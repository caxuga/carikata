// ===== Library Kata (50 kata acak) =====
const wordLibrary = [
  "MATEMATIKA","BIOLOGI","FISIKA","KIMIA","SEJARAH","GEOGRAFI","EKONOMI","SOSIOLOGI","FILSAFAT","PSIKOLOGI",
  "KOMPUTER","INTERNET","ROBOT","MESIN","BUDAYA","SENI","MUSIK","PUISI","BAHASA","PENGETAHUAN",
  "GURU","MURID","SEKOLAH","KELAS","UJIAN","TUGAS","BELAJAR","CERDAS","DISIPLIN","KREATIF",
  "INDONESIA","MERDEKA","PANCASILA","GARUDA","JAKARTA","BANDUNG","SURABAYA","BOROBUDUR","KARTINI","SOEKARNO",
  "OLAHRAGA","SEPAKBOLA","BULUTANGKIS","VOLI","RENANG","ATLET","OLAHRAGAWAN","EMAS","JUARA","PRESTASI"
];

let playerName = "";
let wordsToFind = [];
let gridSize = 10;
let grid = [];
let selectedCells = [];
let timeLeft = 60;
let timerInterval;

// ===== MULAI GAME =====
function startGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("Masukkan nama dulu!");
    return;
  }

  // pilih 10 kata acak
  wordsToFind = shuffleArray(wordLibrary).slice(0, 10);
  
  document.getElementById("home").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("player").textContent = "👤 " + playerName;

  generateGrid();
  renderWordList();
  startTimer();
  playStartSound();
}

// ===== GRID GENERATOR =====
function generateGrid() {
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

  // tanam kata
  wordsToFind.forEach(word => {
    placeWord(word);
  });

  // isi sisa dengan huruf random
  let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  renderGrid();
}

function placeWord(word) {
  let placed = false;
  while (!placed) {
    let row = Math.floor(Math.random() * gridSize);
    let col = Math.floor(Math.random() * gridSize);
    let dir = Math.random() > 0.5 ? "H" : "V";

    if (dir === "H" && col + word.length <= gridSize) {
      if (grid[row].slice(col, col + word.length).every(ch => ch === "")) {
        for (let i = 0; i < word.length; i++) grid[row][col + i] = word[i];
        placed = true;
      }
    } else if (dir === "V" && row + word.length <= gridSize) {
      if (grid.slice(row, row + word.length).every(r => r[col] === "")) {
        for (let i = 0; i < word.length; i++) grid[row + i][col] = word[i];
        placed = true;
      }
    }
  }
}

// ===== RENDER GRID =====
function renderGrid() {
  const gridDiv = document.getElementById("grid");
  gridDiv.innerHTML = "";
  selectedCells = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("mousedown", selectCell);
      cell.addEventListener("mouseover", dragSelect);
      cell.addEventListener("mouseup", endSelection);
      gridDiv.appendChild(cell);
    }
  }
}

// ===== WORD LIST =====
function renderWordList() {
  const list = document.getElementById("wordList");
  list.innerHTML = "";
  wordsToFind.forEach(w => {
    let li = document.createElement("li");
    li.textContent = w;
    li.id = "word-" + w;
    list.appendChild(li);
  });
}

// ===== SELECTION =====
let isSelecting = false;

function selectCell(e) {
  isSelecting = true;
  toggleCell(e.target);
}

function dragSelect(e) {
  if (isSelecting) toggleCell(e.target);
}

function endSelection() {
  isSelecting = false;
  checkSelection();
}

function toggleCell(cell) {
  if (cell.classList.contains("selected")) {
    cell.classList.remove("selected");
    selectedCells = selectedCells.filter(c => c !== cell);
  } else {
    cell.classList.add("selected");
    selectedCells.push(cell);
  }
}

function checkSelection() {
  let word = selectedCells.map(c => c.textContent).join("");
  let reversed = word.split("").reverse().join("");
  
  if (wordsToFind.includes(word) || wordsToFind.includes(reversed)) {
    selectedCells.forEach(c => {
      c.classList.remove("selected");
      c.classList.add("found");
    });
    document.getElementById("word-" + (wordsToFind.includes(word) ? word : reversed)).classList.add("found");
    playFoundSound();

    // cek apakah semua selesai
    if ([...document.querySelectorAll("#wordList li")].every(li => li.classList.contains("found"))) {
      gameOver(true);
    }
  } else {
    selectedCells.forEach(c => c.classList.remove("selected"));
  }
  selectedCells = [];
}

// ===== TIMER =====
function startTimer() {
  timeLeft = 60;
  document.getElementById("timer").textContent = "⏱️ " + timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = "⏱️ " + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameOver(false);
    }
  }, 1000);
}

// ===== GAME OVER =====
function gameOver(won) {
  clearInterval(timerInterval);
  if (won) {
    launchConfetti();
    playCheer();
  } else {
    playGameOverSound();
  }
  saveScore();
  setTimeout(showHome, 5000);
}

// ===== LEADERBOARD =====
function saveScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score: timeLeft });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

function showHome() {
  document.getElementById("game").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  renderLeaderboard();
}

function renderLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  let lb = document.getElementById("leaderboard");
  lb.innerHTML = "";
  scores.forEach((s, i) => {
    let li = document.createElement("li");
    li.textContent = (i + 1) + ". " + s.name + " - " + s.score;
    lb.appendChild(li);
  });
}

// ===== UTIL =====
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ===== SUARA =====
function playStartSound() {
  beep(400, 0.2); beep(600, 0.2);
}

function playFoundSound() {
  beep(800, 0.1); beep(1000, 0.15);
}

function playGameOverSound() {
  beep(200, 0.4); beep(150, 0.4);
}

function beep(freq, duration) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// ===== CHEER =====
function playCheer() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 4;
  const voices = 30;
  for (let i = 0; i < voices; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(200 + Math.random() * 800, ctx.currentTime);
    osc.type = Math.random() > 0.5 ? "square" : "sawtooth";
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    const startTime = ctx.currentTime + Math.random() * 0.3;
    const endTime = startTime + duration - Math.random() * 1.5;
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(endTime);
  }
}

// ===== CONFETTI =====
function launchConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0, 1), y: Math.random() - 0.2 } }));
  }, 250);
}
