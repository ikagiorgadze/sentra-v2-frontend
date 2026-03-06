import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getFormRequest, getFormRequestAnalysisDocument } from '@/features/sentra/api/formRequests';
import { RequestTemplateAnalysisDocument } from '@/features/sentra/components/requests/RequestTemplateAnalysisDocument';
import type { FormRequestRecord, RequestAnalysisDocumentRecord } from '@/features/sentra/types/formRequest';

export function RequestAnalysisPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [request, setRequest] = useState<FormRequestRecord | null>(null);
  const [analysisDocument, setAnalysisDocument] = useState<RequestAnalysisDocumentRecord | null>(null);
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
        const loaded = await getFormRequest(resolvedRequestId);
        const documentPayload = await getFormRequestAnalysisDocument(resolvedRequestId);
        if (!isCancelled) {
          setRequest(loaded);
          setAnalysisDocument(documentPayload);
        }
      } catch (caught) {
        if (!isCancelled) {
          const message = caught instanceof Error ? caught.message : 'Could not load request analysis.';
          setError(message);
          setRequest(null);
          setAnalysisDocument(null);
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
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Request Analysis Document</h1>
          <p className="text-sm text-muted-foreground">Analysis report generated for the selected request.</p>
          <Link to={`/request-history/${requestId}`} className="inline-flex text-sm text-[#3FD6D0] hover:underline">
            Back to Request Details
          </Link>
        </header>

        {isLoading && <p className="text-sm text-muted-foreground">Loading analysis...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!isLoading && !error && request && analysisDocument && (
          <div className="rounded border border-border bg-card p-3">
            <RequestTemplateAnalysisDocument document={analysisDocument} />
          </div>
        )}
      </div>
    </main>
  );
}
