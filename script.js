const maxPoints = 50;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null;

const characterGrid = document.getElementById('characterGrid');
const chosenCharacterBox = document.getElementById('chosenCharacterBox');
const selectedCategory = document.getElementById('selectedCategory'); // Referência ao span

const characters = [
  { name: "Mario", image: "imagens/mario.jpeg" },
  { name: "Link", image: "imagens/link.webp" },
  { name: "Pikachu", image: "imagens/pikachu.avif" },
  { name: "Kirby", image: "imagens/kirby.jpg" },
  { name: "Master Chief", image: "imagens/halo.webp" },
  { name: "Lara Croft", image: "imagens/lara.webp" },
  { name: "Steve", image: "imagens/steve.jpeg" },
  { name: "Donkey", image: "imagens/donkey.jpg" },
  { name: "Megaman", image: "imagens/megaman.jpg" },
  { name: "Ryu", image: "imagens/ryu.webp" },
  { name: "Banjo", image: "imagens/banjo.jpg" },
  { name: "Bowser", image: "imagens/bowser.png" },
  { name: "Crash", image: "imagens/crash.webp" },
  { name: "Eggman", image: "imagens/eggman.webp" },
  { name: "Ellie", image: "imagens/ellie.webp" },
  { name: "Ezio", image: "imagens/ezio.jpg" },
  { name: "Gordon", image: "imagens/gordon.png" },
  { name: "Kratos", image: "imagens/kratos.webp" },
  { name: "Mewtwo", image: "imagens/mewtwo.png" },
  { name: "Rayman", image: "imagens/rayman.jpg" },
  { name: "Shadow", image: "imagens/shadow.webp" },
  { name: "Snake", image: "imagens/snake.webp" },
  { name: "Sonic", image: "imagens/sonic.png" },
  { name: "Sora", image: "imagens/sora.jpg" },
  { name: "Spyro", image: "imagens/spyro.png" },
  { name: "Tail", image: "imagens/tails.webp" },
  { name: "Uncharted", image: "imagens/uncharted.jpg" },
  { name: "Wario", image: "imagens/wario.png" },
  { name: "Zelda", image: "imagens/zelda.webp" },
  { name: "Rato", image: "imagens/rato.webp" },
  { name: "Okami", image: "imagens/okami.webp" },
  { name: "CJ", image: "imagens/cj.webp" },
  { name: "Sans", image: "imagens/sans.jpg" },
  { name: "Hollow", image: "imagens/hollow.jpg" },
  { name: "Ralsei", image: "imagens/ralsei.webp" },
  { name: "Yi", image: "imagens/yi.webp" },
  { name: "Laika", image: "imagens/laika.png" },
  { name: "Madeline", image: "imagens/madeline.jpg" },
  { name: "Jimmy", image: "imagens/jimmy.webp" },
  { name: "Zumbi", image: "imagens/zumbi.jpg" },
  { name: "Hades", image: "imagens/hades.jpg" },
  { name: "Lamb", image: "imagens/lamb.webp" },
  { name: "Caneco", image: "imagens/caneco.jpeg" },
  { name: "Ori", image: "imagens/ori.jpg" },
  { name: "Limbo", image: "imagens/limbo.png" },
  { name: "Pizza", image: "imagens/pizza.jpg" },
  { name: "Asriel", image: "imagens/asriel.webp" },
  { name: "Bomberman", image: "imagens/bomberman.webp" },
  { name: "Pacman", image: "imagens/pacman.webp" },
  { name: "VAULT", image: "imagens/vault.webp" },
];

const nintendoCharacters = ['Mario', 'Link', 'Pikachu', 'Kirby', 'Donkey', 'Bowser', 'Zelda', 'Wario', 'Mewtwo'];
const anthropomorphicCharacters = ['Mewtwo', 'Shadow','Spyro', 'Tail','Ralsei', 'Yi', 'Laika', 'Pikachu', 'Donkey', 'Banjo', 'Asriel', 'Ori', 'Lamb', 'Crash', 'Bowser'];

function startGame() {
  document.getElementById('startMenu').style.display = 'none';
  document.querySelector('main').style.display = 'flex';
  createCharacterGrid('Todos');
}

function openCustomizationMenu() {
  document.getElementById('startMenu').style.display = 'none';
  document.getElementById('customizationMenu').style.display = 'flex';
}

function backToMainMenu() {
  document.getElementById('customizationMenu').style.display = 'none';
  document.getElementById('startMenu').style.display = 'flex';
}

function goBackToMenu() {
  document.querySelector('main').style.display = 'none';
  document.getElementById('startMenu').style.display = 'flex';
}

function selectCategory(category) {
  selectedCategory.textContent = category;
  characterGrid.innerHTML = '';
  createCharacterGrid(category);
}

function createCharacterGrid(category) {
  let filteredCharacters = [];
  let currentMaxPoints = maxPoints;

  if (category === 'Nintendo') {
    filteredCharacters = characters.filter(char => nintendoCharacters.includes(char.name));
    currentMaxPoints = filteredCharacters.length;
  } else if (category === 'Antropomórficos') {
    filteredCharacters = characters.filter(char => anthropomorphicCharacters.includes(char.name));
    currentMaxPoints = filteredCharacters.length;
  } else {
    filteredCharacters = characters;
    currentMaxPoints = maxPoints;
  }

  usedPoints = 0;
  playerChosen = false;
  chosenCharacterBox.innerHTML = '';
  updateCounter(currentMaxPoints);

  if (filteredCharacters.length > 0) {
    filteredCharacters.forEach(char => {
      const charDiv = document.createElement('div');
      charDiv.classList.add('character');
      charDiv.title = char.name;

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const img = document.createElement('img');
      img.src = char.image;
      img.alt = char.name;

      imgContainer.appendChild(img);
      charDiv.appendChild(imgContainer);
      characterGrid.appendChild(charDiv);

      charDiv.onclick = () => {
        if (!playerChosen) {
          playerChosen = true;
          chosenCharacter = charDiv;
          charDiv.classList.add('locked');
          chosenCharacterBox.innerHTML = `<img src="${char.image}" alt="${char.name}">`;
        }

        if (charDiv.classList.contains('selected')) {
          charDiv.classList.remove('selected');
          usedPoints--;
        } else {
          if (usedPoints < currentMaxPoints) {
            charDiv.classList.add('selected');
            usedPoints++;
          }
        }
        updateCounter(currentMaxPoints);
      };
    });
  } else {
    characterGrid.innerHTML = '<p>Nenhum personagem encontrado nesta categoria.</p>';
  }
}

function updateCounter(max) {
  const remaining = max - usedPoints;
  document.getElementById('point-counter').innerText = `Personagens restantes: ${remaining}`;
}



document.addEventListener('DOMContentLoaded', function () {
  const categoryButton = document.getElementById('categoryButton');
  const categoryDropdown = document.getElementById('categoryDropdown');

  categoryButton.addEventListener('click', function (event) {
    event.stopPropagation();
    categoryDropdown.classList.toggle('show');
  });


  
  window.addEventListener('click', function (event) {
    if (!document.querySelector('.dropdown').contains(event.target)) {
      categoryDropdown.classList.remove('show');
    }
  });
});


// Inicializa o contador ao carregar
updateCounter(maxPoints);
