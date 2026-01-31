import fs from 'fs';
import path from 'path';
import { Subscription } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'subscriptions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

export function getSubscriptions(): Subscription[] {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export function saveSubscription(subscription: Subscription) {
    const subs = getSubscriptions();
    subs.push(subscription);
    fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
}

export function updateSubscription(id: string, updates: Partial<Subscription>) {
    const subs = getSubscriptions();
    const index = subs.findIndex(s => s.id === id);
    if (index !== -1) {
        subs[index] = { ...subs[index], ...updates };
        fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
    }
}

export function removeSubscription(id: string) {
    const subs = getSubscriptions();
    const newSubs = subs.filter(s => s.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(newSubs, null, 2));
}
