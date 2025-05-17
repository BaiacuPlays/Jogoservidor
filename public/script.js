const DEBUG = true;
const API_BASE_URL = '';
const maxPoints = 180;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null;
let currentCategory = 'Todos';

const characterGrid = document.getElementById('characterGrid');
const chosenCharacterBox = document.getElementById('chosenCharacterBox');
const selectedCategory = document.getElementById('selectedCategory');

import { characters, uniqueCharacters, nintendoCharacters, anthropomorphicCharacters } from '/data/characterData.js';
import { shuffleArray, getRandomCharacters } from '/utils/helpers.js';

let currentActiveCharacterList = [];
let currentActiveMaxPoints = maxPoints;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

async function initializeData() {
    try {
        debugLog('Iniciando inicialização dos dados...');
        const response = await fetch(`${API_BASE_URL}/api/init-data`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || data.error || response.statusText);
        }
        
        debugLog('Dados inicializados:', data);
        return true;
    } catch (error) {
        console.error('Erro na inicialização:', error);
        if (characterGrid) {
            characterGrid.innerHTML = `<p>Erro ao inicializar dados: ${error.message}</p>`;
        }
        return false;
    }
}

async function generateMixesIfNeeded() {
    try {
        console.log('Iniciando geração dos mixes...');
        const response = await fetch('/api/force-generate-mixes', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || data.error || 'Falha ao gerar mixes');
        }
        
        console.log('Mixes gerados com sucesso:', data);
        return true;
    } catch (error) {
        console.error('Erro ao gerar mixes:', error);
        if (characterGrid) {
            characterGrid.innerHTML = `<p>Erro ao gerar mixes: ${error.message}</p>`;
        }
        return false;
    }
}

async function selectCategory(categoryName) {
  const currentCategoryNameElement = document.getElementById('selectedCategory');
  if (currentCategoryNameElement) {
  currentCategoryNameElement.textContent = categoryName;
  }
    currentCategory = categoryName || 'Todos';
    if (selectedCategory) { selectedCategory.textContent = currentCategory; }
    if (characterGrid) { characterGrid.innerHTML = ''; }
    
    // Esconde a seção do personagem escolhido durante o carregamento
    const chosenDisplay = document.getElementById('chosenDisplay');
    if (chosenDisplay) {
        chosenDisplay.classList.add('hidden');
    }

    let charactersToDisplay = [];
    let maxPointsForCategory;

    if (categoryName === 'Nintendo') {
        charactersToDisplay = uniqueCharacters.filter(char => nintendoCharacters.includes(char.name));
        maxPointsForCategory = charactersToDisplay.length;
    } else if (categoryName === 'Antropomórficos') {
        charactersToDisplay = uniqueCharacters.filter(char => anthropomorphicCharacters.includes(char.name));
        maxPointsForCategory = charactersToDisplay.length;
    } else if (categoryName === 'Todos' || categoryName === '') {
        charactersToDisplay = uniqueCharacters;
        maxPointsForCategory = maxPoints;
        if (selectedCategory) { selectedCategory.textContent = 'Todos'; }
    } else if (['Mix 1', 'Mix 2', 'Mix 3'].includes(categoryName)) {
        const categoryKey = categoryName.replace(' ', '').toLowerCase();
        const apiUrl = `/api/get-mix-chars?category=${categoryKey}`;

        if (characterGrid) { characterGrid.innerHTML = '<p>Carregando personagens do Mix... Aguarde.</p>'; }

        try {
            console.log(`Buscando mix ${categoryKey}...`);
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Mix não encontrado, tentando gerar...');
                    // Se não encontrou os dados, tenta gerar os mixes
                    const generated = await generateMixesIfNeeded();
                    if (generated) {
                        console.log('Mixes gerados, tentando buscar novamente...');
                        // Tenta buscar novamente após gerar
                        const retryResponse = await fetch(apiUrl);
                        const retryData = await retryResponse.json();
                        
                        if (retryResponse.ok) {
                            charactersToDisplay = retryData;
                            maxPointsForCategory = Math.min(50, charactersToDisplay.length);
                            console.log(`Mix ${categoryKey} carregado com sucesso: ${charactersToDisplay.length} personagens`);
                        } else {
                            throw new Error(retryData.details || retryData.error || 'Falha ao buscar mixes após geração');
                        }
                    } else {
                        throw new Error('Falha ao gerar mixes');
                    }
                } else {
                    throw new Error(data.details || data.error || 'Erro ao buscar mixes');
                }
            } else {
                charactersToDisplay = data;
                maxPointsForCategory = Math.min(50, charactersToDisplay.length);
                console.log(`Mix ${categoryKey} carregado com sucesso: ${charactersToDisplay.length} personagens`);
            }
        } catch (error) {
            console.error(`Erro ao carregar mix ${categoryName}:`, error);
            if (characterGrid) { 
                characterGrid.innerHTML = `<p>Erro ao carregar o Mix ${categoryName}: ${error.message}</p>`;
            }
            charactersToDisplay = [];
            maxPointsForCategory = 0;
        }
    } else {
        charactersToDisplay = [];
        maxPointsForCategory = 0;
        if (selectedCategory) { selectedCategory.textContent = 'Categoria Desconhecida'; }
    }

    currentActiveCharacterList = charactersToDisplay;
    currentActiveMaxPoints = maxPointsForCategory;
    createCharacterGridInternal();

    // Mostra a seção do personagem escolhido após o carregamento
    if (chosenDisplay) {
        setTimeout(() => {
            chosenDisplay.classList.remove('hidden');
        }, 100);
    }
    // Sempre mostrar o nick sorteado ao trocar de categoria
    mostrarNickSorteadoNoJogo();
}

