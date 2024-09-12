const { JSDOM } = require('jsdom')

describe('Game class tests', () => {
  let game
  let board
  let player
  let localStorageMock

  beforeEach(() => {
    global.Player = require('../Player')
    global.Piece = require('../Piece')
    global.Board = require('../Board')
    global.Game = require('../Game')

    const dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
      <body>
          <div id="game-container">
            <div id="button-container">
              <button id="playbutton">
                <img src="icons/botao-play.png" alt="Play" />
              </button>
              <button id="tutorialButton">
                <img src="icons/pergunta.png" alt="Tutorial" />
              </button>
              <div id="gameOverMessage">
                <p>FIM DE JOGO!</p>
                <p>Pontuação: <span id="finalScore"></span></p>
                <p>Melhor Pontuação: <span id="finalhighScore"></span></p>
                <button id="newGamebutton">Recomeçar</button>
              </div>
            </div>

            <canvas id="tetris" width="300" height="600"></canvas>

            <div id="next-container">
              <div id="nextPiece1">
                <div>Próxima Peça:</div>
                <canvas id="nextPieceCanvas1" width="115" height="105"></canvas>
              </div>
              <div id="nextPiece2">
                <div>Próxima Peça:</div>
                <canvas id="nextPieceCanvas2" width="115" height="105"></canvas>
              </div>
            </div>
            <div id="score-container">
              <div id="highscoreContain">
                Highscore:
                <div id="highscore">0</div>
              </div>
              <div id="scoreContain">
                Score:
                <div id="score">0</div>
              </div>
            </div>
          </div>

          <div id="tutorialMessage">
            <div id="closeTutorial">X</div>
            <p><strong>Como jogar:</strong></p>
            <p>
              <span style="font-size: 24px">&#8592;</span> <span style="font-size: 24px">&#8594;</span> ou Teclas
              <strong>A</strong> e <strong>D</strong>: Movem as peças para os lados
            </p>
            <p>
              <span style="font-size: 24px">&#8593;</span>
              ou Tecla <strong>W</strong>: Rotaciona a peça
            </p>
            <p>
              <span style="font-size: 24px">&#8595;</span>
              ou Tecla <strong>S</strong>: Aumenta a velocidade de descida das peças
            </p>
            <p>Barra de espaço: Derruba a peça instantaneamente</p>
            <p>
              <strong>Objetivo:</strong> Combine peças para limpar as linhas sem deixar que uma peça toque no topo da tela.
            </p>
          </div>
        </body>
      </html>
    `,
      { runScripts: 'dangerously', resources: 'usable' },
    )

    global.document = dom.window.document
    global.window = dom.window

    localStorageMock = (function () {
      let store = {}
      return {
        getItem(key) {
          return store[key] || null
        },
        setItem(key, value) {
          store[key] = value.toString()
        },
        clear() {
          store = {}
        },
      }
    })()

    global.localStorage = localStorageMock

    board = new Board(20, 10)
    player = new Player()
    game = new Game(board, player)
  })

  afterEach(() => {
    if (game.interval) {
      clearInterval(game.interval)
    }
    if (game.intervalRender) {
      clearInterval(game.intervalRender)
    }
  })

  test('should initialize with correct properties', () => {
    expect(game.board).toBe(board)
    expect(game.player).toBe(player)
    expect(game.currentPiece).toBe(null)
    expect(game.currentX).toBe(0)
    expect(game.currentY).toBe(0)
    expect(game.freezed).toBe(false)
    expect(game.nextPiece).toBe(null)
    expect(game.nextNextPiece).toBe(null)
    expect(game.lose).toBe(false)
    expect(game.interval).toBe(null)
    expect(game.intervalRender).toBe(null)
  })

  test('should generate a random piece', () => {
    const piece = game.generateRandomPiece()
    expect(piece).toBeInstanceOf(Piece)
    expect(piece.shape).toBeDefined()
  })

  test('should start a new shape', () => {
    game.newShape()
    expect(game.currentPiece).toBeDefined()
    expect(game.nextPiece).toBeDefined()
    expect(game.nextNextPiece).toBeDefined()
    expect(game.freezed).toBe(false)
    expect(game.currentX).toBe(4)
    expect(game.currentY).toBe(0)
  })

  test('should move piece down if possible', () => {
    game.newShape()
    const initialY = game.currentY
    game.tick()
    expect(game.currentY).toBe(initialY + 1)
  })

  test('should rotate piece if valid', () => {
    game.newShape()
    const initialCurrent = game.currentPiece.current
    game.rotate()
    expect(game.currentPiece.current).not.toBe(initialCurrent)
  })

  test('should move piece left if valid', () => {
    game.newShape()
    const initialX = game.currentX
    game.moveLeft()
    expect(game.currentX).toBe(initialX - 1)
  })

  test('should move piece right if valid', () => {
    game.newShape()
    const initialX = game.currentX
    game.moveRight()
    expect(game.currentX).toBe(initialX + 1)
  })

  test('should move piece down if valid', () => {
    game.newShape()
    const initialY = game.currentY
    game.moveDown()
    expect(game.currentY).toBe(initialY + 1)
  })

  test('should end game when piece is frozen at the top', () => {
    game.newShape()
    game.currentY = 0
    game.handlePieceFreezing()
    expect(game.lose).toBe(true)
  })

  test('should reset game intervals on resetGame', () => {
    game.startGame()
    game.resetGame()
    expect(game.interval).not.toBe(null)
    expect(game.intervalRender).not.toBe(null)
  })

  test('should start game and initialize properties', () => {
    game.startGame()
    expect(game.board).toBeInstanceOf(Board)
    expect(game.player).toBeInstanceOf(Player)
    expect(game.lose).toBe(false)
    expect(game.interval).not.toBe(null)
    expect(game.intervalRender).not.toBe(null)
  })

  test('should end game and display game over message', () => {
    game.endGame()
    expect(document.getElementById('gameOverMessage').style.display).toBe('block')
    expect(document.getElementById('tutorialButton').disabled).toBe(false)
    expect(document.getElementById('playbutton').disabled).toBe(false)
  })
})
