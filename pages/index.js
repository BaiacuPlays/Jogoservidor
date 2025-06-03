import Head from 'next/head';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redireciona para o jogo HTML estático
    window.location.href = '/index.html';
  }, []);

  return (
    <>
      <Head>
        <title>Pizzaria del Gatito, the game</title>
        <meta name="description" content="Pizzaria del Gatito - Um jogo divertido de seleção de personagens online e local" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pizzaria del Gatito" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>🍕 Pizzaria del Gatito</h1>
          <p>Carregando o jogo...</p>
          <p style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Se não for redirecionado automaticamente,
            <a href="/index.html" style={{ color: '#4CAF50', textDecoration: 'none' }}> clique aqui</a>
          </p>
        </div>
      </div>
    </>
  );
}