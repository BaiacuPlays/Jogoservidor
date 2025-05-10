// script.js - VERSÃO CORRIGIDA

const maxPoints = 50;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null; // This will store the chosen character object

const characterGrid = document.getElementById('characterGrid');
const chosenCharacterBox = document.getElementById('chosenCharacterBox');
const selectedCategory = document.getElementById('selectedCategory'); // Referência ao span

// <-- REMOVIDO: As definições dos arrays characters, uniqueCharacters, nintendoCharacters, anthropomorphicCharacters foram movidas para './data/characterData.js'
// <-- REMOVIDO: As definições das funções shuffleArray e getRandomCharacters foram movidas para './utils/helpers.js'

// <-- NOVO: Importa os dados estáticos e as funções helpers dos arquivos compartilhados
// Certifique-se que os caminhos estão corretos baseados na estrutura do seu projeto
import { characters, uniqueCharacters, nintendoCharacters, anthropomorphicCharacters } from './data/characterData.js'; // Caminho relativo da raiz para data/
import { shuffleArray, getRandomCharacters } from './utils/helpers.js';     // Caminho relativo da raiz para utils/


// Variáveis globais para a lista ativa e limite de pontos (permanecem)
let currentActiveCharacterList = [];
let currentActiveMaxPoints = maxPoints;


// --- selectCategory MODIFICADA PARA SER ASSÍNCRONA E BUSCAR MIXES DA API ---
async function selectCategory(categoryName) { // <-- MODIFICADO: Função agora é assíncrona
    if (selectedCategory) {
        selectedCategory.textContent = categoryName;
    }
    if (characterGrid) {
        characterGrid.innerHTML = ''; // Limpa o grid atual
    }

    let charactersToDisplay = [];
    let maxPointsForCategory;

    // Lógica para categorias estáticas (usam dados locais importados)
    if (categoryName === 'Nintendo') {
        charactersToDisplay = uniqueCharacters.filter(char => nintendoCharacters.includes(char.name));
        maxPointsForCategory = charactersToDisplay.length;
    } else if (categoryName === 'Antropomórficos') {
        charactersToDisplay = uniqueCharacters.filter(char => anthropomorphicCharacters.includes(char.name));
        maxPointsForCategory = charactersToDisplay.length;
    } else if (categoryName === 'Todos' || categoryName === '') {
         charactersToDisplay = uniqueCharacters;
         maxPointsForCategory = maxPoints; // Seu limite global padrão (50)
         if (selectedCategory) {
             selectedCategory.textContent = 'Todos';
         }
    }
    // --- NOVA LÓGICA PARA CATEGORIAS MIX: BUSCAR DO SERVIDOR ---
    else if (['Mix 1', 'Mix 2', 'Mix 3'].includes(categoryName)) {
        // Converte o nome da categoria para a chave esperada pela API ('mix1', 'mix2', 'mix3')
        const categoryKey = categoryName.replace(' ', '').toLowerCase();
        // Define a URL do endpoint da API Serverless que criamos no Passo 4
        const apiUrl = `/api/get-mix-chars?category=${categoryKey}`; // <-- Endpoint da API Serverless

        if (characterGrid) {
            // Opcional: Mostra uma mensagem de carregamento enquanto aguarda a resposta da API
           characterGrid.innerHTML = '<p>Carregando personagens do Mix... Aguarde.</p>';
        }

        try {
            // Faz a requisição assíncrona para a API
            const response = await fetch(apiUrl); // <-- NOVO: Usa fetch()

            // Verifica se a resposta da API foi bem-sucedida (status 200-299)
            if (!response.ok) {
                // Se houver um erro (404, 500, etc.), loga e mostra uma mensagem para o usuário
                console.error(`Erro na API ao carregar Mix ${categoryName}. Status: ${response.status}`);
                const errorData = await response.json(); // <-- Tenta ler o corpo da resposta de erro
                console.error('Detalhes do Erro:', errorData);
                if (characterGrid) {
                   characterGrid.innerHTML = `<p>Não foi possível carregar o Mix ${categoryName}. (${errorData.message || 'Erro desconhecido'})</p>`;
                }
                // Define a lista como vazia e pontos como zero em caso de falha
                charactersToDisplay = [];
                maxPointsForCategory = 0;

            } else {
                // Se a resposta for OK, pega o corpo da resposta como JSON
                // A API /api/get-mix-chars retorna o array de objetos de personagem diretamente
                charactersToDisplay = await response.json(); // <-- NOVO: Espera o parsing do JSON

                // Define o limite de pontos com base na lista recebida (ou use 50 fixo se preferir um limite constante)
                maxPointsForCategory = Math.min(50, charactersToDisplay.length);

                console.log(`Mix ${categoryName} carregado com ${charactersToDisplay.length} personagens.`);

                 // Opcional: Se a lista vier vazia por algum motivo (ex: primeiro acesso antes do cron)
                 if (charactersToDisplay.length === 0 && characterGrid) {
                     characterGrid.innerHTML = `<p>Nenhum personagem encontrado para o Mix ${categoryName}. Tente novamente mais tarde.</p>`;
                 }
            }

        } catch (error) {
            // Captura erros de rede (problemas de conexão com o servidor, etc.)
            console.error(`Erro de rede ao buscar Mix ${categoryName}:`, error);
            if (characterGrid) {
                characterGrid.innerHTML = `<p>Erro de rede ao carregar o Mix ${categoryName}. Verifique sua conexão.</p>`;
            }
            // Define a lista como vazia e pontos como zero em caso de erro
            charactersToDisplay = [];
            maxPointsForCategory = 0;
        }
    } else {
        // Categoria desconhecida
        console.warn(`Categoria selecionada desconhecida: ${categoryName}`);
        charactersToDisplay = [];
        maxPointsForCategory = 0;
        if (selectedCategory) {
            selectedCategory.textContent = 'Categoria Desconhecida';
        }
    }

    // Atualiza as variáveis globais com a lista e o limite de pontos
    currentActiveCharacterList = charactersToDisplay;
    currentActiveMaxPoints = maxPointsForCategory;

    // Chama a função que desenha o grid com a lista e limite definidos.
    createCharacterGridInternal();
}
// --- FIM DA selectCategory MODIFICADA ---


