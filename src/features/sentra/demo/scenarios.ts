import type { DemoScenario } from '@/features/sentra/demo/types';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'iphone-rival-campaign',
    name: 'Retail Rival Campaign',
    description: 'Local tech shop tracks a rival iPhone marketing campaign in Tbilisi.',
    tokenDelayMs: 24,
    stepDelayMs: 400,
    script: [
      { type: 'user_message', content: 'I have a tech shop in Tbilisi and my rival is outselling iPhones.' },
      {
        type: 'assistant_stream',
        content:
          'Understood. I can help monitor the rival\'s iPhone campaign. Please confirm rival name and timeframe before I draft the monitoring query.',
      },
      { type: 'user_message', content: 'The shop is iPhoneShopTbilisi and I want Facebook for the last month.' },
      {
        type: 'assistant_stream',
        content:
          'Great. I drafted a query for Facebook campaign monitoring in Georgia for the last month. Review and confirm to create the job.',
      },
      {
        type: 'proposal_ready',
        normalizedQuery:
          'Monitor Facebook campaign activity and sentiment for iPhoneShopTbilisi in Georgia over the last 30 days',
        filters: { country: 'Georgia', platform: 'facebook', timeframe: 'last_30_days' },
        collectionPlan: {
          sources: ['facebook_posts', 'facebook_comments'],
          entities: ['iPhoneShopTbilisi'],
          intents: ['campaign_mentions', 'engagement_sentiment'],
        },
      },
      { type: 'job_start', jobId: 'demo-job-iphone-1' },
      { type: 'job_complete' },
    ],
    analysisPayload: {
      query: 'iPhoneShopTbilisi Facebook campaign monitoring in Georgia (last 30 days)',
      summary:
        'The rival campaign is growing reach in Tbilisi, with strongest engagement on discount bundles. Sentiment is mixed: positive around pricing, negative around stock quality claims.',
      sentimentOverview: { positive: 34, neutral: 29, negative: 37 },
      sentimentTimeseries: [
        { date: '2026-01-25', positive: 22, neutral: 31, negative: 47 },
        { date: '2026-02-01', positive: 28, neutral: 30, negative: 42 },
        { date: '2026-02-08', positive: 31, neutral: 29, negative: 40 },
        { date: '2026-02-15', positive: 35, neutral: 29, negative: 36 },
        { date: '2026-02-22', positive: 34, neutral: 29, negative: 37 },
      ],
    },
  },
  {
    id: 'policy-sentiment-watch',
    name: 'Policy Sentiment Watch',
    description: 'Stakeholder monitoring around a fast-moving public policy topic.',
    tokenDelayMs: 26,
    stepDelayMs: 450,
    script: [
      { type: 'user_message', content: 'Track pension reform sentiment in Romania for the last week.' },
      {
        type: 'assistant_stream',
        content:
          'I can do that. I\'ll prepare a monitoring query focused on pension reform narratives in Romania over the past seven days.',
      },
      {
        type: 'proposal_ready',
        normalizedQuery: 'Track pension reform sentiment in Romania over the last 7 days',
        filters: { country: 'Romania', timeframe: 'last_7_days', topic: 'pension_reform' },
        collectionPlan: {
          sources: ['facebook_posts', 'facebook_comments'],
          entities: ['pension reform', 'retirement policy'],
          intents: ['support', 'opposition', 'implementation_risk'],
        },
      },
      { type: 'job_start', jobId: 'demo-job-policy-1' },
      { type: 'job_complete' },
    ],
    analysisPayload: {
      query: 'Pension reform sentiment in Romania over last 7 days',
      summary:
        'Conversation volume increased sharply after new policy statements. Negative sentiment centers on affordability concerns, while neutral coverage is dominated by policy explainers.',
      sentimentOverview: { positive: 22, neutral: 18, negative: 60 },
      sentimentTimeseries: [
        { date: '2026-02-17', positive: 31, neutral: 22, negative: 47 },
        { date: '2026-02-18', positive: 28, neutral: 21, negative: 51 },
        { date: '2026-02-19', positive: 26, neutral: 20, negative: 54 },
        { date: '2026-02-20', positive: 24, neutral: 19, negative: 57 },
        { date: '2026-02-21', positive: 23, neutral: 18, negative: 59 },
        { date: '2026-02-22', positive: 22, neutral: 18, negative: 60 },
      ],
    },
  },
];
