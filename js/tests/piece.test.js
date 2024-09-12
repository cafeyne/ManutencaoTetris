const Piece = require('../Piece')

describe('Piece class tests', () => {
  test('should create the matrix from array correctly', () => {
    const shape = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const expectedMatrix = [
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    const piece = new Piece(1, shape)
    expect(piece.current).toEqual(expectedMatrix)
  })

  test('should rotate the shape anti-clockwise', () => {
    const shape = [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const piece = new Piece(1, shape)

    const rotatedShape = piece.rotate()

    const expectedRotatedShape = [
      [0, 0, 2, 2],
      [0, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    expect(rotatedShape).toEqual(expectedRotatedShape)
  })

  test('should rotate another shape anti-clockwise', () => {
    const shape = [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const piece = new Piece(1, shape)

    const rotatedShape = piece.rotate()

    const expectedRotatedShape = [
      [0, 0, 2, 2],
      [0, 0, 2, 0],
      [0, 0, 2, 0],
      [0, 0, 0, 0],
    ]

    expect(rotatedShape).toEqual(expectedRotatedShape)
  })

  test('should handle empty shape array', () => {
    const shape = []

    const expectedMatrix = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    const piece = new Piece(1, shape)
    expect(piece.current).toEqual(expectedMatrix)
  })

  test('should handle shape array with undefined values', () => {
    const shape = [1, undefined, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    const expectedMatrix = [
      [2, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    const piece = new Piece(1, shape)
    expect(piece.current).toEqual(expectedMatrix)
  })
})