function createCharacterGridInternal() {
  usedPoints = 0;
  playerChosen = false;
  chosenCharacter = null;
  if (chosenCharacterBox) {
    chosenCharacterBox.innerHTML = '';
  }
  if (characterGrid) {
    characterGrid.innerHTML = '';
  }
  updateCounter(currentActiveMaxPoints);

  if (currentActiveCharacterList && currentActiveCharacterList.length > 0) {
    currentActiveCharacterList.forEach(charObject => {
      const charDiv = document.createElement('div');
      charDiv.classList.add('character');
      charDiv.title = charObject.name;

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const img = document.createElement('img');
      img.src = charObject.image;
      img.alt = charObject.name;

      imgContainer.appendChild(img);
      charDiv.appendChild(imgContainer);
      if (characterGrid) {
        characterGrid.appendChild(charDiv);
      }

      charDiv.onclick = () => {
        if (!playerChosen) {
          playerChosen = true;
          chosenCharacter = charObject;
          charDiv.classList.add('locked');
          if (chosenCharacterBox) {
            chosenCharacterBox.innerHTML = `<img src="${charObject.image}" alt="${charObject.name}">`;
          }
        } else {
          if (charDiv.classList.contains('locked')) {
            // Não permite desmarcar o personagem escolhido
          } else if (charDiv.classList.contains('selected')) {
            charDiv.classList.remove('selected');
            usedPoints--;
          } else {
            if (usedPoints < currentActiveMaxPoints) {
              charDiv.classList.add('selected');
              usedPoints++;
            }
          }
        }
        updateCounter(currentActiveMaxPoints);
      };
    });
  } else {
    if (characterGrid && selectedCategory && characterGrid.innerHTML === '') {
      characterGrid.innerHTML = `<p>Nenhum personagem encontrado para "${selectedCategory.textContent}".</p>`;
    }
  }
}

function updateCounter(max) {
  const remaining = max - usedPoints;
  const pointCounterElement = document.getElementById('point-counter');
  if (pointCounterElement) {
    pointCounterElement.innerText = `Personagens restantes: ${remaining}`;
  }
}

