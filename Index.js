const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.use(express.json());

// Permite CORS para o Lovable poder chamar (importante!)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Armazena os clientes (sub-bots) por userId
const clients = {};

app.post('/start-bot', async (req, res) => {
  const { token, userId, durationMinutes } = req.body;

  if (!token || !userId || !durationMinutes) {
    return res.status(400).json({ error: 'Token, userId ou durationMinutes faltando' });
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

// Inicia o servidor sem crashar (mesmo sem token fixo)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Hub rodando na porta ${port} - aguardando POSTs em /start-bot`);
});
