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

  const handleStartGame = (whiteDeck, blackDeck) => {
    setSelectedDecks({ white: whiteDeck, black: blackDeck })
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
        <GamePlay whiteDeck={selectedDecks.white} blackDeck={selectedDecks.black} />
      ) : (
        <BlitzGamePlay />
      )}
    </div>
  );
}

export default App;

