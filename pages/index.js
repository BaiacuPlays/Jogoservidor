import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/lobby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });
    const data = await res.json();
    if (data.roomCode) {
      router.push(`/lobby?room=${data.roomCode}&nick=${nickname}`);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/lobby', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, roomCode })
    });
    const data = await res.json();
    if (data.success) {
      router.push(`/lobby?room=${roomCode}&nick=${nickname}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Jogo Lobby Online</h2>
      <form>
        <label>Nickname:<br />
          <input value={nickname} onChange={e => setNickname(e.target.value)} required />
        </label>
        <br /><br />
        <label>Código da sala:<br />
          <input value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={6} />
        </label>
        <br /><br />
        <button onClick={handleCreate} type="submit">Criar sala</button>
        <span style={{ margin: '0 8px' }}></span>
        <button onClick={handleJoin} type="button" disabled={!roomCode}>Entrar na sala</button>
      </form>
    </div>
  );
} 