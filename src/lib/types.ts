export interface FeedItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    guid?: string;
}

export interface Subscription {
    id: string;
    name: string;
    url: string;
    type: 'rss' | 'youtube';
    translate?: boolean;
    lastChecked?: string;
    lastNotifiedGuid?: string; // To avoid duplicate notifications
}

export interface NotificationConfig {
    telegramBotToken?: string;
    telegramChatId?: string;
}
