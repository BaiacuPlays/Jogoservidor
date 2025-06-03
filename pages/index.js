import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redireciona para o arquivo HTML original que funciona
    window.location.href = '/index.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>⚔️ CHARACTER CLASH</h1>
        <p>Carregando o jogo de adivinhação...</p>
        <p style={{ fontSize: '0.9em', opacity: 0.7, marginTop: '20px' }}>
          Se não for redirecionado automaticamente,{' '}
          <a href="/index.html" style={{ color: '#4a90e2', textDecoration: 'none' }}>
            clique aqui
          </a>
        </p>
      </div>
    </div>
  );
}