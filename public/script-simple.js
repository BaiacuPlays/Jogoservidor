// Script simplificado para Vercel
console.log('🚀 Script simplificado carregando...');

// Aguardar carregamento dos dados
function waitForData() {
  return new Promise((resolve) => {
    const checkData = () => {
      console.log('🔍 Verificando dados...');
      console.log('- characters:', typeof window.characters);
      console.log('- shuffleArray:', typeof window.shuffleArray);
      console.log('- getRandomCharacters:', typeof window.getRandomCharacters);
      
      if (window.characters && window.shuffleArray && window.getRandomCharacters) {
        console.log('✅ Todos os dados carregados!');
        resolve();
      } else {
        console.log('⏳ Aguardando...');
        setTimeout(checkData, 100);
      }
    };
    checkData();
  });
}

// Função para mostrar/esconder menus
function showMenu(menuId) {
  console.log(`🔄 showMenu: ${menuId}`);
  
  // Esconder todos os menus
  const menus = ['startMenu', 'lobbyMenu', 'customizationMenu'];
  menus.forEach(id => {
    const menu = document.getElementById(id);
    if (menu) {
      menu.style.display = 'none';
    }
  });
  
  // Esconder main
  const main = document.querySelector('main');
  if (main) {
    main.style.display = 'none';
  }
  
  // Mostrar menu desejado
  if (menuId === 'main') {
    if (main) {
      main.style.display = 'flex';
      setTimeout(() => main.classList.add('visible'), 50);
    }
  } else {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.style.display = 'flex';
    }
  }
}

// Configurar botões
function setupButtons() {
  console.log('🔧 Configurando botões...');
  
  const playLocal = document.getElementById('playLocalButton');
  const playOnline = document.getElementById('playOnlineButton');
  const customization = document.getElementById('customizationButton');
  
  console.log('- playLocal:', !!playLocal);
  console.log('- playOnline:', !!playOnline);
  console.log('- customization:', !!customization);
  
  if (playLocal) {
    playLocal.addEventListener('click', () => {
      console.log('🎮 Jogar Local clicado!');
      showMenu('main');
    });
  }
  
  if (playOnline) {
    playOnline.addEventListener('click', () => {
      console.log('🌐 Jogar Online clicado!');
      showMenu('lobbyMenu');
    });
  }
  
  if (customization) {
    customization.addEventListener('click', () => {
      console.log('⚙️ Configurações clicado!');
      showMenu('customizationMenu');
    });
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 DOM carregado');
  
  try {
    await waitForData();
    setupButtons();
    console.log('✅ Inicialização completa!');
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  }
});

console.log('📜 Script simplificado carregado');