function showMenu(menuId) {
  // Esconde todos os menus/telas
  const menus = [
    document.getElementById('startMenu'),
    document.getElementById('lobbyMenu'),
    document.getElementById('customizationMenu'),
    document.querySelector('main')
  ];
  menus.forEach(menu => {
    if (menu) {
      menu.style.display = 'none';
      if (menu.classList.contains('centered-menu')) menu.classList.remove('hidden');
      if (menu.classList.contains('visible')) menu.classList.remove('visible');
    }
  });
  // Mostra o menu/tela desejado
  const menu = document.getElementById(menuId) || document.querySelector(menuId);
  if (menu) {
    if (menu.classList.contains('centered-menu')) menu.classList.remove('hidden');
    menu.style.display = menuId === 'main' ? 'flex' : 'flex';
    setTimeout(() => {
      if (menu.classList.contains('centered-menu')) menu.classList.remove('hidden');
      if (menuId === 'main') menu.classList.add('visible');
      // Chamar mostrarNickSorteadoNoJogo ao mostrar o jogo
      if (menuId === 'main') mostrarNickSorteadoNoJogo();
    }, 50);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const categoryButton = document.getElementById('categoryButton');
  const categoryDropdown = document.getElementById('categoryDropdown');

  if (categoryButton && categoryDropdown) {
    categoryButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      categoryDropdown.classList.toggle('show');
      if (categoryDropdown.classList.contains('show')) {
        updateScrollIndicators();
      }
    });

    // Atualizar indicadores de scroll quando rolar
    categoryDropdown.addEventListener('scroll', updateScrollIndicators);

    // Fechar o dropdown quando clicar fora
    document.addEventListener('click', function (event) {
      if (!categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) {
        categoryDropdown.classList.remove('show');
      }
    });

    const initialCategoryElement = document.getElementById('selectedCategory');
if (initialCategoryElement) {
initialCategoryElement.textContent = 'Todos'; // Ou a sua categoria padrão
}
    // Fechar o dropdown quando selecionar um item
    const dropdownItems = categoryDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        categoryDropdown.classList.remove('show');
        selectCategory(this.textContent);
      });
    });
  }

  // Adicionar handler específico para o botão Voltar ao Menu
  const backToMenuButton = document.querySelector('button.menu-button.small:last-of-type');
  if (backToMenuButton) {
    backToMenuButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      showMenu('startMenu');
    });
  }

  setupEventListeners();
  updateCounter(maxPoints);
  createPSPBackground();
  monitorWaveAnimations();
  monitorThemeChanges();
  // Ao carregar, mostra as ondas apenas se o menu principal ou de opções estiver visível
  const mainContent = document.querySelector('main');
  if (mainContent && (mainContent.style.display === 'flex' || mainContent.classList.contains('visible'))) {
    showPSPWaves(false);
  } else {
    showPSPWaves(true);
  }
  // Garante pointer-events correto no carregamento
  const waves = document.querySelector('.psp-waves');
  if (waves && waves.style.opacity === '0') {
    waves.style.pointerEvents = 'none';
  }

  // Menu inicial e lobby online
  const startMenu = document.getElementById('startMenu');
  const lobbyMenu = document.getElementById('lobbyMenu');
  const playOnlineButton = document.getElementById('playOnlineButton');
  const backToMenuFromLobby = document.getElementById('backToMenuFromLobby');
  const playLocalButton = document.getElementById('playLocalButton');
  const customizationButton = document.getElementById('customizationButton');
  const customizationMenu = document.getElementById('customizationMenu');
  const backToMenuFromCustomization = document.getElementById('backToMenuFromCustomization');
  // Botão Voltar ao Menu dentro do jogo
  const backToMenuFromGame = mainContent ? mainContent.querySelector('button.menu-button.small:last-of-type') : null;

  // Menu Inicial
  if (playLocalButton) {
    playLocalButton.addEventListener('click', function () {
      showMenu('main');
      selectCategory(currentCategory);
    });
  }
  if (playOnlineButton) {
    playOnlineButton.addEventListener('click', function () {
      showMenu('lobbyMenu');
    });
  }
  if (customizationButton) {
    customizationButton.addEventListener('click', function () {
      openCustomizationMenu();
    });
  }
  // Lobby
  if (backToMenuFromLobby) {
    backToMenuFromLobby.addEventListener('click', function () {
      showMenu('startMenu');
    });
  }
  // Customização
  if (backToMenuFromCustomization) {
    backToMenuFromCustomization.addEventListener('click', function () {
      backToMainMenu();
    });
  }
  // Jogo (main)
  if (backToMenuFromGame) {
    backToMenuFromGame.addEventListener('click', function () {
      showMenu('startMenu');
    });
  }

  // Lógica do lobby online
  const lobbyForm = document.getElementById('lobbyForm');
  const createLobbyBtn = document.getElementById('createLobbyBtn');
  const joinLobbyBtn = document.getElementById('joinLobbyBtn');
  const lobbyNick = document.getElementById('lobbyNick');
  const lobbyRoomCode = document.getElementById('lobbyRoomCode');
  const lobbyStatus = document.getElementById('lobbyStatus');
  const lobbyPlayers = document.getElementById('lobbyPlayers');
  const startGameBtn = document.getElementById('startGameBtn');
  const leaveLobbyBtn = document.getElementById('leaveLobbyBtn');
  let lobbyPollingInterval = null;
  let currentRoomCode = null;
  let currentNick = null;

  function resetLobbyUI(msg) {
    if (lobbyStatus) lobbyStatus.innerHTML = msg ? `<span style='color:orange'>${msg}</span>` : '';
    if (lobbyPlayers) lobbyPlayers.innerHTML = '';
    if (lobbyRoomCode) lobbyRoomCode.value = '';
    if (startGameBtn) startGameBtn.style.display = 'none';
    if (leaveLobbyBtn) leaveLobbyBtn.style.display = 'none';
    if (joinLobbyBtn) joinLobbyBtn.style.display = 'inline-block';
    if (createLobbyBtn) createLobbyBtn.style.display = 'inline-block';
    currentRoomCode = null;
    currentNick = null;
    if (lobbyPollingInterval) clearInterval(lobbyPollingInterval);
  }

  async function updateLobbyPlayers(roomCode) {
    try {
      const res = await fetch(`/api/lobby?roomCode=${roomCode}`);
      const data = await res.json();
      if (data && data.players) {
        lobbyPlayers.innerHTML = '<b>Jogadores na sala:</b><br>' + data.players.map(p => `<div>${p}</div>`).join('');
        // Mostrar botão iniciar jogo apenas para o host e se houver >= 3 jogadores
        if (startGameBtn) {
          if (data.players.length >= 3 && currentNick === data.players[0]) {
            startGameBtn.style.display = 'block';
            startGameBtn.disabled = false;
          } else {
            startGameBtn.style.display = 'none';
          }
        }
        // Mostrar botão sair da sala
        if (leaveLobbyBtn) leaveLobbyBtn.style.display = 'inline-block';
        if (joinLobbyBtn) joinLobbyBtn.style.display = 'none';
        if (createLobbyBtn) createLobbyBtn.style.display = 'none';
      } else {
        // Se não houver sala, desconectado
        resetLobbyUI('Você foi desconectado da sala.');
      }
      // Redirecionar para o jogo se started = true
      if (data && data.started) {
        window.location.href = `index.html?room=${roomCode}&nick=${encodeURIComponent(currentNick)}`;
      }
    } catch (err) {
      lobbyPlayers.innerHTML = '<span style="color:red">Erro ao buscar jogadores.</span>';
      if (startGameBtn) startGameBtn.style.display = 'none';
    }
  }

  function startLobbyPolling(roomCode) {
    if (lobbyPollingInterval) clearInterval(lobbyPollingInterval);
    updateLobbyPlayers(roomCode);
    lobbyPollingInterval = setInterval(() => updateLobbyPlayers(roomCode), 2000);
  }

  if (lobbyForm) {
    lobbyForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!lobbyNick.value) return;
      lobbyStatus.textContent = 'Criando sala...';
      try {
        const res = await fetch(`${API_BASE_URL}/api/lobby`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: lobbyNick.value })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao criar sala');
        }
        
        const data = await res.json();
        if (data.roomCode) {
          currentRoomCode = data.roomCode;
          currentNick = lobbyNick.value;
          lobbyRoomCode.value = data.roomCode;
          lobbyStatus.innerHTML = `<b>Sala criada!</b> Código: <span style='font-family:monospace; font-size:2em; letter-spacing:2px; background:#222; padding:4px 12px; border-radius:8px;'>${data.roomCode}</span>`;
          startLobbyPolling(data.roomCode);
          if (leaveLobbyBtn) leaveLobbyBtn.style.display = 'inline-block';
          if (joinLobbyBtn) joinLobbyBtn.style.display = 'none';
          if (createLobbyBtn) createLobbyBtn.style.display = 'none';
        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } catch (err) {
        console.error('Erro ao criar sala:', err);
        lobbyStatus.innerHTML = `<span style="color:red">Erro ao criar sala: ${err.message}</span>`;
      }
    });
  }
  if (createLobbyBtn) {
    createLobbyBtn.addEventListener('click', function (event) {
      event.preventDefault();
      if (lobbyForm) lobbyForm.dispatchEvent(new Event('submit'));
    });
  }
  if (joinLobbyBtn) {
    joinLobbyBtn.addEventListener('click', async function (event) {
      event.preventDefault();
      if (!lobbyNick.value || !lobbyRoomCode.value) return;
      lobbyStatus.textContent = 'Entrando na sala...';
      try {
        const res = await fetch('/api/lobby', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: lobbyNick.value, roomCode: lobbyRoomCode.value.toUpperCase() })
        });
        const data = await res.json();
        if (data.success) {
          currentRoomCode = lobbyRoomCode.value.toUpperCase();
          currentNick = lobbyNick.value;
          lobbyStatus.innerHTML = `<b>Entrou na sala!</b> Código: <span style='font-family:monospace; font-size:2em; letter-spacing:2px; background:#222; padding:4px 12px; border-radius:8px;'>${currentRoomCode}</span>`;
          startLobbyPolling(currentRoomCode);
          if (leaveLobbyBtn) leaveLobbyBtn.style.display = 'inline-block';
          if (joinLobbyBtn) joinLobbyBtn.style.display = 'none';
          if (createLobbyBtn) createLobbyBtn.style.display = 'none';
        } else {
          lobbyStatus.innerHTML = `<span style='color:red'>${data.error || 'Erro ao entrar na sala.'}</span>`;
        }
      } catch (err) {
        lobbyStatus.innerHTML = '<span style="color:red">Erro ao entrar na sala.</span>';
      }
    });
  }
  if (leaveLobbyBtn) {
    leaveLobbyBtn.addEventListener('click', function () {
      resetLobbyUI('Você saiu da sala.');
      if (lobbyNick) lobbyNick.value = '';
    });
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', async function () {
      if (!currentRoomCode) return;
      startGameBtn.disabled = true;
      startGameBtn.textContent = 'Iniciando...';
      try {
        await fetch('/api/lobby', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode: currentRoomCode, action: 'start' })
        });
        // Em breve: redirecionar para o jogo
      } catch (err) {
        alert('Erro ao iniciar o jogo!');
      }
      startGameBtn.disabled = false;
      startGameBtn.textContent = 'Iniciar jogo';
    });
  }

  // Se for jogo online, mostrar direto o main
  const urlRoom = getQueryParam('room');
  const urlNick = getQueryParam('nick');
  if (urlRoom && urlNick) {
    showMenu('main');
    selectCategory('');
  }

  selectCategory(currentCategory);
});

