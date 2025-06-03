import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Lê o arquivo HTML da pasta public
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Define o content-type como HTML
    res.setHeader('Content-Type', 'text/html');
    
    // Retorna o HTML
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error('Erro ao servir HTML:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
