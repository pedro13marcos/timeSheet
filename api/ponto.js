import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        // Garante que a tabela existe com o campo deleted_at
        await sql`
            CREATE TABLE IF NOT EXISTS ponto (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                evento VARCHAR(50) NOT NULL,
                hora_local VARCHAR(50) NOT NULL,
                data_completa TIMESTAMP NOT NULL,
                resumo VARCHAR(255),
                deleted_at TIMESTAMP DEFAULT NULL
            );
        `;

        // Tenta adicionar a coluna deleted_at caso a tabela já existisse anteriormente sem ela
        try {
            await sql`ALTER TABLE ponto ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;`;
        } catch (e) {
            // Coluna já existente
        }

        if (req.method === 'GET') {
            const ativos = await sql`SELECT * FROM ponto WHERE deleted_at IS NULL ORDER BY data_completa DESC;`;
            const excluidos = await sql`SELECT * FROM ponto WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC;`;
            return res.status(200).json({ ativos: ativos.rows, excluidos: excluidos.rows });
        }

        if (req.method === 'POST') {
            const { nome, evento, hora_local, data_completa, resumo } = req.body;
            await sql`
                INSERT INTO ponto (nome, evento, hora_local, data_completa, resumo)
                VALUES (${nome}, ${evento}, ${hora_local}, ${data_completa}, ${resumo});
            `;
            return res.status(200).json({ sucesso: true });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ erro: 'ID não fornecido' });

            await sql`
                UPDATE ponto 
                SET deleted_at = NOW() 
                WHERE id = ${id};
            `;
            return res.status(200).json({ sucesso: true });
        }

        return res.status(405).json({ erro: 'Method not allowed' });
    } catch (error) {
        console.error("Erro na API de ponto:", error);
        return res.status(500).json({ erro: error.message });
    }
}