function updateScrollIndicators() {
  const dropdown = document.getElementById('categoryDropdown');
  const topIndicator = dropdown.querySelector('.scroll-indicator.top');
  const bottomIndicator = dropdown.querySelector('.scroll-indicator.bottom');

  if (dropdown.scrollTop > 0) {
    topIndicator.style.opacity = '0.9';
  } else {
    topIndicator.style.opacity = '0';
  }

  if (dropdown.scrollHeight - dropdown.scrollTop > dropdown.clientHeight + 1) {
    bottomIndicator.style.opacity = '0.9';
  } else {
    bottomIndicator.style.opacity = '0';
  }
}

function setupEventListeners() {
  const startMenuButtons = document.querySelectorAll('#startMenu .menu-button');
  if (startMenuButtons.length >= 2) {
    startMenuButtons[0].addEventListener('click', startGame);
    startMenuButtons[1].addEventListener('click', openCustomizationMenu);
  } else {
    console.error("Botões do menu inicial não encontrados ou insuficientes!");
  }

  const themeSelect = document.getElementById('themeSelect');
  const scaleRange = document.getElementById('scaleRange');

  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      const theme = this.value;
      document.body.className = theme;
      localStorage.setItem('theme', theme);
    });
  }

  if (scaleRange) {
    scaleRange.addEventListener('input', function() {
      const scale = this.value;
      document.documentElement.style.setProperty('--interface-scale', scale);
      document.querySelector('.scale-value').textContent = `${Math.round(scale * 100)}%`;
      localStorage.setItem('scale', scale);
    });

    // Carregar escala salva
    const savedScale = localStorage.getItem('scale') || '1';
    document.documentElement.style.setProperty('--interface-scale', savedScale);
    document.getElementById('scaleRange').value = savedScale;
    document.querySelector('.scale-value').textContent = `${Math.round(savedScale * 100)}%`;
  }

  const customizationMenuButton = document.querySelector('#customizationMenu .menu-button');
  if (customizationMenuButton) {
    customizationMenuButton.addEventListener('click', backToMainMenu);
  } else {
    console.warn("Botão do menu de customização não encontrado.");
  }

  const mainControlButtons = document.querySelectorAll('main .controls .menu-button.small');
  if (mainControlButtons.length >= 2) {
    let resetButton = null;
    let backButton = null;
    let randomButton = null;

    for (const btn of mainControlButtons) {
      if (btn.textContent.trim() === 'Resetar Personagens') resetButton = btn;
      if (btn.textContent.trim() === 'Voltar ao Menu') backButton = btn;
      if (btn.textContent.trim() === 'Escolher Aleatoriamente') randomButton = btn;
    }

    if (resetButton) {
      resetButton.addEventListener('click', resetCharacters);
    } else { console.warn("Botão Resetar Personagens não encontrado pelo texto."); }

    if (backButton) {
      backButton.addEventListener('click', goBackToMenu);
    } else { console.warn("Botão Voltar ao Menu não encontrado pelo texto."); }

    if (randomButton) {
      randomButton.addEventListener('click', selectRandomCharacter);
    } else { console.warn("Botão Escolher Aleatoriamente não encontrado pelo texto."); }

  } else {
    console.warn("Botões de controle principal não encontrados ou insuficientes.");
  }

  const dropdownItems = document.querySelectorAll('#categoryDropdown .dropdown-item');
  if (dropdownItems.length > 0) {
    dropdownItems.forEach(item => {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        const categoryName = item.textContent.trim();
        selectCategory(categoryName);
        document.getElementById('categoryDropdown')?.classList.remove('show');
      });
    });
  } else {
    console.error("Itens do dropdown de categoria não encontrados!");
  }
}

