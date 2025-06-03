import Head from 'next/head';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Carrega o script do jogo após o componente montar
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/script.js?v=2';
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Character Clash - Jogo de Adivinhação Estilo "Cara a Cara"</title>
        <meta name="description" content="Character Clash - O jogo de adivinhação estilo 'Cara a Cara' com personagens de games. Adivinhe qual personagem seu oponente escolheu!" />
        <meta name="keywords" content="jogo, cara a cara, adivinhação, personagens, character clash, online, multiplayer, nintendo, gaming, guess who" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Character Clash" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preload critical resources */}
        <link rel="preload" href="/styles/styles.css?v=2" as="style" />
        <link rel="preload" href="/script.js?v=2" as="script" />

        {/* Font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Main stylesheet */}
        <link rel="stylesheet" href="/styles/styles.css?v=2" />
      </Head>

      {/* Game HTML content */}
      <div id="startMenu" className="centered-menu">
        <div className="game-logo">
          <h1>⚔️ CHARACTER CLASH</h1>
          <p className="game-subtitle">O Jogo de Adivinhação Definitivo - Estilo "Cara a Cara"</p>
        </div>

        <div className="tutorial-section">
          <h3>🎯 Como Jogar - Estilo "Cara a Cara"</h3>
          <div className="tutorial-grid">
            <div className="tutorial-item">
              <span className="tutorial-icon">🤔</span>
              <div className="tutorial-text">
                <strong>Objetivo</strong>
                <p>Adivinhe qual personagem seu oponente escolheu fazendo perguntas estratégicas!</p>
              </div>
            </div>
            <div className="tutorial-item">
              <span className="tutorial-icon">❓</span>
              <div className="tutorial-text">
                <strong>Como Funciona</strong>
                <p>Faça perguntas como "É da Nintendo?" e elimine personagens baseado nas respostas</p>
              </div>
            </div>
            <div className="tutorial-item">
              <span className="tutorial-icon">🎮</span>
              <div className="tutorial-text">
                <strong>Modo Local</strong>
                <p>Jogue com amigos no mesmo dispositivo, cada um escolhe um personagem secreto</p>
              </div>
            </div>
            <div className="tutorial-item">
              <span className="tutorial-icon">🌐</span>
              <div className="tutorial-text">
                <strong>Modo Online</strong>
                <p>Desafie jogadores do mundo todo em salas privadas ou públicas</p>
              </div>
            </div>
            <div className="tutorial-item">
              <span className="tutorial-icon">🎲</span>
              <div className="tutorial-text">
                <strong>Categorias</strong>
                <p>Nintendo, Antropomórficos ou Mixes diários com 50 personagens cada</p>
              </div>
            </div>
            <div className="tutorial-item">
              <span className="tutorial-icon">🏆</span>
              <div className="tutorial-text">
                <strong>Vitória</strong>
                <p>Primeiro a adivinhar o personagem do oponente vence a partida!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="menu-buttons">
          <button className="menu-button primary" id="playLocalButton">
            <span className="button-icon">🎮</span>
            <span className="button-text">Jogar Local</span>
          </button>
          <button className="menu-button primary" id="playOnlineButton">
            <span className="button-icon">🌐</span>
            <span className="button-text">Jogar Online</span>
          </button>
          <button className="menu-button secondary" id="customizationButton">
            <span className="button-icon">⚙️</span>
            <span className="button-text">Configurações</span>
          </button>
        </div>
      </div>

      <div id="customizationMenu" className="centered-menu" style={{ display: 'none' }}>
        <div className="settings-header">
          <h2>⚙️ Configurações</h2>
          <p className="settings-subtitle">Personalize sua experiência de jogo</p>
        </div>

        <div className="settings-content">
          <div className="customization-group">
            <label htmlFor="themeSelect">🎨 Tema Visual</label>
            <select id="themeSelect" className="theme-selector">
              <option value="dark">🌙 Escuro (Padrão)</option>
              <option value="light">☀️ Claro</option>
              <option value="blue">💙 Azul Oceano</option>
              <option value="green">💚 Verde Floresta</option>
              <option value="purple">💜 Roxo Místico</option>
            </select>
            <p className="setting-description">Escolha o tema que mais combina com você</p>
          </div>
        </div>

        <button className="menu-button secondary" id="backToMenuFromCustomization">
          <span className="button-icon">🔙</span>
          <span className="button-text">Voltar ao Menu</span>
        </button>
      </div>

      <div id="lobbyMenu" className="centered-menu" style={{ display: 'none' }}>
        <h2>🌐 Lobby Online</h2>
        <form id="lobbyForm">
          <label htmlFor="lobbyNick">👤 Nickname:</label>
          <input type="text" id="lobbyNick" required placeholder="Digite seu nickname" />

          <label htmlFor="lobbyRoomCode">🔑 Código da sala:</label>
          <input type="text" id="lobbyRoomCode" maxLength="6" placeholder="Digite o código da sala" />

          <div className="button-group">
            <button type="submit" id="createLobbyBtn">
              <span className="button-icon">➕</span>
              <span className="button-text">Criar sala</span>
            </button>
            <button type="button" id="joinLobbyBtn">
              <span className="button-icon">🚪</span>
              <span className="button-text">Entrar na sala</span>
            </button>
          </div>
        </form>

        <div id="lobbyStatus"></div>
        <div id="lobbyPlayers"></div>

        <div className="lobby-actions">
          <button className="menu-button" id="startGameBtn" style={{ display: 'none' }}>
            <span className="button-icon">🚀</span>
            <span className="button-text">Iniciar jogo</span>
          </button>
          <button className="menu-button" id="backToMenuFromLobby">
            <span className="button-icon">🔙</span>
            <span className="button-text">Voltar ao Menu</span>
          </button>
          <button className="menu-button" id="leaveLobbyBtn" style={{ display: 'none' }}>
            <span className="button-icon">🚪</span>
            <span className="button-text">Sair da sala</span>
          </button>
        </div>
      </div>

      <main style={{ display: 'none' }}>
        <header>
          <h1>⚔️ CHARACTER CLASH</h1>
          <div id="point-counter">Personagens restantes: 128</div>
          <div className="dropdown">
            <button id="categoryButton" className="menu-button small" type="button">
              <div className="button-content">
                <span>Categoria: <span id="selectedCategory"></span></span>
                <span className="arrow"></span>
              </div>
            </button>
            <div id="categoryDropdown" className="dropdown-content">
              <div className="scroll-indicator top"></div>
              <button type="button" className="dropdown-item">Todos</button>
              <button type="button" className="dropdown-item">Nintendo</button>
              <button type="button" className="dropdown-item">Antropomórficos</button>
              <button type="button" className="dropdown-item">Mix 1</button>
              <button type="button" className="dropdown-item">Mix 2</button>
              <button type="button" className="dropdown-item">Mix 3</button>
              <div className="scroll-indicator bottom"></div>
            </div>
          </div>
          <button className="menu-button small" id="randomCharacterButton">Escolher Aleatoriamente</button>
          <button className="menu-button small">Resetar Personagens</button>
          <button className="menu-button small">Voltar ao Menu</button>
          <button className="menu-button small secret-button" id="regenerateMixesSecretButton" style={{ display: 'none', backgroundColor: '#ff6b6b', borderColor: '#ff5252' }}>🔄 Regenerar Mixes Globais</button>
          <div id="chosenDisplay" className="hidden">
            <h3>Seu personagem:</h3>
            <div id="chosenCharacterBox"></div>
          </div>
          <div id="gameInfo"></div>
        </header>
        <section className="character-grid" id="characterGrid"></section>
      </main>
    </>
  );
}