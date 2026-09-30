import { useState } from 'react'
import './deck-select.css'

const lightKingdomImages = Object.values(
    import.meta.glob("./new-assets/light-kingdom/*.png", { eager: true })
).map((mod) => mod.default);

const darkKingdomImages = Object.values(
    import.meta.glob("./new-assets/dark-kingdom/*.png", { eager: true })
).map((mod) => mod.default);


const lightWesternImages = Object.values(
    import.meta.glob("./new-assets/light-western/*.png", { eager: true })
).map((mod) => mod.default);

const darkWesternImages = Object.values(
    import.meta.glob("./new-assets/dark-western/*.png", { eager: true })
).map((mod) => mod.default);


const lightAngelsImages = Object.values(
    import.meta.glob("./new-assets/light-angels/*.png", { eager: true })
).map((mod) => mod.default);

const darkAngelsImages = Object.values(
    import.meta.glob("./new-assets/dark-angels/*.png", { eager: true })
).map((mod) => mod.default);


const lightFeudalImages = Object.values(
    import.meta.glob("./new-assets/light-feudal/*.png", { eager: true })
).map((mod) => mod.default);

const darkFeudalImages = Object.values(
    import.meta.glob("./new-assets/dark-feudal/*.png", { eager: true })
).map((mod) => mod.default);


const lightUndeworldImages = Object.values(
    import.meta.glob("./new-assets/light-underworld/*.png", { eager: true })
).map((mod) => mod.default);

const darkUndeworldImages = Object.values(
    import.meta.glob("./new-assets/dark-underworld/*.png", { eager: true })
).map((mod) => mod.default);


const lightVikingsImages = Object.values(
    import.meta.glob("./new-assets/light-vikings/*.png", { eager: true })
).map((mod) => mod.default);

const darkVikingsImages = Object.values(
    import.meta.glob("./new-assets/dark-vikings/*.png", { eager: true })
).map((mod) => mod.default);


const lightNovaImages = Object.values(
    import.meta.glob("./new-assets/light-nova/*.png", { eager: true })
).map((mod) => mod.default);

const darkNovaImages = Object.values(
    import.meta.glob("./new-assets/dark-nova/*.png", { eager: true })
).map((mod) => mod.default);

// Establish types for each team to represent their movement
const kingdomType = ['queen', 'knight', 'bishop', 'rook', 'pawn']
const westernType = ['gunslinger', 'knight', 'sheriff', 'rook', 'pawnette'] // Note: Pawn may end up being pawnette
const angelsType = ['biblical', 'cupid', 'bishop', 'angel', 'fallen']
const feudalType = ['samurai', 'knight','ninja', 'dragon', 'pawn']
const underworldType = ['pluto', 'bomber', 'bishop', 'rook', 'pawn']
const vikingsType = ['berserker', 'beastrider', 'bishop', 'valkyrie', 'pawn']
const novaType = ['novaQueen', 'knight', 'scientist', 'bishop', 'droid']
//Note: pawnettes move like pawns, but can't be promoted. droids move like pawns, but when
// promoted, turn into knights
// Note: create an array of the special pieces and upon transfer, ask if they are in array, they are claim special = true

// Piece display names for each deck
const kingdomPieceNames = ['King', 'Knight', 'Bishop', 'Dragon', 'Barbarian']
const westernPieceNames = ['Outlaw', 'Rider', 'Sheriff', 'Hawk', 'Cowboy']
const angelsPieceNames = ['Biblical', 'Cupid', 'Prophet', 'Angelic Warrior', 'Fallen Angel']
const feudalPieceNames = ['Samurai', 'Oni Rider', 'Ninja', 'Dragon', 'Apprentice']
const underworldPieceNames = ['Hell King', 'Hellbomber', 'Sorcerer', 'Imp', 'Demon']
const vikingsPieceNames = ['Berserker', 'Beastrider', 'Rune Seeker', 'Valkyrie', 'Viking']
const novaPieceNames = ['Nova Queen', 'Rover', 'Scientist', 'Warhawk', 'Droid']

const deckTypes = [kingdomType, westernType, angelsType, feudalType, underworldType, vikingsType, novaType]
const deckNames = ['Kingdom', 'Western', 'Angels', 'Feudal', 'Demons', 'Vikings', 'Nova Division']
const deckPieceNames = [kingdomPieceNames, westernPieceNames, angelsPieceNames, feudalPieceNames, underworldPieceNames, vikingsPieceNames, novaPieceNames]

