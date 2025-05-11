const maxPoints = 128;
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

async function generateMixesIfNeeded() {
    try {
        const response = await fetch('/api/force-generate-mixes', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Falha ao gerar mixes');
        }
        
        const data = await response.json();
        console.log('Mixes gerados com sucesso:', data);
        return true;
    } catch (error) {
        console.error('Erro ao gerar mixes:', error);
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
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    // Se não encontrou os dados, tenta gerar os mixes
                    const generated = await generateMixesIfNeeded();
                    if (generated) {
                        // Tenta buscar novamente após gerar
                        const retryResponse = await fetch(apiUrl);
                        if (retryResponse.ok) {
                            charactersToDisplay = await retryResponse.json();
                            maxPointsForCategory = Math.min(50, charactersToDisplay.length);
                        } else {
                            throw new Error('Falha ao buscar mixes após geração');
                        }
                    } else {
                        throw new Error('Falha ao gerar mixes');
                    }
                } else {
                    throw new Error('Erro ao buscar mixes');
                }
            } else {
                charactersToDisplay = await response.json();
                maxPointsForCategory = Math.min(50, charactersToDisplay.length);
            }
        } catch (error) {
            if (characterGrid) { 
                characterGrid.innerHTML = `<p>Erro ao carregar o Mix ${categoryName}. ${error.message}</p>`;
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

    for (const btn of mainControlButtons) {
      if (btn.textContent.trim() === 'Resetar Personagens') resetButton = btn;
      if (btn.textContent.trim() === 'Voltar ao Menu') backButton = btn;
    }

    if (resetButton) {
      resetButton.addEventListener('click', resetCharacters);
    } else { console.warn("Botão Resetar Personagens não encontrado pelo texto."); }

    if (backButton) {
      backButton.addEventListener('click', goBackToMenu);
    } else { console.warn("Botão Voltar ao Menu não encontrado pelo texto."); }

  } else {
    console.warn("Botões de controle principal (Resetar/Voltar) não encontrados ou insuficientes.");
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
  startMenu.style.opacity = '0';
  
  // Mostra o conteúdo do jogo
  const mainContent = document.querySelector('main');
  mainContent.style.display = 'flex';
  
  // Após o fade out do menu inicial, esconde ele e mostra o jogo
  setTimeout(() => {
    startMenu.style.display = 'none';
    mainContent.style.opacity = '1';
    selectCategory('');
  }, 500);
}

function openCustomizationMenu() {
  // Esconde o menu inicial
  const startMenu = document.getElementById('startMenu');
  startMenu.style.opacity = '0';
  
  // Mostra o menu de customização
  const customizationMenu = document.getElementById('customizationMenu');
  customizationMenu.style.display = 'flex';
  
  // Após o fade out do menu inicial, esconde ele e mostra o menu de customização
  setTimeout(() => {
    startMenu.style.display = 'none';
    customizationMenu.style.opacity = '1';
  }, 500);
}

function backToMainMenu() {
  // Esconde o menu de customização
  const customizationMenu = document.getElementById('customizationMenu');
  customizationMenu.style.opacity = '0';
  
  // Mostra o menu inicial
  const startMenu = document.getElementById('startMenu');
  startMenu.style.display = 'flex';
  
  // Após o fade out do menu de customização, esconde ele e mostra o menu inicial
  setTimeout(() => {
    customizationMenu.style.display = 'none';
    startMenu.style.opacity = '1';
  }, 500);
}

function goBackToMenu() {
  // Esconde o conteúdo do jogo
  const mainContent = document.querySelector('main');
  mainContent.style.opacity = '0';
  
  // Mostra o menu inicial
  const startMenu = document.getElementById('startMenu');
  startMenu.style.display = 'flex';
  
  // Após o fade out do jogo, esconde ele e mostra o menu inicial
  setTimeout(() => {
    mainContent.style.display = 'none';
    startMenu.style.opacity = '1';
  }, 500);
}

function resetCharacters() {
  usedPoints = 0;

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