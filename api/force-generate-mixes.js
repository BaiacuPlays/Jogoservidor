import { kv } from '@vercel/kv';
import { shuffleArray, getRandomCharacters } from '../utils/helpers.js';
import { uniqueCharacters } from '../data/characterData.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado POST.' });
    }

    console.log('--- Forçando geração dos Mixes ---');

    try {
        const numCharsPerMix = 50;
        
        // Gera os mixes
        const mix1Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);
        const mix2Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);
        const mix3Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);

        // Salva os mixes no KV
        await Promise.all([
            kv.set('mix1_characters', JSON.stringify(mix1Chars)),
            kv.set('mix2_characters', JSON.stringify(mix2Chars)),
            kv.set('mix3_characters', JSON.stringify(mix3Chars))
        ]);

        // Verifica se os dados foram salvos corretamente
        const [savedMix1, savedMix2, savedMix3] = await Promise.all([
            kv.get('mix1_characters'),
            kv.get('mix2_characters'),
            kv.get('mix3_characters')
        ]);

        if (!savedMix1 || !savedMix2 || !savedMix3) {
            throw new Error('Falha ao verificar dados salvos no KV');
        }

        console.log('Mixes gerados e salvos no Vercel KV com sucesso!');
        console.log(`Mix 1: ${mix1Chars.length} personagens`);
        console.log(`Mix 2: ${mix2Chars.length} personagens`);
        console.log(`Mix 3: ${mix3Chars.length} personagens`);

        return res.status(200).json({ 
            message: 'Mixes gerados e salvos com sucesso.',
            counts: {
                mix1: mix1Chars.length,
                mix2: mix2Chars.length,
                mix3: mix3Chars.length
            }
        });

    } catch (error) {
        console.error('!!! ERRO ao gerar ou salvar os Mixes:', error);
        return res.status(500).json({ 
            message: 'Falha ao gerar os mixes.', 
            error: error.message 
        });
    }
} 