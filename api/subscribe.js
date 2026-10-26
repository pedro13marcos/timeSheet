import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const subscription = req.body;
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Inscrição inválida' });
      }

      const endpoint = subscription.endpoint;
      const p256dh = subscription.keys.p256dh;
      const auth = subscription.keys.auth;

      await sql`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id SERIAL PRIMARY KEY,
          endpoint TEXT UNIQUE NOT NULL,
          p256dh TEXT NOT NULL,
          auth TEXT NOT NULL
        );
      `;

      await sql`
        INSERT INTO push_subscriptions (endpoint, p256dh, auth)
        VALUES (${endpoint}, ${p256dh}, ${auth})
        ON CONFLICT (endpoint) DO NOTHING;
      `;

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Erro ao salvar inscrição:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint obrigatório' });
      }

      await sql`
        DELETE FROM push_subscriptions WHERE endpoint = ${endpoint};
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar inscrição:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}