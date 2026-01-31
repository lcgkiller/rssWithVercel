import TelegramBot from 'node-telegram-bot-api';
import { FeedItem } from './types';

// Initialize bot lazily to avoid issues during build time if env vars are missing
let bot: TelegramBot | null = null;

export function initBot(token: string) {
    if (!bot && token) {
        bot = new TelegramBot(token, { polling: false }); // We only send messages, we don't poll
    }
}

export async function sendNotification(chatId: string, item: FeedItem, sourceName: string) {
    if (!bot) {
        console.warn('Telegram bot not initialized');
        return;
    }

    const message = `
📢 *New Update from ${sourceName}*

*${item.title}*

${item.contentSnippet ? item.contentSnippet.substring(0, 100) + '...' : ''}

[Read More](${item.link})
  `.trim();

    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}
