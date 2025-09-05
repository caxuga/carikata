const words = ["BUKU", "PENA", "MEJA", "KURSI", "SEKOLAH", "GURU", "MURID", "PINTU", "JENDELA", "BOLA"];
let gridSize = 10;
let grid = [];
let playerName = "";
let score = 0;
let timeLeft = 120;
let timer;
let isSelecting = false;
let selectedCells = [];
let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const gridDiv = document.getElementById("grid");
const wordListDiv = document.getElementById("wordList");
const infoName = document.getElementById("infoName");
const infoTime = document.getElementById("infoTime");
const infoScore = document.getElementById("infoScore");
const leaderboardOl = document.getElementById("leaderboard");
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

// ---------------- SOUNDS ----------------
function playBeep(freq, duration){
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctxAudio.destination);
  osc.start();
  osc.stop(ctxAudio.currentTime + duration/1000);
}

// suara sorak (random noise burst)
function playCheer(){
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = 2 * ctxAudio.sampleRate;
  const buffer = ctxAudio.createBuffer(1, bufferSize, ctxAudio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctxAudio.createBufferSource();
  noise.buffer = buffer;
  const filter = ctxAudio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  noise.connect(filter);
  filter.connect(ctxAudio.destination);
  noise.start();
  noise.stop(ctxAudio.currentTime + 1.2);
}

// ---------------- GRID GENERATOR ----------------
function generateGrid(){
  grid = Array.from({length:gridSize}, ()=> Array(gridSize).fill(""));
  
  words.forEach(word=>{
    let placed = false;
    while(!placed){
      let dir = Math.random()<0.5 ? "H" : "V";
      let row = Math.floor(Math.random()*gridSize);
      let col = Math.floor(Math.random()*gridSize);
      if(dir==="H" && col+word.length<=gridSize){
        if(grid[row].slice(col,col+word.length).every(c=>c==="")){
          for(let i=0;i<word.length;i++) grid[row][col+i]=word[i];
          placed=true;
        }
      } else if(dir==="V" && row+word.length<=gridSize){
        if(grid.slice(row,row+word.length).every(r=>r[col]==="")){
          for(let i=0;i<word.length;i++) grid[row+i][col]=word[i];
          placed=true;
        }
      }
    }
  });

  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      if(grid[r][c]==="") grid[r][c]=String.fromCharCode(65+Math.floor(Math.random()*26));
    }
  }
}

// ---------------- GAME START ----------------
document.getElementById("startBtn").addEventListener("click", ()=>{
  playerName=document.getElementById("playerName").value.trim();
  if(!playerName){ alert("Masukkan nama dulu!"); return; }

  score=0;
  timeLeft=120;
  updateInfo();
  wordListDiv.innerHTML="";
  words.forEach(w=>{
    let span=document.createElement("span");
    span.className="word";
    span.id="word-"+w;
    span.textContent=w;
    wordListDiv.appendChild(span);
  });

  generateGrid();
  drawGrid();
  menu.style.display="none";
  game.style.display="block";

  playBeep(800,200);

  timer=setInterval(()=>{
    timeLeft--;
    updateInfo();
    if(timeLeft<=0) endGame(false);
  },1000);
});

function updateInfo(){
  infoName.textContent="Nama: "+playerName;
  infoTime.textContent="Waktu: "+timeLeft+" detik";
  infoScore.textContent="Skor: "+score;
}

// ---------------- DRAW GRID ----------------
function drawGrid(){
  gridDiv.innerHTML="";
  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      let cell=document.createElement("div");
      cell.className="cell";
      cell.textContent=grid[r][c];
      cell.dataset.row=r;
      cell.dataset.col=c;
      addCellEvents(cell);
      gridDiv.appendChild(cell);
    }
  }
}

function addCellEvents(cell){
  cell.addEventListener("mousedown", startSelect);
  cell.addEventListener("mousemove", selectMove);
  cell.addEventListener("mouseup", endSelect);

  cell.addEventListener("touchstart", startSelect, {passive:false});
  cell.addEventListener("touchmove", selectMove, {passive:false});
  cell.addEventListener("touchend", endSelect, {passive:false});
}

function startSelect(e){
  e.preventDefault();
  isSelecting=true;
  selectedCells=[];
  selectCell(e.target);
}

function selectMove(e){
  if(!isSelecting) return;
  let touch=e.touches?e.touches[0]:e;
  let elem=document.elementFromPoint(touch.clientX,touch.clientY);
  if(elem && elem.classList.contains("cell") && !selectedCells.includes(elem)){
    selectCell(elem);
  }
}

function endSelect(){
  if(!isSelecting) return;
  isSelecting=false;
  let word=selectedCells.map(c=>c.textContent).join("");
  if(words.includes(word)){
    selectedCells.forEach(c=>c.classList.add("highlight"));
    document.getElementById("word-"+word).classList.add("found");
    score+=10;
    playBeep(600,150);
    updateInfo();
    if([...document.querySelectorAll(".word")].every(w=>w.classList.contains("found"))){
      endGame(true);
    }
  } else {
    selectedCells.forEach(c=>c.classList.remove("selected"));
  }
  selectedCells=[];
}

function selectCell(cell){
  cell.classList.add("selected");
  selectedCells.push(cell);
}

// ---------------- END GAME ----------------
function endGame(isWin){
  clearInterval(timer);
  playBeep(200,400);
  leaderboard.push({name:playerName,score:score,time:120-timeLeft});
  leaderboard.sort((a,b)=>b.score-a.score || a.time-b.time);
  localStorage.setItem("leaderboard",JSON.stringify(leaderboard.slice(0,10)));
  showMenu();

  if(isWin){
    startConfetti();
    playCheer();
    setTimeout(stopConfetti,5000);
  }
}

function showMenu(){
  menu.style.display="block";
  game.style.display="none";
  leaderboardOl.innerHTML="";
  leaderboard.forEach((p)=>{
    let li=document.createElement("li");
    li.textContent=`${p.name} - Skor: ${p.score}, Waktu: ${p.time} detik`;
    leaderboardOl.appendChild(li);
  });
}
showMenu();

// ---------------- CONFETTI ----------------
let confettiParticles = [];
function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function randomColor(){
  const colors=["#ff0","#0f0","#0ff","#f0f","#f00","#00f"];
  return colors[Math.floor(Math.random()*colors.length)];
}

function startConfetti(){
  confettiParticles=[];
  for(let i=0;i<200;i++){
    confettiParticles.push({
      x: Math.random()*confettiCanvas.width,
      y: Math.random()*confettiCanvas.height - confettiCanvas.height,
      w: 5+Math.random()*5,
      h: 10+Math.random()*10,
      color: randomColor(),
      speed: 2+Math.random()*4,
      angle: Math.random()*360
    });
  }
  requestAnimationFrame(updateConfetti);
}

function updateConfetti(){
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confettiParticles.forEach(p=>{
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x,p.y,p.w,p.h);
    p.y+=p.speed;
    p.x+=Math.sin(p.angle)*2;
    if(p.y>confettiCanvas.height) p.y=-10;
  });
  if(confettiParticles.length>0){
    requestAnimationFrame(updateConfetti);
  }
}

function stopConfetti(){
  confettiParticles=[];
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
}
