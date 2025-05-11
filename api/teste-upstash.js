import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    console.log("Iniciando Teste Isolado do Upstash...");

    // Tenta escrever um valor
    const setResult = await kv.set('teste-isolado', 'funciona!');
    console.log("Resultado do Set:", setResult);

    // Tenta ler o valor escrito
    const getResult = await kv.get('teste-isolado');
    console.log("Resultado do Get:", getResult);

    // Responde com sucesso se tudo funcionar
    res.status(200).json({
      message: "Teste isolado do Upstash bem-sucedido!",
      setResult: setResult,
      getResult: getResult,
    });
  } catch (erro) {
    // Captura e registra qualquer erro
    console.error("Erro no Teste Isolado do Upstash:", erro);
    res.status(500).json({
      message: "Teste isolado do Upstash falhou!",
      erro: erro.message,
    });
  }
}
