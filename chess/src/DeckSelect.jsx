import { useState } from 'react'
import './deck-select.css'

const lightKingdomImages = Object.values(
    import.meta.glob("./assets/light-kingdom/*.png", { eager: true })
).map((mod) => mod.default);

const darkKingdomImages = Object.values(
    import.meta.glob("./assets/dark-kingdom/*.png", { eager: true })
).map((mod) => mod.default);


const lightWesternImages = Object.values(
    import.meta.glob("./assets/light-western/*.png", { eager: true })
).map((mod) => mod.default);

const darkWesternImages = Object.values(
    import.meta.glob("./assets/dark-western/*.png", { eager: true })
).map((mod) => mod.default);


const lightAngelsImages = Object.values(
    import.meta.glob("./assets/light-angels/*.png", { eager: true })
).map((mod) => mod.default);

const darkAngelsImages = Object.values(
    import.meta.glob("./assets/dark-angels/*.png", { eager: true })
).map((mod) => mod.default);


const lightFeudalImages = Object.values(
    import.meta.glob("./assets/light-feudal/*.png", { eager: true })
).map((mod) => mod.default);

const darkFeudalImages = Object.values(
    import.meta.glob("./assets/dark-feudal/*.png", { eager: true })
).map((mod) => mod.default);


const lightUndeworldImages = Object.values(
    import.meta.glob("./assets/light-underworld/*.png", { eager: true })
).map((mod) => mod.default);

const darkUndeworldImages = Object.values(
    import.meta.glob("./assets/dark-underworld/*.png", { eager: true })
).map((mod) => mod.default);


const lightVikingsImages = Object.values(
    import.meta.glob("./assets/light-vikings/*.png", { eager: true })
).map((mod) => mod.default);

const darkVikingsImages = Object.values(
    import.meta.glob("./assets/dark-vikings/*.png", { eager: true })
).map((mod) => mod.default);


const lightNovaImages = Object.values(
    import.meta.glob("./assets/light-nova/*.png", { eager: true })
).map((mod) => mod.default);

const darkNovaImages = Object.values(
    import.meta.glob("./assets/dark-nova/*.png", { eager: true })
).map((mod) => mod.default);

// Establish types for each team to represent their movement
const kingdomType = ['queen', 'knight', 'bishop', 'rook', 'pawn']
const westernType = ['gunslinger', 'knight', 'sheriff', 'rook', 'pawn'] // Note: Pawn may end up being pawnette
const angelsType = ['queen', 'cupid', 'angel', 'rook', 'pawnette']
const feudalType = ['queen', 'dragon', 'knight', 'ninja', 'pawn']
const underworldType = ['Hades', 'bomber', 'bishop', 'rook', 'pawn']
const vikingsType = ['konungr', 'beastrider', 'bishop', 'rook', 'pawn']
const novaType = ['nova', 'knight', 'scientist', 'bishop', 'droid']
//Note: pawnettes move like pawns, but can't be promoted. droids move like pawns, but when
// promoted, turn into knights
// Note: create an array of the special pieces and upon transfer, ask if they are in array, they are claim special = true

const deckTypes = [kingdomType, westernType, angelsType, feudalType, underworldType, vikingsType, novaType]


const lightImageSets = [lightKingdomImages, lightWesternImages, lightAngelsImages, lightFeudalImages, lightUndeworldImages, lightVikingsImages, lightNovaImages]
const darkImageSets = [darkKingdomImages, darkWesternImages, darkAngelsImages, darkFeudalImages, darkUndeworldImages, darkVikingsImages, darkNovaImages]


function DeckSelect({ onStartGame }) {
    const [whiteDeck, setWhiteDeck] = useState(0)
    const [blackDeck, setBlackDeck] = useState(0)
    const [whiteType, setWhiteTypes] = useState(deckTypes[0])
    const [blackType, setBlackTypes] = useState(deckTypes[0])

    const currentWhiteSet = lightImageSets[whiteDeck];
    const currentBlackSet = darkImageSets[blackDeck];

    return (
        <div className='main-container'>
            <h2 className='title-Card'>
                Choose Your Deck
            </h2>
            <div>
                <h3>
                    Light
                </h3>
                <div className='deck-container'>
                    <button onClick={() => {
                        setWhiteDeck(whiteDeck == 0 ? lightImageSets.length - 1 : whiteDeck - 1);
                        setWhiteTypes(deckTypes[whiteDeck == 0 ? deckTypes.length - 1 : whiteDeck - 1])
                        console.log(whiteType)
                    }} className='changeBtn'> ← </button>
                    <div className='deck-display'>
                        {currentWhiteSet.map((src, i) => (
                            <img key={i} src={src} alt={`img-${i}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setWhiteDeck(whiteDeck < lightImageSets.length - 1 ? whiteDeck + 1 : 0);
                            setWhiteTypes(deckTypes[whiteDeck < deckTypes.length - 1 ? whiteDeck + 1 : 0])
                            console.log(deckTypes[whiteDeck])
                        }} 
                        className='changeBtn'> →
                    </button>
                </div>
            </div>

            <div>
                <h3>
                    Dark
                </h3>
                <div className='deck-container'>
                    <button onClick={() => {
                        setBlackDeck(blackDeck == 0 ? darkImageSets.length - 1 : blackDeck - 1)
                        setBlackTypes(deckTypes[blackDeck == 0 ? deckTypes.length - 1 : blackDeck - 1])
                    }}className='changeBtn'               
                    > ← </button>
                    <div className='deck-display'>
                        {currentBlackSet.map((src, i) => (
                            <img key={i} src={src} alt={`img-${i}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setBlackDeck(blackDeck < darkImageSets.length - 1 ? blackDeck + 1 : 0);
                            setBlackTypes(deckTypes[blackDeck < deckTypes.length - 1 ? blackDeck + 1 : 0])
                        }}
                        className='changeBtn'> →
                    </button>
                </div>
                <button className='blitzBtn'>Blitz Mode</button>
                <button className='startBtn' onClick={() => onStartGame(currentWhiteSet, currentBlackSet, whiteType, blackType)}>Start Game</button>
            </div>
        </div>

    );
}

export default DeckSelect