class Board {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.board = Array.from({ length: rows }, () => Array(cols).fill(0));
  }
  //renderBoard
  draw(ctx, colors) {
    ctx.strokeStyle = 'black';
    for (let x = 0; x < this.cols; ++x) {
      for (let y = 0; y < this.rows; ++y) {
        if (this.board[y][x]) {
          ctx.fillStyle = colors[this.board[y][x] - 1];
          this.drawBlock(ctx, x, y);
        }
      }
    }
  }

  drawBlock(ctx, x, y) {
    const BLOCK_W = 300 / this.cols;
    const BLOCK_H = 600 / this.rows;
    ctx.fillRect(BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1, BLOCK_H - 1);
    ctx.strokeRect(BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1, BLOCK_H - 1);
  }

  clearCanvas() {
    var canvas = document.getElementsByTagName('canvas')[0];
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  clearLines(player) {
    for (let y = this.rows - 1; y >= 0; --y) {
      if (this.isRowFilled(y)) {
        this.clearAndMoveLines(y);
        player.score += 100;
        player.updateScore();
      }
    }
  }

  isRowFilled(y) {
    return this.board[y].every((cell) => cell !== 0);
  }

  clearAndMoveLines(y) {
    //document.getElementById('clearsound').play();
    for (var yy = y; yy > 0; --yy) {
      for (var x = 0; x < this.cols; ++x) {
        this.board[yy][x] = this.board[yy - 1][x];
      }
    }
    for (var x = 0; x < this.cols; ++x) {
      this.board[0][x] = 0;
    }
  }

  // stop shape at its position and fix it to board
  freeze(piece, currentX, currentY) {
    const current = piece.current;
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (current[y][x]) {
          this.board[y + currentY][x + currentX] = current[y][x];
        }
      }
    }
    //freezed = true;
  }
}

class Player {
  constructor() {
    this.score = 0;
    this.highscore = 0;
  }

  updateScore() {
    document.getElementById('score').innerText = this.score;
  }

  loadHighScore() {
    let savedHighScore = localStorage.getItem('highscore');
    if (savedHighScore !== null) {
      this.highscore = parseInt(savedHighScore);
    } else {
      this.highscore = 0;
    }
    document.getElementById('highscore').innerText = this.highscore;
  }

  saveHighScore() {
    localStorage.setItem('highscore', this.highscore);
  }

  updateHighScore() {
    if (this.score > this.highscore) {
      this.highscore = this.score;
      this.saveHighScore();
    }
    document.getElementById('highscore').innerText = this.highscore;
  }
}

class Piece {
  constructor(id, shape) {
    this.id = id;
    this.shape = shape;
    this.current = this.arrayToMatrix(id, this.shape);
  }

  // returns rotates the rotated shape 'current' perpendicularly anticlockwise
  rotate() {
    var newCurrent = [];
    for (var y = 0; y < 4; ++y) {
      newCurrent[y] = [];
      for (var x = 0; x < 4; ++x) {
        newCurrent[y][x] = this.current[3 - x][y];
      }
    }
    return newCurrent;
  }

  arrayToMatrix(id, array) {
    let matrix = [];

    for (var y = 0; y < 4; ++y) {
      matrix[y] = [];
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x;
        if (typeof array[i] != 'undefined' && array[i]) {
          matrix[y][x] = id + 1;
        } else {
          matrix[y][x] = 0;
        }
      }
    }
    return matrix;
  }
}

class Game {
  constructor(board, player) {
    this.board = board;
    this.player = player;
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.freezed = false;
    this.nextPiece = null;
    this.nextNextPiece = null;
    this.lose = false;
    this.interval = null;
    this.intervalRender = null;
    this.shapes = [
      [1, 1, 1, 1],
      [1, 1, 1, 0, 1],
      [1, 1, 1, 0, 0, 0, 1],
      [1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 1, 1],
      [0, 1, 0, 0, 1, 1, 1],
    ];
    this.colors = [
      'rgba(97, 200, 246, 1)',
      'rgba(246, 192, 97, 1)',
      'rgba(99, 79, 253, 1)',
      'rgba(218, 246, 97, 1)',
      'rgba(253, 76, 76, 1)',
      'rgba(97, 246, 123, 1)',
      'rgba(214, 74, 255, 1)',
    ];
  }

