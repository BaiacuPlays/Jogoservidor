const maxPoints = 50;
let usedPoints = 0;
let playerChosen = false;
let chosenCharacter = null; // This will store the chosen character object

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
  { name: "Uncharted", image: "imagens/uncharted.jpg" }, // Note: Character name is typically 'Nathan Drake'
  { name: "Wario", image: "imagens/wario.png" },
  { name: "Zelda", image: "imagens/zelda.webp" },
  { name: "Rato", image: "imagens/rato.webp" }, // Consider a more specific name like "Mickey Mouse" or from a specific game
  { name: "Okami", image: "imagens/okami.webp" }, // Character is Amaterasu
  { name: "CJ", image: "imagens/cj.webp" },
  { name: "Sans", image: "imagens/sans.jpg" },
  { name: "Hollow", image: "imagens/hollow.jpg" }, // Character is "The Knight" or "Ghost"
  { name: "Ralsei", image: "imagens/ralsei.webp" },
  { name: "Yi", image: "imagens/yi.webp" }, // Master Yi from League of Legends?
  { name: "Laika", image: "imagens/laika.png" },
  { name: "Madeline", image: "imagens/madeline.jpg" },
  { name: "Jimmy", image: "imagens/jimmy.webp" }, // Jimmy Hopkins from Bully?
  { name: "Zumbi", image: "imagens/zumbi.jpg" }, // Generic Zombie, or specific one like from Plants vs Zombies?
  { name: "Hades", image: "imagens/hades.jpg" }, // Character is Zagreus, or Hades himself? (Image is Zagreus)
  { name: "Lamb", image: "imagens/lamb.webp" }, // The Lamb from Cult of the Lamb
  { name: "Caneco", image: "imagens/caneco.jpeg" }, // Cuphead
  { name: "Ori", image: "imagens/ori.jpg" },
  { name: "Limbo", image: "imagens/limbo.png" }, // Character is "The Boy"
  { name: "Pizza", image: "imagens/pizza.jpg" }, // Peppino Spaghetti from Pizza Tower?
  { name: "Asriel", image: "imagens/asriel.webp" },
  { name: "Bomberman", image: "imagens/bomberman.webp" },
  { name: "Pacman", image: "imagens/pacman.webp" },
  { name: "VAULT", image: "imagens/vault.webp" }, // Vault Boy from Fallout
  { name: "Samus", image: "imagens/samus.jpg" },
  { name: "Pikmin", image: "imagens/pikmin.webp" }, // Pikmin (as a group or Olimar)
  { name: "Doom Slayer", image: "imagens/doom_slayer.jpg" }, // Also known as Doomguy
  { name: "Alucard", image: "imagens/alucard.jpg" },
  { name: "Geralt", image: "imagens/geralt.webp" },
  { name: "Shovel Knight", image: "imagens/shovel_knight.webp" },
  { name: "Kiryu", image: "imagens/kiyru.jpg" }, // Kazuma Kiryu
  { name: "Sackboy", image: "imagens/sackboy.jpg" },
  { name: "Vega", image: "imagens/vega.jpg" },
  { name: "Waluigi", image: "imagens/waluigi.jpg" },
  { name: "Goku", image: "imagens/goku.jpg" },
  { name: "Luffy", image: "imagens/luffy.jpg" },
  { name: "Arthur Morgan", image: "imagens/arthur_morgan.jpg" },
  { name: "Yoshi", image: "imagens/yoshi.jpg" },
  { name: "Luigi", image: "imagens/luigi.jpg" },
  { name: "Dante", image: "imagens/dante.jpg" },
  { name: "Bayonetta", image: "imagens/bayonetta.jpg" },
  { name: "Fox", image: "imagens/fox.jpg" }, // Fox McCloud
  { name: "Ness", image: "imagens/ness.jpg" },
  { name: "Captain Falcon", image: "imagens/captain_falcon.jpg" },
  { name: "Jigglypuff", image: "imagens/jigglypuff.jpg" },
  { name: "Peach", image: "imagens/peach.jpg" },
  { name: "Daisy", image: "imagens/daisy.jpg" },
  { name: "Pichu", image: "imagens/pichu.jpg" },
  { name: "Falco", image: "imagens/falco.jpg" }, // Falco Lombardi
  { name: "Marth", image: "imagens/marth.jpg" },
  { name: "Lucina", image: "imagens/lucina.jpg" },
  { name: "Ganondorf", image: "imagens/ganondorf.jpg" },
  { name: "Wolf", image: "imagens/wolf.jpg" }, // Wolf O'Donnell
  { name: "Villager", image: "imagens/villager.jpg" },
  { name: "Isabelle", image: "imagens/isabelle.jpg" }, // Duplicate entry for Isabelle, image name differs
  { name: "Greninja", image: "imagens/greninja.jpg" },
  { name: "Bowser Jr.", image: "imagens/bowser_jr.jpg" },
  { name: "Duck Hunt", image: "imagens/duck_hunt.jpg" }, // Duck Hunt Duo
  { name: "Ken", image: "imagens/ken.jpg" },
  { name: "Cloud", image: "imagens/cloud.jpg" },
  { name: "Corrin", image: "imagens/corrin.jpg" },
  { name: "Inkling", image: "imagens/inkling.jpg" },
  { name: "Ridley", image: "imagens/ridley.jpg" },
  { name: "Simon", image: "imagens/simon.jpg" }, // Simon Belmont
  { name: "Richter", image: "imagens/richter.jpg" }, // Richter Belmont
  { name: "King K. Rool", image: "imagens/king_k_rool.jpg" },
  // { name: "Isabelle", image: "imagens/isabelle.jpg" }, // This is a duplicate name/image path of an earlier Isabelle. Removed for consistency.
  { name: "Incineroar", image: "imagens/incineroar.jpg" },
  { name: "Piranha Plant", image: "imagens/piranha_plant.jpg" },
  { name: "Joker", image: "imagens/joker.jpg" },
  { name: "Kazuya", image: "imagens/kazuya.jpg" },
  { name: "Silver the Hedgehog", image: "imagens/silver_crusade.jpg" },
  { name: "Funky Kong", image: "imagens/funky_kong.jpg" },
  { name: "Geno", image: "imagens/geno.jpg" },
  { name: "Shantae", image: "imagens/shantae.jpg" },
  { name: "Terry Bogard", image: "imagens/terry_bogard.jpg" },
  { name: "Captain Toad", image: "imagens/captain_toad.jpg" },
  { name: "Scorpion (Mortal Kombat)", image: "imagens/scorpion.jpg" },
  { name: "Sub Zero (Mortal Kombat)", image: "imagens/sub_zero.jpg" },
  { name: "Conker", image: "imagens/conker.jpg" },
  { name: "Cranky Kong", image: "imagens/cranky_kong.jpg" },
  { name: "Diddy Kong", image: "imagens/diddy_kong.jpg" },
  { name: "Donkey Kong Jr.", image: "imagens/donkey_kong_jr.jpg" },
  { name: "Duke Nukem", image: "imagens/duke_nukem.jpg" },
  { name: "Doomguy", image: "imagens/doomguy.jpg" }, // Duplicate of Doom Slayer, consider merging or choosing one
  { name: "King Dedede", image: "imagens/king_dedede.jpg" },
  { name: "Knuckles", image: "imagens/knuckles.jpg" },
  { name: "King Boo", image: "imagens/king_boo.jpg" },
  { name: "Liu Kang", image: "imagens/liu_kang.jpg" },
  { name: "Little Mac", image: "imagens/little_mac.jpg" },
  { name: "Papyrus", image: "imagens/papyrus.jpg" },
  { name: "Shy Guy", image: "imagens/shy_guy.jpg" },
  { name: "Tommy Vercetti", image: "imagens/tommy_vercetti.jpg" },
  // Pokemon Section - Many duplicates from earlier Smash Bros section if using generic names.
  // Example: Pikachu, Mewtwo, Jigglypuff, Greninja, Incineroar were already listed.
  // For clarity, I'll assume these are specifically for a "Pokemon" category if you make one,
  // or they should be merged if the 'name' is the unique identifier across all categories.
  // I'm keeping them for now as per your list, but be aware of potential name collisions.
  { name: "Pikachu (Pokemon)", image: "imagens/pikachu.jpg" }, // If different from Smash Pikachu
  { name: "Charizard", image: "imagens/charizard.jpg" },
  { name: "Mewtwo (Pokemon)", image: "imagens/mewtwo.jpg" }, // If different from Smash Mewtwo
  { name: "Eevee", image: "imagens/eevee.jpg" },
  { name: "Bulbasaur", image: "imagens/bulbasaur.jpg" },
  { name: "Charmander", image: "imagens/charmander.jpg" },
  { name: "Squirtle", image: "imagens/squirtle.jpg" },
  // { name: "Jigglypuff", image: "imagens/jigglypuff.jpg" }, // Duplicate
  { name: "Mew", image: "imagens/mew.jpg" },
  { name: "Lucario", image: "imagens/lucario.jpg" },
  // { name: "Greninja", image: "imagens/greninja.jpg" }, // Duplicate
  { name: "Garchomp", image: "imagens/garchomp.jpg" },
  { name: "Gardevoir", image: "imagens/gardevoir.jpg" },
  { name: "Snorlax", image: "imagens/snorlax.jpg" },
  { name: "Blastoise", image: "imagens/blastoise.jpg" },
  { name: "Dragonite", image: "imagens/dragonite.jpg" },
  { name: "Raichu", image: "imagens/raichu.jpg" },
  { name: "Alakazam", image: "imagens/alakazam.jpg" },
  { name: "Zapdos", image: "imagens/zapdos.jpg" },
  { name: "Articuno", image: "imagens/articuno.jpg" },
  { name: "Moltres", image: "imagens/moltres.jpg" },
  { name: "Ditto", image: "imagens/ditto.jpg" },
  { name: "Vaporeon", image: "imagens/vaporeon.jpg" },
  { name: "Jolteon", image: "imagens/jolteon.jpg" },
  { name: "Flareon", image: "imagens/flareon.jpg" },
  { name: "Espeon", image: "imagens/espeon.jpg" },
  { name: "Umbreon", image: "imagens/umbreon.jpg" },
  { name: "Leafeon", image: "imagens/leafeon.jpg" },
  { name: "Glaceon", image: "imagens/glaceon.jpg" },
  { name: "Sylveon", image: "imagens/sylveon.jpg" },
  { name: "Togekiss", image: "imagens/togekiss.jpg" },
  { name: "Piplup", image: "imagens/piplup.jpg" },
  // { name: "Incineroar", image: "imagens/incineroar.jpg" }, // Duplicate
  { name: "Scorbunny", image: "imagens/scorbunny.jpg" },
  { name: "Sobble", image: "imagens/sobble.jpg" },
  { name: "Machamp", image: "imagens/machamp.jpg" },
  { name: "Tyranitar", image: "imagens/tyranitar.jpg" },
  { name: "Zygarde", image: "imagens/zygarde.jpg" },
  { name: "Lugia", image: "imagens/lugia.jpg" },
  { name: "Ho-Oh", image: "imagens/ho-oh.jpg" },
  { name: "Genesect", image: "imagens/genesect.jpg" },
  { name: "Zeraora", image: "imagens/zeraora.jpg" },
  { name: "Sableye", image: "imagens/sableye.jpg" },
  { name: "Shuckle", image: "imagens/shuckle.jpg" },
  { name: "Gumshoos", image: "imagens/gumshoos.jpg" },
  { name: "Decidueye", image: "imagens/decidueye.jpg" },
  { name: "Lurantis", image: "imagens/lurantis.jpg" },
  { name: "Salamence", image: "imagens/salamence.jpg" }
];

