<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Mencari Kata</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="home">
    <h1>Mencari Kata</h1>

    <div class="controls">
      <input type="text" id="playerName" placeholder="Masukkan Nama" />
      <button id="startBtn">Mulai Game</button>
    </div>

    <div class="lb-header">
      <h2>Leaderboard</h2>
      <button id="resetBtn" class="danger">Reset Leaderboard</button>
    </div>
    <ol id="leaderboard"></ol>
  </div>

  <div id="game" class="hidden">
    <div id="hud">
      <span id="timer">⏱️ 60</span>
      <span id="player"></span>
    </div>

    <div id="grid"></div>

    <h3>Kata yang dicari:</h3>
    <ul id="wordList"></ul>
  </div>

  <footer>
    © 2025 dibuat dengan ❤️ oleh Agus Widodo FN.
  </footer>

  <!-- CDN konfeti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