const lightImageSets = [lightKingdomImages, lightWesternImages, lightAngelsImages, lightFeudalImages, lightUndeworldImages, lightVikingsImages, lightNovaImages]
const darkImageSets = [darkKingdomImages, darkWesternImages, darkAngelsImages, darkFeudalImages, darkUndeworldImages, darkVikingsImages, darkNovaImages]

const pieceRules = {
    queen: {
        movement: 'Moves any number of tiles in a straight line or diagonal.',
        ability: 'None',
    },
    samurai: {
        movement: 'Moves 1 tile diagonally, or 1 to 2 tiles horizontally or vertically.',
        ability: 'None',
    },
    biblical: {
        movement: 'Moves 1 tile in any direction, or 2 tiles diagonally.',
        ability: 'None',
    },
    knight: {
        movement: 'Moves in an L-shape: two tiles in one direction, then one tile perpendicular.',
        ability: 'None',
    },
    bishop: {
        movement: 'Moves any number of tiles diagonally.',
        ability: 'None',
    },
    rook: {
        movement: 'Moves any number of tiles in a straight line.',
        ability: 'None',
    },
    pawn: {
        movement: 'Moves one tile forward and captures one tile diagonally.',
        ability: 'Promotes when it reaches the far side of the board.',
    },
    gunslinger: {
        movement: 'Moves one tile in any direction.',
        ability: 'Fires along a straight or diagonal line. Reloads before firing again.',
    },
    sheriff: {
        movement: 'Moves one tile in any direction.',
        ability: 'Locks an enemy piece along the same row or column. If the sheriff moves or is killed, the enemy is released.',
    },
    pawnette: {
        movement: 'Moves one tile forward and captures one tile diagonally.',
        ability: 'Promotes into a Miner and movement is changed to one tile in any direction.',
    },
    cupid: {
        movement: 'Moves like a knight.',
        ability: 'Links two pieces. Linked pieces share their fate when one is killed. If the cupid dies, the link is released.',
    },
    angel: {
        movement: 'Moves one tile in any direction.',
        ability: 'Revives one fallen ally, with a chance that the Angel dies.',
    },
    fallen: {
        movement: 'Moves one tile forward and captures one tile diagonally.',
        ability: 'Returns as a fallen piece and promotes into a risen Angel. Movement is changed to one tile in any direction.',
    },
    ninja: {
        movement: 'Moves one tile in any direction.',
        ability: 'Can be spawned in anywhere on the board.',
    },
    dragon: {
        movement: 'Moves any number of tiles in a straight line.',
        ability: 'Shapeshifts into an enemy piece on the board, copying its movement and special ability for up to 5 of the Dragon\'s turns. Each enemy piece can only be copied once per game. Returning to Dragon form starts a 5-turn cooldown.',
    },
    pluto: {
        movement: 'Moves one tile in any direction.',
        ability: 'Summons a servant on the board from the souls of the fallen. servant moves in one direction once every allies turn. It cannot be killed. The ability is recharged for every death on the board, both allies and enemies, and has a maximum storage of 5 souls.',
    },
    bomber: {
        movement: 'Moves one tile in any direction.',
        ability: 'Detonates and destroys pieces in an adjacent or diagonal blast, at the expense of his own life.',
    },
    berserker: {
        movement: 'Moves one tile in any direction.',
        ability: 'Charges to the end of a row or column, clearing both enemies and allies in its path. Once reaching the other side, the berserker falls dizzy for one turn.',
    },
    beastrider: {
        movement: 'Moves like a knight.',
        ability: 'If killed, the rider returns as a viking.',
    },
    valkyrie: {
        movement: 'Moves any number of tiles in a straight line or diagonal.',
        ability: 'Marks its position and can return to that mark later. It does not require a turn to place a mark.',
    },
    novaQueen: {
        movement: 'Moves any number of tiles in a straight line or diagonal.',
        ability: 'Calls two airstrikes: the first targets a chosen 3x3 area, the second is random. Air strikes can kill both enemies and allies.',
    },
    scientist: {
        movement: 'Moves one tile in any direction.',
        ability: 'Scrambles an active enemy special ability. Resets after 5 turns.',
    },
    droid: {
        movement: 'Moves one tile forward and captures one tile diagonally.',
        ability: 'Once reaching the other side of the board, it can be detonated. This sends an airstrike to one random tile on the board, excluding tiles allies are on.',
    },
}

