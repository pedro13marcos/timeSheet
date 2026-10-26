import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
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

        await sql`
            CREATE TABLE IF NOT EXISTS escala_turnos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(50) NOT NULL,
                data_turno DATE NOT NULL,
                turno_texto VARCHAR(50) NOT NULL
            );
        `;
        
        return res.status(200).json({ mensagem: "Tabelas de ponto e escala criadas com sucesso!" });
    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
}