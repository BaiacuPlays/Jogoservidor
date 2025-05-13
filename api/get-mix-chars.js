import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado GET.' });
    }

    try {
        // Verifica se o KV está inicializado
        if (!kv) {
            throw new Error('KV store não está inicializado');
        }

        const { category } = req.query;
        
        // Valida o parâmetro category
        if (!category || !['mix1', 'mix2', 'mix3'].includes(category)) {
            return res.status(400).json({ 
                message: 'Categoria inválida. Use mix1, mix2 ou mix3.' 
            });
        }

        console.log(`Buscando personagens para ${category}...`);
        
        // Busca os personagens no KV
        const characters = await kv.get(`${category}_characters`);
        
        if (!characters) {
            console.warn(`Nenhum dado encontrado para ${category}`);
            return res.status(404).json({ 
                message: `Nenhum dado encontrado para ${category}. É necessário gerar os mixes primeiro.`,
                needsGeneration: true
            });
        }

        // Verifica se os dados têm a estrutura correta
        if (!Array.isArray(characters)) {
            throw new Error(`Dados inválidos para ${category}: não é um array`);
        }

        const requiredProps = ['name', 'image'];
        for (const char of characters) {
            if (!char || typeof char !== 'object') {
                throw new Error(`Dados inválidos para ${category}: elemento não é um objeto válido`);
            }
            for (const prop of requiredProps) {
                if (!(prop in char)) {
                    throw new Error(`Dados inválidos para ${category}: personagem sem a propriedade ${prop}`);
                }
            }
        }

        console.log(`Retornando ${characters.length} personagens para ${category}`);
        
        return res.status(200).json(characters);

    } catch (error) {
        console.error(`Erro ao buscar personagens:`, error);
        return res.status(500).json({ 
            message: 'Erro ao buscar personagens.',
            error: error.message
        });
    }
}