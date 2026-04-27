import { useState, useEffect } from 'react'
import './App.css'
import whiteBishop from './assets/pieces-basic-png/white-bishop.png'
import whiteKing from './assets/pieces-basic-png/white-king.png'
import whiteKnight from './assets/pieces-basic-png/white-knight.png'
import whitePawn from './assets/pieces-basic-png/white-pawn.png'
import whiteQueen from './assets/pieces-basic-png/white-queen.png'
import whiteRook from './assets/pieces-basic-png/white-rook.png'
import blackBishop from './assets/pieces-basic-png/black-bishop.png'
import blackKing from './assets/pieces-basic-png/black-king.png'
import blackKnight from './assets/pieces-basic-png/black-knight.png'
import blackPawn from './assets/pieces-basic-png/black-pawn.png'
import blackQueen from './assets/pieces-basic-png/black-queen.png'
import blackRook from './assets/pieces-basic-png/black-rook.png'

const BOARD_SIDE_WIDTH = 7
const BOARD_SIDE_HEIGHT = 2
const CENTER_SIZE = 4

const pieceImages = {
  white: {
    pawn: whitePawn,
    rook: whiteRook,
    knight: whiteKnight,
    bishop: whiteBishop,
    queen: whiteQueen,
    king: whiteKing,
  },
  black: {
    pawn: blackPawn,
    rook: blackRook,
    knight: blackKnight,
    bishop: blackBishop,
    queen: blackQueen,
    king: blackKing,
  },
}

const backRowOrder = ['rook', 'knight', 'bishop', 'queen', 'bishop', 'knight', 'rook']

const createPiece = (color, type) => ({ color, type, image: pieceImages[color][type] })

