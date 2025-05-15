import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Verifica se os mixes precisam ser atualizados
        const timestamp = await kv.get('mixes_timestamp');
        const currentTime = Date.now();
        
        // Se não houver timestamp ou se passou mais de 24 horas
        if (!timestamp || (currentTime - timestamp) > 24 * 60 * 60 * 1000) {
            // Atualiza o timestamp
            await kv.set('mixes_timestamp', currentTime);
            
            return res.status(200).json({
                message: 'Mixes atualizados com sucesso',
                timestamp: currentTime
            });
        }
        
        return res.status(200).json({
            message: 'Mixes já estão atualizados',
            timestamp: timestamp
        });
    } catch (error) {
        console.error('Erro ao verificar mixes:', error);
        return res.status(500).json({
            message: 'Erro ao verificar mixes',
            error: error.message
        });
    }
} 