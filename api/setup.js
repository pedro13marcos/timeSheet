import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        // Instrução SQL para criar a tabela caso ela não exista
        await sql`
            CREATE TABLE IF NOT EXISTS registros_ponto (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(50) NOT NULL,
                evento VARCHAR(20) NOT NULL,
                hora_local VARCHAR(20) NOT NULL,
                data_completa TIMESTAMPTZ NOT NULL,
                resumo VARCHAR(100)
            );
        `;
        
        return res.status(200).json({ mensagem: "Tabela de ponto criada com sucesso!" });
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}