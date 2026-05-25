import { useState, useEffect, useRef } from 'react'
import './gameplay.css'
import lightGunslingerEmpty from './new-assets/sub-assets/light-outlaw-empty-Photoroom.png'
import darkGunslingerEmpty from './new-assets/sub-assets/dark-outlaw-empty-Photoroom.png'
import lightServant from './new-assets/sub-assets/light-servant-Photoroom.png'
import darkServant from './new-assets/sub-assets/dark-servant-Photoroom.png'
import jailCell from './assets/0special-pieces/jail-cell.png'
import deputyBadge from './assets/0special-pieces/deputy-badge.png'
import lightExplosion from './assets/0special-pieces/light-explosion.png'
import darkExplosion from './assets/0special-pieces/dark-explosion.png'

const BOARD_SIDE_WIDTH = 2
const BOARD_SIDE_HEIGHT = 7
const CENTER_SIZE = 5



function GamePlay({ whiteDeck, blackDeck, whiteType, blackType }) {

  const emptyGunslingerImages = {
    white: lightGunslingerEmpty,
    black: darkGunslingerEmpty,
  }


  const whiteBackRowOrder = (whiteType?.[0] === 'queen' || whiteType?.[0] === 'novaQueen') ?
    ['rook', 'knight', 'bishop', 'queen', 'bishop', 'knight', 'rook'] :
    ['rook', 'knight', 'bishop', 'titan', 'bishop', 'knight', 'rook']

  const blackBackRowOrder = (blackType?.[0] === 'queen' || blackType?.[0] === 'novaQueen') ?
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

  const nextPieceId = useRef(1)

  const createPiece = (color, mvtype) => ({
    id: nextPieceId.current++,
    color,
    mvtype,
    pctype: (color === 'white' ? whiteDeckTypeMap : blackDeckTypeMap)[mvtype] ?? mvtype,
    image: pieceImages[color][mvtype],
    ammo: (color === 'white' ? whiteDeckTypeMap : blackDeckTypeMap)[mvtype] === 'gunslinger' ? 1 : null,
    lockUps: (color === 'white' ? whiteDeckTypeMap : blackDeckTypeMap)[mvtype] === 'sheriff' ? 1 : null,
  })
  const createServantPiece = (color, direction) => ({
    id: nextPieceId.current++,
    color,
    mvtype: 'servant',
    pctype: 'servant',
    image: color === 'white' ? lightServant : darkServant,
    servantDirection: direction,
    isImmortal: true,
  })
  const [currentTurn, setCurrentTurn] = useState('white')
  const [selected, setSelected] = useState(null)
  const [specialMode, setSpecialMode] = useState(null)
  const [remainingTime, setRemainingTime] = useState(350)
  const [gameOver, setGameOver] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState('')
  const [strikes, setStrikes] = useState({ white: 0, black: 0 })
  const [cupidLinks, setCupidLinks] = useState({})
  const [cupidSelectionPairs, setCupidSelectionPairs] = useState({})
  const [cupidSelections, setCupidSelections] = useState([])
  const [fallenPiecesByColor, setFallenPiecesByColor] = useState({ white: [], black: [] })
  const [angelAbilityUsedByColor, setAngelAbilityUsedByColor] = useState({ white: false, black: false })
  const [airstrikeDisplayTiles, setAirstrikeDisplayTiles] = useState([])
  const [airstrikeTeam, setAirstrikeTeam] = useState(null)
  const [novaQueenStrikesLeft, setNovaQueenStrikesLeft] = useState({})
  const [plutoDeploymentsById, setPlutoDeploymentsById] = useState({})
  const [topPieces, setTopPieces] = useState(() => {
    const pieces = []
    whiteBackRowOrder.forEach((mvtype) => {
      pieces.push(createPiece('white', mvtype))
      pieces.push(createPiece('white', 'pawn'))
    })
    return pieces
  })
  const [bottomPieces, setBottomPieces] = useState(() => {
    const pieces = []
    blackBackRowOrder.forEach((mvtype) => {
      pieces.push(createPiece('black', 'pawn'))
      pieces.push(createPiece('black', mvtype))
    })
    return pieces
  })
  const [centerPieces, setCenterPieces] = useState(() =>
    Array.from({ length: CENTER_SIZE * CENTER_SIZE }, () => null)
  )

  function isSpecial(piece) {
    // Define which pieces are considered special for movement purposes
    const specialPieces = ['pluto', 'bomber', 'cupid', 'angel', 'gunslinger', 'sheriff', 'ninja', 'dragon', 'konungr', 'beastrider', 'novaQueen', 'scientist']
    return specialPieces.includes(piece)
  }

  useEffect(() => {
    // if (specialMode) {
    //   console.log('In Special Mode')
    // } else console.log('Special Mode cancelled')
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

  const unlockPieceLockedBySheriff = (sheriffId) => {
    const unlock = (piece) => (piece?.lockedBySheriffId === sheriffId ? {
      ...piece,
      isLocked: false,
      lockedBySheriffId: null,
    } : piece)

    setTopPieces((previous) => previous.map(unlock))
    setBottomPieces((previous) => previous.map(unlock))
    setCenterPieces((previous) => previous.map(unlock))
  }

  const recordFallenPiece = (piece) => {
    if (!piece) return

    setFallenPiecesByColor((previous) => ({
      ...previous,
      [piece.color]: [...previous[piece.color], piece],
    }))
  }

  const addPieceToHand = (color, pieceToAdd) => {
    if (!pieceToAdd) return

    const sideRegion = color === 'white' ? 'top' : 'bottom'
    const sidePieces = color === 'white' ? topPieces : bottomPieces
    const emptySideIndex = sidePieces.findIndex((piece) => !piece)

    if (emptySideIndex === -1) return
    setPiece(sideRegion, emptySideIndex, pieceToAdd)
  }

  const addCupidLink = (links, leftId, rightId) => {
    const next = { ...links }
    const leftLinks = new Set(next[leftId] ?? [])
    const rightLinks = new Set(next[rightId] ?? [])
    leftLinks.add(rightId)
    rightLinks.add(leftId)
    next[leftId] = [...leftLinks]
    next[rightId] = [...rightLinks]
    return next
  }

  const getCupidLinksWithNewPair = (links, leftId, rightId) => {
    const next = addCupidLink(links, leftId, rightId)
    const visited = new Set([leftId])
    const queue = [leftId]

    while (queue.length > 0) {
      const currentId = queue.shift()
      const linkedIds = next[currentId] ?? []

      linkedIds.forEach((linkedId) => {
        if (visited.has(linkedId)) return
        visited.add(linkedId)
        queue.push(linkedId)
      })
    }

    return { nextLinks: next, linkedIds: [...visited] }
  }

  const findCupidIdLinkingTarget = (targetId, color, exceptCupidId = null) => {
    const centerCupid = centerPieces.find((piece) =>
      piece?.pctype === 'cupid'
      && piece?.color === color
      && piece?.id !== exceptCupidId
      && (cupidSelectionPairs[piece.id] ?? []).includes(targetId))

    return centerCupid?.id ?? null
  }


  const removeCupidLink = (links, leftId, rightId) => {
    const next = { ...links }

    const leftLinks = (next[leftId] ?? []).filter((id) => id !== rightId)
    const rightLinks = (next[rightId] ?? []).filter((id) => id !== leftId)

    if (leftLinks.length === 0) {
      delete next[leftId]
    } else {
      next[leftId] = leftLinks
    }

    if (rightLinks.length === 0) {
      delete next[rightId]
    } else {
      next[rightId] = rightLinks
    }

    return next
  }

  const removeAllCupidLinksForSource = (links, sourceId) => {
    const next = { ...links }
    const linkedIds = next[sourceId] ?? []

    linkedIds.forEach((linkedId) => {
      const updatedLinks = (next[linkedId] ?? []).filter((id) => id !== sourceId)
      if (updatedLinks.length === 0) {
        delete next[linkedId]
      } else {
        next[linkedId] = updatedLinks
      }
    })

    delete next[sourceId]
    return next
  }

  const removeCupidSelectionPairLinks = (links, selectionPair = []) => {
    if (selectionPair.length < 2) return links
    const [leftId, rightId] = selectionPair
    return removeCupidLink(links, leftId, rightId)
  }

  const getCupidLinkedIds = (sourceId) => {
    if (!sourceId) return []

    const visited = new Set([sourceId])
    const queue = [sourceId]

    while (queue.length > 0) {
      const currentId = queue.shift()
      const linkedIds = cupidLinks[currentId] ?? []

      linkedIds.forEach((linkedId) => {
        if (visited.has(linkedId)) return
        visited.add(linkedId)
        queue.push(linkedId)
      })
    }

    visited.delete(sourceId)
    return [...visited]
  }

  const clearPieceWithEffects = (region, index, options = {}) => {
    const { skipLinkedKill = false, fallenPieceOverride = null } = options
    const piece = getPiece(region, index)
    if (!piece) return
        if (piece.isImmortal) return

    if (piece?.pctype === 'sheriff') {
      unlockPieceLockedBySheriff(piece.id)
    }

    if (piece?.pctype === 'cupid') {
      const selectionPair = cupidSelectionPairs[piece.id] ?? []
      setCupidLinks((previous) => {
        const withoutSourceLinks = removeAllCupidLinksForSource(previous, piece.id)
        return removeCupidSelectionPairLinks(withoutSourceLinks, selectionPair)
      })
      setCupidSelectionPairs((previous) => {
        const next = { ...previous }
        delete next[piece.id]
        return next
      })
      setCupidSelections([])
    }

    if (!skipLinkedKill) {
      const linkedTargetIds = getCupidLinkedIds(piece.id)
      linkedTargetIds.forEach((linkedTargetId) => {
        const linkedTarget = centerPieces
          .map((targetPiece, targetIndex) => ({ targetPiece, targetIndex }))
          .find(({ targetPiece }) => targetPiece?.id === linkedTargetId)

        if (linkedTarget) {
          clearPieceWithEffects('center', linkedTarget.targetIndex, { skipLinkedKill: true })
        }
      })
    }
    recordFallenPiece(fallenPieceOverride ?? piece)

    if (piece.pctype === 'beastrider') {
      addPieceToHand(piece.color, createPiece(piece.color, 'pawn'))
    }

    clearPiece(region, index)
  }

  const switchTurn = () => {
    setCupidSelections([])
    setCurrentTurn((previous) => (previous === 'white' ? 'black' : 'white'))
    setRemainingTime(350)
    setSelected(null)
    setSpecialMode(false)
  }

  const toggleTurn = () => {
    setCenterPieces((previous) => {
      const next = [...previous]
      const plannedMoves = []

      previous.forEach((piece, originIndex) => {
        if (!piece || piece.pctype !== 'servant' || !piece.servantDirection) return
        const originRow = Math.floor(originIndex / CENTER_SIZE)
        const originCol = originIndex % CENTER_SIZE
        const targetRow = originRow + piece.servantDirection.dr
        const targetCol = originCol + piece.servantDirection.dc
        if (targetRow < 0 || targetRow >= CENTER_SIZE || targetCol < 0 || targetCol >= CENTER_SIZE) {
          next[originIndex] = null
          return
        }
        const targetIndex = targetRow * CENTER_SIZE + targetCol
        plannedMoves.push({ originIndex, targetIndex, piece })
      })

      const targetCounts = plannedMoves.reduce((counts, move) => {
        counts[move.targetIndex] = (counts[move.targetIndex] ?? 0) + 1
        return counts
      }, {})

      plannedMoves.forEach(({ originIndex, targetIndex, piece }) => {
        if (targetCounts[targetIndex] > 1) return
        const targetPiece = previous[targetIndex]
        if (targetPiece?.color === piece.color) {
          next[originIndex] = null
          return
        }
        if (targetPiece?.isLocked) return

        next[originIndex] = null
        next[targetIndex] = piece
      })

      return next
    })
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

      if (isSpecial(selectedPiece?.pctype) && region === 'center' && !selectedPiece?.isLocked) {
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

  const getBomberTargetIndexes = (originIndex) => {
    const row = Math.floor(originIndex / CENTER_SIZE)
    const col = originIndex % CENTER_SIZE

    const adjacent = []
    const diagonal = []

    const adjacentOffsets = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]
    const diagonalOffsets = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ]

    adjacentOffsets.forEach(([dr, dc]) => {
      const nextRow = row + dr
      const nextCol = col + dc
      if (nextRow < 0 || nextRow >= CENTER_SIZE || nextCol < 0 || nextCol >= CENTER_SIZE) return
      adjacent.push(nextRow * CENTER_SIZE + nextCol)
    })

    diagonalOffsets.forEach(([dr, dc]) => {
      const nextRow = row + dr
      const nextCol = col + dc
      if (nextRow < 0 || nextRow >= CENTER_SIZE || nextCol < 0 || nextCol >= CENTER_SIZE) return
      diagonal.push(nextRow * CENTER_SIZE + nextCol)
    })

    return { adjacent, diagonal }
  }

  const getValidMoves = (piece, region, index, cols) => {
    // Pieces from side boards can move to any empty square on center board
    if (region !== 'center') {
      if (piece?.pctype === 'ninja' || piece?.mvtype === 'ninja') {
        return Array.from({ length: CENTER_SIZE * CENTER_SIZE }, (_, i) => i).filter((i) => !centerPieces[i])
      }
      const middleColumns = CENTER_SIZE % 2 === 0
        ? [CENTER_SIZE / 2 - 1, CENTER_SIZE / 2]
        : [Math.floor(CENTER_SIZE / 2)]

      return Array.from({ length: CENTER_SIZE * CENTER_SIZE }, (_, i) => i).filter((i) => {
        const columnIndex = i % CENTER_SIZE

        // Ninja can be deployed to any square in the middle files, regardless of side.
        if (piece.pctype === 'ninja') {
          return middleColumns.includes(columnIndex) && !centerPieces[i]
        }

        // Ninja can be deployed to any open square from the sideboard.
        if (piece.pctype === 'ninja') return !centerPieces[i]

        // Default sideboard placement restriction (closest three columns only).
        if (piece.color === 'white' && columnIndex === CENTER_SIZE - 2) return false
        if (piece.color === 'black' && columnIndex === 1) return false

        if (piece.color === 'white' && columnIndex === CENTER_SIZE - 1) return false
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
      if (!targetPiece) return true
      if (targetPiece.color === piece.color) return false
      return !targetPiece.isLocked
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
          } else if (targetPiece.color !== piece.color && !targetPiece.isLocked) {
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
              centerPieces[targetIndex].color !== piece.color &&
              !centerPieces[targetIndex].isLocked
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
              centerPieces[targetIndex].color !== piece.color &&
              !centerPieces[targetIndex].isLocked
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
    if (!piece || region !== 'center' || piece.isLocked) return []

    if (piece.pctype === 'gunslinger') {
      if (piece.ammo === 0) {
        return [index]
      }

      const row = Math.floor(index / CENTER_SIZE)
      const col = index % CENTER_SIZE
      const visibleTargets = []
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]

      for (const [dr, dc] of directions) {
        let r = row + dr
        let c = col + dc

        while (r >= 0 && r < CENTER_SIZE && c >= 0 && c < CENTER_SIZE) {
          const targetIndex = r * cols + c
          const targetPiece = centerPieces[targetIndex]

          if (targetPiece) {
            if (targetPiece.color !== piece.color) {
              visibleTargets.push(targetIndex)
            }
            break
          }

          r += dr
          c += dc
        }
      }

      return visibleTargets
    }

    if (piece.pctype === 'pluto') {
      const deploymentsUsed = plutoDeploymentsById[piece.id] ?? 0
      const alreadyHasServant = centerPieces.some(
        (boardPiece) => boardPiece?.pctype === 'servant' && boardPiece.color === piece.color,
      )
      if (deploymentsUsed >= 2 || alreadyHasServant) return []

      const row = Math.floor(index / CENTER_SIZE)
      const col = index % CENTER_SIZE
      const adjacentOffsets = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]

      return adjacentOffsets
        .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
        .filter(({ row: r, col: c }) => r >= 0 && r < CENTER_SIZE && c >= 0 && c < CENTER_SIZE)
        .map(({ row: r, col: c }) => r * cols + c)
        .filter((targetIndex) => !centerPieces[targetIndex])
    }

    if (piece.pctype === 'sheriff') {
      if ((piece.lockUps ?? 0) <= 0) return []

      const row = Math.floor(index / CENTER_SIZE)
      const col = index % CENTER_SIZE
      return centerPieces
        .map((targetPiece, targetIndex) => ({ targetPiece, targetIndex }))
        .filter(({ targetPiece, targetIndex }) => {
          if (!targetPiece || targetPiece.color === piece.color || targetPiece.isLocked || targetIndex === index) {
            return false
          }
          const targetRow = Math.floor(targetIndex / CENTER_SIZE)
          const targetCol = targetIndex % CENTER_SIZE
          return targetRow === row || targetCol === col
        })
        .map(({ targetIndex }) => targetIndex)
    }

    if (piece.pctype === 'cupid') {
      if (piece.specialUsed) return []

      return centerPieces
        .map((targetPiece, targetIndex) => ({ targetPiece, targetIndex }))
        .filter(({ targetPiece, targetIndex }) =>
          targetPiece
          && targetPiece.color !== piece.color
          && targetPiece.pctype !== 'titan'
          && targetPiece.id !== piece.id
          && targetIndex !== index,
        )
        .map(({
          targetIndex }) => targetIndex)
    }

    if (piece.pctype === 'angel') {
      return []
    }

    if (piece.pctype === 'novaQueen') {
      const strikesRemaining = novaQueenStrikesLeft[piece.id] ?? 2
      if (strikesRemaining <= 0) return []

      const targets = []
      const isFirstStrike = strikesRemaining === 2

      if (isFirstStrike) {
        if (piece.color === 'white') {
          for (let row = 0; row < CENTER_SIZE; row++) {
            for (let col = 2; col < CENTER_SIZE; col++) {
              targets.push(row * CENTER_SIZE + col)
            }
          }
        } else {
          for (let row = 0; row < CENTER_SIZE; row++) {
            for (let col = 0; col < 3; col++) {
              targets.push(row * CENTER_SIZE + col)
            }
          }
        }
      } else {
        for (let i = 0; i < CENTER_SIZE * CENTER_SIZE; i++) {
          targets.push(i)
        }
      }

      return targets
    }

    if (piece.pctype === 'bomber') {
      const { adjacent, diagonal } = getBomberTargetIndexes(index)
      return [...adjacent, ...diagonal]
    }

    // Default special behavior for other special pieces.
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
    if (selectedPiece.isLocked) return

    if (region !== 'center') return

    // Get valid moves for the selected piece - use correct column count based on region
    const cols = selected.region === 'center' ? CENTER_SIZE : BOARD_SIDE_WIDTH
    const validMoves = specialMode
      ? getValidSpecialMoves(selectedPiece, selected.region, selected.index, cols)
      : getValidMoves(selectedPiece, selected.region, selected.index, cols)

    // Check if the target index is in valid moves
    if (!validMoves.includes(index)) {
      return
    }

    // Check if pawn-like pieces should be promoted on the far column.
    let pieceToPlace = selectedPiece
    if (selectedPiece.mvtype === 'pawn') {
      const columnIndex = index % CENTER_SIZE
      const reachedPromotionColumn =
        (selectedPiece.color === 'white' && columnIndex === CENTER_SIZE - 1) ||
        (selectedPiece.color === 'black' && columnIndex === 0)

      if (reachedPromotionColumn) {
        // Pawnettes never promote.
        if (selectedPiece.pctype === 'pawnette') {
          pieceToPlace = selectedPiece
        } else if (selectedPiece.pctype === 'droid') {
          // Droids promote into knights.
          pieceToPlace = {
            ...createPiece(selectedPiece.color, 'knight'),
            id: selectedPiece.id,
          }
        } else {
          // Standard pawns and other pawn-like variants promote into queens.
          pieceToPlace = {
            ...createPiece(selectedPiece.color, 'queen'),
            id: selectedPiece.id,
          }
        }
      }
    }

    if (specialMode && selectedPiece.pctype === 'gunslinger') {
      const targetPiece = getPiece(region, index)
      const shootingPiece = { ...selectedPiece, ammo: selectedPiece.ammo === 0 ? 1 : 0 }

      if (selectedPiece.ammo === 0) {
        if (index !== selected.index) return
        setPiece('center', selected.index, shootingPiece)
      } else {
        if (targetPiece?.isLocked) return
        clearPieceWithEffects(region, index)
        setPiece('center', selected.index, shootingPiece)
      }

      setSelected(null)
      toggleTurn()
      return
    }

    if (specialMode && selectedPiece.pctype === 'cupid') {
      const targetPiece = getPiece(region, index)
      if (!targetPiece || targetPiece.color === selectedPiece.color) return
      if (targetPiece.pctype === 'titan') return

      setCupidSelections((previous) => {
        if (previous.includes(index)) {
          return previous.filter((selectionIndex) => selectionIndex !== index)
        }

        if (previous.length >= 2) {
          return [previous[1], index]
        }

        return [...previous, index]
      })
      return
    }

    if (specialMode && selectedPiece.pctype === 'bomber') {
      const { adjacent, diagonal } = getBomberTargetIndexes(selected.index)
      const targetGroup = adjacent.includes(index) ? adjacent : diagonal.includes(index) ? diagonal : null
      if (!targetGroup) return

      targetGroup.forEach((targetIndex) => clearPieceWithEffects('center', targetIndex))
      clearPieceWithEffects('center', selected.index)
      setSelected(null)
      toggleTurn()
      return
    }

    if (specialMode && selectedPiece.pctype === 'pluto') {
      const deploymentsUsed = plutoDeploymentsById[selectedPiece.id] ?? 0
      const alreadyHasServant = centerPieces.some(
        (boardPiece) => boardPiece?.pctype === 'servant' && boardPiece.color === selectedPiece.color,
      )
      if (deploymentsUsed >= 2 || alreadyHasServant) return

      const targetPiece = getPiece(region, index)
      if (targetPiece) return
      const fromRow = Math.floor(selected.index / CENTER_SIZE)
      const fromCol = selected.index % CENTER_SIZE
      const toRow = Math.floor(index / CENTER_SIZE)
      const toCol = index % CENTER_SIZE
      const rowDelta = toRow - fromRow
      const colDelta = toCol - fromCol
      const isAdjacentOrthogonal = Math.abs(rowDelta) + Math.abs(colDelta) === 1
      if (!isAdjacentOrthogonal) return

      setSelected(null)
      toggleTurn()
      setCenterPieces((previous) => {
        if (previous[index]) return previous
        const next = [...previous]
        next[index] = createServantPiece(selectedPiece.color, { dr: rowDelta, dc: colDelta })
        return next
      })
      setPlutoDeploymentsById((previous) => ({
        ...previous,
        [selectedPiece.id]: deploymentsUsed + 1,
      }))
      return
    }

    if (specialMode && selectedPiece.pctype === 'novaQueen') {
      return
    }

    if (specialMode && selectedPiece.pctype === 'sheriff') {
      const targetPiece = getPiece(region, index)
      if (!targetPiece || targetPiece.color === selectedPiece.color || targetPiece.isLocked) return

      setPiece(region, index, {
        ...targetPiece,
        isLocked: true,
        lockedBySheriffId: selectedPiece.id,
      })
      setPiece('center', selected.index, {
        ...selectedPiece,
        lockUps: Math.max((selectedPiece.lockUps ?? 0) - 1, 0),
        hasDeputyBadge: true,
      })
      setSelected(null)
      toggleTurn()
      return
    }

    const targetPiece = getPiece(region, index)
    const servantSelfDestructs = (
      selectedPiece.pctype === 'servant'
      && Boolean(targetPiece)
      && targetPiece.color !== selectedPiece.color
    )

    if (selected.region === 'center' && selected.index === index) {
      setSelected(null)
      return
    }

    const sheriffMoved = selectedPiece.pctype === 'sheriff' && (selected.region !== region || selected.index !== index)
    const movedPiece = sheriffMoved ? { ...pieceToPlace, hasDeputyBadge: false } : pieceToPlace

    if (sheriffMoved) {
      unlockPieceLockedBySheriff(selectedPiece.id)
    }

    clearPieceWithEffects(region, index)

    if (servantSelfDestructs) {
      clearPiece(selected.region, selected.index)
      setSelected(null)
      toggleTurn()
      return
    }
    
    setPiece(region, index, movedPiece)
    clearPiece(selected.region, selected.index)
    setSelected(null)
    toggleTurn()
  }

  const getValidMovesForHighlight = () => {
    if (!selected) return []
    const piece = getPiece(selected.region, selected.index)
    if (!piece || piece.isLocked) return []

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

  const getSelectedPiece = () => {
    if (!selected) return null
    return getPiece(selected.region, selected.index)
  }

  const selectedPiece = getSelectedPiece()


  const getCupidLinkedHighlightIndexes = (piece, pieceIndex) => {
    if (!piece) return []

    const indexes = []

    const linkedPieceIds = getCupidLinkedIds(piece.id)
    if (linkedPieceIds.length > 0) {
      indexes.push(pieceIndex)
      linkedPieceIds.forEach((linkedPieceId) => {
        const linkedIndex = centerPieces.findIndex((targetPiece) => targetPiece?.id === linkedPieceId)
        if (linkedIndex !== -1) indexes.push(linkedIndex)
      })
    }

    if (specialMode && piece.pctype === 'cupid') {
      const linkedPairIds = cupidSelectionPairs[piece.id] ?? []
      linkedPairIds.forEach((linkedId) => {
        const linkedIndex = centerPieces.findIndex((targetPiece) => targetPiece?.id === linkedId)
        if (linkedIndex !== -1) indexes.push(linkedIndex)
      })
    }

    return [...new Set(indexes)]
  }
  const specialActionVisible = Boolean(
    specialMode
    && !selectedPiece?.isLocked
    && (selectedPiece?.pctype === 'gunslinger' 
      || selectedPiece?.pctype === 'sheriff' 
      || selectedPiece?.pctype === 'cupid' 
      || selectedPiece?.pctype === 'angel' 
      || selectedPiece?.pctype === 'novaQueen' 
      || selectedPiece?.pctype === 'pluto')
  )
  const specialActionEnabled = Boolean(
    specialActionVisible
    && ((selectedPiece?.pctype === 'gunslinger' && selectedPiece?.ammo === 0)
      || selectedPiece?.pctype === 'sheriff'
      || (selectedPiece?.pctype === 'cupid' && cupidSelections.length === 2 && !selectedPiece?.specialUsed)
      || (selectedPiece?.pctype === 'angel' && !selectedPiece?.specialUsed && fallenPiecesByColor[selectedPiece.color]?.length > 0)
      || (selectedPiece?.pctype === 'novaQueen' && (novaQueenStrikesLeft[selectedPiece?.id] ?? 2) > 0))
  )

  const getAngelDeathChance = (angelPiece) => {
    if (!angelPiece) return 0

    const opponentColor = angelPiece.color === 'white' ? 'black' : 'white'
    return angelAbilityUsedByColor[angelPiece.color] ? 1 / 2 : 1 / 3
  }

  const getAngelDeathPercentage = (angelPiece) => Math.floor(getAngelDeathChance(angelPiece) * 100)

  const specialActionLabel = selectedPiece?.pctype === 'gunslinger'
    ? 'Reload'
    : selectedPiece?.pctype === 'sheriff'
      ? `Lock-ups (${selectedPiece.lockUps ?? 0})`
      : selectedPiece?.pctype === 'cupid'
        ? `Link (${cupidSelections.length}/2)`
        : selectedPiece?.pctype === 'angel'
          ? `Heal (${getAngelDeathPercentage(selectedPiece)}% Death)`
          : selectedPiece?.pctype === 'novaQueen'
            ? `Nova Strike (${novaQueenStrikesLeft[selectedPiece?.id] ?? 2} Left)`
            : selectedPiece?.pctype === 'pluto'
              ? `Summon (${Math.max(0, 2 - (plutoDeploymentsById[selectedPiece?.id] ?? 0))})`
              : 'Special'

  const handleSpecialAction = () => {
    if (!specialActionEnabled || !selectedPiece || !selected) return
    if (selectedPiece.pctype === 'gunslinger') {
      setPiece(selected.region, selected.index, {
        ...selectedPiece,
        ammo: 1,
        image: pieceImages[selectedPiece.color][selectedPiece.mvtype],
      })
      setSelected(null)
      toggleTurn()
      return
    }

    if (selectedPiece.pctype === 'angel') {
      if (selectedPiece.specialUsed) return

      const fallenPieces = fallenPiecesByColor[selectedPiece.color] ?? []
      if (fallenPieces.length === 0) return

      const revivedPiece = fallenPieces[fallenPieces.length - 1]
      const sideRegion = selectedPiece.color === 'white' ? 'bottom' : 'top'
      const sidePieces = selectedPiece.color === 'white' ? bottomPieces : topPieces
      const emptySideIndex = sidePieces.findIndex((piece) => !piece)

      if (emptySideIndex === -1) return

      setPiece(sideRegion, emptySideIndex, revivedPiece)

      setFallenPiecesByColor((previous) => ({
        ...previous,
        [selectedPiece.color]: previous[selectedPiece.color].slice(0, -1),
      }))

      setAngelAbilityUsedByColor((previous) => ({
        ...previous,
        [selectedPiece.color]: true,
      }))

      const deathChance = getAngelDeathChance(selectedPiece)
      const angelDies = Math.random() < deathChance
      console.log("angelDies:", angelDies)
      if (angelDies) {
        clearPieceWithEffects(selected.region, selected.index, {
          fallenPieceOverride: { ...selectedPiece, specialUsed: true },
        })
      } else {
        setPiece(selected.region, selected.index, { ...selectedPiece, specialUsed: true })
      }

      setSelected(null)
      toggleTurn()
      return
    }

    if (selectedPiece.pctype === 'cupid') {
      const [firstTargetIndex, secondTargetIndex] = cupidSelections
      const firstTarget = getPiece('center', firstTargetIndex)
      const secondTarget = getPiece('center', secondTargetIndex)
      if (!firstTarget || !secondTarget) return

      const { linkedIds } = getCupidLinksWithNewPair(cupidLinks, firstTarget.id, secondTarget.id)
      const opponentLinkCount = linkedIds
        .filter((linkedId) => linkedId !== selectedPiece.id)
        .map((linkedId) => centerPieces.find((piece) => piece?.id === linkedId))
        .filter((piece) => piece?.color && piece.color !== selectedPiece.color)
        .length
      setCupidLinks((previous) => addCupidLink(previous, firstTarget.id, secondTarget.id))

      if (opponentLinkCount > 2) {
        const linkedCupidId = findCupidIdLinkingTarget(firstTarget.id, selectedPiece.color, selectedPiece.id)
          ?? findCupidIdLinkingTarget(secondTarget.id, selectedPiece.color, selectedPiece.id)

        if (linkedCupidId) {
          setCupidLinks((previous) => addCupidLink(previous, selectedPiece.id, linkedCupidId))
        }
      }

      setCupidSelectionPairs((previous) => ({
        ...previous,
        [selectedPiece.id]: [firstTarget.id, secondTarget.id],
      }))

      setPiece('center', selected.index, { ...selectedPiece, specialUsed: true })
      setCupidSelections([])
      setSelected(null)
      toggleTurn()
    }

    if (selectedPiece.pctype === 'novaQueen') {
      const strikesRemaining = novaQueenStrikesLeft[selectedPiece.id] ?? 2
      if (strikesRemaining <= 0) return

      // Determine strike pool based on which strike this is
      const strikePool = []
      const isFirstStrike = strikesRemaining === 2

      if (isFirstStrike) {
        // First strike: opponent's deployable region on the center board
        if (selectedPiece.color === 'white') {
          // White attacks black's deployable side (rows 0-1, columns 2, 3, 4)
          for (let row = 0; row < 2; row++) {
            for (let col = 2; col < CENTER_SIZE; col++) {
              strikePool.push({ region: 'center', index: row * CENTER_SIZE + col })
            }
          }
        } else {
          // Black attacks white's deployable side (rows 3-4, columns 0, 1, 2)
          for (let row = 3; row < CENTER_SIZE; row++) {
            for (let col = 0; col < 3; col++) {
              strikePool.push({ region: 'center', index: row * CENTER_SIZE + col })
            }
          }
        }
      } else {
        // Second strike: anywhere on the center board
        for (let i = 0; i < CENTER_SIZE * CENTER_SIZE; i++) {
          strikePool.push({ region: 'center', index: i })
        }
      }

      const shuffledTargets = [...strikePool]
      for (let i = shuffledTargets.length - 1; i > 0; i -= 1) {
        const swapIndex = Math.floor(Math.random() * (i + 1))
        ;[shuffledTargets[i], shuffledTargets[swapIndex]] = [shuffledTargets[swapIndex], shuffledTargets[i]]
      }

      const strikeTargets = shuffledTargets.slice(0, Math.min(3, shuffledTargets.length))
      const strikeCoordinates = strikeTargets.map(({ index: targetIndex }) => {
        const x = targetIndex % CENTER_SIZE
        const y = Math.floor(targetIndex / CENTER_SIZE)
        return { x, y }
      })
      console.log(`Nova Queen Airstrike ${isFirstStrike ? '1' : '2'} Targets:`, strikeCoordinates.map(({ x, y }) => `(${x},${y})`).join(', '))

      strikeTargets.forEach(({ region: targetRegion, index: targetIndex }) => {
        const targetPiece = centerPieces[targetIndex]
        if (targetPiece) {
          clearPieceWithEffects(targetRegion, targetIndex)
        }
      })

      // Check if Nova Queen was hit by her own airstrike
      const novaQueenHit = strikeTargets.some(({ index: targetIndex }) => targetIndex === selected.index)

      if (novaQueenHit) {
        // Nova Queen dies from her own airstrike
        clearPieceWithEffects(selected.region, selected.index)
        setSelected(null)
        toggleTurn()
        return
      }

      // Display explosion on airstrike tiles for 1 second
      const strikeIndices = strikeTargets.map(({ index: targetIndex }) => targetIndex)
      setAirstrikeTeam(selectedPiece.color)
      setAirstrikeDisplayTiles(strikeIndices)
      setTimeout(() => {
        setAirstrikeDisplayTiles([])
        setAirstrikeTeam(null)
      }, 1000)

      // Update strikes remaining
      const newStrikesRemaining = strikesRemaining - 1
      setNovaQueenStrikesLeft((previous) => ({
        ...previous,
        [selectedPiece.id]: newStrikesRemaining,
      }))

      // Update piece with new strikes or mark as used if no strikes left
      const updatedPiece = newStrikesRemaining <= 0
        ? { ...selectedPiece, specialUsed: true }
        : selectedPiece

      setPiece(selected.region, selected.index, updatedPiece)
      setSelected(null)
      toggleTurn()
      return
    }
  }

  const renderBoard = (rows, cols, region, className) => {
    const rowArray = Array.from({ length: rows })
    const colArray = Array.from({ length: cols })
    const validMoves = getValidMovesForHighlight()
    const currentlySelectedPiece = selected ? getPiece(selected.region, selected.index) : null

    const getPieceImage = (piece) => {
      if (!piece) return null
      if (piece.pctype === 'gunslinger' && piece.ammo === 0) {
        return emptyGunslingerImages[piece.color]
      }
      return piece.image
    }


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
              const bomberTargets = selected && currentlySelectedPiece?.pctype === 'bomber'
                ? getBomberTargetIndexes(selected.index)
                : null
              const isBomberDiagonalTarget = Boolean(specialMode && bomberTargets?.diagonal.includes(index))
              const isSpecialTarget = specialMode && isHighlightedMove && !isBomberDiagonalTarget
              const isValidMove = !specialMode && isHighlightedMove
              const isSheriffJailedTarget = Boolean(
                currentlySelectedPiece?.pctype === 'sheriff'
                && piece?.lockedBySheriffId === currentlySelectedPiece.id,
              )
              const isJailingSheriffTarget = Boolean(
                currentlySelectedPiece?.isLocked
                && piece?.pctype === 'sheriff'
                && piece?.id === currentlySelectedPiece.lockedBySheriffId,
              )
              const linkedHighlightIndexes = selected && selected.region === 'center'
                ? getCupidLinkedHighlightIndexes(currentlySelectedPiece, selected.index)
                : []
              const isCupidLinkedHighlight = selected && region === 'center' && linkedHighlightIndexes.includes(index)
              const isCupidSelectionTarget = Boolean(
                specialMode
                && currentlySelectedPiece?.pctype === 'cupid'
                && selected?.region === 'center'
                && region === 'center'
                && cupidSelections.includes(index),
              )
              const isPlutoServantHighlight = Boolean(
                specialMode
                && currentlySelectedPiece?.pctype === 'pluto'
                && piece?.pctype === 'servant'
                && piece?.color === currentlySelectedPiece?.color,
              )

              return (
                <button
                  key={index}
                  mvtype="button"
                  className={`board-cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} 
                            ${isValidMove ? 'valid-move' : ''} ${isSpecialTarget ? 'special-target' : ''}
                            ${isBomberDiagonalTarget ? 'special-target-diagonal' : ''}
                            ${isJailingSheriffTarget ? 'special-target' : ''}
                            ${isSheriffJailedTarget ? 'special-outline' : ''}
                            ${isPlutoServantHighlight ? 'special-outline' : ''}
                            ${specialMode && isSelected ? 'special-source' : ''}
                            ${isCupidLinkedHighlight ? 'cupid-linked' : ''}
                            ${isCupidSelectionTarget ? 'cupid-selection-target' : ''}`}
                  onClick={() => handleCellClick(region, index)}
                >
                  {piece ? (
                    <>
                      <img
                        src={getPieceImage(piece)}
                        alt={`${piece.color} ${piece.mvtype}`}
                        className="piece"
                      />
                      {piece.pctype === 'sheriff' && piece.hasDeputyBadge ? <img src={deputyBadge} alt="Deputy badge" className="lock-overlay" /> : null}
                      {piece.isLocked ? <img src={jailCell} alt="Jailed" className="lock-overlay" /> : null}
                    </>
                  ) : null}
                  {region === 'center' && airstrikeDisplayTiles.includes(index) ? <img src={airstrikeTeam === 'white' ? lightExplosion : darkExplosion} alt="Airstrike" className="lock-overlay" /> : null}
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
            <button
              type="button"
              className={`special-action-button ${specialActionVisible ? 'special-action-visible' : 'special-action-hidden'}`}
              disabled={!specialActionEnabled}
              aria-hidden={!specialActionVisible}
              tabIndex={specialActionVisible ? 0 : -1}
              onClick={handleSpecialAction}
            >
              {specialActionLabel}
            </button>
          </div>

          <div className="side-board bottom-board">
            {getPlayerHeader('black', 'Black', blackMaterial, -materialDiff)}
            {renderBoard(BOARD_SIDE_HEIGHT, BOARD_SIDE_WIDTH, 'bottom', 'side-board-grid')}
          </div>
        </div>
      </section>
    </main>
  )
}



export default GamePlay;