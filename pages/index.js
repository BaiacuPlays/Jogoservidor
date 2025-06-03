import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redireciona para o HTML puro servido pela API
    window.location.replace('/api/serve-html');
  }, []);

  return null;
}