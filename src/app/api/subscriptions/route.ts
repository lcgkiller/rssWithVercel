import { NextResponse } from 'next/server';
import { getSubscriptions, saveSubscription, removeSubscription } from '@/lib/storage';
import { Subscription } from '@/lib/types';

export async function GET() {
    const subs = getSubscriptions();
    return NextResponse.json(subs);
}

export async function POST(request: Request) {
    const body = await request.json();
    const newSub: Subscription = {
        id: Date.now().toString(),
        name: body.name.trim(),
        url: body.url.trim(),
        type: body.type || 'rss',
        translate: body.translate || false,
        lastChecked: undefined
    };

    saveSubscription(newSub);
    return NextResponse.json(newSub);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        removeSubscription(id);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
}