function showPSPWaves(show) {
  const waves = document.querySelector('.psp-waves');
  if (waves) {
    if (show) {
      waves.style.opacity = '1';
      setTimeout(() => { waves.style.pointerEvents = 'auto'; }, 600);
    } else {
      waves.style.opacity = '0';
      setTimeout(() => { waves.style.pointerEvents = 'none'; }, 600);
    }
  }
}

function startGame() {
    debugLog('Iniciando transição para o jogo');
    // Esconde o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.classList.add('hidden');
        setTimeout(() => {
            startMenu.style.display = 'none';
        }, 300);
    }
    // Esconde as ondas PSP com transição
    showPSPWaves(false);
    // Mostra o conteúdo do jogo
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.display = 'flex';
        setTimeout(() => {
            mainContent.classList.add('visible');
        }, 50);
    }
    // Inicia o jogo com a categoria padrão
    selectCategory('');
}

function openCustomizationMenu() {
    debugLog('Iniciando transição para o menu de customização');
    // Esconde o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.classList.add('hidden');
        setTimeout(() => {
            startMenu.style.display = 'none';
        }, 300);
    }
    // Mostra as ondas PSP com transição
    showPSPWaves(true);
    // Mostra o menu de customização
    const customizationMenu = document.getElementById('customizationMenu');
    if (customizationMenu) {
        customizationMenu.style.display = 'flex';
        customizationMenu.classList.remove('hidden');
        setTimeout(() => {
            customizationMenu.classList.add('visible');
        }, 50);
    }
}

