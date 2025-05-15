let lobbies = global.lobbies || {};
global.lobbies = lobbies;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function shuffle(array) {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sortearNicks(players) {
  let sorteados;
  let tentativas = 0;
  do {
    sorteados = shuffle([...players]);
    tentativas++;
    // Garante que ninguém sorteie a si mesmo
  } while (players.some((p, i) => p === sorteados[i]) && tentativas < 10);
  // Se não conseguir em 10 tentativas, faz um swap manual
  if (players.some((p, i) => p === sorteados[i])) {
    for (let i = 0; i < players.length; i++) {
      if (players[i] === sorteados[i]) {
        const j = (i + 1) % players.length;
        [sorteados[i], sorteados[j]] = [sorteados[j], sorteados[i]];
      }
    }
  }
  // Retorna um objeto: { jogador: sorteado }
  const resultado = {};
  players.forEach((p, i) => {
    resultado[p] = sorteados[i];
  });
  return resultado;
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Criar sala
    const { nickname } = req.body;
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (lobbies[roomCode]);
    lobbies[roomCode] = { players: [nickname] };
    return res.status(200).json({ roomCode });
  }
  if (req.method === 'PUT') {
    // Entrar em sala
    const { nickname, roomCode } = req.body;
    if (!lobbies[roomCode]) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    if (!lobbies[roomCode].players.includes(nickname)) {
      lobbies[roomCode].players.push(nickname);
    }
    return res.status(200).json({ success: true });
  }
  if (req.method === 'PATCH') {
    // Iniciar jogo e sortear nicks
    const { roomCode, action } = req.body;
    if (action === 'start') {
      const sala = lobbies[roomCode];
      if (!sala || !sala.players || sala.players.length < 3) {
        return res.status(400).json({ error: 'Sala inválida ou jogadores insuficientes.' });
      }
      sala.sorteio = sortearNicks(sala.players);
      sala.started = true;
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Ação inválida.' });
  }
  if (req.method === 'GET') {
    // Listar jogadores da sala
    const { roomCode } = req.query;
    if (!lobbies[roomCode]) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    return res.status(200).json({ players: lobbies[roomCode].players, started: lobbies[roomCode].started || false });
  }
  res.status(405).end();
} 