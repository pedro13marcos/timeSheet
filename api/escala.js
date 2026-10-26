import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        // 1. Cria a tabela automaticamente se ela não existir, 
        // definindo 'nome' e 'data_turno' como chave única conjunta.
        await sql`
            CREATE TABLE IF NOT EXISTS escala_turnos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                data_turno DATE NOT NULL,
                turno_texto VARCHAR(50) NOT NULL,
                CONSTRAINT unique_funcionario_data UNIQUE (nome, data_turno)
            );
        `;

        // 2. Lógica para buscar todas as escalas (GET)
        if (req.method === 'GET') {
            const { rows } = await sql`SELECT * FROM escala_turnos`;
            return res.status(200).json(rows);
        } 
        
        // 3. Lógica para salvar ou atualizar a escala (POST)
        if (req.method === 'POST') {
            const { nome, data_turno, turno_texto } = req.body;
            
            // O "ON CONFLICT" resolve o problema de edição: 
            // Se já existir registo para este funcionário nesta data, ele atualiza (UPDATE).
            await sql`
                INSERT INTO escala_turnos (nome, data_turno, turno_texto) 
                VALUES (${nome}, ${data_turno}, ${turno_texto})
                ON CONFLICT (nome, data_turno) 
                DO UPDATE SET turno_texto = EXCLUDED.turno_texto;
            `;
            
            return res.status(200).json({ sucesso: true });
        }

        return res.status(405).json({ erro: 'Método não permitido' });

    } catch (error) {
        console.error("Erro na API de escala:", error);
        return res.status(500).json({ erro: error.message });
    }
}