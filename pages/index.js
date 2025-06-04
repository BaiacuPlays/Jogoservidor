import fs from 'fs';
import path from 'path';

export default function Home({ htmlContent }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

export async function getStaticProps() {
  try {
    // Lê o arquivo HTML da pasta public
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    return {
      props: {
        htmlContent
      }
    };
  } catch (error) {
    console.error('Erro ao ler HTML:', error);
    return {
      props: {
        htmlContent: '<html><body><h1>Erro ao carregar o jogo</h1></body></html>'
      }
    };
  }
}