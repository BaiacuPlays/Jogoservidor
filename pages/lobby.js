import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Lobby() {
  const router = useRouter();
  const { room, nick } = router.query;
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let interval;
    async function fetchPlayers() {
      if (room) {
        const res = await fetch(`/api/lobby?roomCode=${room}`);
        const data = await res.json();
        setPlayers(data.players || []);
        setStarted(data.started || false);
        if (data.players && data.players[0] === nick) {
          setIsHost(true);
        } else {
          setIsHost(false);
        }
        // Se o jogo foi iniciado, redireciona
        if (data.started) {
          window.location.href = `index.html?room=${room}&nick=${nick}`;
        }
      }
    }
    if (room) {
      fetchPlayers();
      interval = setInterval(fetchPlayers, 2000);
    }
    return () => clearInterval(interval);
  }, [room, nick, router]);

  const handleStartGame = async () => {
    setStarting(true);
    await fetch('/api/lobby', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: room, action: 'start' })
    });
    setStarting(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Lobby da Sala</h2>
      <p><b>Código da sala:</b> {room}</p>
      <p><b>Seu nick:</b> {nick}</p>
      <h4>Jogadores na sala:</h4>
      <ul>
        {players.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <p>Aguardando jogadores...</p>
      {isHost && (
        <button onClick={handleStartGame} disabled={starting || players.length < 3} style={{ marginTop: 16 }}>
          {starting ? 'Iniciando...' : 'Iniciar jogo'}
        </button>
      )}
      {isHost && players.length < 3 && (
        <p style={{ color: 'red', marginTop: 8 }}>É preciso pelo menos 3 jogadores para iniciar.</p>
      )}
    </div>
  );
} 