  generateRandomPiece() {
    const id = Math.floor(Math.random() * this.shapes.length);
    const shape = this.shapes[id];
    return new Piece(id, shape);
  }

  arrayToMatrix(array) {
    let matrix = [];

    for (var y = 0; y < 4; ++y) {
      matrix[y] = [];
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x;
        if (typeof array[i] != 'undefined' && array[i]) {
          matrix[y][x] = id + 1;
        } else {
          matrix[y][x] = 0;
        }
      }
    }
    return matrix;
  }

  newShape() {
    if (!this.nextPiece) {
      this.nextPiece = this.generateRandomPiece();
      this.nextNextPiece = this.generateRandomPiece();
    }

    this.currentPiece = this.nextPiece;
    this.nextPiece = this.nextNextPiece;
    this.nextNextPiece = this.generateRandomPiece();

    this.drawNextPiece('nextPieceCanvas1', this.nextPiece);
    this.drawNextNextPiece('nextPieceCanvas2', this.nextNextPiece);

    this.freezed = false;
    this.currentX = 4;
    this.currentY = 0;
  }

  drawNextPiece(canvasId, piece) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas with id ${canvasId} not found`);
      return;
    }

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const shape = piece.shape;
    const id = piece.id;

    const [minX, maxX, minY, maxY] = this.getPieceBounds(shape);

    const pieceWidth = maxX - minX + 1;
    const pieceHeight = maxY - minY + 1;

    // Calcula o offset para centralizar a peça
    const offsetX = Math.floor((canvas.width - pieceWidth * 20) / 2);
    const offsetY = Math.floor((canvas.height - pieceHeight * 20) / 2);

    context.fillStyle = this.colors[id]; // Define a cor da peça
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x;
        if (shape[i]) {
          context.fillRect(offsetX + (x - minX) * 20, offsetY + (y - minY) * 20, 20, 20);
        }
      }
    }
  }

  drawNextNextPiece(canvasId, piece) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.error(`Canvas with id ${canvasId} not found`);
      return;
    }

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const shape = piece.shape;
    const id = piece.id;

    const [minX, maxX, minY, maxY] = this.getPieceBounds(shape);

    const pieceWidth = maxX - minX + 1;
    const pieceHeight = maxY - minY + 1;

    // Calcula o offset para centralizar a peça
    const offsetX = Math.floor((canvas.width - pieceWidth * 20) / 2);
    const offsetY = Math.floor((canvas.height - pieceHeight * 20) / 2);

    context.fillStyle = this.colors[id]; // Define a cor da peça
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x;
        if (shape[i]) {
          context.fillRect(offsetX + (x - minX) * 20, offsetY + (y - minY) * 20, 20, 20);
        }
      }
    }
  }

  getPieceBounds(shape) {
    let minX = 4,
      maxX = 0,
      minY = 4,
      maxY = 0;
    for (let y = 0; y < 4; ++y) {
      for (let x = 0; x < 4; ++x) {
        let i = 4 * y + x;
        if (shape[i]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return [minX, maxX, minY, maxY];
  }

  // Função principal que move a peça
  tick() {
    if (this.canMoveDown()) {
      this.moveDownPiece();
    } else {
      this.handlePieceFreezing();
    }
  }
  // Verifica se a peça pode continuar se movendo para baixo
  canMoveDown() {
    return this.valid(0, 1);
  }

  moveDownPiece() {
    this.currentY++;
  }

  // Lida com o congelamento da peça e verificação de fim de jogo
  handlePieceFreezing() {
    this.board.freeze(this.currentPiece, this.currentX, this.currentY);
    this.freezed = true;
    this.valid(0, 1);

    if (this.lose) {
      this.endGame();
    } else {
      this.board.clearLines(this.player);
      this.newShape();
    }
  }

  rotate() {
    const rotated = this.currentPiece.rotate();
    if (this.valid(0, 0, rotated)) {
      this.currentPiece.current = rotated;
    }
  }

  moveLeft() {
    if (this.valid(-1)) {
      this.currentX--;
    }
  }

  moveRight() {
    if (this.valid(1)) {
      this.currentX++;
    }
  }

  moveDown() {
    if (this.valid(0, 1)) {
      this.currentY++;
    }
  }

  keyPress(key) {
    switch (key) {
      case 'left':
        this.moveLeft();
        break;
      case 'right':
        this.moveRight();
        break;
      case 'down':
        this.moveDown();
        break;
      case 'rotate':
        this.rotate();
        break;
      case 'drop':
        while (this.valid(0, 1)) {
          this.currentY++;
        }
        this.tick();
        break;
    }
  }

  // checks if the resulting position of current shape will be feasible
  valid(offsetX, offsetY, newCurrent) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = this.currentX + offsetX;
    offsetY = this.currentY + offsetY;
    newCurrent = newCurrent || this.currentPiece.current;

    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (newCurrent[y][x]) {
          if (
            typeof this.board.board[y + offsetY] == 'undefined' ||
            typeof this.board.board[y + offsetY][x + offsetX] == 'undefined' ||
            this.board.board[y + offsetY][x + offsetX] ||
            x + offsetX < 0 ||
            y + offsetY >= this.rows ||
            x + offsetX >= this.cols
          ) {
            if (offsetY == 1 && this.freezed) {
              this.lose = true; // lose if the current shape is settled at the top most row
              this.player.updateHighScore();
            }
            return false;
          }
        }
      }
    }
    return true;
  }

  playButtonClicked() {
    if (this.lose) {
      this.resetGame();
    }
    this.startGame();
  }

  toggleTutorial() {
    var tutorialMessage = document.getElementById('tutorialMessage');
    var displayStyle = tutorialMessage.style.display;
    if (displayStyle === 'none' || displayStyle === '') {
      tutorialMessage.style.display = 'block';
    } else {
      tutorialMessage.style.display = 'none';
    }
  }

  startGame() {
    this.board = new Board(20, 10); // Reset board
    this.player = new Player(); // Reset player
    this.player.loadHighScore(); // Load highscore
    this.player.updateScore()
    this.player.updateHighScore();
    this.newShape();
    this.lose = false;

    this.interval = setInterval(() => this.tick(), 400);
    this.intervalRender = setInterval(() => this.render(), 30);
    document.getElementById('tutorialMessage').style.display = 'none';
    document.getElementById('gameOverMessage').style.display = 'none'; //
    document.getElementById('playbutton').disabled = true; //
    document.getElementById('tutorialButton').disabled = true;
  }

  endGame() {
    this.resetGame();
    document.getElementById('gameOverMessage').style.display = 'block';
    document.getElementById('tutorialButton').disabled = false;
    document.getElementById('playbutton').disabled = false;
    document.getElementById('finalScore').innerText = this.player.score;
    document.getElementById('finalhighScore').innerText = this.player.highscore;
  }

  // clearAllIntervals
  resetGame() {
    clearInterval(this.interval);
    clearInterval(this.intervalRender);
  }

  render() {
    var canvas = document.getElementsByTagName('canvas')[0];

    if (!canvas) {
      console.error('Canvas with id tetrisCanvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.board.draw(ctx, this.colors);
    this.drawCurrentPiece(ctx, canvas.width, canvas.height);
  }

  drawCurrentPiece(ctx, canvasWidth, canvasHeight) {
    if (this.currentPiece) {
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'black';
      const current = this.currentPiece.current;

      for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
          if (current[y][x]) {
            ctx.fillStyle = this.colors[current[y][x] - 1];
            this.board.drawBlock(ctx, this.currentX + x, this.currentY + y);
          }
        }
      }
    }
  }
}

// Vinculando o botão "Play" à função playButtonClicked
window.onload = () => {
  const board = new Board(20, 10);
  const player = new Player();
  const game = new Game(board, player);

  document.getElementById('playbutton').addEventListener('click', () => {
    game.playButtonClicked();
  });

  document.getElementById('newGamebutton').addEventListener('click', () => {
    game.playButtonClicked();
  });

  document.getElementById('tutorialButton').addEventListener('click', () => {
    game.toggleTutorial();
  });

  document.getElementById('closeTutorial').addEventListener('click', () => {
    game.toggleTutorial();
  });

  document.addEventListener('keydown', (e) => {
    var keys = {
      37: 'left',
      39: 'right',
      40: 'down',
      38: 'rotate',
      32: 'drop',
      65: 'left', // Tecla A
      68: 'right', // Tecla D
      83: 'down', // Tecla S
      87: 'rotate', // Tecla W
    };

    if (typeof keys[e.keyCode] != 'undefined') {
      game.keyPress(keys[e.keyCode]);
    }
  });
};