// A função createCharacterGridInternal continua a mesma
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

                // O click handler para os personagens permanece o mesmo
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
                updateCounter(currentActiveMaxPoints); // Atualiza o contador após cada clique de seleção
            };
        });
    } else {
        // Mensagem para quando a lista está vazia
         if (characterGrid && selectedCategory && characterGrid.innerHTML === '') { // Evita sobrescrever mensagem de loading ou erro
             // Esta mensagem será exibida se currentActiveCharacterList estiver vazio
             // Pode acontecer se a API retornar [] ou em caso de erro
            characterGrid.innerHTML = `<p>Nenhum personagem encontrado para "${selectedCategory.textContent}".</p>`;
         }
    }
}

// A função updateCounter permanece a mesma
function updateCounter(max) {
    const remaining = max - usedPoints;
    const pointCounterElement = document.getElementById('point-counter');
    if (pointCounterElement) {
        pointCounterElement.innerText = `Personagens restantes: ${remaining}`;
    }
}

// --- document.addEventListener('DOMContentLoaded') - O ÚNICO E CORRETO ---
document.addEventListener('DOMContentLoaded', function () {
    const categoryButton = document.getElementById('categoryButton');
    const categoryDropdown = document.getElementById('categoryDropdown');

    // A lógica de inicialização de Mixes com localStorage já deve ter sido removida

    // Listener para o botão que abre/fecha o dropdown de categoria
    if (categoryButton && categoryDropdown) {
        categoryButton.addEventListener('click', function (event) {
            event.stopPropagation();
            categoryDropdown.classList.toggle('show');
        });
    }

    // Listener para fechar o dropdown ao clicar fora
    window.addEventListener('click', function (event) {
        if (categoryDropdown && categoryButton && !categoryButton.contains(event.target) && !categoryDropdown.contains(event.target)) {
            categoryDropdown.classList.remove('show');
        }
    });

    // <-- NOVO/CORRIGIDO: CHAMA a função para configurar TODOS os outros ouvintes de evento
    setupEventListeners(); // <-- Esta linha DEVE estar DENTRO DESTE bloco DOMContentLoaded

    // Inicializa o contador com o limite padrão (50)
    updateCounter(maxPoints);

    // A função startGame() chama selectCategory('') quando o botão "Começar Jogo" é clicado.
    // Não chamamos selectCategory('') diretamente aqui.

});
// --- FIM DO ÚNICO E CORRETO DOMContentLoaded ---