function App() {
  const [currentTurn, setCurrentTurn] = useState('white')
  const [selected, setSelected] = useState(null)
  const [topPieces, setTopPieces] = useState(() => [
    ...backRowOrder.map((type) => createPiece('white', type)),
    ...Array.from({ length: BOARD_SIDE_WIDTH }, () => createPiece('white', 'pawn')),
  ])
  const [bottomPieces, setBottomPieces] = useState(() => [
    ...Array.from({ length: BOARD_SIDE_WIDTH }, () => createPiece('black', 'pawn')),
    ...backRowOrder.map((type) => createPiece('black', type)),
  ])
  const [centerPieces, setCenterPieces] = useState(() =>
    Array.from({ length: CENTER_SIZE * CENTER_SIZE }, () => null)
  )

  useEffect(() => {
    const bgWhite = 'radial-gradient(circle at top left, #fff9db, #ffd5b5 30%, #fff7ed 100%)'
    const bgBlack = 'radial-gradient(circle at top left, #1e293b, #0f172a 40%, #111827 100%)'
    document.documentElement.style.setProperty('--bg-white', bgWhite)
    document.documentElement.style.setProperty('--bg-black', bgBlack)
    document.body.style.background = currentTurn === 'white' ? bgWhite : bgBlack
  }, [currentTurn])

  const getPiece = (region, index) => {
    if (region === 'top') return topPieces[index]
    if (region === 'bottom') return bottomPieces[index]
    return centerPieces[index]
  }

  const setPiece = (region, index, piece) => {
    if (region === 'top') {
      setTopPieces((previous) => {
        const next = [...previous]
        next[index] = piece
        return next
      })
      return
    }

    if (region === 'bottom') {
      setBottomPieces((previous) => {
        const next = [...previous]
        next[index] = piece
        return next
      })
      return
    }

    setCenterPieces((previous) => {
      const next = [...previous]
      next[index] = piece
      return next
    })
  }

  const clearPiece = (region, index) => setPiece(region, index, null)

  const toggleTurn = () => {
    setCurrentTurn((previous) => (previous === 'white' ? 'black' : 'white'))
  }

  const canSelect = (piece) => piece && piece.color === currentTurn

  const activateSelection = (region, index) => {
    if (selected && selected.region === region && selected.index === index) {
      setSelected(null)
    } else {
      setSelected({ region, index })
    }
  }

  const getValidMoves = (piece, region, index, cols) => {
    // Pieces from side boards can move to any empty square on center board
    if (region !== 'center') {
      return Array.from({ length: CENTER_SIZE * CENTER_SIZE }, (_, i) => i).filter(
        (i) => !centerPieces[i]
      )
    }

    // Pieces on center board follow chess rules with board orientation
    if (!piece) return []

    const row = Math.floor(index / cols)
    const col = index % cols
    const validMoves = []

    // Determine direction: white moves down (+), black moves up (-)
    const moveDirection = piece.color === 'white' ? 1 : -1

    const isValidPos = (r, c) => r >= 0 && r < CENTER_SIZE && c >= 0 && c < CENTER_SIZE

    const canMoveTo = (r, c) => {
      if (!isValidPos(r, c)) return false
      const targetIndex = r * cols + c
      const targetPiece = centerPieces[targetIndex]
      return !targetPiece || targetPiece.color !== piece.color
    }

    const addMove = (r, c) => {
      if (canMoveTo(r, c)) {
        validMoves.push(r * cols + c)
      }
    }

    const addSlidingMoves = (directions) => {
      for (const [dr, dc] of directions) {
        let r = row + dr
        let c = col + dc
        while (isValidPos(r, c)) {
          const targetIndex = r * cols + c
          const targetPiece = centerPieces[targetIndex]
          if (!targetPiece) {
            validMoves.push(targetIndex)
          } else if (targetPiece.color !== piece.color) {
            validMoves.push(targetIndex)
            break
          } else {
            break
          }
          r += dr
          c += dc
        }
      }
    }

    switch (piece.type) {
      case 'pawn': {
        const forwardRow = row + moveDirection
        if (isValidPos(forwardRow, col) && !centerPieces[forwardRow * cols + col]) {
          validMoves.push(forwardRow * cols + col)
        }
        for (const newCol of [col - 1, col + 1]) {
          if (isValidPos(forwardRow, newCol)) {
            const targetIndex = forwardRow * cols + newCol
            if (centerPieces[targetIndex]?.color !== piece.color && centerPieces[targetIndex]) {
              validMoves.push(targetIndex)
            }
          }
        }
        break
      }
      case 'rook': {
        // Can move forward, backward (toward home), left, right
        addSlidingMoves([[moveDirection, 0], [-moveDirection, 0], [0, 1], [0, -1]])
        break
      }
      case 'knight': {
        // Knights can move in all L-shaped moves regardless of orientation
        const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]
        for (const [dr, dc] of moves) {
          addMove(row + dr, col + dc)
        }
        break
      }
      case 'bishop': {
        // Can move forward-diagonally and backward-diagonally, left-right diagonally
        const diagonals =
          moveDirection === 1
            ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
            : [[1, 1], [1, -1], [-1, 1], [-1, -1]]
        addSlidingMoves(diagonals)
        break
      }
      case 'queen': {
        // Can move forward, backward, and all diagonals
        addSlidingMoves([
          [moveDirection, 0],
          [-moveDirection, 0],
          [0, 1],
          [0, -1],
          [moveDirection, 1],
          [moveDirection, -1],
          [-moveDirection, 1],
          [-moveDirection, -1],
        ])
        break
      }
      case 'king': {
        // Can move one square in any direction including forward/backward
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
              addMove(row + dr, col + dc)
            }
          }
        }
        break
      }
    }

    return validMoves
  }

  const moveSelectedPieceTo = (region, index) => {
    if (!selected) return

    const selectedPiece = getPiece(selected.region, selected.index)
    if (!selectedPiece) {
      setSelected(null)
      return
    }

    if (region !== 'center') return
    if (selected.region === 'center' && selected.index === index) {
      setSelected(null)
      return
    }

    // Get valid moves for the selected piece - use correct column count based on region
    const cols = selected.region === 'center' ? CENTER_SIZE : BOARD_SIDE_WIDTH
    const validMoves = getValidMoves(selectedPiece, selected.region, selected.index, cols)

    // Check if the target index is in valid moves
    if (!validMoves.includes(index)) {
      return
    }

    setPiece(region, index, selectedPiece)
    clearPiece(selected.region, selected.index)
    setSelected(null)
    toggleTurn()
  }

  const getValidMovesForHighlight = () => {
    if (!selected) return []
    const piece = getPiece(selected.region, selected.index)
    if (!piece) return []
    const cols = selected.region === 'center' ? CENTER_SIZE : BOARD_SIDE_WIDTH
    return getValidMoves(piece, selected.region, selected.index, cols)
  }

  const handleCellClick = (region, index) => {
    const piece = getPiece(region, index)
    if (piece && canSelect(piece)) {
      activateSelection(region, index)
      return
    }

    if (selected) {
      moveSelectedPieceTo(region, index)
    }
  }

  const renderBoard = (rows, cols, region, className) => {
    const rowArray = Array.from({ length: rows })
    const colArray = Array.from({ length: cols })
    const validMoves = getValidMovesForHighlight()

    return (
      <div className={`chessboard ${className}`}>
        {rowArray.map((_, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {colArray.map((_, colIndex) => {
              const index = rowIndex * cols + colIndex
              const isDark = (rowIndex + colIndex) % 2 === 1
              const piece = getPiece(region, index)
              const isSelected = selected?.region === region && selected?.index === index
              const isValidMove = selected && validMoves.includes(index) && region === 'center'

              return (
                <button
                  key={index}
                  type="button"
                  className={`board-cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''}`}
                  onClick={() => handleCellClick(region, index)}
                >
                  {piece ? (
                    <img
                      src={piece.image}
                      alt={`${piece.color} ${piece.type}`}
                      className="piece"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <main className={`app-shell turn-${currentTurn}`}>
      <section className="board-card">
        <span className="turn-label">{currentTurn === 'white' ? 'White turn' : 'Black turn'}</span>

        <div className="board-layout">
          <div className="side-board top-board">
            {renderBoard(BOARD_SIDE_HEIGHT, BOARD_SIDE_WIDTH, 'top', 'side-board-grid')}
          </div>

          <div className="center-board">
            {renderBoard(CENTER_SIZE, CENTER_SIZE, 'center', 'main-board-grid')}
          </div>

          <div className="side-board bottom-board">
            {renderBoard(BOARD_SIDE_HEIGHT, BOARD_SIDE_WIDTH, 'bottom', 'side-board-grid')}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
