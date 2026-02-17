// bot.js - KeyBot Discord Bot (hospedado no Render.com)
const { Client, GatewayIntentBits } = require('discord.js');

// Token é passado via variável de ambiente (seguro, não fica no código)
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error('ERRO: Token não encontrado. Defina a variável TOKEN no Render.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ BOT ONLINE - ${client.user.tag}`);
  console.log(`Conectado a ${client.guilds.cache.size} servidor(es)`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  // Exemplo de comando simples (pode adicionar mais depois)
  if (message.content.toLowerCase() === '!ping') {
    message.reply('Pong! Estou vivo! 🚀');
  }
});

// Inicia o bot
client.login(TOKEN).catch(err => {
  console.error('Erro ao logar:', err);
});
