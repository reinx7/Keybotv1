# KeyBot Hub

Servidor que inicia bots Discord reais via POST do site KeyBot.

## Como funciona

- O frontend (Lovable) envia POST para /start-bot com token do usuário.
- O Render inicia um bot separado por userId.
- O bot fica online até o tempo expirar (durationMinutes).
- Logs reais no Render.

## Deploy no Render

1. Conecte esse repo no Render
2. Build Command: yarn install ou npm install
3. Start Command: npm start
4. Environment Variables: não precisa (token vem via POST)

## Teste

POST https://keybotv1.onrender.com/start-bot

Body:
{
  "token": "token-do-usuario",
  "userId": "user123",
  "durationMinutes": 5
}
