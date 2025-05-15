import { kv } from '@vercel/kv';

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

export const config = {
  runtime: 'edge',
  regions: ['sao1'],
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responder a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // Criar sala
      const { nickname } = req.body;
      if (!nickname) {
        return res.status(400).json({ error: 'Nickname é obrigatório.' });
      }

      let roomCode;
      let existingLobby;
      do {
        roomCode = generateRoomCode();
        existingLobby = await kv.get(`lobby:${roomCode}`);
      } while (existingLobby);

      const lobby = {
        players: [nickname],
        created: Date.now()
      };

      await kv.set(`lobby:${roomCode}`, lobby);
      return res.status(200).json({ roomCode });
    }

    if (req.method === 'PUT') {
      // Entrar em sala
      const { nickname, roomCode } = req.body;
      if (!nickname || !roomCode) {
        return res.status(400).json({ error: 'Nickname e código da sala são obrigatórios.' });
      }

      const lobby = await kv.get(`lobby:${roomCode}`);
      if (!lobby) {
        return res.status(404).json({ error: 'Sala não encontrada.' });
      }

      if (!lobby.players.includes(nickname)) {
        lobby.players.push(nickname);
        await kv.set(`lobby:${roomCode}`, lobby);
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'PATCH') {
      // Iniciar jogo e sortear nicks
      const { roomCode, action } = req.body;
      if (!roomCode || action !== 'start') {
        return res.status(400).json({ error: 'Parâmetros inválidos.' });
      }

      const lobby = await kv.get(`lobby:${roomCode}`);
      if (!lobby || !lobby.players || lobby.players.length < 3) {
        return res.status(400).json({ error: 'Sala inválida ou jogadores insuficientes.' });
      }

      lobby.sorteio = sortearNicks(lobby.players);
      lobby.started = true;
      await kv.set(`lobby:${roomCode}`, lobby);

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      // Listar jogadores da sala
      const { roomCode } = req.query;
      if (!roomCode) {
        return res.status(400).json({ error: 'Código da sala é obrigatório.' });
      }

      const lobby = await kv.get(`lobby:${roomCode}`);
      if (!lobby) {
        return res.status(404).json({ error: 'Sala não encontrada.' });
      }

      return res.status(200).json({
        players: lobby.players,
        started: lobby.started || false,
        sorteio: lobby.sorteio || null
      });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de lobby:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
} 