const deckPieceRuleOverrides = {
    3: {
        4: {
            movement: 'Moves one tile forward and captures one tile diagonally.',
            ability: "Promotes to an Oni when reaching the other side of the board. Oni's can teleport to the spaces of fallen allies, marked by an oni-mask. Movement is changed to one tile in any diagnonal direction.",
        },
    },
    4: {
        2: {
            ability: "When an enemy is killed on the board by any ally, the Sorcerer's spawn is extended to those tiles as well as the default spawn area.",
        },
        4: {
            movement: 'Moves one tile forward and captures one tile diagonally.',
            ability: 'Promotes to Hell King when it reaches the far side of the board.',
        },
    },
    5: {
        4: {
            movement: 'Moves one tile forward and captures one tile diagonally.',
            ability: 'Promotes  to a Berserker when it reaches the far side of the board.',
        },
    },
}

const getPieceRules = (deckIndex, pieceIndex, pieceType) => (
    deckPieceRuleOverrides[deckIndex]?.[pieceIndex] ?? pieceRules[pieceType] ?? { movement: 'None', ability: 'None' }
)


function DeckSelect({ onStartGame, onStartBlitzGame, onHostOnline, mode = 'local', onBack }) {
    const [whiteDeck, setWhiteDeck] = useState(0)
    const [blackDeck, setBlackDeck] = useState(0)
    const [whiteType, setWhiteTypes] = useState(deckTypes[0])
    const [blackType, setBlackTypes] = useState(deckTypes[0])
    const [selectedPiece, setSelectedPiece] = useState(null)

    const isOnlineMode = mode === 'online'
    const currentWhiteSet = lightImageSets[whiteDeck];
    const currentBlackSet = darkImageSets[blackDeck];

    return (
        <div className={`main-container ${isOnlineMode ? 'single-deck-mode' : ''}`}>
            <button type='button' className='deck-back-btn' onClick={onBack}>Back</button>
            <h2 className='title-Card'>Choose Your {isOnlineMode ? 'Deck' : 'Decks'}</h2>

            {isOnlineMode ? (
                <div className='online-deck-selection'>
                    <h3 className='light-deck-heading'>{deckNames[whiteDeck]}</h3>
                    <div className='deck-container'>
                        <button
                            type='button'
                            onClick={() => {
                                const nextDeck = whiteDeck === 0 ? lightImageSets.length - 1 : whiteDeck - 1;
                                setWhiteDeck(nextDeck);
                                setWhiteTypes(deckTypes[nextDeck]);
                            }}
                            className='changeBtn'
                            aria-label='Previous deck'
                        >←</button>
                        <div className='deck-display'>
                            {currentWhiteSet.map((src, i) => (
                                <button
                                    key={i}
                                    type='button'
                                    className='piece-container piece-card'
                                    onClick={() => setSelectedPiece({
                                        image: src,
                                        name: deckPieceNames[whiteDeck][i],
                                        type: deckTypes[whiteDeck][i],
                                        rules: getPieceRules(whiteDeck, i, deckTypes[whiteDeck][i]),
                                        side: 'Your',
                                    })}
                                >
                                    <img src={src} alt={deckPieceNames[whiteDeck][i]} />
                                    <p className='piece-name piece-name-light'>{deckPieceNames[whiteDeck][i]}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            type='button'
                            onClick={() => {
                                const nextDeck = whiteDeck < lightImageSets.length - 1 ? whiteDeck + 1 : 0;
                                setWhiteDeck(nextDeck);
                                setWhiteTypes(deckTypes[nextDeck]);
                            }}
                            className='changeBtn'
                            aria-label='Next deck'
                        >→</button>
                    </div>
                    <button
                        className='onlineBtn'
                        onClick={() => onHostOnline(
                            currentWhiteSet,
                            darkImageSets[whiteDeck],
                            deckTypes[whiteDeck],
                            deckTypes[whiteDeck],
                        )}
                    >
                        Continue Online
                    </button>
                </div>
            ) : (
                <>
                    <div>
                        <h3 className='light-deck-heading'>{deckNames[whiteDeck]}</h3>
                        <div className='deck-container'>
                            <button onClick={() => {
                                const nextDeck = whiteDeck === 0 ? lightImageSets.length - 1 : whiteDeck - 1;
                                setWhiteDeck(nextDeck);
                                setWhiteTypes(deckTypes[nextDeck]);
                            }} className='changeBtn'>←</button>
                            <div className='deck-display'>
                                {currentWhiteSet.map((src, i) => (
                                    <button
                                        key={i}
                                        type='button'
                                        className='piece-container piece-card'
                                        onClick={() => setSelectedPiece({
                                            image: src,
                                            name: deckPieceNames[whiteDeck][i],
                                            type: deckTypes[whiteDeck][i],
                                            rules: getPieceRules(whiteDeck, i, deckTypes[whiteDeck][i]),
                                            side: 'Light',
                                        })}
                                    >
                                        <img src={src} alt={deckPieceNames[whiteDeck][i]} />
                                        <p className='piece-name piece-name-light'>{deckPieceNames[whiteDeck][i]}</p>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    const nextDeck = whiteDeck < lightImageSets.length - 1 ? whiteDeck + 1 : 0;
                                    setWhiteDeck(nextDeck);
                                    setWhiteTypes(deckTypes[nextDeck]);
                                }}
                                className='changeBtn'>→</button>
                        </div>
                    </div>

                    <div>
                        <h3 className='dark-deck-heading'>{deckNames[blackDeck]}</h3>
                        <div className='deck-container'>
                            <button onClick={() => {
                                const nextDeck = blackDeck === 0 ? darkImageSets.length - 1 : blackDeck - 1;
                                setBlackDeck(nextDeck);
                                setBlackTypes(deckTypes[nextDeck]);
                            }} className='changeBtn'>←</button>
                            <div className='deck-display'>
                                {currentBlackSet.map((src, i) => (
                                    <button
                                        key={i}
                                        type='button'
                                        className='piece-container piece-card'
                                        onClick={() => setSelectedPiece({
                                            image: src,
                                            name: deckPieceNames[blackDeck][i],
                                            type: deckTypes[blackDeck][i],
                                            rules: getPieceRules(blackDeck, i, deckTypes[blackDeck][i]),
                                            side: 'Dark',
                                        })}
                                    >
                                        <img src={src} alt={deckPieceNames[blackDeck][i]} />
                                        <p className='piece-name piece-name-dark'>{deckPieceNames[blackDeck][i]}</p>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    const nextDeck = blackDeck < darkImageSets.length - 1 ? blackDeck + 1 : 0;
                                    setBlackDeck(nextDeck);
                                    setBlackTypes(deckTypes[nextDeck]);
                                }}
                                className='changeBtn'>→</button>
                        </div>
                        <button className='blitzBtn' onClick={() => onStartBlitzGame(currentWhiteSet, currentBlackSet, whiteType, blackType)}>Blitz Mode</button>
                        <button className='startBtn' onClick={() => onStartGame(currentWhiteSet, currentBlackSet, whiteType, blackType)}>Classic</button>
                    </div>
                </>
            )}

            {selectedPiece && (
                <div className='piece-info-backdrop' role='presentation' onClick={() => setSelectedPiece(null)}>
                    <section
                        className='piece-info-panel'
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='piece-info-title'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type='button'
                            className='piece-info-close'
                            aria-label='Close piece information'
                            onClick={() => setSelectedPiece(null)}
                        >
                            ×
                        </button>
                        <p className='piece-info-side'>{selectedPiece.side} piece</p>
                        <img src={selectedPiece.image} alt={selectedPiece.name} className='piece-info-image' />
                        <h2 id='piece-info-title'>{selectedPiece.name}</h2>
                        <div className='piece-info-rule'>
                            <h3>Movement</h3>
                            <p>{selectedPiece.rules.movement}</p>
                        </div>
                        <div className='piece-info-rule'>
                            <h3>Ability</h3>
                            <p>{selectedPiece.rules.ability}</p>
                        </div>
                    </section>
                </div>
            )}
        </div>

    );
}

export default DeckSelect