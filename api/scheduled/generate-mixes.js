// api/scheduled/generate-mixes.js

// <-- NOVO: Importa o cliente Vercel KV. Ele usa as variáveis de ambiente configuradas no Passo 1.
import { kv } from '@vercel/kv';

// --- IMPORTS DOS DADOS E HELPERS COMPARTILHADOS ---
// <-- NOVO: Importa as funções helpers e a lista de personagens únicos dos arquivos compartilhados.
// Ajuste os caminhos RELATIVOS de 'api/scheduled/' para a raiz do seu projeto.
// Se 'utils' e 'data' estiverem na raiz, o caminho é '../../'.
import { shuffleArray, getRandomCharacters } from '../../utils/helpers.js'; // Caminho de api/scheduled/ para utils/
import { uniqueCharacters } from '../../data/characterData.js'; // Caminho de api/scheduled/ para data/characterData.js


// <-- REMOVIDO: As definições locais de shuffleArray e getRandomCharacters devem ter sido movidas para o arquivo 'utils/helpers.js'
// <-- REMOVIDO: A definição local de uniqueCharacters (ou a lista completa characters) deve ter sido movida para o arquivo 'data/characterData.js'


export default async function handler(req, res) {
    // A Vercel Scheduled Function envia uma requisição POST
    // É uma boa prática verificar o método por segurança
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado POST.' });
    }

    console.log('--- Executando tarefa agendada: Gerando Mixes Diários ---');

    try {
        // Define o número de personagens por Mix (pode ser 50 como no seu código original)
        const numCharsPerMix = 50;

        // Usa a função importada getRandomCharacters com a lista importada uniqueCharacters
        const mix1Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);
        const mix2Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);
        const mix3Chars = getRandomCharacters(uniqueCharacters, numCharsPerMix);

        // Salva as listas geradas no Vercel KV
        // Usamos chaves claras: 'mix1_characters', 'mix2_characters', 'mix3_characters'
        // Salvamos como JSON stringificado.
        await kv.set('mix1_characters', JSON.stringify(mix1Chars));
        await kv.set('mix2_characters', JSON.stringify(mix2Chars));
        await kv.set('mix3_characters', JSON.stringify(mix3Chars));

        console.log('Mixes Diários gerados e salvos no Vercel KV com sucesso!');
        console.log(`Mix 1: ${mix1Chars.length} personagens`);
        console.log(`Mix 2: ${mix2Chars.length} personagens`);
        console.log(`Mix 3: ${mix3Chars.length} personagens`);


        // Retorna uma resposta de sucesso (status 200) para a Vercel, indicando que a tarefa rodou.
        return res.status(200).json({ message: 'Mixes diários gerados e salvos.' });

    } catch (error) {
        // Em caso de erro na geração ou salvamento
        console.error('!!! ERRO ao gerar ou salvar os Mixes Diários:', error);

        // Retorna uma resposta de erro (status 500)
        return res.status(500).json({ message: 'Falha ao gerar os mixes diários.', error: error.message });
    }
}