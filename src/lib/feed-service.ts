import Parser from 'rss-parser';
import { FeedItem } from './types';

const parser = new Parser();

export async function fetchFeed(url: string): Promise<FeedItem[]> {
    try {
        const feed = await parser.parseURL(url);

        return feed.items.map(item => ({
            title: item.title || 'No Title',
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString(),
            contentSnippet: item.contentSnippet,
            guid: item.guid || item.link || item.title // Fallback for ID
        }));
    } catch (error) {
        console.error(`Error fetching feed ${url}:`, error);
        return [];
    }
}
