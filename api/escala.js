// api/escala.js
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

// Configuração das chaves VAPID (certifique-se de adicioná-las nas variáveis de ambiente da Vercel)
webpush.setVapidDetails(
  'mailto:pedromarcos212@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS escalas (
          id SERIAL PRIMARY KEY,
          nome TEXT NOT NULL,
          data_turno DATE NOT NULL,
          turno_texto TEXT NOT NULL,
          UNIQUE(nome, data_turno)
        );
      `;
      const { rows } = await sql`SELECT * FROM escalas;`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome, data_turno, turno_texto } = req.body;

      // Verifica se já existiam registros salvos para esta data/semana antes da alteração
      const { rows: existingRows } = await sql`SELECT * FROM escalas WHERE data_turno = ${data_turno};`;
      const jaExistia = existingRows.length > 0;

      // Salva ou atualiza o turno no banco
      await sql`
        INSERT INTO escalas (nome, data_turno, turno_texto)
        VALUES (${nome}, ${data_turno}, ${turno_texto})
        ON CONFLICT (nome, data_turno) DO UPDATE SET turno_texto = ${turno_texto};
      `;

      // Prepara a mensagem da notificação com base na regra solicitada
      const mensagemTitulo = "Atualização de Escala (Roster)";
      const mensagemTexto = jaExistia 
        ? `O roster da semana começando em ${data_turno} foi alterado.` 
        : `O roster da semana começando em ${data_turno} já está disponível.`;

      // Busca todas as inscrições push ativas no banco de dados
      const { rows: subs } = await sql`SELECT * FROM push_subscriptions;`;

      const payload = JSON.stringify({ title: mensagemTitulo, body: mensagemTexto });

      // Dispara a notificação para todos os dispositivos inscritos em segundo plano
      subs.forEach(sub => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        };
        webpush.sendNotification(pushSub, payload).catch(async (err) => {
          // Se a assinatura expirar ou for cancelada, removemos do banco
          if (err.statusCode === 410 || err.statusCode === 404) {
            await sql`DELETE FROM subscriptions WHERE endpoint = ${sub.endpoint};`;
          } else {
            console.error("Erro ao enviar notificação push:", err);
          }
        });
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro no salvamento da escala:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}