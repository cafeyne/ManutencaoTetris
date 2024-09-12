const { JSDOM } = require('jsdom')
const Player = require('../Player')

describe('Player class tests', () => {
  let player
  let localStorageMock

  beforeEach(() => {
    player = new Player()

    const dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
      <body>
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

    document.body.innerHTML = `
      <div id="score"></div>
      <div id="highscore"></div>
    `

    localStorage.clear()
  })

  test('should initialize with score and highscore as 0', () => {
    expect(player.score).toBe(0)
    expect(player.highscore).toBe(0)
  })

  test('should update the score in the DOM', () => {
    player.score = 100
    player.updateScore()
    expect(document.getElementById('score').innerText).toBe(100)
  })

  test('should load highscore from localStorage', () => {
    localStorage.setItem('highscore', '200')
    player.loadHighScore()
    expect(player.highscore).toBe(200)
    expect(document.getElementById('highscore').innerText).toBe(200)
  })

  test('should set highscore to 0 if not in localStorage', () => {
    player.loadHighScore()
    expect(player.highscore).toBe(0)
    expect(document.getElementById('highscore').innerText).toBe(0)
  })

  test('should save highscore to localStorage', () => {
    player.highscore = 300
    player.saveHighScore()
    expect(localStorage.getItem('highscore')).toBe('300')
  })

  test('should update highscore if current score is higher', () => {
    player.score = 400
    player.updateHighScore()
    expect(player.highscore).toBe(400)
    expect(localStorage.getItem('highscore')).toBe('400')
    expect(document.getElementById('highscore').innerText).toBe(400)
  })

  test('should not update highscore if current score is lower', () => {
    player.highscore = 500
    localStorage.setItem('highscore', '500')
    player.score = 100
    player.updateHighScore()
    expect(player.highscore).toBe(500)
    expect(localStorage.getItem('highscore')).toBe('500')
    expect(document.getElementById('highscore').innerText).toBe(500)
  })
})