function backToMainMenu() {
    debugLog('Iniciando transição de volta ao menu principal');
    // Esconde o menu de customização
    const customizationMenu = document.getElementById('customizationMenu');
    if (customizationMenu) {
        customizationMenu.classList.remove('visible');
        setTimeout(() => {
            customizationMenu.style.display = 'none';
            customizationMenu.classList.add('hidden');
        }, 300);
    }
    // Mostra as ondas PSP com transição
    showPSPWaves(true);
    // Mostra o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.style.display = 'flex';
        startMenu.classList.remove('hidden');
    }
}

function goBackToMenu() {
    // Esconde o conteúdo do jogo
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove('visible');
        setTimeout(() => {
            mainContent.style.display = 'none';
        }, 300);
    }
    // Mostra as ondas PSP com transição
    showPSPWaves(true);
    // Mostra o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.style.display = 'flex';
        setTimeout(() => {
            startMenu.classList.remove('hidden');
        }, 50);
    }
}

function selectRandomCharacter() {
  if (!currentActiveCharacterList || currentActiveCharacterList.length === 0) {
    console.warn('Não há personagens disponíveis para seleção aleatória');
    return;
  }

  // Se já tiver um personagem escolhido, remove a seleção
  if (playerChosen && chosenCharacter) {
    const currentLocked = characterGrid.querySelector('.character.locked');
    if (currentLocked) {
      currentLocked.classList.remove('locked');
    }
  }

  // Seleciona um personagem aleatório
  const randomIndex = Math.floor(Math.random() * currentActiveCharacterList.length);
  const randomChar = currentActiveCharacterList[randomIndex];
  
  // Atualiza o estado
  playerChosen = true;
  chosenCharacter = randomChar;

  // Atualiza a UI
  if (chosenCharacterBox) {
    chosenCharacterBox.innerHTML = `<img src="${randomChar.image}" alt="${randomChar.name}">`;
  }

  // Marca o personagem como selecionado na grid
  const allCharacters = characterGrid.querySelectorAll('.character');
  allCharacters.forEach(charDiv => {
    if (charDiv.title === randomChar.name) {
      charDiv.classList.add('locked');
    }
  });

  // Atualiza o contador
  updateCounter(currentActiveMaxPoints);
}

