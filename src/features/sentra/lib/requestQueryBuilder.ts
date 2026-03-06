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
  geography: RequestGeographyInput;
  timeframe: RequestTimeframeInput;
  keywords: string[];
}

export function buildRequestQuery(input: RequestQueryInput): string {
  const primaryEntity = input.primary_entity.trim();
  const keywordTokens = input.keywords.map((entry) => entry.trim()).filter(Boolean);
  return [primaryEntity, ...keywordTokens].filter(Boolean).join(' ');
}
