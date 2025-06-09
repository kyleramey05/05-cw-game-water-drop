// Variables to control game state
let gameRunning = false;
let dropMaker;
let score = 0; // integer for live updates
let scoreStack = [];
let gameTimer = null;
let gameDuration = 30; // seconds
let timeLeft = gameDuration;
let timerInterval;
let paused = false;

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const can1 = document.getElementById("can1");
const can2 = document.getElementById("can2");

let feedbackMsg = document.getElementById("feedback-msg");
if (!feedbackMsg) {
  feedbackMsg = document.createElement("div");
  feedbackMsg.id = "feedback-msg";
  feedbackMsg.style.display = "none";
  document.querySelector(".game-wrapper").appendChild(feedbackMsg);
}

const winMessages = [
  "Amazing! You're a Water Hero! 💧🥇",
  "You saved the day! 🌊👏",
  "Incredible! Clean water for all! 🚰✨",
  "You crushed it! Water for everyone! 💦🎉"
];
const loseMessages = [
  "Try again! The world needs you! 🌍",
  "Almost there! Give it another go! 💪",
  "Don't give up! Water is life! 💧",
  "Keep going! Every drop counts! 🫧"
];

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", restartGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
can1.addEventListener("click", () => collectCan(can1));
can2.addEventListener("click", () => collectCan(can2));

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  paused = false;
  score = 0;
  timeLeft = gameDuration;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  feedbackMsg.style.display = "none";
  gameContainer.innerHTML = "";
  dropMaker = setInterval(createDrop, 700);
  timerInterval = setInterval(updateTimer, 1000);
  enableCans();
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function pauseGame() {
  if (!gameRunning) return;
  paused = !paused;
  if (paused) {
    clearInterval(dropMaker);
    clearInterval(timerInterval);
    pauseBtn.textContent = "Resume";
    showTempMsg("Paused!", true, gameContainer, true);
  } else {
    dropMaker = setInterval(createDrop, 700);
    timerInterval = setInterval(updateTimer, 1000);
    pauseBtn.textContent = "Pause";
  }
}

function restartGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
  paused = false;
  pauseBtn.textContent = "Pause";
  startGame();
}

function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
  paused = false;
  pauseBtn.textContent = "⏸️ Pause";
  score = 0;
  timeLeft = gameDuration;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  feedbackMsg.style.display = "none";
  gameContainer.innerHTML = "";
  enableCans();
  updateScoreDisplay();
}

function updateTimer() {
  if (paused) return;
  timeLeft--;
  timeDisplay.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  if (gameTimer) clearInterval(gameTimer);
  document.querySelectorAll('.water-drop, .bad-drop, .obstacle-drop').forEach(drop => drop.remove());
  let msgArr = score >= 20 ? winMessages : loseMessages;
  let msg = msgArr[Math.floor(Math.random() * msgArr.length)];
  feedbackMsg.textContent = score >= 20 ? `🏆 ${msg}` : `😅 ${msg}`;
  feedbackMsg.style.display = "block";
  feedbackMsg.className = score >= 20 ? "win" : "lose";
  disableCans();
  if (score >= 20) showConfetti();
  // Show final score with color change for 3 seconds
  document.getElementById('score').textContent = score + ' (Final)';
  scoreDisplay.style.color = '#FFC907';
  setTimeout(() => {
    document.getElementById('score').textContent = score;
    scoreDisplay.style.color = '#2E9DF7';
  }, 3000);
  // Stack the score as a string
  scoreStack.push(score.toString());
  // Optionally display the stack somewhere
  displayScoreStack();
}

// Confetti effect for celebration
function showConfetti() {
  const confettiColors = ["#FFC907", "#2E9DF7", "#4FCB53", "#F5402C", "#8BD1CB"];
  for (let i = 0; i < 80; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    conf.style.left = Math.random() * 100 + "%";
    conf.style.animationDuration = (Math.random() * 1.5 + 1.5) + "s";
    conf.style.opacity = Math.random() * 0.5 + 0.5;
    conf.style.width = conf.style.height = Math.random() * 8 + 6 + "px";
    conf.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 2200);
  }
}

