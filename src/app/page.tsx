'use client';
import { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  name: string;
  url: string;
  type: string;
  lastChecked?: string;
  lastNotifiedGuid?: string;
}

export default function Home() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    setSubs(data);
  };

  const addSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, url: newUrl, type: 'rss' }),
    });

    setNewName('');
    setNewUrl('');
    fetchSubs();
  };

  const removeSub = async (id: string) => {
    await fetch(`/api/subscriptions?id=${id}`, { method: 'DELETE' });
    fetchSubs();
  };

  const runCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/check', { method: 'POST' });
      const result = await res.json();
      alert(`Check Complete! New Items: ${JSON.stringify(result.newItems)}`);
      fetchSubs();
    } catch (e) {
      alert('Check failed');
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">RSS Notifier</h1>
          <button
            onClick={runCheck}
            disabled={checking}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Check Now'}
          </button>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Subscription</h2>
          <form onSubmit={addSub} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. My Favorite Tech Blog"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RSS / Feed URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Subscriptions ({subs.length})</h2>
          {subs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No subscriptions yet. Add one above!</p>
          ) : (
            <ul className="space-y-4">
              {subs.map((sub) => (
                <li key={sub.id} className="flex justify-between items-start border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{sub.name}</h3>
                    <p className="text-sm text-gray-500 break-all">{sub.url}</p>
                    {sub.lastChecked && (
                      <p className="text-xs text-gray-400 mt-1">Last checked: {new Date(sub.lastChecked).toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSub(sub.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local</p>
        </footer>
      </div>
    </main>
  );
}
