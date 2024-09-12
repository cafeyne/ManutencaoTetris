const { JSDOM } = require('jsdom')
const { createCanvas } = require('canvas')
const Board = require('../Board')

describe('Board class tests', () => {
  let board
  const rows = 20
  const cols = 10

  beforeEach(() => {
    board = new Board(rows, cols)

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

    // Substituir o canvas padrão do JSDOM pelo criado com node-canvas
    const canvasElement = createCanvas(300, 600)
    dom.window.document.getElementById('tetris').getContext = canvasElement.getContext.bind(canvasElement)
  })

  test('should initialize board with correct dimensions', () => {
    expect(board.board.length).toBe(rows)
    expect(board.board[0].length).toBe(cols)
    expect(board.board.every((row) => row.every((cell) => cell === 0))).toBe(true)
  })

  test('should clear canvas correctly', () => {
    const canvas = document.getElementById('tetris')
    const ctx = canvas.getContext('2d')
    jest.spyOn(ctx, 'clearRect')

    board.clearCanvas()

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height)
  })

  test('should detect filled row correctly', () => {
    board.board[0] = Array(cols).fill(1)
    expect(board.isRowFilled(0)).toBe(true)
  })

  test('should clear and move lines correctly', () => {
    board.board[0] = Array(cols).fill(1)
    board.clearAndMoveLines(0)
    expect(board.board[0].every((cell) => cell === 0)).toBe(true)
  })

  test('should freeze piece correctly', () => {
    const piece = {
      current: [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    }
    board.freeze(piece, 0, 0)
    expect(board.board[0][0]).toBe(1)
    expect(board.board[1][1]).toBe(1)
  })

  test('should clear lines and update player score', () => {
    const player = { score: 0, updateScore: jest.fn() }
    board.board[19] = Array(cols).fill(1)
    board.clearLines(player)
    expect(player.score).toBe(100)
    expect(player.updateScore).toHaveBeenCalled()
  })
})
