import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redireciona para a página do jogo em React
    window.location.replace('/game');
  }, []);

  return null;
}