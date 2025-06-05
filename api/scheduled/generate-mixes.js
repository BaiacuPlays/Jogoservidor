import { kv } from '@vercel/kv';
import { getRandomCharacters } from '../../utils/helpers.js';
import { uniqueCharacters } from '../../data/characterData.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado GET.' });
    }

    console.log('--- Iniciando atualização automática dos Mixes ---');

    try {
        // Verifica se o KV está inicializado
        if (!kv) {
            throw new Error('KV store não está inicializado');
        }

        const numCharsPerMix = 50;
        
        // Verifica se temos personagens suficientes
        if (!uniqueCharacters || uniqueCharacters.length < numCharsPerMix) {
            throw new Error(`Não há personagens suficientes. Necessário: ${numCharsPerMix}, Disponível: ${uniqueCharacters?.length || 0}`);
        }

        console.log(`Gerando ${numCharsPerMix} personagens para cada mix...`);
        
        // Gera os mixes
        const mix1Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);
        const mix2Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);
        const mix3Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);

        // Prepara os dados para salvar
        const mix1Data = mix1Chars.map(char => ({
            name: char.name,
            image: char.image
        }));
        const mix2Data = mix2Chars.map(char => ({
            name: char.name,
            image: char.image
        }));
        const mix3Data = mix3Chars.map(char => ({
            name: char.name,
            image: char.image
        }));

        // Salva os mixes no KV
        await kv.set('mix1_characters', mix1Data);
        await kv.set('mix2_characters', mix2Data);
        await kv.set('mix3_characters', mix3Data);

        // Salva o timestamp da última atualização
        await kv.set('last_mix_update', Date.now());

        console.log('Mixes atualizados com sucesso!');
        
        return res.status(200).json({ 
            message: 'Mixes atualizados com sucesso.',
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Erro ao atualizar mixes:', error);
        return res.status(500).json({ 
            message: 'Falha ao atualizar mixes.',
            error: error.message
        });
    }
}