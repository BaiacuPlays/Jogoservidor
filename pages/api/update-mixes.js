import { kv } from '@vercel/kv';
import { getRandomCharacters } from '../../utils/helpers.js';
import { uniqueCharacters } from '../../data/characterData.js';

// Função para gerar novos mixes
async function generateNewMixes() {
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
        return true;
    } catch (error) {
        console.error('Erro ao atualizar mixes:', error);
        return false;
    }
}

// Função para verificar se é meia-noite
function isMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() === 0;
}

// Função para verificar se é necessário atualizar os mixes
async function checkAndUpdateMixes() {
    try {
        const lastUpdate = await kv.get('last_mix_update');
        const now = new Date();
        
        // Se não houver registro de última atualização
        if (!lastUpdate) {
            return await generateNewMixes();
        }

        // Converte o timestamp para Date
        const lastUpdateDate = new Date(lastUpdate);
        
        // Verifica se é um novo dia (meia-noite)
        const isNewDay = now.getDate() !== lastUpdateDate.getDate() && isMidnight();
        
        // Se for meia-noite de um novo dia, atualiza os mixes
        if (isNewDay) {
            console.log('É meia-noite! Atualizando mixes...');
            return await generateNewMixes();
        }
        
        return false;
    } catch (error) {
        console.error('Erro ao verificar atualização dos mixes:', error);
        return false;
    }
}

// Handler para a API
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado POST.' });
    }

    try {
        const updated = await checkAndUpdateMixes();
        
        if (updated) {
            return res.status(200).json({ 
                message: 'Mixes atualizados com sucesso.',
                timestamp: Date.now()
            });
        } else {
            return res.status(200).json({ 
                message: 'Mixes já estão atualizados.',
                timestamp: await kv.get('last_mix_update')
            });
        }
    } catch (error) {
        console.error('Erro na API de atualização:', error);
        return res.status(500).json({ 
            message: 'Erro ao atualizar mixes.',
            error: error.message
        });
    }
} 