function createDrop() {
  if (!gameRunning || paused) return;
  // 15% chance to create an obstacle (striped) drop
  if (Math.random() < 0.15) {
    createObstacleDrop();
    return;
  }
  const drop = document.createElement("div");
  const isBad = Math.random() < 0.25;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = isBad ? "2.2s" : "2.5s";
  drop.style.animationName = "dropFall";
  gameContainer.appendChild(drop);
  // Attach click event to drops as they are created
  drop.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!gameRunning || paused) return;
    if (isBad) {
      score = Math.max(0, score - 10);
      showTempMsg("Ouch! Dirty water! -10", false, drop);
      handleDropClick('bad');
    } else {
      score += 10;
      showTempMsg("+10!", true, drop);
      handleDropClick('good');
    }
    drop.remove();
  });
  drop.addEventListener("animationend", () => {
    drop.remove(); // No penalty for missed drops
  });
}

function createObstacleDrop() {
  const drop = document.createElement("div");
  drop.className = "water-drop obstacle-drop";
  drop.title = "Obstacle! Striped drop: +20 points!";
  drop.style.background = "repeating-linear-gradient(135deg, #2E9DF7, #8BD1CB 10px, #FFC907 20px)";
  drop.style.border = "2px solid #2E9DF7";
  drop.style.boxShadow = "0 2px 12px #2E9DF788";
  drop.style.width = drop.style.height = "48px";
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 48);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = "2s";
  drop.style.animationName = "dropFall";
  gameContainer.appendChild(drop);
  drop.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!gameRunning || paused) return;
    score += 20;
    showTempMsg("Striped drop! +20", true, drop);
    drop.remove();
    handleDropClick('striped');
  });
  drop.addEventListener("animationend", () => {
    drop.remove(); // No penalty for missed striped drops
  });
}

// Score logic: always update #score in real time
function updateScoreDisplay(change = null) {
    const scoreSpan = document.getElementById('score');
    if (scoreSpan) {
        scoreSpan.textContent = score;
    }
    // Show +10/-10 feedback if change is provided
    if (change !== null) {
        showScoreChange(change);
    }
}

function showScoreChange(change) {
    let msg = document.createElement('span');
    msg.className = 'score-change-msg ' + (change > 0 ? 'good' : 'bad');
    msg.textContent = (change > 0 ? '+' : '') + change;
    msg.setAttribute('aria-live', 'polite');
    msg.style.position = 'absolute';
    msg.style.left = '50%';
    msg.style.top = '0';
    msg.style.transform = 'translate(-50%, 0)';
    msg.style.fontSize = '1.5rem';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '100';
    msg.style.pointerEvents = 'none';
    msg.style.transition = 'opacity 0.7s, top 0.7s';
    msg.style.opacity = '1';
    document.querySelector('.score-panel').appendChild(msg);
    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.top = '-30px';
    }, 50);
    setTimeout(() => {
        msg.remove();
    }, 800);
}

function handleDropClick(dropType) {
    if (timeLeft > 0) { // Only allow scoring while timer is running
        let change = 0;
        if (dropType === 'good') {
            change = 10;
        } else if (dropType === 'bonus') {
            change = 20;
        } else if (dropType === 'bad') {
            change = -10;
        }
        score += change;
        updateScoreDisplay(change);
    }
}

function displayScoreStack() {
    let stackDiv = document.getElementById('score-stack');
    if (!stackDiv) {
        stackDiv = document.createElement('div');
        stackDiv.id = 'score-stack';
        stackDiv.style.marginTop = '12px';
        stackDiv.style.fontSize = '1.1rem';
        stackDiv.style.textAlign = 'center';
        document.querySelector('.score-panel').appendChild(stackDiv);
    }
    stackDiv.textContent = 'Score History: ' + scoreStack.join(', ');
}

// Make sure the dropFall animation is defined for fluid motion
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes dropFall {
    0% { top: -60px; opacity: 0.9; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0.7; }
}`, styleSheet.cssRules.length);
