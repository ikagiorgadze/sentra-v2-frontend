import { Loader2 } from 'lucide-react';

import type { JobProgressSnapshot } from '@/features/sentra/types/conversation';

interface JobProgressCardProps {
  statusLabel: string;
  stageLabel?: string | null;
  warningMessage?: string | null;
  errorMessage?: string | null;
  canRetry?: boolean;
  progress?: JobProgressSnapshot | null;
  onTryAgain?: () => Promise<void> | void;
  isRetrying?: boolean;
}

function formatLabel(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    return fallback;
  }
  return normalized;
}

function asCounter(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

function formatOverallCounters(progress: JobProgressSnapshot | null | undefined): string | null {
  if (!progress?.overall) {
    return null;
  }
  const done = asCounter(progress.overall.stages_completed);
  const total = asCounter(progress.overall.stages_total);
  if (done === null || total === null || total <= 0) {
    return null;
  }
  return `Overall: ${done}/${total} stages`;
}

function formatCurrentStageCounters(progress: JobProgressSnapshot | null | undefined): string | null {
  const overall = progress?.overall;
  const stages = progress?.stages;
  if (!overall || !stages) {
    return null;
  }
  const rawStageCode = overall.current_stage_code;
  if (typeof rawStageCode !== 'string') {
    return null;
  }
  const stageCode = rawStageCode.trim().toLowerCase();
  if (!stageCode) {
    return null;
  }
  const stageProgress = stages[stageCode];
  if (!stageProgress) {
    return null;
  }

  if (stageCode === 'sentiment') {
    const postsDone = asCounter(stageProgress.posts_done);
    const postsTotal = asCounter(stageProgress.posts_total);
    const commentsDone = asCounter(stageProgress.comments_done);
    const commentsTotal = asCounter(stageProgress.comments_total);
    if (postsDone !== null && postsTotal !== null && commentsDone !== null && commentsTotal !== null) {
      return `Sentiment: posts ${postsDone}/${postsTotal}, comments ${commentsDone}/${commentsTotal}`;
    }
  }

  if (stageCode === 'topics') {
    const itemsDone = asCounter(stageProgress.items_done);
    const itemsTotal = asCounter(stageProgress.items_total);
    const clustersDone = asCounter(stageProgress.clusters_labeled);
    const clustersTotal = asCounter(stageProgress.clusters_total);
    if (itemsDone !== null && itemsTotal !== null && clustersDone !== null && clustersTotal !== null) {
      return `Topics: items ${itemsDone}/${itemsTotal}, clusters ${clustersDone}/${clustersTotal}`;
    }
  }

  if (stageCode === 'analytics') {
    const stepsDone = asCounter(stageProgress.steps_done);
    const stepsTotal = asCounter(stageProgress.steps_total);
    if (stepsDone !== null && stepsTotal !== null) {
      return `Analytics: steps ${stepsDone}/${stepsTotal}`;
    }
  }

  return null;
}

export function JobProgressCard({
  statusLabel,
  stageLabel = null,
  warningMessage = null,
  errorMessage = null,
  canRetry = false,
  progress = null,
  onTryAgain,
  isRetrying = false,
}: JobProgressCardProps) {
  const status = formatLabel(statusLabel, 'running').replaceAll('_', ' ');
  const stage = formatLabel(stageLabel, status).replaceAll('_', ' ');
  const isTerminalFailure = status.toLowerCase() === 'failed';
  const isBusy = status.toLowerCase() === 'queued' || status.toLowerCase() === 'running';
  const overallCounters = formatOverallCounters(progress);
  const stageCounters = formatCurrentStageCounters(progress);

  return (
    <div className="mr-auto max-w-[80%]">
      <div className="space-y-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin text-[#3FD6D0]" /> : null}
          <span>Status: {stage}</span>
        </div>
        {overallCounters ? <p className="text-xs text-muted-foreground">{overallCounters}</p> : null}
        {stageCounters ? <p className="text-xs text-muted-foreground">{stageCounters}</p> : null}
        {warningMessage ? <p className="text-xs text-[#FFC043]">{warningMessage}</p> : null}
        {errorMessage ? <p className="text-xs text-[#FF7F7F]">{errorMessage}</p> : null}
        {isTerminalFailure && canRetry && onTryAgain ? (
          <button
            type="button"
            onClick={() => void onTryAgain()}
            disabled={isRetrying}
            className="rounded bg-[#3FD6D0] px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-[#72E4DF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRetrying ? 'Preparing...' : 'Try again'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