// Deduped character list based on name for higher accuracy in random selections
const uniqueCharacters = characters.filter((char, index, self) =>
    index === self.findIndex((c) => c.name === char.name)
);


const nintendoCharacters = [
    'Mario', 'Link', 'Pikachu', 'Kirby', 'Donkey', 'Bowser', 'Zelda', 'Wario', 'Mewtwo', 
    'Yoshi', 'Luigi', 'Peach', 'Daisy', 'Pichu', 'Falco', 'Marth', 'Lucina', 'Ganondorf', 
    'Wolf', 'Villager', 'Isabelle', 'Greninja', 'Bowser Jr.', 'Duck Hunt', 'Inkling', 
    'Ridley', 'King K. Rool', 'Incineroar', 'Piranha Plant', 'Samus', 'Pikmin', 'Fox', 
    'Ness', 'Captain Falcon', 'Jigglypuff', 'Captain Toad', 'Shy Guy', 'King Boo', 'Waluigi',
    'King Dedede', 'Little Mac'
];
const anthropomorphicCharacters = [
    'Mewtwo', 'Shadow', 'Spyro', 'Tail', 'Ralsei', 'Yi', 'Laika', 'Pikachu', 'Donkey', 
    'Banjo', 'Asriel', 'Ori', 'Lamb', 'Crash', 'Bowser', 'Sonic', 'Fox', 'Falco', 'Wolf', 
    'Greninja', 'Incineroar', 'Funky Kong', 'Diddy Kong', 'Knuckles', 'King K. Rool', 
    'Isabelle', 'Lucario', 'Eevee', 'Charizard', 'Blastoise', 'Dragonite', 'Raichu', 'Zeraora',
    'Sableye', 'Decidueye', 'Lurantis', 'Salamence', 'Garchomp', 'Tyranitar', 'Lugia', 'Ho-Oh'
];


