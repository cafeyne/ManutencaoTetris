
// clears the board
function init() {
  for (var y = 0; y < ROWS; ++y) {
    board[y] = [];
    for (var x = 0; x < COLS; ++x) {
      board[y][x] = 0;
    }
  }
  score = 0;
  loadHighScore();
  updateScore();
}

// Função principal que move a peça
function tick() {
  if (canMoveDown()) {
    moveDownPiece();
  } else {
    handlePieceFreezing();
  }
}

// Verifica se a peça pode continuar se movendo para baixo
function canMoveDown() {
  return valid(0, 1);
}

// Movimenta a peça para baixo
function moveDownPiece() {
  ++currentY;
}

// Lida com o congelamento da peça e verificação de fim de jogo
function handlePieceFreezing() {
  freeze();
  valid(0, 1);

  if (isGameOver()) {
    endGame();
  } else {
    clearLines();
    newShape();
  }
}

// Verifica se o jogo acabou (se a peça chegou no topo e está congelada)
function isGameOver() {
  return lose;
}

// Função que termina o jogo
function endGame() {
  clearAllIntervals();
  document.getElementById('gameOverMessage').style.display = 'block';
  document.getElementById('tutorialButton').disabled = false;
  document.getElementById('playbutton').disabled = false;
  document.getElementById('finalScore').innerText = score;
}


function moveLeft() {
  if (valid(-1)) {
    --currentX;
  }
}

function moveDown() {
  if (valid(0, 1)) {
    ++currentY;
  }
}

function keyPress(key) {
  switch (key) {
    case 'left':
      moveLeft();
      break;
    case 'right':
      if (valid(1)) {
        ++currentX;
      }
      break;
    case 'down':
      moveDown();
      break;
    case 'rotate':
      var rotated = rotate(current);
      if (valid(0, 0, rotated)) {
        current = rotated;
      }
      break;
    case 'drop':
      while (valid(0, 1)) {
        ++currentY;
      }
      tick();
      break;
  }
}

// checks if the resulting position of current shape will be feasible
function valid(offsetX, offsetY, newCurrent) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  offsetX = currentX + offsetX;
  offsetY = currentY + offsetY;
  newCurrent = newCurrent || current;

  for (var y = 0; y < 4; ++y) {
    for (var x = 0; x < 4; ++x) {
      if (newCurrent[y][x]) {
        if (
          typeof board[y + offsetY] == 'undefined' ||
          typeof board[y + offsetY][x + offsetX] == 'undefined' ||
          board[y + offsetY][x + offsetX] ||
          x + offsetX < 0 ||
          y + offsetY >= ROWS ||
          x + offsetX >= COLS
        ) {
          if (offsetY == 1 && freezed) {
            lose = true; // lose if the current shape is settled at the top most row
            document.getElementById('playbutton').disabled = false;
            updateHighScore();
            document.getElementById('finalhighScore').innerText = highscore;
          }
          return false;
        }
      }
    }
  }
  return true;
}

function playButtonClicked() {
  document.getElementById('gameOverMessage').style.display = 'none'; //
  newGame(); //
  document.getElementById('playbutton').disabled = true; //
  document.getElementById('tutorialButton').disabled = true;
}

function newGame() {
  clearAllIntervals();
  intervalRender = setInterval(render, 30);
  init();
  newShape();
  lose = false;
  interval = setInterval(tick, 400);
}

function clearAllIntervals() {
  clearInterval(interval);
  clearInterval(intervalRender);
  document.getElementById('tutorialButton').disabled = false;
}

window.onload = function () {
  loadHighScore();
};

function toggleTutorial() {
  var tutorialMessage = document.getElementById('tutorialMessage');
  var displayStyle = tutorialMessage.style.display;
  if (displayStyle === 'none' || displayStyle === '') {
    tutorialMessage.style.display = 'block';
    document.getElementById('playbutton').disabled = true;
  } else {
    tutorialMessage.style.display = 'none';
    if (!interval) {
      document.getElementById('playbutton').disabled = false;
    }
  }
}
