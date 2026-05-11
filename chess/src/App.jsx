import { useState } from "react";
import GamePlay from "./GamePlay";
import BlitzGamePlay from "./BlitzGamePlay";
import DeckSelect from "./DeckSelect";


function App() {
  const [screenView, setScreenView] = useState(0)
  const [selectedDecks, setSelectedDecks] = useState({
    white: null,
    black: null,
  })
    const [selectedTypes, setSelectedTypes] = useState({
    white: null,
    black: null,
  })

  const handleStartGame = (whiteDeck, blackDeck, whiteType, blackType) => {
    setSelectedDecks({ white: whiteDeck, black: blackDeck })
    setSelectedTypes({ white: whiteType, black: blackType })
      console.log("deck", whiteDeck)
     console.log('black type', blackType)
    setScreenView(1)
  }
  const screens = {
    0: DeckSelect,
    1: GamePlay,
    2: BlitzGamePlay,
    // add more here as needed
  };

  const CurrentScreen = screens[screenView];
  
  return (
    <div className="App">
            {screenView === 0 ? (
        <DeckSelect onStartGame={handleStartGame} />
      ) : screenView === 1 ? (
        <GamePlay whiteDeck={selectedDecks.white} blackDeck={selectedDecks.black} 
                  whiteType={selectedTypes.white} blackType={selectedTypes.black} />
      ) : (
        <BlitzGamePlay />
      )}
    </div>
  );
}

export default App;

