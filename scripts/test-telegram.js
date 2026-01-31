require('dotenv').config({ path: '.env.local' });
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('Testing Telegram Bot...');
console.log('Token exists:', !!token);
console.log('ChatID:', chatId);

if (!token || !chatId) {
    console.error('ERROR: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.local');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

bot.sendMessage(chatId, '🔔 Test Notification from Build Agent\nIf you see this, your configuration is correct!')
    .then(() => {
        console.log('✅ Success! Message sent.');
    })
    .catch((err) => {
        console.error('❌ Failed to send message:', err.message);
        if (err.response && err.response.body) {
            console.error('Response:', err.response.body);
        }
    });
