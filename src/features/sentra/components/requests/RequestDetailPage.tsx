import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getFormRequest } from '@/features/sentra/api/formRequests';
import { getJob, type JobRecord } from '@/features/sentra/api/jobs';
import { JobProgressCard } from '@/features/sentra/components/chat/JobProgressCard';
import type { FormRequestRecord } from '@/features/sentra/types/formRequest';

interface JobProgressState {
  statusLabel: string;
  stageLabel?: string | null;
  warningMessage?: string | null;
  errorMessage?: string | null;
  canRetry?: boolean;
  progress?: JobRecord['progress'];
}

function formatStageLabel(status: string | null | undefined, fallback = 'Running'): string {
  const normalized = status?.trim();
  if (!normalized) {
    return fallback;
  }
  return normalized.replaceAll('_', ' ');
}

function isJobTerminal(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return normalized === 'completed' || normalized === 'failed';
}

export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<FormRequestRecord | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [jobProgress, setJobProgress] = useState<JobProgressState | null>(null);
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
        if (!loadedRequest.job_id) {
          setJob(null);
          setJobProgress(null);
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

  useEffect(() => {
    const linkedJobId = String(request?.job_id ?? '').trim();
    if (!linkedJobId) {
      return undefined;
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let consecutivePollErrors = 0;

    const poll = async () => {
      try {
        const linkedJob = await getJob(linkedJobId);
        if (isCancelled) {
          return;
        }
        setJob(linkedJob);
        setJobProgress({
          statusLabel: linkedJob.status,
          stageLabel: formatStageLabel(linkedJob.stage_label, formatStageLabel(linkedJob.stage_code, linkedJob.status)),
          warningMessage: null,
          errorMessage: linkedJob.error_message?.trim() || null,
          canRetry: false,
          progress: linkedJob.progress ?? null,
        });
        consecutivePollErrors = 0;

        if (isJobTerminal(linkedJob.status)) {
          return;
        }
      } catch {
        if (isCancelled) {
          return;
        }
        consecutivePollErrors += 1;
        if (consecutivePollErrors >= 3) {
          setJobProgress((prev) => {
            if (!prev) {
              return {
                statusLabel: 'running',
                stageLabel: 'Running',
                warningMessage: 'Job status is temporarily unreachable. Retrying...',
                errorMessage: null,
                canRetry: false,
                progress: null,
              };
            }
            return {
              ...prev,
              warningMessage: 'Job status is temporarily unreachable. Retrying...',
            };
          });
          consecutivePollErrors = 0;
        }
      }

      timeoutId = setTimeout(poll, 3000);
    };

    void poll();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [request?.job_id]);

  return (
    <main className="px-4 py-8">
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

            {request.job_id && jobProgress && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Linked Job Progress</p>
                <JobProgressCard
                  statusLabel={jobProgress.statusLabel}
                  stageLabel={jobProgress.stageLabel}
                  warningMessage={jobProgress.warningMessage}
                  errorMessage={jobProgress.errorMessage}
                  canRetry={false}
                  progress={jobProgress.progress ?? null}
                />
              </div>
            )}

            {request.job_id && (
              <Link
                to={`/request-history/${request.id}/analysis`}
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
