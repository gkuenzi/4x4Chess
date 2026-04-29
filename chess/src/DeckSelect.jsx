import { useState, useEffect } from 'react'
import './deck-select.css'

const lightMedievalImages = Object.values(
    import.meta.glob("./assets/light-medieval/*.png", { eager: true })
).map((mod) => mod.default);

const darkMedievalImages = Object.values(
    import.meta.glob("./assets/dark-medieval/*.png", { eager: true })
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


const lightImageSets = [lightMedievalImages, lightWesternImages, lightAngelsImages, lightFeudalImages]
const darkImageSets = [darkMedievalImages, darkWesternImages, darkAngelsImages]


function DeckSelect() {
    const [whiteDeck, setWhiteDeck] = useState(0)
    const [blackDeck, setBlackDeck] = useState(0)

    const currentWhiteSet = lightImageSets[whiteDeck];
    const currentBlackSet = darkImageSets[blackDeck];

    function displayDeck(deck, setDeck) {
        currentWhiteSet.map((src, i) => (
            <img key={i} src={src} alt={`img-${i}`} />
        ))
    }

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
                    <button onClick={() => setWhiteDeck(whiteDeck == 0 ? lightImageSets.length - 1 : whiteDeck - 1)} className='changeBtn'> ← </button>
                    <div className='deck-display'>
                        {currentWhiteSet.map((src, i) => (
                            <img key={i} src={src} alt={`img-${i}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => setWhiteDeck(whiteDeck < lightImageSets.length - 1 ? whiteDeck + 1 : 0)}
                        className='changeBtn'> →
                    </button>
                </div>
            </div>

            <div>
                <h3>
                    Dark
                </h3>
                <div className='deck-container'>
                    <button onClick={() => setBlackDeck(blackDeck == 0 ? darkImageSets.length - 1 : blackDeck - 1)} className='changeBtn'> ← </button>
                    <div className='deck-display'>
                        {currentBlackSet.map((src, i) => (
                            <img key={i} src={src} alt={`img-${i}`} />
                        ))}
                    </div>
                    <button
                        onClick={() => setBlackDeck(blackDeck < darkImageSets.length - 1 ? blackDeck + 1 : 0)}
                        className='changeBtn'> →
                    </button>
                </div>
            </div>
        </div>

    );
}

export default DeckSelect