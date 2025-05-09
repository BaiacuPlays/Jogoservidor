const maxPoints = 40;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null;

const characterGrid = document.getElementById('characterGrid');
const chosenCharacterBox = document.getElementById('chosenCharacterBox');

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
  { name: "Crash", image: "imagens/Crash.webp" },
  { name: "Eggman", image: "imagens/Eggman.webp" },
  { name: "Ellie", image: "imagens/Ellie.webp" },
  { name: "Ezio", image: "imagens/Ezio.jpg" },
  { name: "Gordon", image: "imagens/Gordon.png" },
  { name: "Kratos", image: "imagens/Kratos.webp" },
  { name: "Mewtwo", image: "imagens/Mewtwo.png" },
  { name: "Rayman", image: "imagens/Rayman.jpg" },
  { name: "Shadow", image: "imagens/shadow.webp" },
  { name: "Snake", image: "imagens/Snake.webp" },
  { name: "Sonic", image: "imagens/Sonic.png" },
  { name: "Sora", image: "imagens/Sora.jpg" },
  { name: "Spyro", image: "imagens/Spyro.png" },
  { name: "Tail", image: "imagens/Tails.webp" },
  { name: "Uncharted", image: "imagens/Uncharted.jpg" },
  { name: "Wario", image: "imagens/Wario.png" },
  { name: "Zelda", image: "imagens/Zelda.webp" },
  { name: "Rato", image: "imagens/rato.webp" },
  { name: "Okami", image: "imagens/okami.webp" },
  { name: "CJ", image: "imagens/Cj.webp" },
  { name: "Sans", image: "imagens/sans.jpg" },
  { name: "Hollow", image: "imagens/Hollow.jpg" },
  { name: "Ralsei", image: "imagens/Ralsei.webp" },
  { name: "Yi", image: "imagens/Yi.webp" },
  { name: "Laika", image: "imagens/laika.png" },
  { name: "Madeline", image: "imagens/Madeline.jpg" },
  { name: "Jimmy", image: "imagens/Jimmy.webp" },
  { name: "Zumbi", image: "imagens/zumbi.jpg" },
  { name: "Hades", image: "imagens/hades.jpg" },
  { name: "Lamb", image: "imagens/lamb.webp" },
  { name: "Caneco", image: "imagens/Caneco.jpeg" },
  { name: "Ori", image: "imagens/ori.jpg" },
  { name: "Limbo", image: "imagens/Limbo.png" },
  { name: "Pizza", image: "imagens/Pizza.jpg" },
  { name: "Asriel", image: "imagens/Asriel.webp" },
  { name: "Bomberman", image: "imagens/Bomberman.webp" },
  { name: "Pacman", image: "imagens/pacman.webp" },
  { name: "VAULT", image: "imagens/vault.webp" },
];

characters.forEach((char, index) => {
  const charDiv = document.createElement('div');
  charDiv.classList.add('character');
  charDiv.title = `${char.name} - Personagem ${index + 1}`;

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
      if (usedPoints < maxPoints) {
        charDiv.classList.add('selected');
        usedPoints++;
      }
    }

    updateCounter();
  };
});

function updateCounter() {
  const remaining = maxPoints - usedPoints;
  document.getElementById('point-counter').innerText = `Personagens restantes: ${remaining}`;
}

function startGame() {
  document.getElementById('startMenu').style.display = 'none';
  document.querySelector('main').style.display = 'flex';
}

function openCategoryMenu() {
  document.getElementById('startMenu').style.display = 'none';
  document.getElementById('customizationMenu').style.display = 'none';
  document.getElementById('categoryMenu').style.display = 'flex';
}

function openCustomizationMenu() {
  document.getElementById('startMenu').style.display = 'none';
  document.getElementById('categoryMenu').style.display = 'none';
  document.getElementById('customizationMenu').style.display = 'flex';
}

function backToMainMenu() {
  document.getElementById('categoryMenu').style.display = 'none';
  document.getElementById('customizationMenu').style.display = 'none';
  document.getElementById('startMenu').style.display = 'flex';
}

function goBackToMenu() {
  document.querySelector('main').style.display = 'none';
  document.getElementById('startMenu').style.display = 'flex';
}

// 🟡 Customização: tema claro/escuro
document.getElementById('themeSelect').addEventListener('change', (e) => {
  const theme = e.target.value;
  if (theme === 'light') {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  } else if (theme === 'dark') {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  }
});

// 🟡 Customização: escala da interface
document.getElementById('scaleRange').addEventListener('input', (e) => {
  const scale = e.target.value;
  document.documentElement.style.setProperty('--interface-scale', scale);
});

function resetCharacters() {
    // Desmarca todos os personagens selecionados
    document.querySelectorAll('.character.selected').forEach(el => {
      el.classList.remove('selected');
    });
  
    // Remove o personagem escolhido
    if (chosenCharacter) {
      chosenCharacter.classList.remove('locked');
      chosenCharacter = null;
      playerChosen = false;
    }
  
    // Limpa a imagem do personagem escolhido
    document.getElementById('chosenCharacterBox').innerHTML = "";
  
    // Zera os pontos
    usedPoints = 0;
    updateCounter();
  }
  
updateCounter();
