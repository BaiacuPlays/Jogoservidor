export default function Home() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️ CHARACTER CLASH</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
        O Jogo de Adivinhação Definitivo - Estilo "Cara a Cara"
      </p>

      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '15px',
        maxWidth: '600px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🚧 Em Manutenção</h2>
        <p style={{ lineHeight: '1.6' }}>
          Estamos trabalhando para resolver alguns problemas técnicos.<br/>
          O jogo estará disponível em breve com todas as funcionalidades.
        </p>
      </div>

      <a
        href="/game"
        style={{
          display: 'inline-block',
          padding: '15px 30px',
          backgroundColor: '#4a90e2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '10px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#357abd'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#4a90e2'}
      >
        🎮 Tentar Acessar o Jogo
      </a>

      <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.6 }}>
        Se o link acima não funcionar, o problema está sendo corrigido.
      </p>
    </div>
  );
}