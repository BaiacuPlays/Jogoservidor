// script.js - VERSÃO COM LOGS PARA DEBUG

console.log('script.js: Iniciando carregamento do script.'); // Log no início do arquivo

const maxPoints = 50;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null; // This will store the chosen character object

const characterGrid = document.getElementById('characterGrid');
const chosenCharacterBox = document.getElementById('chosenCharacterBox');
const selectedCategory = document.getElementById('selectedCategory'); // Referência ao span

// <-- Imports permanecem aqui -->
import { characters, uniqueCharacters, nintendoCharacters, anthropomorphicCharacters } from './data/characterData.js';
import { shuffleArray, getRandomCharacters } from './utils/helpers.js';


// Variáveis globais para a lista ativa e limite de pontos (permanecem)
let currentActiveCharacterList = [];
let currentActiveMaxPoints = maxPoints;


// --- selectCategory --- (Não precisa adicionar logs aqui agora, o foco é na setupEventListeners)
async function selectCategory(categoryName) {
    console.log(`selectCategory: Categoria selecionada: ${categoryName}`); // Log no início de selectCategory
    // ... o restante da sua função selectCategory ...

     if (selectedCategory) { selectedCategory.textContent = categoryName; }
     if (characterGrid) { characterGrid.innerHTML = ''; }

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
             // LOG: Antes de fazer a requisição fetch
             console.log(`selectCategory: Fazendo fetch para URL: ${apiUrl}`);
             const response = await fetch(apiUrl);
             // LOG: Após receber a resposta do fetch
             console.log(`selectCategory: Resposta fetch recebida. Status: ${response.status}`);

             if (!response.ok) {
                 console.error(`selectCategory: Erro na resposta da API. Status: ${response.status}`);
                 const errorData = await response.json();
                 console.error('selectCategory: Detalhes do Erro da API:', errorData);
                 if (characterGrid) { characterGrid.innerHTML = `<p>Não foi possível carregar o Mix ${categoryName}. (${errorData.message || 'Erro desconhecido'})</p>`; }
                 charactersToDisplay = [];
                 maxPointsForCategory = 0;
             } else {
                 charactersToDisplay = await response.json();
                 maxPointsForCategory = Math.min(50, charactersToDisplay.length);
                 console.log(`selectCategory: Mix ${categoryName} carregado com ${charactersToDisplay.length} personagens.`);
                  if (charactersToDisplay.length === 0 && characterGrid) {
                      characterGrid.innerHTML = `<p>Nenhum personagem encontrado para o Mix ${categoryName}. Tente novamente mais tarde.</p>`;
                  }
             }
         } catch (error) {
             console.error(`selectCategory: Erro de rede ao buscar Mix ${categoryName}:`, error);
             if (characterGrid) { characterGrid.innerHTML = `<p>Erro de rede ao carregar o Mix ${categoryName}. Verifique sua conexão.</p>`; }
             charactersToDisplay = [];
             maxPointsForCategory = 0;
         }
     } else {
         console.warn(`selectCategory: Categoria selecionada desconhecida: ${categoryName}`);
         charactersToDisplay = [];
         maxPointsForCategory = 0;
         if (selectedCategory) { selectedCategory.textContent = 'Categoria Desconhecida'; }
     }

     currentActiveCharacterList = charactersToDisplay;
     currentActiveMaxPoints = maxPointsForCategory;

     // LOG: Antes de chamar createCharacterGridInternal
     console.log('selectCategory: Chamando createCharacterGridInternal');
     createCharacterGridInternal();
}
// --- FIM DA selectCategory ---


