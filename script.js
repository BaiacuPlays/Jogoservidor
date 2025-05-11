// script.js

const maxPoints = 50;
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

async function selectCategory(categoryName) {
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
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                if (characterGrid) { characterGrid.innerHTML = `<p>Não foi possível carregar o Mix ${categoryName}. (${errorData.message || 'Erro desconhecido'})</p>`; }
                charactersToDisplay = [];
                maxPointsForCategory = 0;
            } else {
                charactersToDisplay = await response.json();
                maxPointsForCategory = Math.min(50, charactersToDisplay.length);
                if (charactersToDisplay.length === 0 && characterGrid) {
                    characterGrid.innerHTML = `<p>Nenhum personagem encontrado para o Mix ${categoryName}. Tente novamente mais tarde.</p>`;
                }
            }
        } catch (error) {
            if (characterGrid) { characterGrid.innerHTML = `<p>Erro de rede ao carregar o Mix ${categoryName}. Verifique sua conexão.</p>`; }
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
}

function createCharacterGridInternal() {
    usedPoints = 0;
    playerChosen = false;
    chosenCharacter = null;
    if (chosenCharacterBox) {
        chosenCharacterBox.innerHTML = '';
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
        });
    }

    window.addEventListener('click', function (event) {
        if (categoryDropdown && categoryButton && !categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) {
            categoryDropdown.classList.remove('show');
        }
    });

    setupEventListeners();
    updateCounter(maxPoints);
});

function setupEventListeners() {
    const startMenuButtons = document.querySelectorAll('#startMenu .menu-button');
    if (startMenuButtons.length >= 2) {
        startMenuButtons[0].addEventListener('click', startGame);
        startMenuButtons[1].addEventListener('click', openCustomizationMenu);
    } else {
        console.error("Botões do menu inicial não encontrados ou insuficientes!");
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

        for(const btn of mainControlButtons) {
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
            item.addEventListener('click', function() {
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
    document.body.classList.add("fade-out");
    setTimeout(() => {
        if(document.querySelector(".centered-menu")) {
            document.querySelector(".centered-menu").style.display = "none";
        }
        if(document.querySelector("main")) {
            document.querySelector("main").style.display = "flex";
        }
        document.body.classList.remove("fade-out");
        selectCategory('');
    }, 500);
}

function openCustomizationMenu() {
    if(document.getElementById('startMenu')) {
        document.getElementById('startMenu').style.display = 'none';
    }
    if(document.getElementById('customizationMenu')) {
        document.getElementById('customizationMenu').style.display = 'flex';
    }
}

function backToMainMenu() {
    if(document.getElementById('customizationMenu')) {
        document.getElementById('customizationMenu').style.display = 'none';
    }
    if(document.getElementById('startMenu')) {
        document.getElementById('startMenu').style.display = 'flex';
    }
}

function goBackToMenu() {
    if(document.querySelector('main')) {
        document.querySelector('main').style.display = 'none';
    }
    if(document.getElementById('startMenu')) {
        document.getElementById('startMenu').style.display = 'flex';
    }
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