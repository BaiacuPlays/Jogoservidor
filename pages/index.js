import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redireciona para o arquivo HTML que funcionava
    window.location.replace('/index.html');
  }, []);

  return null;
}