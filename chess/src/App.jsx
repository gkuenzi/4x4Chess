import { useState, useRef, useCallback } from 'react';
import GamePlay from "./GamePlay";
import BlitzGamePlay from "./BlitzGamePlay";
import DeckSelect from "./DeckSelect";
import "./online-lobby.css";

function getWsUrl() {
  if (typeof window === 'undefined') return 'ws://localhost:8080';
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.origin.replace(/^http/, 'ws')}/ws`;
  }
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${wsProtocol}://${window.location.host}/ws`;
}

function App() {
  const [screenView, setScreenView] = useState(0);
  // 0: DeckSelect  1: GamePlay (local)  2: BlitzGamePlay  3: GamePlay (online)

  const [selectedDecks, setSelectedDecks] = useState({ white: null, black: null });
  const [selectedTypes, setSelectedTypes] = useState({ white: null, black: null });

  // Online state
  const wsRef = useRef(null);
  const pendingActionRef = useRef(null);
  const pendingDeckDataRef = useRef(null);

  const [onlinePanel, setOnlinePanel] = useState('hidden');
  // 'hidden' | 'menu' | 'hosting' | 'joining'
  const [onlineStatus, setOnlineStatus] = useState('idle');
  // 'idle' | 'connecting' | 'waiting' | 'error'
  const [roomCode, setRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [onlineError, setOnlineError] = useState('');
  const [playerColor, setPlayerColor] = useState(null);

  const connectAndSend = useCallback((action) => {
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify(action));
    };

    ws.onmessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }

      if (data.type === 'ROOM_CREATED') {
        setRoomCode(data.code);
        setOnlineStatus('waiting');
      } else if (data.type === 'OPPONENT_JOINED') {
        if (data.deckData) {
          const { whiteDeck, blackDeck, whiteType, blackType } = data.deckData;
          setSelectedDecks({ white: whiteDeck, black: blackDeck });
          setSelectedTypes({ white: whiteType, black: blackType });
        }
        setScreenView(3);
        setOnlinePanel('hidden');
      } else if (data.type === 'JOINED_ROOM') {
        const { whiteDeck, blackDeck, whiteType, blackType } = data.deckData;
        setSelectedDecks({ white: whiteDeck, black: blackDeck });
        setSelectedTypes({ white: whiteType, black: blackType });
        setScreenView(3);
        setOnlinePanel('hidden');
      } else if (data.type === 'ERROR') {
        setOnlineError(data.message);
        setOnlineStatus('error');
      }
    };

    ws.onerror = () => {
      setOnlineError('Could not connect. Make sure the game server is running.');
      setOnlineStatus('error');
    };
  }, []);

  // Called when user clicks "Play Online" in DeckSelect — decks already chosen
  const handleOpenOnlineMenu = (whiteDeck, blackDeck, whiteType, blackType) => {
    setSelectedDecks({ white: whiteDeck, black: blackDeck });
    setSelectedTypes({ white: whiteType, black: blackType });
    pendingDeckDataRef.current = { whiteDeck, blackDeck, whiteType, blackType };
    setOnlinePanel('menu');
    setOnlineStatus('idle');
    setOnlineError('');
  };

  const handleHostGame = () => {
    const deckData = pendingDeckDataRef.current;
    if (!deckData) return;
    setPlayerColor('white');
    setOnlineStatus('connecting');
    setOnlinePanel('hosting');
    setOnlineError('');
    // Send full deck data so the server has a fallback black deck if the guest doesn't provide one
    connectAndSend({ type: 'CREATE_ROOM', deckData });
  };

  const handleJoinGame = () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    setPlayerColor('black');
    setOnlineStatus('connecting');
    setOnlinePanel('joining');
    setOnlineError('');
    // Send guest's currently selected dark deck so the server can merge it with the host's light deck
    const pending = pendingDeckDataRef.current;
    const guestDeckData = pending ? { blackDeck: pending.blackDeck, blackType: pending.blackType } : null;
    connectAndSend({ type: 'JOIN_ROOM', code, guestDeckData });
  };

  const closePanel = () => {
    if (wsRef.current && onlineStatus !== 'waiting') {
      wsRef.current.close();
      wsRef.current = null;
    }
    setOnlinePanel('hidden');
    setOnlineStatus('idle');
    setOnlineError('');
    setRoomCode('');
  };

  const handleBackToMenu = () => {
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setScreenView(0);
    setOnlinePanel('hidden');
    setOnlineStatus('idle');
    setRoomCode('');
    setJoinCodeInput('');
    setOnlineError('');
    setPlayerColor(null);
    pendingDeckDataRef.current = null;
  };

  const renderOnlinePanel = () => {
    if (onlinePanel === 'hidden') return null;

    return (
      <div className="online-overlay">
        <div className="online-modal">
          <button className="online-modal-close" onClick={closePanel}>✕</button>

          {onlinePanel === 'menu' && (
            <>
              <h2 className="online-title">Play Online</h2>
              <p className="online-subtitle">Host a game with your selected decks, or join a friend</p>
              <div className="online-menu-buttons">
                <button className="online-action-btn host-btn" onClick={handleHostGame}>
                  Host Game
                  <span className="online-btn-sub">Create a room and share the code</span>
                </button>
                <div className="online-divider">or</div>
                <div className="online-join-section">
                  <p className="online-join-label">Join a Game</p>
                  <div className="online-join-row">
                    <input
                      className="online-code-input"
                      placeholder="XXXXXX"
                      value={joinCodeInput}
                      onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                      maxLength={6}
                      onKeyDown={e => e.key === 'Enter' && handleJoinGame()}
                      autoFocus
                    />
                    <button className="online-action-btn join-btn" onClick={handleJoinGame}>
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {onlinePanel === 'hosting' && (
            <>
              <h2 className="online-title">Your Room</h2>
              {onlineStatus === 'connecting' && (
                <p className="online-status-text">Connecting to server...</p>
              )}
              {onlineStatus === 'waiting' && (
                <>
                  <p className="online-subtitle">Share this code with your friend:</p>
                  <div className="online-room-code">{roomCode}</div>
                  <p className="online-waiting-text">Waiting for opponent to join...</p>
                </>
              )}
              {onlineStatus === 'error' && (
                <>
                  <p className="online-error">{onlineError}</p>
                  <button className="online-action-btn host-btn" onClick={() => setOnlinePanel('menu')} style={{marginTop: '1rem'}}>
                    Back
                  </button>
                </>
              )}
            </>
          )}

          {onlinePanel === 'joining' && (
            <>
              <h2 className="online-title">Joining Game</h2>
              {onlineStatus === 'connecting' && (
                <p className="online-status-text">Connecting...</p>
              )}
              {onlineStatus === 'error' && (
                <>
                  <p className="online-error">{onlineError}</p>
                  <button className="online-action-btn join-btn" onClick={() => setOnlinePanel('menu')} style={{marginTop: '1rem', width: '100%'}}>
                    Back
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {renderOnlinePanel()}

      {screenView === 0 && (
        <DeckSelect
          onStartGame={(whiteDeck, blackDeck, whiteType, blackType) => {
            setSelectedDecks({ white: whiteDeck, black: blackDeck });
            setSelectedTypes({ white: whiteType, black: blackType });
            setScreenView(1);
          }}
          onStartBlitzGame={(whiteDeck, blackDeck, whiteType, blackType) => {
            setSelectedDecks({ white: whiteDeck, black: blackDeck });
            setSelectedTypes({ white: whiteType, black: blackType });
            setScreenView(2);
          }}
          onHostOnline={handleOpenOnlineMenu}
        />
      )}

      {screenView === 1 && (
        <GamePlay
          whiteDeck={selectedDecks.white}
          blackDeck={selectedDecks.black}
          whiteType={selectedTypes.white}
          blackType={selectedTypes.black}
        />
      )}

      {screenView === 2 && (
        <BlitzGamePlay
          whiteDeck={selectedDecks.white}
          blackDeck={selectedDecks.black}
          whiteType={selectedTypes.white}
          blackType={selectedTypes.black}
        />
      )}

      {screenView === 3 && (
        <GamePlay
          whiteDeck={selectedDecks.white}
          blackDeck={selectedDecks.black}
          whiteType={selectedTypes.white}
          blackType={selectedTypes.black}
          isMultiplayer={true}
          playerColor={playerColor}
          wsRef={wsRef}
          onLeaveGame={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;