function resetCharacters() {
  usedPoints = 0;
  playerChosen = false;
  chosenCharacter = null;

  if (chosenCharacterBox) {
    chosenCharacterBox.innerHTML = '';
  }

  if (characterGrid) {
    const allCharactersInGrid = characterGrid.querySelectorAll('.character');
    allCharactersInGrid.forEach(charDiv => {
      if (!charDiv.classList.contains('locked')) {
        charDiv.classList.remove('selected');
      }
    });
  }

  updateCounter(currentActiveMaxPoints);

  if (chosenCharacter && chosenCharacterBox) {
    chosenCharacterBox.innerHTML = `<img src="${chosenCharacter.image}" alt="${chosenCharacter.name}">`;
  }
}

// Carregar tema salvo
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.className = savedTheme;
document.getElementById('themeSelect').value = savedTheme;

function createPSPBackground() {
  debugLog('Creating PSP background waves');
  // Remover ondas existentes se houver
  const existingWaves = document.querySelector('.psp-waves');
  if (existingWaves) {
    existingWaves.remove();
  }

  // Criar container das ondas no body
  const waves = document.createElement('div');
  waves.className = 'psp-waves';
  document.body.insertBefore(waves, document.body.firstChild); // Agora no body

  // Criar 3 camadas de ondas
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'wave';
    waves.appendChild(wave);
    debugLog(`Created wave layer ${i + 1}`);
  }
}

// Adicionar no final do arquivo, antes do último fechamento de chave
document.getElementById('regenerateMixesButton')?.addEventListener('click', async () => {
    if (characterGrid) {
        characterGrid.innerHTML = '<p>Regenerando mixes... Aguarde.</p>';
    }
    const success = await generateMixesIfNeeded();
    if (success) {
        alert('Mixes regenerados com sucesso!');
        const currentCategory = selectedCategory?.textContent;
        if (currentCategory) {
            selectCategory(currentCategory);
        }
    } else {
        alert('Erro ao regenerar mixes. Tente novamente mais tarde.');
    }
});

// Função para verificar se os mixes precisam ser atualizados
async function checkMixesUpdate() {
    try {
        console.log('Verificando atualização dos mixes...');
        const response = await fetch('/api/update-mixes', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Falha ao verificar atualização dos mixes');
        }
        
        const data = await response.json();
        console.log('Status dos mixes:', data.message);
        return data.timestamp;
    } catch (error) {
        console.error('Erro ao verificar atualização dos mixes:', error);
        return null;
    }
}

// Função para verificar se é meia-noite
function isMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() === 0;
}

// Função para verificar periodicamente se é meia-noite
function startMidnightCheck() {
    // Verifica a cada minuto
    setInterval(async () => {
        if (isMidnight()) {
            console.log('É meia-noite! Atualizando mixes...');
            await checkMixesUpdate();
        }
    }, 60000); // 60000 ms = 1 minuto
}

// Função para carregar as configurações salvas
function loadSettings() {
    try {
        // Carrega as configurações do localStorage
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            // Aplica as configurações carregadas
            if (settings.theme) {
                document.body.className = settings.theme;
            }
            // Adicione aqui outras configurações que você queira carregar
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Função para inicializar o jogo
async function initializeGame() {
    try {
        console.log('Inicializando jogo...');
        
        // Verifica se os mixes precisam ser atualizados
        await checkMixesUpdate();
        
        // Inicia a verificação periódica para meia-noite
        startMidnightCheck();
        
        // Carrega as configurações salvas
        loadSettings();
        
        // Inicializa os elementos da interface
        const categoryButton = document.getElementById('categoryButton');
        const categoryDropdown = document.getElementById('categoryDropdown');
        
        if (categoryButton && categoryDropdown) {
            // Remove event listeners antigos para evitar duplicação
            const newCategoryButton = categoryButton.cloneNode(true);
            categoryButton.parentNode.replaceChild(newCategoryButton, categoryButton);
            
            const newCategoryDropdown = categoryDropdown.cloneNode(true);
            categoryDropdown.parentNode.replaceChild(newCategoryDropdown, categoryDropdown);
            
            // Adiciona os event listeners novamente
            newCategoryButton.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                newCategoryDropdown.classList.toggle('show');
                if (newCategoryDropdown.classList.contains('show')) {
                    updateScrollIndicators();
                }
            });
            
            // Fechar o dropdown quando clicar fora
            document.addEventListener('click', function(event) {
                if (!newCategoryButton.contains(event.target) && !newCategoryDropdown.contains(event.target)) {
                    newCategoryDropdown.classList.remove('show');
                }
            });
            
            // Fechar o dropdown quando selecionar um item
            const dropdownItems = newCategoryDropdown.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    newCategoryDropdown.classList.remove('show');
                    selectCategory(this.textContent);
                });
            });
        }
        
        console.log('Jogo inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o jogo:', error);
    }
}

