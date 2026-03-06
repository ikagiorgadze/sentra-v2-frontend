export interface RequestGeographyInput {
  region: string;
  country?: string;
  subregions?: string[];
}

export interface RequestTimeframeInput {
  preset: 'Last 24 hours' | 'Last 7 days' | 'Last 30 days' | 'Custom range';
  start_date?: string;
  end_date?: string;
}

export interface RequestQueryInput {
  primary_entity: string;
  objectives: string[];
  geography: RequestGeographyInput;
  timeframe: RequestTimeframeInput;
  keywords: string[];
  competitors?: string[];
  key_question?: string;
}

function resolveLocation(geography: RequestGeographyInput): string {
  const country = String(geography.country ?? '').trim();
  if (country) {
    return country;
  }
  return String(geography.region || 'global').trim() || 'global';
}

function resolveTimeframe(timeframe: RequestTimeframeInput): string {
  if (timeframe.preset !== 'Custom range') {
    return timeframe.preset.toLowerCase();
  }

  const start = String(timeframe.start_date ?? '').trim();
  const end = String(timeframe.end_date ?? '').trim();
  if (start && end) {
    return `${start} to ${end}`;
  }
  return 'custom range';
}

export function buildRequestQuery(input: RequestQueryInput): string {
  const entity = input.primary_entity.trim() || 'target entity';
  const objective = (input.objectives[0] || 'Monitoring objective').trim();
  const location = resolveLocation(input.geography);
  const timeframe = resolveTimeframe(input.timeframe);
  const keywords = input.keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 8);
  const competitors = (input.competitors ?? []).map((entry) => entry.trim()).filter(Boolean).slice(0, 5);
  const keyQuestion = String(input.key_question ?? '').trim();

  const parts = [`${objective} for ${entity} in ${location} over ${timeframe}`];
  if (keywords.length > 0) {
    parts.push(`keywords: ${keywords.join(', ')}`);
  }
  if (competitors.length > 0) {
    parts.push(`competitors: ${competitors.join(', ')}`);
  }
  if (keyQuestion) {
    parts.push(`question: ${keyQuestion}`);
  }

  return parts.join('. ');
}
