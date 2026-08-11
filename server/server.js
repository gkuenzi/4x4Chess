const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
wss.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process and try again.`);
  } else {
    console.error('WebSocket server error:', err.message);
  }
  process.exit(1);
});
const rooms = {};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms[code]);
  return code;
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    if (data.type === 'CREATE_ROOM') {
      const code = generateCode();
      rooms[code] = { host: ws, guest: null, deckData: data.deckData };
      ws.roomCode = code;
      ws.role = 'host';
      ws.send(JSON.stringify({ type: 'ROOM_CREATED', code }));
    }

    else if (data.type === 'JOIN_ROOM') {
      const room = rooms[data.code];
      if (!room) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found. Check your code.' }));
        return;
      }
      if (room.guest) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
        return;
      }
      room.guest = ws;
      ws.roomCode = data.code;
      ws.role = 'guest';

      // Merge host's white deck with guest's chosen black deck
      const guest = data.guestDeckData || {};
      const completeDeckData = {
        whiteDeck: room.deckData.whiteDeck,
        whiteType: room.deckData.whiteType,
        blackDeck: guest.blackDeck || room.deckData.blackDeck,
        blackType: guest.blackType || room.deckData.blackType,
      };

      ws.send(JSON.stringify({ type: 'JOINED_ROOM', code: data.code, deckData: completeDeckData }));
      room.host.send(JSON.stringify({ type: 'OPPONENT_JOINED', deckData: completeDeckData }));
    }

    else if (data.type === 'GAME_STATE') {
      const room = rooms[ws.roomCode];
      if (!room) return;
      const opponent = ws.role === 'host' ? room.guest : room.host;
      if (opponent && opponent.readyState === WebSocket.OPEN) {
        opponent.send(JSON.stringify(data));
      }
    }
  });

  ws.on('close', () => {
    if (!ws.roomCode) return;
    const room = rooms[ws.roomCode];
    if (!room) return;
    const opponent = ws.role === 'host' ? room.guest : room.host;
    if (opponent && opponent.readyState === WebSocket.OPEN) {
      opponent.send(JSON.stringify({ type: 'OPPONENT_DISCONNECTED' }));
    }
    delete rooms[ws.roomCode];
  });
});

