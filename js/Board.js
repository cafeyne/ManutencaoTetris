class Board {
  constructor(rows, cols) {
    this.rows = rows
    this.cols = cols
    this.board = Array.from({ length: rows }, () => Array(cols).fill(0))
  }

  //renderBoard
  draw(ctx, colors) {
    ctx.strokeStyle = 'black'
    for (let x = 0; x < this.cols; ++x) {
      for (let y = 0; y < this.rows; ++y) {
        if (this.board[y][x]) {
          ctx.fillStyle = colors[this.board[y][x] - 1]
          this.drawBlock(ctx, x, y)
        }
      }
    }
  }

  drawBlock(ctx, x, y) {
    const BLOCK_W = 300 / this.cols
    const BLOCK_H = 600 / this.rows
    ctx.fillRect(BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1, BLOCK_H - 1)
    ctx.strokeRect(BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1, BLOCK_H - 1)
  }

  clearCanvas() {
    var canvas = document.getElementsByTagName('canvas')[0]
    var ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  clearLines(player) {
    for (let y = this.rows - 1; y >= 0; --y) {
      if (this.isRowFilled(y)) {
        this.clearAndMoveLines(y)
        player.score += 100
        player.updateScore()
      }
    }
  }

  isRowFilled(y) {
    return this.board[y].every((cell) => cell !== 0)
  }

  clearAndMoveLines(y) {
    for (var yy = y; yy > 0; --yy) {
      for (var x = 0; x < this.cols; ++x) {
        this.board[yy][x] = this.board[yy - 1][x]
      }
    }
    for (var x = 0; x < this.cols; ++x) {
      this.board[0][x] = 0
    }
  }

  // stop shape at its position and fix it to board
  freeze(piece, currentX, currentY) {
    const current = piece.current
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (current[y][x]) {
          this.board[y + currentY][x + currentX] = current[y][x]
        }
      }
    }
  }
}

module.exports = Board
