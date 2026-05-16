import { useState, useEffect } from 'react'
import './gameplay.css'

const BOARD_SIDE_WIDTH = 7
const BOARD_SIDE_HEIGHT = 2
const CENTER_SIZE = 5



function GamePlay({ whiteDeck, blackDeck, whiteType, blackType }) {

  const whiteBackRowOrder = whiteType?.[0] === 'queen' ?
    ['rook', 'knight', 'bishop', 'queen', 'bishop', 'knight', 'rook'] :
    ['rook', 'knight', 'bishop', 'titan', 'bishop', 'knight', 'rook']

  const blackBackRowOrder = blackType?.[0] === 'queen' ?
    ['rook', 'knight', 'bishop', 'queen', 'bishop', 'knight', 'rook'] :
    ['rook', 'knight', 'bishop', 'titan', 'bishop', 'knight', 'rook']


  const pieceImages = {
    white: {
      pawn: whiteDeck?.[4],
      rook: whiteDeck?.[3],
      knight: whiteDeck?.[1],
      bishop: whiteDeck?.[2],
      queen: whiteDeck?.[0],
      titan: whiteDeck?.[0],
    },
    black: {
      pawn: blackDeck?.[4],
      rook: blackDeck?.[3],
      knight: blackDeck?.[1],
      bishop: blackDeck?.[2],
      queen: blackDeck?.[0],
      titan: blackDeck?.[0],
    },
  }


  const getDeckTypeMap = (types = []) => ({
    queen: types[0] ?? 'queen',
    titan: types[0] ?? 'queen',
    knight: types[1] ?? 'knight',
    bishop: types[2] ?? 'bishop',
    rook: types[3] ?? 'rook',
    pawn: types[4] ?? 'pawn',
    pawnette: types[4] ?? 'pawnette',
    droid: types[4] ?? 'droid',
  })

  const whiteDeckTypeMap = getDeckTypeMap(whiteType)
  const blackDeckTypeMap = getDeckTypeMap(blackType)

  const createPiece = (color, mvtype) => ({
    color,
    mvtype,
    pctype: (color === 'white' ? whiteDeckTypeMap : blackDeckTypeMap)[mvtype] ?? mvtype,
    image: pieceImages[color][mvtype],
  })
  const [currentTurn, setCurrentTurn] = useState('white')
  const [selected, setSelected] = useState(null)
  const [specialMode, setSpecialMode] = useState(null)
  const [remainingTime, setRemainingTime] = useState(350)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState('')
  const [strikes, setStrikes] = useState({ white: 0, black: 0 })
  const [topPieces, setTopPieces] = useState(() => [
    ...whiteBackRowOrder.map((mvtype) => createPiece('white', mvtype)),
    ...Array.from({ length: BOARD_SIDE_WIDTH }, () => createPiece('white', 'pawn')),
  ])
  const [bottomPieces, setBottomPieces] = useState(() => [
    ...Array.from({ length: BOARD_SIDE_WIDTH }, () => createPiece('black', 'pawn')),
    ...blackBackRowOrder.map((mvtype) => createPiece('black', mvtype)),
  ])
  const [centerPieces, setCenterPieces] = useState(() =>
    Array.from({ length: CENTER_SIZE * CENTER_SIZE }, () => null)
  )

  function isSpecial(piece) {
    // Define which pieces are considered special for movement purposes
    const specialPieces = ['hades', 'bomber', 'cupid', 'angel', 'gunslinger', 'dragon', 'konungr', 'beastrider', 'scientist', 'nova']
    return specialPieces.includes(piece)
  }

  useEffect(() => {
    if (specialMode) {
      console.log('In Special Mode')
    } else console.log('Special Mode cancelled')
  }, [specialMode])

  useEffect(() => {
    document.body.classList.remove('turn-white', 'turn-black')
    document.body.classList.add(currentTurn === 'white' ? 'turn-white' : 'turn-black')
  }, [currentTurn])

  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    titan: 9,
  }

  const getPiece = (region, index) => {
    if (region === 'top') return topPieces[index]
    if (region === 'bottom') return bottomPieces[index]
    return centerPieces[index]
  }

  const getTeamMaterial = (color) => {
    const sidePieces = color === 'white' ? topPieces : bottomPieces
    const teamSidePieces = sidePieces.filter(Boolean)
    const teamCenterPieces = centerPieces.filter((piece) => piece?.color === color)
    return [...teamSidePieces, ...teamCenterPieces].reduce(
      (sum, piece) => sum + (pieceValues[piece.mvtype] ?? 0),
      0
    )
  }

  const formatMaterialDiff = (value) => {
    if (value > 0) return `+${value}`
    if (value < 0) return `-${Math.abs(value)}`
    return '0'
  }

  const getPlayerHeader = (color, label, material, diff) => (
    <div className={`player-score-row player-${color}`}>
      <span className="player-name">{label}</span>
      <span className="player-strikes">
        {'❌'.repeat(strikes[color])}
      </span>
      <span className="player-material">
        {material} ({formatMaterialDiff(diff)})
      </span>
    </div>
  )

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

  const switchTurn = () => {
    setCurrentTurn((previous) => (previous === 'white' ? 'black' : 'white'))
    setRemainingTime(350)
    setSelected(null)
    setSpecialMode(false)
  }

  const toggleTurn = () => {
    switchTurn()
  }

  const canSelect = (piece) => piece && piece.color === currentTurn

  const getTeamPieces = (color) => {
    const sidePieces = color === 'white' ? topPieces : bottomPieces
    const sideRegion = color === 'white' ? 'top' : 'bottom'

    const teamSidePieces = sidePieces
      .map((piece, index) => (piece ? { piece, region: sideRegion, index } : null))
      .filter(Boolean)

    const teamCenterPieces = centerPieces
      .map((piece, index) => (piece?.color === color ? { piece, region: 'center', index } : null))
      .filter(Boolean)

    return [...teamSidePieces, ...teamCenterPieces]
  }

  const playerHasAnyMoves = (color) =>
    getTeamPieces(color).some(({ piece, region, index }) =>
      getValidMoves(piece, region, index, region === 'center' ? CENTER_SIZE : BOARD_SIDE_WIDTH).length > 0
    )

  const evaluateGameStatus = () => {
    const teamPieces = getTeamPieces(currentTurn)
    if (teamPieces.length === 0) {
      return {
        over: true,
        message: `Game over — ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)} has no pieces left.`,
      }
    }

    if (!playerHasAnyMoves(currentTurn)) {
      return {
        over: true,
        message: `Game over — ${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)} has no legal moves.`,
      }
    }

    return { over: false, message: '' }
  }

  const activateSelection = (region, index) => {
    if (selected && selected.region === region && selected.index === index) {
      const selectedPiece = getPiece(region, index)

      if (specialMode) {
        setSpecialMode(false)
        setSelected(null)
        return
      }

      if (isSpecial(selectedPiece?.pctype) && region === 'center') {
        setSpecialMode(true)
      } else {
        setSelected(null)
      }
    } else {
      if (specialMode) {
        setSpecialMode(false)
      }
      setSelected({ region, index })
    }
  }

  const getValidMoves = (piece, region, index, cols) => {
    // Pieces from side boards can move to any empty square on center board
    if (region !== 'center') {
      return Array.from({ length: CENTER_SIZE * CENTER_SIZE }, (_, i) => i).filter((i) => {
        // Pawns cannot be placed on the opposite side of the board
        const row = Math.floor((Math.floor(i / CENTER_SIZE)))
        const columnIndex = i % CENTER_SIZE
        // White pawns (from top) cannot be placed on bottom row (row 3)
        if (piece.color === 'white' && columnIndex === CENTER_SIZE - 2) return false
        // Black pawns (from bottom) cannot be placed on top row (row 0)
        if (piece.color === 'black' && columnIndex === 1) return false

        if (piece.color === 'white' && columnIndex === CENTER_SIZE - 1) return false
        // Black pawns (from bottom) cannot be placed on top row (row 0)
        if (piece.color === 'black' && columnIndex === 0) return false


        return !centerPieces[i]
      })
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

    if (specialMode && isSpecial(piece.pctype) && region === 'center') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          addMove(row + dr, col + dc)
        }
      }
      return validMoves
    }


    switch (piece.mvtype) {
      case 'pawn': {
        const forwardCol = col + moveDirection

        // Move forward (sideways now)
        if (isValidPos(row, forwardCol) && !centerPieces[row * cols + forwardCol]) {
          validMoves.push(row * cols + forwardCol)
        }

        // Diagonal captures (now vertical offsets instead of horizontal)
        for (const newRow of [row - 1, row + 1]) {
          if (isValidPos(newRow, forwardCol)) {
            const targetIndex = newRow * cols + forwardCol
            if (
              centerPieces[targetIndex] &&
              centerPieces[targetIndex].color !== piece.color
            ) {
              validMoves.push(targetIndex)
            }
          }
        }

        break
      }
      case 'pawnette': {
        const forwardCol = col + moveDirection

        // Move forward (sideways now)
        if (isValidPos(row, forwardCol) && !centerPieces[row * cols + forwardCol]) {
          validMoves.push(row * cols + forwardCol)
        }

        // Diagonal captures (now vertical offsets instead of horizontal)
        for (const newRow of [row - 1, row + 1]) {
          if (isValidPos(newRow, forwardCol)) {
            const targetIndex = newRow * cols + forwardCol
            if (
              centerPieces[targetIndex] &&
              centerPieces[targetIndex].color !== piece.color
            ) {
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
      //moves like a chess king
      case 'titan': {
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

  const getValidSpecialMoves = (piece, region, index, cols) => {
    if (!piece || region !== 'center') return []

    // Special abilities are activated on center-board targets only.
    // For now, specials can target any enemy piece on the center board.
    return centerPieces
      .map((targetPiece, targetIndex) => ({ targetPiece, targetIndex }))
      .filter(({ targetPiece, targetIndex }) =>
        targetPiece &&
        targetPiece.color !== piece.color &&
        targetIndex !== index
      )
      .map(({ targetIndex }) => targetIndex)
  }

  const moveSelectedPieceTo = (region, index) => {
    if (gameOver || !selected) return

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
    const validMoves = specialMode
      ? getValidSpecialMoves(selectedPiece, selected.region, selected.index, cols)
      : getValidMoves(selectedPiece, selected.region, selected.index, cols)

    // Check if the target index is in valid moves
    if (!validMoves.includes(index)) {
      return
    }

    // Check if pawn should be promoted to queen
    let pieceToPlace = selectedPiece
    if (selectedPiece.mvtype === 'pawn') {
      const row = Math.floor(index / CENTER_SIZE)
      const columnIndex = index % CENTER_SIZE
      // White pawn reaching bottom row (row 3) becomes a queen
      if (selectedPiece.color === 'white' && columnIndex === CENTER_SIZE - 1) {
        pieceToPlace = createPiece(selectedPiece.color, 'queen')
      }
      // Black pawn reaching top row (row 0) becomes a queen
      if (selectedPiece.color === 'black' && columnIndex === 0) {
        pieceToPlace = createPiece(selectedPiece.color, 'queen')
      }
    }

    setPiece(region, index, pieceToPlace)
    clearPiece(selected.region, selected.index)
    setSelected(null)
    toggleTurn()
  }

  const getValidMovesForHighlight = () => {
    if (!selected) return []
    const piece = getPiece(selected.region, selected.index)
    if (!piece) return []

    if (specialMode && selected.region === 'center') {
      const row = Math.floor(selected.index / CENTER_SIZE)
      const col = selected.index % CENTER_SIZE
      const specialTargets = []

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nextRow = row + dr
          const nextCol = col + dc
          const inBounds =
            nextRow >= 0 &&
            nextRow < CENTER_SIZE &&
            nextCol >= 0 &&
            nextCol < CENTER_SIZE

          if (inBounds) {
            specialTargets.push(nextRow * CENTER_SIZE + nextCol)
          }
        }
      }

      return specialTargets
    }

    const cols = selected.region === 'center' ? CENTER_SIZE : BOARD_SIDE_WIDTH
    return specialMode
      ? getValidSpecialMoves(piece, selected.region, selected.index, cols)
      : getValidMoves(piece, selected.region, selected.index, cols)
  }

  const handleCellClick = (region, index) => {
    if (gameOver) return

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
              const isHighlightedMove = selected && validMoves.includes(index) && region === 'center'
              const isSpecialTarget = specialMode && isHighlightedMove
              const isValidMove = !specialMode && isHighlightedMove
              const isNormalValidMove = selected && validMoves.includes(index) && region === 'center' && !specialMode

              return (
                <button
                  key={index}
                  mvtype="button"
                  className={`board-cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} 
                            ${isValidMove ? 'valid-move' : ''} ${isSpecialTarget ? 'special-target' : ''}`}
                  onClick={() => handleCellClick(region, index)}
                >
                  {piece ? (
                    <img
                      src={piece.image}
                      alt={`${piece.color} ${piece.mvtype}`}
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

  useEffect(() => {
    if (gameOver) return

    const status = evaluateGameStatus()
    if (status.over) {
      setGameOver(true)
      setGameOverMessage(status.message)
    }
  }, [topPieces, bottomPieces, centerPieces, currentTurn, gameOver])

  useEffect(() => {
    if (gameOver) return
    if (remainingTime <= 0) return

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        const nextTime = Math.max(prev - 0.05, 0)
        if (nextTime === 0) {
          clearInterval(interval)
        }
        return nextTime
      })
    }, 50)

    return () => clearInterval(interval)
  }, [currentTurn, gameOver])

  useEffect(() => {
    if (gameOver || remainingTime > 0) return

    const newStrikes = { ...strikes, [currentTurn]: strikes[currentTurn] + 1 }
    setStrikes(newStrikes)

    if (newStrikes[currentTurn] >= 2) {
      const winner = currentTurn === 'white' ? 'Black' : 'White'
      setGameOver(true)
      setGameOverMessage(`${winner} wins — ${currentTurn} has exceeded the time limit twice.`)
      return
    }

    switchTurn()
  }, [remainingTime, currentTurn, gameOver, strikes])

  const whiteMaterial = getTeamMaterial('white')
  const blackMaterial = getTeamMaterial('black')
  const materialDiff = whiteMaterial - blackMaterial

  return (
    <main className={`app-shell turn-${currentTurn}`}>
      {gameOver ? <div className="game-over-banner">{gameOverMessage}</div> : null}
      <section className="board-card">
        <div className="title-row">
          <span className="turn-label">{currentTurn === 'white' ? 'White turn' : 'Black turn'}</span>
          <div className="turn-timer">
            <span className="timer-label">{Math.ceil(remainingTime)}s</span>
            <div className="timer-bar-wrapper">
              <div
                className={`timer-bar ${remainingTime <= 10 ? 'timer-critical' : ''}`}
                style={{ width: `${(remainingTime / 35) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="board-layout">
          <div className="side-board top-board">
            {getPlayerHeader('white', 'White', whiteMaterial, materialDiff)}
            {renderBoard(BOARD_SIDE_HEIGHT, BOARD_SIDE_WIDTH, 'top', 'side-board-grid')}
          </div>

          <div className="center-board">
            {renderBoard(CENTER_SIZE, CENTER_SIZE, 'center', 'main-board-grid-gameplay')}
          </div>

          <div className="side-board bottom-board">
            {renderBoard(BOARD_SIDE_HEIGHT, BOARD_SIDE_WIDTH, 'bottom', 'side-board-grid')}
            {getPlayerHeader('black', 'Black', blackMaterial, -materialDiff)}
          </div>
        </div>
      </section>
    </main>
  )
}


export default GamePlay;