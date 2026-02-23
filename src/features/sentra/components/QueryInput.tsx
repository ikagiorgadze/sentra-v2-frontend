import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
}

export function QueryInput({ onSubmit }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    timeRange: '7d',
    country: 'AUTO',
    sources: 'AUTO',
    domain: 'AUTO',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  const examplePrompts = [
    'Sentiment about [candidate] in Poland last 7 days',
    'Narrative shift around pension reform in Romania',
    'Public reaction to [brand] outage in Czechia',
    'Detect coordinated attacks against [topic]',
  ];

  const filterOptions = {
    timeRange: ['24h', '7d', '30d', '90d'],
    country: ['AUTO', 'Poland', 'Romania', 'Czechia', 'Hungary'],
    sources: ['AUTO', 'Social', 'News', 'Forums'],
    domain: ['AUTO', 'Politics', 'Brand', 'Banking'],
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-3 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#3FD6D0]" />
            <span className="text-sm uppercase tracking-wider text-muted-foreground">Sentra Intelligence</span>
          </div>
          <h1 className="text-4xl tracking-tight" style={{ fontWeight: 400 }}>
            Where Signals Become Strategy
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              aria-label="Query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={examplePrompts[Math.floor(Math.random() * examplePrompts.length)]}
              className="w-full rounded-lg border border-border bg-card py-5 pl-12 pr-4 transition-all focus:outline-none focus:ring-1 focus:ring-[#3FD6D0]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="relative">
                <select
                  value={selectedFilters[key as keyof typeof selectedFilters]}
                  onChange={(event) => setSelectedFilters({ ...selectedFilters, [key]: event.target.value })}
                  className="cursor-pointer appearance-none rounded border border-border bg-card px-3 py-1.5 pr-8 text-sm transition-colors hover:border-[#3FD6D0]"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {key === 'timeRange' ? `Last ${option}` : option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </form>

        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Example queries:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setQuery(prompt)}
                className="rounded border border-border/50 bg-card/50 px-3 py-1.5 text-xs transition-colors hover:border-border hover:bg-card"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
