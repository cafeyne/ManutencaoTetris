class Player {
  constructor() {
    this.score = 0
    this.highscore = 0
  }

  updateScore() {
    document.getElementById('score').innerText = this.score
  }

  loadHighScore() {
    let savedHighScore = localStorage.getItem('highscore')
    if (savedHighScore !== null) {
      this.highscore = parseInt(savedHighScore)
    } else {
      this.highscore = 0
    }
    document.getElementById('highscore').innerText = this.highscore
  }

  saveHighScore() {
    localStorage.setItem('highscore', this.highscore)
  }

  updateHighScore() {
    if (this.score > this.highscore) {
      this.highscore = this.score
      this.saveHighScore()
    }
    document.getElementById('highscore').innerText = this.highscore
  }
}

module.exports = Player
