import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { nome, evento, hora_local, data_completa, resumo } = req.body;
        
        try {
            await sql`
                INSERT INTO registros_ponto (nome, evento, hora_local, data_completa, resumo)
                VALUES (${nome}, ${evento}, ${hora_local}, ${data_completa}, ${resumo});
            `;
            return res.status(200).json({ mensagem: "Registo guardado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    } 
    
    if (req.method === 'GET') {
        try {
            const { rows } = await sql`
                SELECT * FROM registros_ponto 
                ORDER BY data_completa DESC 
                LIMIT 100;
            `;
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}