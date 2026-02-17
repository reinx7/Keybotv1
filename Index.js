// index.js - KeyBot Hub (servidor que inicia bots Discord via POST do site Lovable)
// Hospedado no Render.com - URL: https://keybotv1.onrender.com

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.use(express.json());

// CORS completo para permitir chamadas do Lovable (frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Armazena os bots ativos por userId
const clients = {};

app.post('/start-bot', async (req, res) => {
  const { token, userId, durationMinutes } = req.body;

  console.log(`[POST /start-bot] Requisição recebida de ${userId} | Duração: ${durationMinutes} min`);

  if (!token || !userId || !durationMinutes) {
    console.log('[ERRO] Campos faltando:', { token: !!token, userId: !!userId, durationMinutes: !!durationMinutes });
    return res.status(400).json({ error: 'Token, userId ou durationMinutes faltando' });
  }

  if (clients[userId]) {
    console.log(`[INFO] Bot já rodando para ${userId}`);
    return res.json({ status: 'already running', message: 'Bot já está rodando' });
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.once('ready', () => {
    console.log(`[SUCCESS] Bot ${client.user.tag} ONLINE para user ${userId}`);
  });

  client.on('error', (err) => {
    console.error(`[ERROR] Bot ${userId}:`, err.message);
  });

  try {
    await client.login(token);
    clients[userId] = client;

    console.log(`[INFO] Bot iniciado com sucesso para ${userId}. Expira em ${durationMinutes} minutos`);

    // Expira automaticamente
    setTimeout(() => {
      client.destroy();
      delete clients[userId];
      console.log(`[EXPIRED] Bot do user ${userId} expirado após ${durationMinutes} minutos`);
    }, durationMinutes * 60 * 1000);

    res.json({ status: 'started', message: 'Bot iniciado com sucesso!' });
  } catch (err) {
    console.error(`[ERROR] Falha ao iniciar bot para ${userId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('KeyBot Hub - Online');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[START] KeyBot Hub rodando na porta ${port} - aguardando POSTs em /start-bot`);
});
