<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Word Search Game</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container" id="home">
    <h1>Word Search Game</h1>

    <div id="leaderboard-section">
      <h2>Leaderboard</h2>
      <ol id="leaderboard"></ol>
      <button id="resetLeaderboard">Reset Leaderboard</button>
    </div>

    <div id="name-section">
      <input type="text" id="playerName" placeholder="Masukkan Nama">
      <button id="startGame">Mulai Game</button>
    </div>
  </div>

  <div class="container hidden" id="game">
    <h2 id="timer">Waktu: 60</h2>
    <div id="word-list"></div>
    <div id="grid" class="grid"></div>
  </div>

  <footer>
    © 2025 dibuat dengan ❤️ oleh Agus Widodo FN.
  </footer>

  <canvas id="confetti-canvas"></canvas>

  <script src="script.js"></script>
</body>
</html>