// <-- NOVO: Função para configurar todos os ouvintes de evento JavaScript (DEFINIÇÃO)
function setupEventListeners() {
    // Botões do Menu Inicial (#startMenu)
    const startMenuButtons = document.querySelectorAll('#startMenu .menu-button');
    if (startMenuButtons.length >= 2) { // Espera pelo menos 2 botões
        startMenuButtons[0].addEventListener('click', startGame); // Primeiro botão: "Começar Jogo"
        startMenuButtons[1].addEventListener('click', openCustomizationMenu); // Segundo botão: "Customização"
    } else {
        console.error("Botões do menu inicial não encontrados ou insuficientes!");
    }

    // Botão do Menu de Customização (#customizationMenu)
    const customizationMenuButton = document.querySelector('#customizationMenu .menu-button');
    if (customizationMenuButton) {
        customizationMenuButton.addEventListener('click', backToMainMenu); // Botão "Voltar"
    } else {
         console.warn("Botão do menu de customização não encontrado.");
    }

    // Botões de Controle na Área Principal (<main .controls>)
    const mainControlButtons = document.querySelectorAll('main .controls .menu-button.small');
     if (mainControlButtons.length >= 2) { // Espera pelo menos o Resetar e Voltar
         // Encontra o botão de reset e voltar pelo texto, já que não têm IDs
         let resetButton = null;
         let backButton = null;

         for(const btn of mainControlButtons) {
             if (btn.textContent.trim() === 'Resetar Personagens') resetButton = btn;
             if (btn.textContent.trim() === 'Voltar ao Menu') backButton = btn;
         }

         if (resetButton) {
             resetButton.addEventListener('click', resetCharacters); // <-- resetCharacters DEVE ser acessível aqui
         } else { console.warn("Botão Resetar Personagens não encontrado pelo texto."); }

         if (backButton) {
            backButton.addEventListener('click', goBackToMenu); // <-- goBackToMenu DEVE ser acessível aqui
         } else { console.warn("Botão Voltar ao Menu não encontrado pelo texto."); }

    } else {
        console.warn("Botões de controle principal (Resetar/Voltar) não encontrados ou insuficientes.");
    }

    // Itens do Dropdown de Categoria (#categoryDropdown)
    const dropdownItems = document.querySelectorAll('#categoryDropdown .dropdown-item');
    if (dropdownItems.length > 0) {
       dropdownItems.forEach(item => {
           item.addEventListener('click', function() {
               const categoryName = item.textContent.trim(); // Pega o texto do botão (nome da categoria)
               selectCategory(categoryName); // <-- selectCategory DEVE ser acessível aqui
                // Opcional: fechar o dropdown após a seleção
                document.getElementById('categoryDropdown')?.classList.remove('show');
           });
       });
    } else {
        console.error("Itens do dropdown de categoria não encontrados!");
    }

    // O botão categoryButton que abre/fecha o dropdown já tem listener no DOMContentLoaded acima.
}

// As funções startGame, openCustomizationMenu, backToMainMenu, goBackToMenu, selectCategory, resetCharacters
// devem estar definidas aqui, no nível superior do módulo, ANTES de setupEventListeners ser chamada.
// Garanta que elas NÃO TÊM a palavra-chave 'export' antes delas, a menos que sejam importadas por outros módulos.

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
        // Carrega a categoria 'Todos' por padrão ao iniciar o jogo
        selectCategory(''); // <-- Chama selectCategory para carregar a primeira lista ('Todos')
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

// --- FIM DO ARQUIVO script.js ---