// A função createCharacterGridInternal continua a mesma
function createCharacterGridInternal() {
    console.log('createCharacterGridInternal: Iniciando...'); // Log no início
    usedPoints = 0;
    playerChosen = false;
    chosenCharacter = null;
    if (chosenCharacterBox) {
        chosenCharacterBox.innerHTML = '';
    }
    updateCounter(currentActiveMaxPoints);

    if (currentActiveCharacterList && currentActiveCharacterList.length > 0) {
        console.log(`createCharacterGridInternal: Desenhando grid com ${currentActiveCharacterList.length} personagens.`); // Log antes do loop
        currentActiveCharacterList.forEach(charObject => {
             // ... código para criar o div do personagem ...
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

              // O click handler para os personagens permanece o mesmo
             charDiv.onclick = () => {
                  // ... sua lógica de clique de personagem ...
                 if (!playerChosen) {
                      playerChosen = true;
                      chosenCharacter = charObject;
                      charDiv.classList.add('locked');
                      if (chosenCharacterBox) {
                          chosenCharacterBox.innerHTML = `<img src="${charObject.image}" alt="${charObject.name}">`;
                      }
                  } else {
                       if (charDiv.classList.contains('locked')) {
                           // Player's own locked character, do nothing for selection pool
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
         console.log('createCharacterGridInternal: Grid desenhado.'); // Log após o loop
    } else {
         console.log('createCharacterGridInternal: Lista de personagens vazia.'); // Log se a lista estiver vazia
         if (characterGrid && selectedCategory && characterGrid.innerHTML === '') {
            characterGrid.innerHTML = `<p>Nenhum personagem encontrado para "${selectedCategory.textContent}".</p>`;
         }
    }
     console.log('createCharacterGridInternal: Finalizado.'); // Log no final
}

// A função updateCounter permanece a mesma
function updateCounter(max) {
    const remaining = max - usedPoints;
    const pointCounterElement = document.getElementById('point-counter');
    if (pointCounterElement) {
        pointCounterElement.innerText = `Personagens restantes: ${remaining}`;
    }
}

// --- document.addEventListener('DOMContentLoaded') ---
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded: DOM completamente carregado.'); // Log no início do DOMContentLoaded

    const categoryButton = document.getElementById('categoryButton');
    const categoryDropdown = document.getElementById('categoryDropdown');

    if (categoryButton && categoryDropdown) {
        categoryButton.addEventListener('click', function (event) {
            event.stopPropagation();
            categoryDropdown.classList.toggle('show');
        });
    }

    window.addEventListener('click', function (event) {
        if (categoryDropdown && categoryButton && !categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) {
            categoryDropdown.classList.remove('show');
        }
    });

    // LOG: Antes de chamar setupEventListeners
    console.log('DOMContentLoaded: Chamando setupEventListeners.');

    // CHAMA a função para configurar TODOS os outros ouvintes de evento
    setupEventListeners(); // <-- Esta linha DEVE estar AQUI

    // LOG: Após chamar setupEventListeners
    console.log('DOMContentLoaded: setupEventListeners chamada. Inicializando contador.');

    // Inicializa o contador com o limite padrão (50)
    updateCounter(maxPoints);

    // A função startGame() chama selectCategory('') quando o botão "Começar Jogo" é clicado.
});
// --- FIM DO DOMContentLoaded ---


// <-- Função para configurar todos os ouvintes de evento JavaScript (DEFINIÇÃO) -->
function setupEventListeners() {
    console.log('setupEventListeners: Iniciando configuração dos ouvintes de evento.'); // Log no início da função

    // LOG: Antes de configurar botões do menu inicial
    console.log('setupEventListeners: Configurando botões do menu inicial.');
    // Botões do Menu Inicial (#startMenu)
    const startMenuButtons = document.querySelectorAll('#startMenu .menu-button');
    if (startMenuButtons.length >= 2) {
        startMenuButtons[0].addEventListener('click', startGame);
        startMenuButtons[1].addEventListener('click', openCustomizationMenu);
        console.log('setupEventListeners: Botões do menu inicial configurados.'); // Log após
    } else {
        console.error("setupEventListeners: Botões do menu inicial não encontrados ou insuficientes!");
    }

    // LOG: Antes de configurar botão de customização
    console.log('setupEventListeners: Configurando botão de customização.');
    // Botão do Menu de Customização (#customizationMenu)
    const customizationMenuButton = document.querySelector('#customizationMenu .menu-button');
    if (customizationMenuButton) {
        customizationMenuButton.addEventListener('click', backToMainMenu);
        console.log('setupEventListeners: Botão de customização configurado.'); // Log após
    } else {
         console.warn("setupEventListeners: Botão do menu de customização não encontrado.");
    }

    // LOG: Antes de configurar botões de controle principal
    console.log('setupEventListeners: Configurando botões de controle principal (Resetar/Voltar).');
    // Botões de Controle na Área Principal (<main .controls>)
    const mainControlButtons = document.querySelectorAll('main .controls .menu-button.small');
     if (mainControlButtons.length >= 2) {
         let resetButton = null;
         let backButton = null;

         for(const btn of mainControlButtons) {
             if (btn.textContent.trim() === 'Resetar Personagens') resetButton = btn;
             if (btn.textContent.trim() === 'Voltar ao Menu') backButton = btn;
         }

         if (resetButton) {
             // LOG: Antes de adicionar listener de Resetar
             console.log('setupEventListeners: Adicionando listener para Resetar Personagens.');
             resetButton.addEventListener('click', resetCharacters); // <-- Se der ReferenceError, acontece AQUI
              console.log('setupEventListeners: Listener para Resetar Personagens adicionado.'); // Log após
         } else { console.warn("setupEventListeners: Botão Resetar Personagens não encontrado pelo texto."); }

         if (backButton) {
            // LOG: Antes de adicionar listener de Voltar
            console.log('setupEventListeners: Adicionando listener para Voltar ao Menu.');
            backButton.addEventListener('click', goBackToMenu); // <-- Se der ReferenceError, pode acontecer AQUI
            console.log('setupEventListeners: Listener para Voltar ao Menu adicionado.'); // Log após
         } else { console.warn("setupEventListeners: Botão Voltar ao Menu não encontrado pelo texto."); }

         console.log('setupEventListeners: Botões de controle principal configurados.'); // Log após o bloco

    } else {
        console.warn("setupEventListeners: Botões de controle principal (Resetar/Voltar) não encontrados ou insuficientes.");
    }

    // LOG: Antes de configurar itens do dropdown de categoria
    console.log('setupEventListeners: Configurando itens do dropdown de categoria.');
    // Itens do Dropdown de Categoria (#categoryDropdown)
    const dropdownItems = document.querySelectorAll('#categoryDropdown .dropdown-item');
    if (dropdownItems.length > 0) {
       dropdownItems.forEach(item => {
           // LOG: Adicionando listener para item do dropdown
           console.log(`setupEventListeners: Adicionando listener para item do dropdown: ${item.textContent.trim()}`);
           item.addEventListener('click', function() {
               console.log(`Listener Categoria: Item clicado: ${item.textContent.trim()}`); // Log dentro do listener de click
               const categoryName = item.textContent.trim();
               selectCategory(categoryName);
                document.getElementById('categoryDropdown')?.classList.remove('show');
           });
           console.log(`setupEventListeners: Listener para item do dropdown ${item.textContent.trim()} adicionado.`); // Log após adicionar
       });
       console.log('setupEventListeners: Itens do dropdown de categoria configurados.'); // Log após o loop
    } else {
        console.error("setupEventListeners: Itens do dropdown de categoria não encontrados!");
    }

    console.log('setupEventListeners: Configuração dos ouvintes de evento FINALIZADA.'); // Log no final da função
}

// As funções startGame, openCustomizationMenu, backToMainMenu, goBackToMenu, selectCategory, resetCharacters
// devem estar definidas aqui, no nível superior do módulo, ANTES de setupEventListeners ser chamada.
// Garanta que elas NÃO TÊM a palavra-chave 'export' antes delas.

function startGame() {
    console.log('startGame: Iniciando jogo.'); // Log no início da função
    document.body.classList.add("fade-out");
    setTimeout(() => {
        if(document.querySelector(".centered-menu")) {
            document.querySelector(".centered-menu").style.display = "none";
        }
        if(document.querySelector("main")) {
            document.querySelector("main").style.display = "flex";
        }
        document.body.classList.remove("fade-out");
        // Carrega a categoria 'Todos' por padrão ao iniciar o jogo
        selectCategory('');
         console.log('startGame: selectCategory("") chamada.'); // Log após
    }, 500);
}

function openCustomizationMenu() {
     console.log('openCustomizationMenu: Abrindo menu de customização.');
    if(document.getElementById('startMenu')) {
        document.getElementById('startMenu').style.display = 'none';
    }
    if(document.getElementById('customizationMenu')) {
        document.getElementById('customizationMenu').style.display = 'flex';
    }
     console.log('openCustomizationMenu: Menu de customização aberto.');
}

function backToMainMenu() {
     console.log('backToMainMenu: Voltando para o menu principal.');
    if(document.getElementById('customizationMenu')) {
        document.getElementById('customizationMenu').style.display = 'none';
    }
    if(document.getElementById('startMenu')) {
        document.getElementById('startMenu').style.display = 'flex';
    }
     console.log('backToMainMenu: Voltou para o menu principal.');
}

function goBackToMenu() {
     console.log('goBackToMenu: Voltando para o menu principal (do jogo).');
    if(document.querySelector('main')) {
        document.querySelector('main').style.display = 'none';
    }
    if(document.getElementById('startMenu')) {
        document.getElementById('startMenu').style.display = 'flex';
    }
     console.log('goBackToMenu: Voltou para o menu principal (do jogo).');
}

function resetCharacters() {
    console.log('resetCharacters: Resetando personagens.'); // Log no início
    usedPoints = 0;
    playerChosen = false;
    chosenCharacter = null;
    if (chosenCharacterBox) {
        chosenCharacterBox.innerHTML = '';
    }

    if (characterGrid) {
        const allCharactersInGrid = characterGrid.querySelectorAll('.character');
        allCharactersInGrid.forEach(charDiv => {
            charDiv.classList.remove('selected');
            charDiv.classList.remove('locked');
        });
    }

    updateCounter(currentActiveMaxPoints);
     console.log('resetCharacters: Reset finalizado.'); // Log no final
}


// --- FIM DO ARQUIVO script.js ---