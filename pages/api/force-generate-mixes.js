import { getRandomCharacters } from '../../utils/helpers.js';
import { uniqueCharacters } from '../../data/characterData.js';

// Simulação de storage local para desenvolvimento
let localMixStorage = {};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado POST.' });
    }

    console.log('--- Forçando geração dos Mixes ---');

    try {

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

        console.log('Mixes gerados, salvando no KV...');

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

        console.log('Mixes salvos no KV, verificando...');

        // Verifica se os dados foram salvos corretamente
        const [savedMix1, savedMix2, savedMix3] = await Promise.all([
            kv.get('mix1_characters'),
            kv.get('mix2_characters'),
            kv.get('mix3_characters')
        ]);

        if (!savedMix1 || !savedMix2 || !savedMix3) {
            throw new Error('Falha ao verificar dados salvos no KV');
        }

        // Verifica se os dados têm a estrutura correta
        const requiredProps = ['name', 'image'];
        for (const [mixName, mix] of [
            ['Mix 1', savedMix1],
            ['Mix 2', savedMix2],
            ['Mix 3', savedMix3]
        ]) {
            if (!Array.isArray(mix)) {
                throw new Error(`${mixName} não é um array válido`);
            }
            if (mix.length !== numCharsPerMix) {
                throw new Error(`${mixName} não tem o número correto de personagens`);
            }
            for (const char of mix) {
                if (!char || typeof char !== 'object') {
                    throw new Error(`${mixName} contém um elemento inválido`);
                }
                for (const prop of requiredProps) {
                    if (!(prop in char)) {
                        throw new Error(`${mixName} contém um personagem sem a propriedade ${prop}`);
                    }
                }
            }
        }

        console.log('Mixes gerados e salvos no Vercel KV com sucesso!');
        console.log(`Mix 1: ${savedMix1.length} personagens`);
        console.log(`Mix 2: ${savedMix2.length} personagens`);
        console.log(`Mix 3: ${savedMix3.length} personagens`);

        return res.status(200).json({ 
            message: 'Mixes gerados e salvos com sucesso.',
            counts: {
                mix1: savedMix1.length,
                mix2: savedMix2.length,
                mix3: savedMix3.length
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