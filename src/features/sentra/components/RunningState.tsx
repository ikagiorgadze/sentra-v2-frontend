import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function RunningState() {
  const [counts, setCounts] = useState({
    posts: 0,
    sources: 0,
    languages: 0,
    confidence: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        posts: Math.min(prev.posts + Math.floor(Math.random() * 150), 2847),
        sources: Math.min(prev.sources + Math.floor(Math.random() * 5), 42),
        languages: Math.min(prev.languages + 1, 7),
        confidence: Math.min(prev.confidence + Math.floor(Math.random() * 5), 94),
      }));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#3FD6D0]" />
          <span className="text-sm">Collecting public discourse {'->'} analyzing {'->'} generating briefing</span>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="font-mono text-2xl text-[#3FD6D0]">{counts.posts.toLocaleString()}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Posts Collected</div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-2xl text-[#3FD6D0]">{counts.sources}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Sources Discovered</div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-2xl text-[#3FD6D0]">{counts.languages}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Languages Detected</div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-2xl text-[#3FD6D0]">{counts.confidence}%</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Confidence Estimate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