// Global lists for mix characters, populated on load and when selected
let mix1CharactersList = [];
let mix2CharactersList = [];
let mix3CharactersList = [];

// Globals to store the currently active list and its max points
let currentActiveCharacterList = [];
let currentActiveMaxPoints = maxPoints;


// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Helper function to get random unique characters from the source
function getRandomCharacters(sourceArray, count) {
  if (sourceArray.length === 0) return [];
  const numToPick = Math.min(count, sourceArray.length);
  const shuffled = [...sourceArray]; 
  shuffleArray(shuffled);
  return shuffled.slice(0, numToPick);
}

// Function to refresh a mix category if needed (older than 24h or not present)
function refreshAndGetMixCategory(mixCategoryName) {
  const lastUpdateKey = `${mixCategoryName}_lastUpdate`;
  const characterNamesKey = `${mixCategoryName}_characterNames`; 
  
  const storedTimestamp = localStorage.getItem(lastUpdateKey);
  const storedCharacterNamesJSON = localStorage.getItem(characterNamesKey);
  
  const now = new Date().getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000; 

  let mixCharacterNames;
  let needsRefresh = false;

  if (!storedTimestamp || !storedCharacterNamesJSON) {
    needsRefresh = true;
    console.log(`No stored data for ${mixCategoryName}. Generating new characters.`);
  } else {
    const timeSinceLastUpdate = now - parseInt(storedTimestamp);
    if (timeSinceLastUpdate > twentyFourHours) {
      needsRefresh = true;
      console.log(`${mixCategoryName} data is older than 24 hours. Generating new characters.`);
    } else {
      console.log(`Loading ${mixCategoryName} characters from localStorage. Time until next refresh: ${Math.round((twentyFourHours - timeSinceLastUpdate) / (60 * 1000))} minutes.`);
      try {
        mixCharacterNames = JSON.parse(storedCharacterNamesJSON);
        if (!Array.isArray(mixCharacterNames) || mixCharacterNames.length === 0) {
            console.warn(`Stored character names for ${mixCategoryName} is invalid or empty. Refreshing.`);
            needsRefresh = true;
        }
      } catch (e) {
        console.error(`Error parsing stored character names for ${mixCategoryName}. Refreshing.`, e);
        needsRefresh = true;
      }
    }
  }

  if (needsRefresh) {
    // Use uniqueCharacters to avoid issues if the original 'characters' array has duplicates by name
    const selectedChars = getRandomCharacters(uniqueCharacters, 50); 
    mixCharacterNames = selectedChars.map(char => char.name); 
    
    localStorage.setItem(characterNamesKey, JSON.stringify(mixCharacterNames));
    localStorage.setItem(lastUpdateKey, now.toString());
    console.log(`${mixCategoryName} refreshed with ${mixCharacterNames.length} characters.`);
  }

  if (!mixCharacterNames) mixCharacterNames = []; 
  return mixCharacterNames.map(name => uniqueCharacters.find(char => char.name === name)).filter(Boolean); 
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

function selectCategory(categoryName) {
  if (selectedCategory) {
    selectedCategory.textContent = categoryName; 
  }
  if (characterGrid) {
    characterGrid.innerHTML = ''; 
  }

  let charactersToDisplay;
  let maxPointsForCategory;

  if (categoryName === 'Nintendo') {
    charactersToDisplay = uniqueCharacters.filter(char => nintendoCharacters.includes(char.name));
    maxPointsForCategory = charactersToDisplay.length;
  } else if (categoryName === 'Antropomórficos') {
    charactersToDisplay = uniqueCharacters.filter(char => anthropomorphicCharacters.includes(char.name));
    maxPointsForCategory = charactersToDisplay.length;
  } else if (categoryName === 'Mix 1') {
    mix1CharactersList = refreshAndGetMixCategory('Mix 1');
    charactersToDisplay = mix1CharactersList;
    maxPointsForCategory = Math.min(50, charactersToDisplay.length); // Ensure it doesn't exceed available if less than 50 generated
  } else if (categoryName === 'Mix 2') {
    mix2CharactersList = refreshAndGetMixCategory('Mix 2');
    charactersToDisplay = mix2CharactersList;
    maxPointsForCategory = Math.min(50, charactersToDisplay.length);
  } else if (categoryName === 'Mix 3') {
    mix3CharactersList = refreshAndGetMixCategory('Mix 3');
    charactersToDisplay = mix3CharactersList;
    maxPointsForCategory = Math.min(50, charactersToDisplay.length);
  } else { 
    charactersToDisplay = uniqueCharacters;
    maxPointsForCategory = maxPoints; 
    if (selectedCategory) {
      selectedCategory.textContent = 'Todos'; 
    }
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
  } else {
    if (characterGrid && selectedCategory) {
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

  mix1CharactersList = refreshAndGetMixCategory('Mix 1');
  mix2CharactersList = refreshAndGetMixCategory('Mix 2');
  mix3CharactersList = refreshAndGetMixCategory('Mix 3');

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
  
  updateCounter(currentActiveMaxPoints); 
});

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
      charDiv.classList.remove('selected');
      charDiv.classList.remove('locked');
    });
  }

  updateCounter(currentActiveMaxPoints); 
}