// Inicializa o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', initializeGame);

function monitorWaveAnimations() {
  debugLog('Starting wave animation monitoring');
  
  const waves = document.querySelectorAll('.wave');
  waves.forEach((wave, index) => {
    // Monitor animation events
    wave.addEventListener('animationstart', () => {
      debugLog(`Wave ${index + 1} animation started`);
    });
    
    wave.addEventListener('animationiteration', () => {
      debugLog(`Wave ${index + 1} animation iteration`);
    });
    
    wave.addEventListener('animationend', () => {
      debugLog(`Wave ${index + 1} animation ended`);
    });

    // Monitor computed styles
    const observer = new MutationObserver(() => {
      const computedStyle = window.getComputedStyle(wave);
      const transform = computedStyle.getPropertyValue('transform');
      const opacity = computedStyle.getPropertyValue('opacity');
      debugLog(`Wave ${index + 1} state:`, { transform, opacity });
    });

    observer.observe(wave, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  });
}

function monitorThemeChanges() {
  debugLog('Iniciando monitoramento de mudanças de tema');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const currentTheme = document.body.className;
        debugLog('Tema alterado para:', currentTheme);
        
        const waves = document.querySelectorAll('.wave');
        waves.forEach((wave, index) => {
          const computedStyle = window.getComputedStyle(wave);
          const background = computedStyle.getPropertyValue('background');
          const opacity = computedStyle.getPropertyValue('opacity');
          debugLog(`Wave ${index + 1} no tema ${currentTheme}:`, {
            background,
            opacity,
            transform: computedStyle.getPropertyValue('transform')
          });
        });
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

// Função utilitária para ler parâmetros da URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function mostrarNickSorteado() {
    const room = getQueryParam('room');
    const nick = getQueryParam('nick');
    if (!room || !nick) return;

    try {
        const res = await fetch(`/api/lobby?roomCode=${room}`);
        const data = await res.json();
        if (data && data.players && data.started && data.sorteio && data.sorteio[nick]) {
            const sorteado = data.sorteio[nick];
            // Cria ou atualiza o elemento de exibição do nick sorteado
            let sorteadoDiv = document.getElementById('nick-sorteado-info');
            if (!sorteadoDiv) {
                sorteadoDiv = document.createElement('div');
                sorteadoDiv.id = 'nick-sorteado-info';
                sorteadoDiv.style.marginTop = '12px';
                sorteadoDiv.style.fontSize = '1.1em';
                sorteadoDiv.style.fontWeight = 'bold';
                sorteadoDiv.style.color = '#2a7';
                // Insere logo após o botão Voltar ao Menu
                const controls = document.querySelector('header .controls');
                if (controls) {
                    controls.parentNode.insertBefore(sorteadoDiv, controls.nextSibling);
                }
            }
            sorteadoDiv.textContent = `Você deve adivinhar o personagem de: ${sorteado}`;
        }
    } catch (err) {
        console.error('Erro ao buscar nick sorteado:', err);
    }
}

document.addEventListener('DOMContentLoaded', mostrarNickSorteado);

// Exibir nick sorteado no jogo (main)
async function mostrarNickSorteadoNoJogo() {
  const room = getQueryParam('room');
  const nick = getQueryParam('nick');
  if (!room || !nick) return;
  try {
    const res = await fetch(`/api/lobby?roomCode=${room}`);
    const data = await res.json();
    if (data && data.sorteio && data.sorteio[nick]) {
      const sorteado = data.sorteio[nick];
      // Exibir no local correto: abaixo do botão Voltar ao Menu e acima de "Seu personagem"
      const controls = document.querySelector('header .controls');
      const chosenDisplay = document.getElementById('chosenDisplay');
      let sorteadoDiv = document.getElementById('nick-sorteado-info');
      if (!sorteadoDiv) {
        sorteadoDiv = document.createElement('div');
        sorteadoDiv.id = 'nick-sorteado-info';
        sorteadoDiv.style.margin = '16px 0 8px 0';
        sorteadoDiv.style.fontSize = '1.1em';
        sorteadoDiv.style.fontWeight = 'bold';
        sorteadoDiv.style.color = '#2a7';
        if (controls && chosenDisplay) {
          controls.parentNode.insertBefore(sorteadoDiv, chosenDisplay);
        }
      }
      sorteadoDiv.textContent = `Você deve adivinhar o personagem de: ${sorteado}`;
    }
  } catch (err) {
    // Silenciar erro
  }
}

// Chamar ao carregar o jogo
document.addEventListener('DOMContentLoaded', mostrarNickSorteadoNoJogo);