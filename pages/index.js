import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Força o redirecionamento para index.html usando replace para não criar histórico
    if (typeof window !== 'undefined') {
      window.location.replace('/index.html');
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Carregando Character Clash...</h1>
        <p>Se não for redirecionado automaticamente, <a href="/index.html">clique aqui</a>.</p>
      </div>
    </div>
  );
}