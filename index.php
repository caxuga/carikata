<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mencari Kata</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="home">
    <h1>Mencari Kata</h1>
    <input type="text" id="playerName" placeholder="Masukkan Nama">
    <button onclick="startGame()">Mulai Game</button>

    <h2>Leaderboard</h2>
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

  <script src="script.js"></script>
</body>
</html>
