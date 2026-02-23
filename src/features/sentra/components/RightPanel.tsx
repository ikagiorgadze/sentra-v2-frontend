import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function RightPanel() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`flex h-screen border-l border-border bg-card transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
      <button
        type="button"
        aria-label="Toggle filters panel"
        onClick={() => setIsCollapsed((value) => !value)}
        className="flex w-12 items-center justify-center border-r border-border transition-colors hover:bg-muted/20"
      >
        {isCollapsed ? (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {!isCollapsed && (
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Advanced Filters</div>

            <div className="space-y-2">
              <label className="text-xs text-foreground">Source Types</label>
              <div className="space-y-1.5">
                {['Social Media', 'News Sites', 'Forums', 'Blogs', 'Official'].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-border text-[#3FD6D0] focus:ring-[#3FD6D0]"
                    />
                    <span className="text-muted-foreground">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-foreground">Min Confidence</label>
              <input type="range" min="0" max="100" defaultValue="70" className="w-full accent-[#3FD6D0]" />
              <div className="font-mono text-xs text-muted-foreground">70%</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-foreground">Account Age Filter</label>
              <select className="w-full rounded border border-border bg-background px-3 py-2 text-sm">
                <option>All accounts</option>
                <option>30+ days only</option>
                <option>90+ days only</option>
                <option>1 year+ only</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Methodology</div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <div className="mb-1 text-xs text-foreground">Data Collection</div>
                <div className="text-xs leading-relaxed">
                  Multi-source aggregation across social platforms, news sites, and public forums using REST and
                  streaming APIs.
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-foreground">Sentiment Analysis</div>
                <div className="text-xs leading-relaxed">
                  Transformer-based NLP models fine-tuned on regional language patterns and context-aware sentiment
                  scoring.
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-foreground">Narrative Detection</div>
                <div className="text-xs leading-relaxed">
                  Clustering algorithms identify thematic groups based on semantic similarity and co-occurrence patterns.
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-foreground">Anomaly Detection</div>
                <div className="text-xs leading-relaxed">
                  Statistical deviation analysis and behavioral pattern recognition to flag coordinated activity.
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <button
              type="button"
              className="w-full rounded border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-[#3FD6D0]"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
