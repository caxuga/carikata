const wordsLibrary = [
  "GURU","SEKOLAH","BELAJAR","MURID","BUKU",
  "PENA","KELAS","ILMU","UJIAN","CERDAS"
];

let gridSize = 10;
let grid = [];
let selectedCells = [];
let foundWords = [];
let timerInterval;
let timeLeft = 60;
let playerName = "";

const startBtn = document.getElementById("startGame");
const playerInput = document.getElementById("playerName");
const home = document.getElementById("home");
const game = document.getElementById("game");
const gridEl = document.getElementById("grid");
const wordListEl = document.getElementById("word-list");
const timerEl = document.getElementById("timer");
const leaderboardEl = document.getElementById("leaderboard");
const resetBtn = document.getElementById("resetLeaderboard");

const startSound = new Audio("data:audio/mp3;base64,//uQxAAAA..."); // start
const successSound = new Audio("data:audio/mp3;base64,//uQxAAAA..."); // kata benar
const gameOverSound = new Audio("data:audio/mp3;base64,//uQxAAAA..."); // game over
const cheerSound = new Audio("data:audio/mp3;base64,//uQxAAAA..."); // sorak panjang

// --- Leaderboard
function loadLeaderboard() {
  const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboardEl.innerHTML = "";
  data.sort((a,b)=>b.score-a.score).forEach((item,i)=>{
    const li = document.createElement("li");
    li.textContent = `${i+1}. ${item.name} - ${item.score}`;
    leaderboardEl.appendChild(li);
  });
}

resetBtn.addEventListener("click", () => {
  const pass = prompt("Masukkan password reset:");
  if (pass === "Reset@12345") {
    localStorage.removeItem("leaderboard");
    loadLeaderboard();
    alert("Leaderboard berhasil direset!");
  } else {
    alert("Password salah!");
  }
});

// --- Build Grid
function buildGrid(words) {
  grid = Array.from({length:gridSize},()=>Array(gridSize).fill(""));
  words.forEach(word=>{
    let placed = false;
    while(!placed) {
      const row = Math.floor(Math.random()*gridSize);
      const col = Math.floor(Math.random()*gridSize);
      if (col+word.length <= gridSize) {
        let fits = true;
        for (let i=0;i<word.length;i++){
          if(grid[row][col+i] && grid[row][col+i]!==word[i]){fits=false;break;}
        }
        if (fits){
          for (let i=0;i<word.length;i++) grid[row][col+i]=word[i];
          placed=true;
        }
      }
    }
  });
  const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      if(!grid[r][c]) grid[r][c]=alphabet[Math.floor(Math.random()*alphabet.length)];
    }
  }
}

// --- Render Grid
function renderGrid(){
  gridEl.innerHTML="";
  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      const div=document.createElement("div");
      div.className="cell";
      div.dataset.row=r;
      div.dataset.col=c;
      div.textContent=grid[r][c];
      div.addEventListener("mousedown",startSwipe);
      div.addEventListener("mouseover",swipeOver);
      div.addEventListener("mouseup",endSwipe);

      div.addEventListener("touchstart",startSwipe,{passive:true});
      div.addEventListener("touchmove",swipeTouch,{passive:true});
      div.addEventListener("touchend",endSwipe);
      gridEl.appendChild(div);
    }
  }
}

// --- Swipe system
let isSwiping = false;

function startSwipe(e){
  isSwiping = true;
  clearSelection();
  selectCell(e.target);
}

function swipeOver(e){
  if(isSwiping) selectCell(e.target);
}

function swipeTouch(e){
  const touch = e.touches[0];
  const elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if(elem && elem.classList.contains("cell")) selectCell(elem);
}

function endSwipe(){
  if(isSwiping){
    checkWord();
    isSwiping = false;
  }
}

function selectCell(cell){
  if(!selectedCells.includes(cell)){
    cell.classList.add("selected");
    selectedCells.push(cell);
  }
}

function clearSelection(){
  selectedCells.forEach(c=>c.classList.remove("selected"));
  selectedCells = [];
}

// --- Check Word
function checkWord(){
  const word=selectedCells.map(c=>c.textContent).join("");
  if(wordsToFind.includes(word) && !foundWords.includes(word)){
    foundWords.push(word);
    selectedCells.forEach(c=>{c.classList.add("correct");c.classList.remove("selected");});
    selectedCells=[];
    successSound.play();
    updateWordList();
    if(foundWords.length===wordsToFind.length) endGame(true);
  } else {
    clearSelection();
  }
}

function updateWordList(){
  wordListEl.innerHTML=wordsToFind.map(w=>foundWords.includes(w)?`<s>${w}</s>`:w).join(" | ");
}

// --- Start Game
let wordsToFind=[];
startBtn.addEventListener("click",()=>{
  playerName=playerInput.value.trim();
  if(!playerName){alert("Masukkan nama!");return;}
  home.classList.add("hidden");
  game.classList.remove("hidden");

  wordsToFind = [...wordsLibrary].sort(()=>0.5-Math.random()).slice(0,5);
  foundWords=[];
  buildGrid(wordsToFind);
  renderGrid();
  updateWordList();

  timeLeft=60;
  timerEl.textContent=`Waktu: ${timeLeft}`;
  startSound.play();
  timerInterval=setInterval(()=>{
    timeLeft--;
    timerEl.textContent=`Waktu: ${timeLeft}`;
    if(timeLeft<=0) endGame(false);
  },1000);
});

// --- End Game
function endGame(win){
  clearInterval(timerInterval);
  game.classList.add("hidden");
  home.classList.remove("hidden");

  if(win){
    cheerSound.play();
    startConfetti();
    saveScore(playerName,timeLeft*10);
  }else{
    gameOverSound.play();
    saveScore(playerName,foundWords.length*10);
  }
  loadLeaderboard();
}

function saveScore(name,score){
  let data=JSON.parse(localStorage.getItem("leaderboard")||"[]");
  data.push({name,score});
  localStorage.setItem("leaderboard",JSON.stringify(data));
}

// --- Confetti
function startConfetti(){
  const duration=5*1000;
  const end=Date.now()+duration;
  const colors=["#bb0000","#ffffff","#00bb00","#0000bb"];
  (function frame(){
    const timeLeft=end-Date.now();
    if(timeLeft<=0) return;
    const canvas=document.getElementById("confetti-canvas");
    const ctx=canvas.getContext("2d");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<100;i++){
      ctx.fillStyle=colors[Math.floor(Math.random()*colors.length)];
      ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,5,10);
    }
    requestAnimationFrame(frame);
  })();
}

loadLeaderboard();
