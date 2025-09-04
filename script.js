/* ====== KONFIG ====== */
const RESET_PASSWORD = "agus123"; // ganti sesuai keinginan Cak
const GAME_TIME = 60;             // detik
const GRID_SIZE = 10;

/* ====== LIBRARY KATA ====== */
const WORD_LIBRARY = [
  "MATEMATIKA","BIOLOGI","FISIKA","KIMIA","SEJARAH","GEOGRAFI","EKONOMI","SOSIOLOGI","FILSAFAT","PSIKOLOGI",
  "KOMPUTER","INTERNET","ROBOT","MESIN","BUDAYA","SENI","MUSIK","PUISI","BAHASA","PENGETAHUAN",
  "GURU","MURID","SEKOLAH","KELAS","UJIAN","TUGAS","BELAJAR","CERDAS","DISIPLIN","KREATIF",
  "INDONESIA","MERDEKA","PANCASILA","GARUDA","JAKARTA","BANDUNG","SURABAYA","BOROBUDUR","KARTINI","SOEKARNO",
  "OLAHRAGA","SEPAKBOLA","BULUTANGKIS","VOLI","RENANG","ATLET","OLAHRAGAWAN","EMAS","JUARA","PRESTASI"
];

/* ====== STATE ====== */
let playerName = "";
let wordsToFind = [];
let grid = [];
let selectedCells = [];
let isSelecting = false;
let timeLeft = GAME_TIME;
let timerInterval = null;

/* ====== DOM ====== */
const elHome = document.getElementById("home");
const elGame = document.getElementById("game");
const elGrid = document.getElementById("grid");
const elWordList = document.getElementById("wordList");
const elTimer = document.getElementById("timer");
const elPlayer = document.getElementById("player");
const elLeaderboard = document.getElementById("leaderboard");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const nameInput = document.getElementById("playerName");

/* ====== INIT ====== */
document.addEventListener("DOMContentLoaded", () => {
  // Tombol mulai & reset pakai event listener (tidak inline) agar pasti terpasang
  startBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", resetLeaderboard);
  renderLeaderboard();

  // End selection jika pointer diangkat di mana pun
  document.addEventListener("pointerup", endSelectionGlobal);
});

/* ====== LEADERBOARD ====== */
function renderLeaderboard(){
  const scores = JSON.parse(localStorage.getItem("leaderboard")||"[]");
  elLeaderboard.innerHTML = "";
  // Pakai <ol> -> nomor otomatis, jadi li tidak pakai nomor manual
  scores.forEach(s=>{
    const li = document.createElement("li");
    li.innerHTML = `<span>${s.name}</span><span>${s.score}</span>`;
    elLeaderboard.appendChild(li);
  });
}

function saveScore(scoreValue){
  let scores = JSON.parse(localStorage.getItem("leaderboard")||"[]");
  scores.push({ name: playerName, score: scoreValue });
  scores.sort((a,b)=> b.score - a.score);
  scores = scores.slice(0,10);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

function resetLeaderboard(){
  const pass = prompt("Masukkan password reset leaderboard:");
  if(pass === null) return;
  if(pass === RESET_PASSWORD){
    localStorage.removeItem("leaderboard");
    alert("Leaderboard berhasil direset.");
    renderLeaderboard();
  }else{
    alert("Password salah.");
  }
}

/* ====== GAME FLOW ====== */
function startGame(){
  playerName = nameInput.value.trim();
  if(!playerName){
    alert("Masukkan nama dulu ya.");
    nameInput.focus();
    return;
  }

  wordsToFind = shuffle(WORD_LIBRARY).slice(0,10);

  elHome.classList.add("hidden");
  elGame.classList.remove("hidden");
  elPlayer.textContent = "👤 " + playerName;

  timeLeft = GAME_TIME;
  updateTimerLabel();

  generateGrid();
  renderWordList();
  attachGridPointerEvents();

  playStartSound();
  startTimer();
}

function showHome(){
  elGame.classList.add("hidden");
  elHome.classList.remove("hidden");
  renderLeaderboard();
}

/* ====== TIMER ====== */
function startTimer(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimerLabel();
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      gameOver(false);
    }
  },1000);
}
function updateTimerLabel(){
  elTimer.textContent = "⏱️ " + timeLeft;
}

/* ====== GRID GENERATION ====== */
function generateGrid(){
  const N = GRID_SIZE;
  grid = Array.from({length:N}, ()=> Array(N).fill(""));

  // tanam kata (H/V)
  wordsToFind.forEach(word => placeWordHV(word));

  // isi kosong dengan huruf acak
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<N;r++){
    for(let c=0;c<N;c++){
      if(grid[r][c]===""){
        grid[r][c] = letters[Math.floor(Math.random()*letters.length)];
      }
    }
  }
  renderGrid();
}

