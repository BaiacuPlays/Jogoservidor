// api/get-mix-chars.js - Versão Verificada

// Importa o cliente Vercel KV
import { kv } from '@vercel/kv';

import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const redis = await createClient().connect();

export const POST = async () => {
  // Fetch data from Redis
  const result = await redis.get("item");
  
  // Return the result in the response
  return new NextResponse(JSON.stringify({ result }), { status: 200 });
};

export default async function handler(req, res) {
    // Esta função deve responder a requisições GET do front-end
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método Não Permitido. Esperado GET.' });
    }

    // Obtém o nome da categoria desejada ('mix1', 'mix2', 'mix3') dos parâmetros da URL
    // Exemplo de URL: /api/get-mix-chars?category=mix1
    const category = req.query.category;

    // Valida se a categoria foi fornecida e é uma das esperadas
    if (!category || !['mix1', 'mix2', 'mix3'].includes(category)) {
        return res.status(400).json({ message: 'Parâmetro "category" inválido ou ausente. Use mix1, mix2 ou mix3.' });
    }

    console.log(`--- Requisição recebida para Mix: ${category} ---`);

    try {
        // Busca a lista salva no Vercel KV pela chave correspondente
        // O Vercel KV SDK (@vercel/kv) automaticamente tenta desserializar JSON
        const characters = await kv.get(`${category}_characters`);

        // Verifica se encontrou dados (pode não encontrar na primeira vez antes do cron rodar)
        if (characters === null) {
             console.warn(`!!! Dados não encontrados no KV para a chave: ${category}_characters. Talvez o Cron Job ainda não tenha rodado ou a chave expirou.`);
             // Retorna 404 se os dados não existirem no KV
             return res.status(404).json({ message: `Lista de personagens para ${category} não encontrada. Tente novamente mais tarde.` });
        }

        // Se encontrou, retorna a lista de personagens como JSON
        console.log(`Dados encontrados para ${category}. Retornando ${Array.isArray(characters) ? characters.length : '???'} personagens.`);
        return res.status(200).json(characters); // O SDK já retornou o array/objeto parsed

    } catch (error) {
        // Em caso de erro na busca do KV (ex: problema de conexão, variáveis de ambiente incorretas no deploy)
        console.error(`!!! ERRO ao buscar dados no KV para ${category}:`, error);
        // Retorna 500 em caso de erro interno do servidor
        return res.status(500).json({ message: 'Falha ao buscar personagens do Mix.', error: error.message });
    }
}