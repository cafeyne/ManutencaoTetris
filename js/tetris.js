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

  clearLines() {
    for (let y = this.rows - 1; y >= 0; --y) {
      if (this.isRowFilled(y)) {
        this.clearAndMoveLines(y);
        score += 100;
        updateScore();
      }
    }
  }

  isRowFilled(y) {
    return this.board[y].every((cell) => cell !== 0);
  }

  clearAndMoveLines(y) {
    document.getElementById('clearsound').play();
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
    current = piece.current
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (current[y][x]) {
          this.board[y + currentY][x + currentX] = current[y][x];
        }
      }
    }
    freezed = true;
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
    this.current = this.arrayToMatrix(this.shape);
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
    this.current = newCurrent;
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

  tick() {
    if (!this.freezed) {
      if (this.valid(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.moveDownPiece();
      } else {
        this.handlePieceFreezing();
      }
    }
    this.render();
  }

  moveDownPiece() {
    this.currentY++;
  }

  handlePieceFreezing() {
    this.board.freeze(this.currentPiece, this.currentX, this.currentY);
    this.board.clearLines();
    this.newShape();

    if (!this.valid(this.currentX, this.currentY, this.currentPiece)) {
      this.lose = true;
      clearInterval(this.interval);
      clearInterval(this.intervalRender);
    }
  }

  rotate() {
    const rotated = this.rotatePiece();
    if (this.valid(this.currentX, this.currentY, rotated)) {
      this.currentPiece = rotated;
    }
  }

  rotatePiece() {
    const size = this.currentPiece.shape.length;
    const rotated = Array.from({ length: size }, () => Array(size).fill(0));
    for (let y = 0; y < size; ++y) {
      for (let x = 0; x < size; ++x) {
        rotated[x][size - y - 1] = this.currentPiece.shape[y][x];
      }
    }
    return new Piece(this.currentPiece.id, rotated);
  }

  moveLeft() {
    if (this.valid(this.currentX - 1, this.currentY, this.currentPiece)) {
      this.currentX--;
    }
  }

  moveRight() {
    if (this.valid(this.currentX + 1, this.currentY, this.currentPiece)) {
      this.currentX++;
    }
  }

  moveDown() {
    this.tick();
  }

  valid(offsetX, offsetY, newPiece) {
    for (let y = 0; y < newPiece.shape.length; ++y) {
      for (let x = 0; x < newPiece.shape[y].length; ++x) {
        if (newPiece.shape[y][x]) {
          if (offsetX + x < 0 || offsetX + x >= this.board.cols || offsetY + y >= this.board.rows) {
            return false;
          }
          if (offsetY + y >= 0 && this.board.board[offsetY + y][offsetX + x]) {
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

  startGame() {
    this.board = new Board(20, 10); // Reset board
    this.player = new Player(); // Reset player
    this.player.loadHighScore(); // Load highscore

    this.newShape();
    this.lose = false;

    this.interval = setInterval(() => this.tick(), 1000);
    this.intervalRender = setInterval(() => this.render(), 16);
  }

  resetGame() {
    clearInterval(this.interval);
    clearInterval(this.intervalRender);
  }

  render() {
    //const canvas = document.getElementById('tetris');
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
      current = this.arrayToMatrix(this.currentPiece.shape);

      for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
          if (current[y][x]) {
            ctx.fillStyle = this.colors[current[y][x] - 1];
            this.board.drawBlock(this.currentX + x, this.currentY + y);
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') game.moveLeft();
    if (e.key === 'ArrowRight') game.moveRight();
    if (e.key === 'ArrowDown') game.moveDown();
    if (e.key === 'ArrowUp') game.rotate();
  });
};
