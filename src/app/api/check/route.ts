import { NextResponse } from 'next/server';
import { getSubscriptions, updateSubscription } from '@/lib/storage';
import { fetchFeed } from '@/lib/feed-service';
import { sendNotification, initBot } from '@/lib/notifier';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const CRON_SECRET = process.env.CRON_SECRET;

initBot(TELEGRAM_TOKEN);

async function checkFeeds(isCron = false) {
    const subscriptions = getSubscriptions();
    const results = [];
    const now = new Date();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    for (const sub of subscriptions) {
        const items = await fetchFeed(sub.url);
        const sortedItems = items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        if (sortedItems.length > 0) {
            const latestItem = sortedItems[0];
            const itemDate = new Date(latestItem.pubDate);

            let shouldNotify = false;

            // Logic:
            // 1. If we have a stored lastNotifiedGuid, checks against it.
            // 2. If NO stored state, check if item is from last 24h.

            const hasStoredState = !!sub.lastNotifiedGuid;
            const isNewByGuid = latestItem.guid !== sub.lastNotifiedGuid;
            const isRecent = (now.getTime() - itemDate.getTime()) < ONE_DAY_MS;

            if (hasStoredState) {
                if (isNewByGuid) shouldNotify = true;
            } else {
                // Stateless mode
                if (isRecent) shouldNotify = true;
            }

            if (shouldNotify) {
                if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
                    await sendNotification(TELEGRAM_CHAT_ID, latestItem, sub.name, sub.translate);
                }

                updateSubscription(sub.id, {
                    lastChecked: now.toISOString(),
                    lastNotifiedGuid: latestItem.guid
                });

                results.push({ name: sub.name, newItem: latestItem.title });
            }
        }
    }
    return results;
}

export async function POST() {
    const newItems = await checkFeeds(false);
    return NextResponse.json({ success: true, newItems });
}

export async function GET(request: Request) {
    // Secure Cron Job
    if (CRON_SECRET) {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    const newItems = await checkFeeds(true);
    return NextResponse.json({ success: true, newItems });
}
