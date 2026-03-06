import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getFormRequest } from '@/features/sentra/api/formRequests';
import { getJob, type JobRecord } from '@/features/sentra/api/jobs';
import type { FormRequestRecord } from '@/features/sentra/types/formRequest';

export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<FormRequestRecord | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolvedRequestId = String(requestId ?? '').trim();
    if (!resolvedRequestId) {
      setError('Request ID is missing.');
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadedRequest = await getFormRequest(resolvedRequestId);
        if (isCancelled) {
          return;
        }
        setRequest(loadedRequest);

        const linkedJobId = String(loadedRequest.job_id ?? '').trim();
        if (linkedJobId) {
          try {
            const linkedJob = await getJob(linkedJobId);
            if (!isCancelled) {
              setJob(linkedJob);
            }
          } catch {
            if (!isCancelled) {
              setJob(null);
            }
          }
        } else if (!isCancelled) {
          setJob(null);
        }
      } catch (caught) {
        if (!isCancelled) {
          const message = caught instanceof Error ? caught.message : 'Could not load request detail.';
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
  }, [requestId]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Request Details</h1>
          <p className="text-sm text-muted-foreground">Request payload snapshot and linked job status.</p>
        </header>

        {isLoading && <p className="text-sm text-muted-foreground">Loading request...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!isLoading && !error && request && (
          <section className="space-y-4 rounded border border-border bg-card p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Query</p>
              <p className="mt-1 text-sm">{request.query}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Request Status</p>
                <p className="mt-1 text-sm">{request.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Linked Job Status</p>
                <p className="mt-1 text-sm">{job?.status ?? 'unavailable'}</p>
              </div>
            </div>

            {request.job_id && (
              <Link
                to="/chat"
                className="inline-flex rounded border border-border px-3 py-1.5 text-sm transition-colors hover:border-[#3FD6D0]"
              >
                Open Analysis Document
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
