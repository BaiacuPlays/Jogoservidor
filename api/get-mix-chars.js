import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado GET.' });
    }

    const category = req.query.category;

    if (!category || !['mix1', 'mix2', 'mix3'].includes(category)) {
        return res.status(400).json({ message: 'Parâmetro "category" inválido ou ausente. Use mix1, mix2 ou mix3.' });
    }

    console.log(`--- Requisição recebida para Mix: ${category} ---`);

    try {
        const characters = await kv.get(`${category}_characters`);

        if (characters === null) {
            console.warn(`!!! Dados não encontrados no KV para a chave: ${category}_characters.`);
            return res.status(404).json({ message: `Lista de personagens para ${category} não encontrada. Tente novamente mais tarde.` });
        }

        console.log(`Dados encontrados para ${category}. Retornando ${Array.isArray(characters) ? characters.length : '???'} personagens.`);
        res.status(200).json(characters);
    } catch (error) {
        console.error(`!!! ERRO ao buscar dados no KV para ${category}:`, error);
        res.status(500).json({
            message: 'Falha ao buscar personagens do Mix.',
            error: error.message,
            stack: error.stack
        });
    }
}
