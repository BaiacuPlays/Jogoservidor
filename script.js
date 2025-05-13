const DEBUG = true;
const API_BASE_URL = '/api';
const maxPoints = 200;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null;

const characterGrid = document.getElementById('characterGrid');
const chosenCharacterBox = document.getElementById('chosenCharacterBox');
const selectedCategory = document.getElementById('selectedCategory');

import { characters, uniqueCharacters, nintendoCharacters, anthropomorphicCharacters } from './data/characterData.js';
import { shuffleArray, getRandomCharacters } from './utils/helpers.js';

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
        const response = await fetch(`${API_BASE_URL}/init-data`);
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
    if (selectedCategory) { selectedCategory.textContent = categoryName; }
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

document.addEventListener('DOMContentLoaded', function () {
  const categoryButton = document.getElementById('categoryButton');
  const categoryDropdown = document.getElementById('categoryDropdown');

  if (categoryButton && categoryDropdown) {
    categoryButton.addEventListener('click', function (event) {
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

    // Fechar o dropdown quando selecionar um item
    const dropdownItems = categoryDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function () {
        categoryDropdown.classList.remove('show');
      });
    });
  }

  setupEventListeners();
  updateCounter(maxPoints);
  createPSPBackground();
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
      item.addEventListener('click', function () {
        const categoryName = item.textContent.trim();
        selectCategory(categoryName);
        document.getElementById('categoryDropdown')?.classList.remove('show');
      });
    });
  } else {
    console.error("Itens do dropdown de categoria não encontrados!");
  }
}

function startGame() {
    // Esconde o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.classList.add('hidden');
        setTimeout(() => {
            startMenu.style.display = 'none';
        }, 300);
    }
    
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
    // Esconde o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.classList.add('hidden');
        setTimeout(() => {
            startMenu.style.display = 'none';
        }, 300);
    }
    
    // Mostra o menu de customização
    const customizationMenu = document.getElementById('customizationMenu');
    if (customizationMenu) {
        customizationMenu.style.display = 'flex';
        setTimeout(() => {
            customizationMenu.classList.add('visible');
        }, 50);
    }
}

function backToMainMenu() {
    // Esconde o menu de customização
    const customizationMenu = document.getElementById('customizationMenu');
    if (customizationMenu) {
        customizationMenu.classList.remove('visible');
        setTimeout(() => {
            customizationMenu.style.display = 'none';
        }, 300);
    }
    
    // Mostra o menu inicial
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.style.display = 'flex';
        setTimeout(() => {
            startMenu.classList.remove('hidden');
        }, 50);
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
  const menu = document.querySelector('.centered-menu');
  if (!menu) return;

  // Criar container das ondas
  const waves = document.createElement('div');
  waves.className = 'psp-waves';
  menu.insertBefore(waves, menu.firstChild);

  // Criar 3 camadas de ondas
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'wave';
    waves.appendChild(wave);
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