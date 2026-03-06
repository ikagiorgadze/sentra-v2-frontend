import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listFormRequests } from '@/features/sentra/api/formRequests';
import type { FormRequestRecord } from '@/features/sentra/types/formRequest';

function formatTimestamp(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return new Date(parsed).toISOString().replace('T', ' ').replace('Z', ' UTC');
}

export function RequestHistoryPage() {
  const [items, setItems] = useState<FormRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const records = await listFormRequests();
        if (!isCancelled) {
          setItems(records);
        }
      } catch (caught) {
        if (!isCancelled) {
          const message = caught instanceof Error ? caught.message : 'Could not load form requests.';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Form Requests</h1>
          <p className="text-sm text-muted-foreground">History of jobs created through the structured request form.</p>
        </header>

        {isLoading && <p className="text-sm text-muted-foreground">Loading requests...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!isLoading && !error && items.length === 0 && (
          <p className="rounded border border-border bg-card p-4 text-sm text-muted-foreground">
            No form requests yet.
          </p>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/request-history/${item.id}`}
                className="block rounded border border-border bg-card p-4 transition-colors hover:border-[#3FD6D0]"
              >
                <p className="text-sm font-medium">{item.query}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.status} · {formatTimestamp(item.updated_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
