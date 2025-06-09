// Variables to control game state
let gameRunning = false;
let dropMaker;
let score = 0;
let timeLeft = 30;
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
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  feedbackMsg.style.display = "none";
  gameContainer.innerHTML = "";
  dropMaker = setInterval(createDrop, 700);
  timerInterval = setInterval(updateTimer, 1000);
  enableCans();
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
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  feedbackMsg.style.display = "none";
  gameContainer.innerHTML = "";
  enableCans();
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
  document.querySelectorAll('.water-drop, .bad-drop, .obstacle-drop').forEach(drop => drop.remove());
  let msgArr = score >= 20 ? winMessages : loseMessages;
  let msg = msgArr[Math.floor(Math.random() * msgArr.length)];
  feedbackMsg.textContent = score >= 20 ? `🏆 ${msg}` : `😅 ${msg}`;
  feedbackMsg.style.display = "block";
  feedbackMsg.className = score >= 20 ? "win" : "lose";
  disableCans();
  if (score >= 20) showConfetti();
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
  // 15% chance to create an obstacle drop
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
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = "4s";
  gameContainer.appendChild(drop);
  drop.addEventListener("click", function () {
    if (!gameRunning || paused) return;
    if (isBad) {
      score = Math.max(0, score - 2);
      showTempMsg("Ouch! Dirty water! -2", false, drop);
      drop.remove();
    } else {
      score++;
      showTempMsg("+1!", true, drop);
      drop.remove();
    }
    scoreDisplay.textContent = score;
    scoreDisplay.style.color = isBad ? '#F5402C' : '#4FCB53';
    setTimeout(() => scoreDisplay.style.color = '#2E9DF7', 400);
  });
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}

function createObstacleDrop() {
  const drop = document.createElement("div");
  drop.className = "water-drop obstacle-drop";
  drop.title = "Obstacle! Avoid this!";
  drop.style.background = "repeating-linear-gradient(135deg, #F5402C, #FFC907 10px, #2E9DF7 20px)";
  drop.style.border = "2px solid #F5402C";
  drop.style.boxShadow = "0 2px 12px #F5402C88";
  drop.style.width = drop.style.height = "48px";
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 48);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = "3.5s";
  gameContainer.appendChild(drop);
  drop.addEventListener("click", function () {
    if (!gameRunning || paused) return;
    score = Math.max(0, score - 5);
    showTempMsg("Obstacle! -5", false, drop);
    drop.remove();
    scoreDisplay.textContent = score;
    scoreDisplay.style.color = '#F5402C';
    setTimeout(() => scoreDisplay.style.color = '#2E9DF7', 400);
  });
  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}