function placeWordHV(word){
  const N = GRID_SIZE;
  let placed = false, guard=0;
  while(!placed && guard<500){
    guard++;
    const dir = Math.random()<0.5 ? "H":"V";
    const row = Math.floor(Math.random()*N);
    const col = Math.floor(Math.random()*N);
    if(dir==="H" && col+word.length<=N){
      // cek kosong
      let ok = true;
      for(let i=0;i<word.length;i++){
        if(grid[row][col+i] !== "") { ok=false; break; }
      }
      if(ok){
        for(let i=0;i<word.length;i++) grid[row][col+i] = word[i];
        placed = true;
      }
    }else if(dir==="V" && row+word.length<=N){
      let ok = true;
      for(let i=0;i<word.length;i++){
        if(grid[row+i][col] !== "") { ok=false; break; }
      }
      if(ok){
        for(let i=0;i<word.length;i++) grid[row+i][col] = word[i];
        placed = true;
      }
    }
  }
}

function renderGrid(){
  elGrid.innerHTML = "";
  const N = GRID_SIZE;
  for(let r=0;r<N;r++){
    for(let c=0;c<N;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      elGrid.appendChild(cell);
    }
  }
}

/* ====== WORD LIST ====== */
function renderWordList(){
  elWordList.innerHTML = "";
  wordsToFind.forEach(w=>{
    const li = document.createElement("li");
    li.id = "word-"+w;
    li.textContent = w;
    elWordList.appendChild(li);
  });
}

/* ====== SELECTION (SWIPE/DRAG) ====== */
function attachGridPointerEvents(){
  // Pakai Pointer Events biar mulus di desktop & HP
  elGrid.querySelectorAll(".cell").forEach(cell=>{
    cell.addEventListener("pointerdown", onPointerDown);
    cell.addEventListener("pointerenter", onPointerEnter);
  });
}

function onPointerDown(e){
  e.preventDefault();
  isSelecting = true;
  selectedCells = [];
  toggleCell(e.currentTarget);
}

function onPointerEnter(e){
  if(!isSelecting) return;
  toggleCell(e.currentTarget);
}

function endSelectionGlobal(){
  if(!isSelecting) return;
  isSelecting = false;
  checkSelection();
}

function toggleCell(cellEl){
  if(!cellEl.classList.contains("cell")) return;
  if(cellEl.classList.contains("selected")){
    // boleh batal pilih dengan lewat lagi
    cellEl.classList.remove("selected");
    selectedCells = selectedCells.filter(n => n !== cellEl);
  }else{
    cellEl.classList.add("selected");
    selectedCells.push(cellEl);
  }
}

function checkSelection(){
  const word = selectedCells.map(c=>c.textContent).join("");
  const reversed = [...word].reverse().join("");
  const match = wordsToFind.includes(word) ? word :
                (wordsToFind.includes(reversed) ? reversed : null);

  if(match){
    // tandai di grid & daftar
    selectedCells.forEach(c=>{
      c.classList.remove("selected");
      c.classList.add("found");
    });
    const li = document.getElementById("word-"+match);
    if(li) li.classList.add("found");

    playFoundSound();

    // selesai semua
    const allDone = [...elWordList.querySelectorAll("li")]
      .every(li => li.classList.contains("found"));
    if(allDone){
      gameOver(true);
    }
  }else{
    // batal
    selectedCells.forEach(c=>c.classList.remove("selected"));
  }
  selectedCells = [];
}

/* ====== GAME OVER ====== */
function gameOver(won){
  clearInterval(timerInterval);
  if(won){
    // Konfeti + cheer BERSAMAAN
    launchConfetti();
    playCheer();
  }else{
    playGameOverSound();
  }
  // Skor pakai sisa waktu
  saveScore(timeLeft);
  // Kembali ke home
  setTimeout(showHome, 3500);
}

/* ====== UTIL ====== */
function shuffle(arr){ return arr.slice().sort(()=>Math.random()-0.5); }

/* ====== AUDIO (tanpa file eksternal) ====== */
function beep(freq, durationSec){
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  osc.start();
  osc.stop(ctx.currentTime + durationSec);
}

function playStartSound(){
  // versi awal: nada naik 400 -> 600
  beep(400, 0.18);
  setTimeout(()=>beep(600,0.2), 190);
}

function playFoundSound(){
  // cepat 800 -> 1000
  beep(800, 0.1);
  setTimeout(()=>beep(1000,0.14), 110);
}

function playGameOverSound(){
  // versi awal: nada turun 400 -> 200
  beep(400, 0.28);
  setTimeout(()=>beep(200,0.35), 300);
}

function playCheer(){
  // sorak/tepuk tangan ramai (tanpa file), overlay oscillator
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const duration = 3.2;
  const voices = 28;

  for(let i=0;i<voices;i++){
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = Math.random()>0.5 ? "square" : "sawtooth";
    osc.frequency.setValueAtTime(220 + Math.random()*900, ctx.currentTime);
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    const start = ctx.currentTime + Math.random()*0.25;
    const end   = start + duration - Math.random()*1.1;
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end);
  }
}

/* ====== CONFETTI ====== */
function launchConfetti(){
  // pakai canvas-confetti (CDN sudah di index.php)
  const duration = 2200;
  const end = Date.now() + duration;

  (function frame(){
    // 2 letupan per frame (kiri & kanan)
    confetti({
      particleCount: 40,
      startVelocity: 30,
      spread: 55,
      origin: { x: 0.15, y: 0.2 }
    });
    confetti({
      particleCount: 40,
      startVelocity: 30,
      spread: 55,
      origin: { x: 0.85, y: 0.2 }
    });
    if(Date.now() < end){
      requestAnimationFrame(frame);
    }
  })();
}
