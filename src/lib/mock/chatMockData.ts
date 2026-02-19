export interface BriefingData {
  query: string;
  executiveSummary: string;
  sentiment: { label: string; value: number; color: string }[];
  trendLine: { day: string; value: number }[];
  narrativeClusters: { label: string; description: string; mentions: number }[];
  entityInsights: { name: string; mentions: number; sentiment: string; influence: number }[];
  riskSignals: { title: string; description: string; severity: "high" | "medium" | "low" }[];
  evidenceTable: { source: string; date: string; snippet: string; sentiment: string; engagement: number }[];
  suggestions: string[];
}

const SOURCES = ["X (Twitter)", "Reddit", "Telegram", "News RSS", "Facebook", "YouTube", "Blog Aggregator", "Government Portal"];
const SENTIMENTS = ["Positive", "Negative", "Neutral", "Mixed"];

function extractKeywords(query: string): { topic: string; region: string; timeframe: string } {
  const regionMatch = query.match(/\b(Poland|Germany|France|UK|US|Ukraine|Italy|Spain|Brazil|India|China|Russia|Japan)\b/i);
  const timeMatch = query.match(/(\d+)\s*(day|week|month)s?/i);
  const region = regionMatch?.[0] || "the region";
  const timeframe = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}${parseInt(timeMatch[1]) > 1 ? "s" : ""}` : "7 days";
  const topic = query
    .replace(/sentiment\s*(about|on|regarding)?/i, "")
    .replace(regionMatch?.[0] || "", "")
    .replace(timeMatch?.[0] || "", "")
    .replace(/\b(last|past|in|the|for)\b/gi, "")
    .trim() || "the topic";
  return { topic, region, timeframe };
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockBriefing(query: string): BriefingData {
  const { topic, region, timeframe } = extractKeywords(query);

  const positive = rand(15, 40);
  const negative = rand(15, 35);
  const mixed = rand(5, 15);
  const neutral = 100 - positive - negative - mixed;

  const days = parseInt(timeframe) || 7;
  const trendLine = Array.from({ length: Math.min(days, 14) }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: rand(20, 80),
  }));

  return {
    query,
    executiveSummary: `Analysis of "${topic}" in ${region} over the last ${timeframe} reveals a predominantly ${positive > negative ? "positive" : "negative"} sentiment landscape. Public discourse is driven by ${rand(3, 6)} major narrative clusters across ${rand(800, 4000).toLocaleString()} mentions sourced from ${rand(4, 8)} platforms. ${positive > negative ? "Favorable" : "Critical"} sentiment accounts for ${Math.max(positive, negative)}% of total volume, with notable amplification detected in social media channels. Key entities show divergent influence patterns, with ${rand(2, 4)} risk signals flagged for further review.`,
    sentiment: [
      { label: "Positive", value: positive, color: "hsl(var(--signal-cyan))" },
      { label: "Neutral", value: neutral, color: "hsl(var(--muted-foreground))" },
      { label: "Negative", value: negative, color: "hsl(var(--severe-red))" },
      { label: "Mixed", value: mixed, color: "hsl(var(--amber))" },
    ],
    trendLine,
    narrativeClusters: [
      { label: "Reform Advocacy", description: `Positive framing of ${topic} as modernization opportunity in ${region}. Emphasis on economic benefits and EU alignment.`, mentions: rand(200, 800) },
      { label: "Opposition Critique", description: `Critical voices questioning implementation timeline and budget allocation. Strong presence on Telegram and fringe media.`, mentions: rand(150, 600) },
      { label: "Grassroots Mobilization", description: `Organic community discussions about local impact. High engagement rates but lower volume.`, mentions: rand(100, 400) },
      { label: "Disinformation Vectors", description: `Coordinated narratives linking ${topic} to conspiracy theories. Bot-like amplification patterns detected.`, mentions: rand(50, 200) },
    ],
    entityInsights: [
      { name: "Government Officials", mentions: rand(300, 900), sentiment: "Mixed", influence: rand(70, 95) },
      { name: "Opposition Leaders", mentions: rand(200, 600), sentiment: "Negative", influence: rand(60, 85) },
      { name: "Industry Groups", mentions: rand(100, 400), sentiment: "Positive", influence: rand(50, 75) },
      { name: "Civil Society Orgs", mentions: rand(80, 300), sentiment: "Positive", influence: rand(40, 70) },
      { name: "Foreign Media", mentions: rand(50, 200), sentiment: "Neutral", influence: rand(30, 60) },
    ],
    riskSignals: [
      { title: "Bot Amplification Detected", description: `Abnormal repost patterns identified across ${rand(3, 8)} accounts targeting ${topic} narratives. Volume spike of ${rand(200, 500)}% above baseline.`, severity: "high" },
      { title: "Coordinated Inauthentic Behavior", description: `Cluster of ${rand(12, 45)} accounts created within 48h showing identical posting patterns and shared media assets.`, severity: "high" },
      { title: "Cross-Platform Narrative Seeding", description: `Identical talking points appearing simultaneously on Telegram, X, and Facebook groups within ${region}.`, severity: "medium" },
    ],
    evidenceTable: Array.from({ length: 8 }, (_, i) => ({
      source: SOURCES[i % SOURCES.length],
      date: `2025-01-${String(rand(8, 18)).padStart(2, "0")}`,
      snippet: [
        `"The ${topic} initiative represents a turning point for ${region}'s future..."`,
        `"Critics warn that ${topic} could destabilize existing frameworks..."`,
        `"Community leaders rally support for ${topic} implementation..."`,
        `"Leaked documents reveal hidden costs associated with ${topic}..."`,
        `"International observers praise ${region}'s approach to ${topic}..."`,
        `"Social media campaigns around ${topic} show unusual coordination..."`,
        `"Economic analysts project significant ROI from ${topic} reforms..."`,
        `"Opposition files formal complaint regarding ${topic} transparency..."`,
      ][i],
      sentiment: SENTIMENTS[i % 4],
      engagement: rand(50, 5000),
    })),
    suggestions: [
      "Compare with opposition narratives",
      "Show bot activity breakdown",
      "Narrow to X (Twitter) only",
      `Extend to 30 days`,
    ],
  };
}
