class Game {
  constructor(board, player) {
    this.board = board
    this.player = player
    this.currentPiece = null
    this.currentX = 0
    this.currentY = 0
    this.freezed = false
    this.nextPiece = null
    this.nextNextPiece = null
    this.lose = false
    this.interval = null
    this.intervalRender = null
    this.shapes = [
      [1, 1, 1, 1],
      [1, 1, 1, 0, 1],
      [1, 1, 1, 0, 0, 0, 1],
      [1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 1, 1],
      [0, 1, 0, 0, 1, 1, 1],
    ]
    this.colors = [
      'rgba(97, 200, 246, 1)',
      'rgba(246, 192, 97, 1)',
      'rgba(99, 79, 253, 1)',
      'rgba(218, 246, 97, 1)',
      'rgba(253, 76, 76, 1)',
      'rgba(97, 246, 123, 1)',
      'rgba(214, 74, 255, 1)',
    ]
  }

  generateRandomPiece() {
    const id = Math.floor(Math.random() * this.shapes.length)
    const shape = this.shapes[id]
    return new Piece(id, shape)
  }

  arrayToMatrix(array) {
    let matrix = []

    for (var y = 0; y < 4; ++y) {
      matrix[y] = []
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x
        if (typeof array[i] != 'undefined' && array[i]) {
          matrix[y][x] = id + 1
        } else {
          matrix[y][x] = 0
        }
      }
    }
    return matrix
  }

  newShape() {
    if (!this.nextPiece) {
      this.nextPiece = this.generateRandomPiece()
      this.nextNextPiece = this.generateRandomPiece()
    }

    this.currentPiece = this.nextPiece
    this.nextPiece = this.nextNextPiece
    this.nextNextPiece = this.generateRandomPiece()

    this.drawNextPiece('nextPieceCanvas1', this.nextPiece)
    this.drawNextNextPiece('nextPieceCanvas2', this.nextNextPiece)

    this.freezed = false
    this.currentX = 4
    this.currentY = 0
  }

  drawNextPiece(canvasId, piece) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      console.error(`Canvas with id ${canvasId} not found`)
      return
    }

    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    const shape = piece.shape
    const id = piece.id

    const [minX, maxX, minY, maxY] = this.getPieceBounds(shape)

    const pieceWidth = maxX - minX + 1
    const pieceHeight = maxY - minY + 1

    // Calcula o offset para centralizar a peça
    const offsetX = Math.floor((canvas.width - pieceWidth * 20) / 2)
    const offsetY = Math.floor((canvas.height - pieceHeight * 20) / 2)

    context.fillStyle = this.colors[id] // Define a cor da peça
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x
        if (shape[i]) {
          context.fillRect(offsetX + (x - minX) * 20, offsetY + (y - minY) * 20, 20, 20)
        }
      }
    }
  }

  drawNextNextPiece(canvasId, piece) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      console.error(`Canvas with id ${canvasId} not found`)
      return
    }

    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    const shape = piece.shape
    const id = piece.id

    const [minX, maxX, minY, maxY] = this.getPieceBounds(shape)

    const pieceWidth = maxX - minX + 1
    const pieceHeight = maxY - minY + 1

    // Calcula o offset para centralizar a peça
    const offsetX = Math.floor((canvas.width - pieceWidth * 20) / 2)
    const offsetY = Math.floor((canvas.height - pieceHeight * 20) / 2)

    context.fillStyle = this.colors[id] // Define a cor da peça
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x
        if (shape[i]) {
          context.fillRect(offsetX + (x - minX) * 20, offsetY + (y - minY) * 20, 20, 20)
        }
      }
    }
  }

  getPieceBounds(shape) {
    let minX = 4,
      maxX = 0,
      minY = 4,
      maxY = 0
    for (let y = 0; y < 4; ++y) {
      for (let x = 0; x < 4; ++x) {
        let i = 4 * y + x
        if (shape[i]) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    return [minX, maxX, minY, maxY]
  }

  // Função principal que move a peça
  tick() {
    if (this.canMoveDown()) {
      this.moveDownPiece()
    } else {
      this.handlePieceFreezing()
    }
  }
  // Verifica se a peça pode continuar se movendo para baixo
  canMoveDown() {
    return this.valid(0, 1)
  }

  moveDownPiece() {
    this.currentY++
  }

  // Lida com o congelamento da peça e verificação de fim de jogo
  handlePieceFreezing() {
    this.board.freeze(this.currentPiece, this.currentX, this.currentY)
    this.freezed = true
    // this.playSound()
    this.valid(0, 1)

    if (this.lose) {
      this.endGame()
    } else {
      this.board.clearLines(this.player)
      this.newShape()
    }
  }

  playSound() {
    const audio = document.getElementById('clearsound')
    audio.currentTime = 0
    audio.play()
    audio.addEventListener('ended', () => {
      audio.currentTime = 0
    })
  }

  rotate() {
    const rotated = this.currentPiece.rotate()
    if (this.valid(0, 0, rotated)) {
      this.currentPiece.current = rotated
    }
  }

  moveLeft() {
    if (this.valid(-1)) {
      this.currentX--
    }
  }

  moveRight() {
    if (this.valid(1)) {
      this.currentX++
    }
  }

  moveDown() {
    if (this.valid(0, 1)) {
      this.currentY++
    }
  }

  keyPress(key) {
    switch (key) {
      case 'left':
        this.moveLeft()
        break
      case 'right':
        this.moveRight()
        break
      case 'down':
        this.moveDown()
        break
      case 'rotate':
        this.rotate()
        break
      case 'drop':
        while (this.valid(0, 1)) {
          this.currentY++
        }
        this.tick()
        break
    }
  }

  // checks if the resulting position of current shape will be feasible
  valid(offsetX, offsetY, newCurrent) {
    offsetX = offsetX || 0
    offsetY = offsetY || 0
    offsetX = this.currentX + offsetX
    offsetY = this.currentY + offsetY
    newCurrent = newCurrent || this.currentPiece.current

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
              this.lose = true // lose if the current shape is settled at the top most row
              this.player.updateHighScore()
            }
            return false
          }
        }
      }
    }
    return true
  }

  playButtonClicked() {
    if (this.lose) {
      this.resetGame()
    }
    this.startGame()
  }

  toggleTutorial() {
    var tutorialMessage = document.getElementById('tutorialMessage')
    var displayStyle = tutorialMessage.style.display
    if (displayStyle === 'none' || displayStyle === '') {
      tutorialMessage.style.display = 'block'
    } else {
      tutorialMessage.style.display = 'none'
    }
  }

  startGame() {
    this.board = new Board(20, 10) // Reset board
    this.player = new Player() // Reset player
    this.player.loadHighScore() // Load highscore
    this.player.updateScore()
    this.player.updateHighScore()
    this.newShape()
    this.lose = false

    this.interval = setInterval(() => this.tick(), 400)
    this.intervalRender = setInterval(() => this.render(), 30)
    document.getElementById('tutorialMessage').style.display = 'none'
    document.getElementById('gameOverMessage').style.display = 'none' //
    document.getElementById('playbutton').disabled = true //
    document.getElementById('tutorialButton').disabled = true
  }

  endGame() {
    this.resetGame()
    document.getElementById('gameOverMessage').style.display = 'block'
    document.getElementById('tutorialButton').disabled = false
    document.getElementById('playbutton').disabled = false
    document.getElementById('finalScore').innerText = this.player.score
    document.getElementById('finalhighScore').innerText = this.player.highscore
  }

  // clearAllIntervals
  resetGame() {
    clearInterval(this.interval)
    clearInterval(this.intervalRender)
  }

  render() {
    var canvas = document.getElementsByTagName('canvas')[0]

    if (!canvas) {
      console.error('Canvas with id tetrisCanvas not found')
      return
    }

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.board.draw(ctx, this.colors)
    this.drawCurrentPiece(ctx, canvas.width, canvas.height)
  }

  drawCurrentPiece(ctx, canvasWidth, canvasHeight) {
    if (this.currentPiece) {
      ctx.fillStyle = 'red'
      ctx.strokeStyle = 'black'
      const current = this.currentPiece.current

      for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
          if (current[y][x]) {
            ctx.fillStyle = this.colors[current[y][x] - 1]
            this.board.drawBlock(ctx, this.currentX + x, this.currentY + y)
          }
        }
      }
    }
  }
}

module.exports = Game
