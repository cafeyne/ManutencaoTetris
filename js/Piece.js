class Piece {
  constructor(id, shape) {
    this.id = id
    this.shape = shape
    this.current = this.arrayToMatrix(id, this.shape)
  }

  // returns rotates the rotated shape 'current' perpendicularly anticlockwise
  rotate() {
    var newCurrent = []
    for (var y = 0; y < 4; ++y) {
      newCurrent[y] = []
      for (var x = 0; x < 4; ++x) {
        newCurrent[y][x] = this.current[3 - x][y]
      }
    }
    return newCurrent
  }

  arrayToMatrix(id, array) {
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
}

module.exports = Piece
