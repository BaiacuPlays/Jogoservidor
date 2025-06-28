// Otimizações específicas para dispositivos móveis
(function() {
  'use strict';

  // Detectar capacidades do dispositivo
  const deviceCapabilities = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isLowEnd: navigator.deviceMemory && navigator.deviceMemory < 4,
    isSlowConnection: navigator.connection && (navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g'),
    supportsTouchEvents: 'ontouchstart' in window,
    supportsPassiveEvents: false
  };

  // Testar suporte a eventos passivos
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        deviceCapabilities.supportsPassiveEvents = true;
        return false;
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}

  // Otimizações para dispositivos de baixo desempenho
  function applyLowEndOptimizations() {
    console.log('🔧 Aplicando otimizações para dispositivo de baixo desempenho');
    
    // Reduzir qualidade de animações
    const style = document.createElement('style');
    style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .psp-waves {
        display: none !important;
      }
      .character-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    `;
    document.head.appendChild(style);
    
    // Desabilitar efeitos visuais desnecessários
    document.body.classList.add('low-performance-mode');
  }

  // Otimizações para conexão lenta
  function applySlowConnectionOptimizations() {
    console.log('🐌 Aplicando otimizações para conexão lenta');
    
    // Reduzir qualidade de imagens
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && !img.dataset.optimized) {
        img.style.imageRendering = 'pixelated';
        img.dataset.optimized = 'true';
      }
    });
    
    // Desabilitar preload de recursos não críticos
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    preloadLinks.forEach(link => {
      if (!link.href.includes('critical')) {
        link.remove();
      }
    });
  }

  // Otimizar eventos de touch
  function optimizeTouchEvents() {
    const passiveOption = deviceCapabilities.supportsPassiveEvents ? { passive: true } : false;
    
    // Adicionar eventos de touch otimizados
    document.addEventListener('touchstart', function(e) {
      // Prevenir delay de 300ms em alguns dispositivos
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && (target.classList.contains('character') || target.classList.contains('menu-button'))) {
          target.style.transform = 'scale(0.95)';
        }
      }
    }, passiveOption);
    
    document.addEventListener('touchend', function(e) {
      // Restaurar escala
      const elements = document.querySelectorAll('.character, .menu-button');
      elements.forEach(el => {
        el.style.transform = '';
      });
    }, passiveOption);
  }

  // Otimizar scroll em mobile
  function optimizeScrolling() {
    // Aplicar scroll suave apenas onde necessário
    const scrollableElements = document.querySelectorAll('.dropdown-content, .character-grid');
    scrollableElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';
      element.style.overscrollBehavior = 'contain';
    });
  }

  // Gerenciar memória de imagens
  function manageImageMemory() {
    const imageCache = new Map();
    const maxCacheSize = deviceCapabilities.isLowEnd ? 20 : 50;
    
    function addToCache(src, element) {
      if (imageCache.size >= maxCacheSize) {
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }
      imageCache.set(src, element);
    }
    
    // Observer para limpar imagens fora da viewport
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const img = entry.target;
          if (!entry.isIntersecting && deviceCapabilities.isLowEnd) {
            // Em dispositivos de baixo desempenho, limpar imagens fora da viewport
            if (img.src && img.src !== img.dataset.placeholder) {
              img.dataset.originalSrc = img.src;
              img.src = img.dataset.placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
            }
          } else if (entry.isIntersecting && img.dataset.originalSrc) {
            img.src = img.dataset.originalSrc;
            delete img.dataset.originalSrc;
          }
        });
      }, {
        rootMargin: '100px',
        threshold: 0
      });
      
      // Observar todas as imagens
      document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => imageObserver.observe(img));
      });
    }
  }

  // Otimizar performance de CSS
  function optimizeCSS() {
    if (deviceCapabilities.isLowEnd) {
      const style = document.createElement('style');
      style.textContent = `
        * {
          will-change: auto !important;
        }
        .character, .menu-button {
          will-change: transform;
        }
        .character-grid {
          contain: layout style paint;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Debounce para eventos de resize
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Otimizar eventos de resize
  function optimizeResizeEvents() {
    const debouncedResize = debounce(() => {
      // Recalcular viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Otimizar grid baseado no tamanho da tela
      const characterGrid = document.querySelector('.character-grid');
      if (characterGrid && window.innerWidth < 480) {
        characterGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else if (characterGrid && window.innerWidth < 768) {
        characterGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      }
    }, 100);
    
    window.addEventListener('resize', debouncedResize, 
      deviceCapabilities.supportsPassiveEvents ? { passive: true } : false
    );
    window.addEventListener('orientationchange', debouncedResize,
      deviceCapabilities.supportsPassiveEvents ? { passive: true } : false
    );
  }

  // Inicializar otimizações
  function init() {
    console.log('📱 Inicializando otimizações mobile', deviceCapabilities);
    
    if (deviceCapabilities.isMobile) {
      optimizeTouchEvents();
      optimizeScrolling();
      optimizeResizeEvents();
      manageImageMemory();
      optimizeCSS();
      
      if (deviceCapabilities.isLowEnd) {
        applyLowEndOptimizations();
      }
      
      if (deviceCapabilities.isSlowConnection) {
        applySlowConnectionOptimizations();
      }
    }
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exportar para uso global se necessário
  window.MobileOptimizations = {
    deviceCapabilities,
    applyLowEndOptimizations,
    applySlowConnectionOptimizations
  };

})();