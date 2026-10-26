import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { nome, data_turno, turno_texto } = req.body;
        try {
            // Remove escala anterior do funcionário neste dia para evitar duplicados
            await sql`
                DELETE FROM escala_turnos WHERE nome = ${nome} AND data_turno = ${data_turno};
            `;
            
            if (turno_texto && turno_texto.trim() !== '' && turno_texto !== 'OFF') {
                await sql`
                    INSERT INTO escala_turnos (nome, data_turno, turno_texto)
                    VALUES (${nome}, ${data_turno}, ${turno_texto});
                `;
            }
            return res.status(200).json({ mensagem: "Escala guardada com sucesso!" });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    } 
    
    if (req.method === 'GET') {
        try {
            const { rows } = await sql`
                SELECT * FROM escala_turnos 
                ORDER BY data_turno ASC;
            `;
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await sql`DELETE FROM escala_turnos WHERE id = ${id};`;
            return res.status(200).json({ mensagem: "Escala apagada com sucesso!" });
        } catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}