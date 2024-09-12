// Vinculando o botão "Play" à função playButtonClicked
window.onload = () => {
  const board = new Board(20, 10)
  const player = new Player()
  const game = new Game(board, player)

  document.getElementById('playbutton').addEventListener('click', () => {
    game.playButtonClicked()
  })

  document.getElementById('newGamebutton').addEventListener('click', () => {
    game.playButtonClicked()
  })

  document.getElementById('tutorialButton').addEventListener('click', () => {
    game.toggleTutorial()
  })

  document.getElementById('closeTutorial').addEventListener('click', () => {
    game.toggleTutorial()
  })

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
    }

    if (typeof keys[e.keyCode] != 'undefined') {
      game.keyPress(keys[e.keyCode])
    }
  })
}
