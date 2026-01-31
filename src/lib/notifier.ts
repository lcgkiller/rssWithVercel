import TelegramBot from 'node-telegram-bot-api';
import { translate } from 'google-translate-api-x';
import { FeedItem } from './types';

// Initialize bot lazily to avoid issues during build time if env vars are missing
let bot: TelegramBot | null = null;

export function initBot(token: string) {
    if (!bot && token) {
        bot = new TelegramBot(token, { polling: false }); // We only send messages, we don't poll
    }
}

export async function sendNotification(chatId: string, item: FeedItem, sourceName: string, shouldTranslate: boolean = false) {
    if (!bot) {
        console.warn('Telegram bot not initialized');
        return;
    }

    let title = item.title;
    let content = item.contentSnippet ? item.contentSnippet.substring(0, 100) + '...' : '';
    let translatedTitle = '';
    let translatedContent = '';

    // Translate if explicitly requested or auto-detect non-Korean? 
    // User asked for "channel I intend to translate", implying explicit.
    // But let's keep the logic simple: If shouldTranslate is true, do it. 
    // To match previous "auto" behavior, we should perhaps defaults to false but maybe user wants it.
    // Actually, let's make it: IF shouldTranslate is true, THEN force translate (or auto-detect if env is mixed).

    // Original logic was "Auto-detect".
    // New logic: Only if shouldTranslate == true, then try to translate if not Korean.

    if (shouldTranslate) {
        try {
            const tTitle = await translate(title, { to: 'ko' });
            if (tTitle.from.language.iso !== 'ko') {
                translatedTitle = `\n(번역) ${tTitle.text}`;

                if (content) {
                    const tContent = await translate(content, { to: 'ko' });
                    translatedContent = `\n(번역) ${tContent.text}`;
                }
            }
        } catch (e) {
            console.error('Translation failed', e);
        }
    }

    const message = `
📢 *New Update from ${sourceName}*

*${title}*${translatedTitle}

${content}${translatedContent}

[Read More](${item.link})
  `.trim();

    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}
