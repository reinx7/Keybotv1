const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.use(express.json());

// Armazena os clientes (sub-bots) por userId
const clients = {};

app.post('/start-bot', async (req, res) => {
  const { token, userId, durationMinutes } = req.body;

  if (!token || !userId) {
    return res.status(400).json({ error: 'Token ou userId faltando' });
  }

  if (clients[userId]) {
    return res.json({ status: 'already running' });
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.once('ready', () => {
    console.log(`Bot ${client.user.tag} ONLINE para user ${userId}`);
  });

  client.on('error', (err) => {
    console.error(`Erro no bot ${userId}:`, err);
  });

  try {
    await client.login(token);
    clients[userId] = client;

    // Expira automaticamente
    setTimeout(() => {
      client.destroy();
      delete clients[userId];
      console.log(`Bot do user ${userId} expirado após ${durationMinutes} minutos`);
    }, durationMinutes * 60 * 1000);

    res.json({ status: 'started', message: `Bot iniciado com sucesso!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('KeyBot Hub - Online');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Hub rodando na porta ${port}`);
});
