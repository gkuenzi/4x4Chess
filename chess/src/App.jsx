import { useState } from "react";
import GamePlay from "./GamePlay";
import DeckSelect from "./DeckSelect";


function App() {
  const [screenView, setScreenView] = useState(0)

  const screens = {
    0: DeckSelect,
    1: GamePlay,
    // add more here as needed
  };

  const CurrentScreen = screens[screenView];
  
  return (
    <div className="App">
      <CurrentScreen />
    </div>
  );
}

export default App;

