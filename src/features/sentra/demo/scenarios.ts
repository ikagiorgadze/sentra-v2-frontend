import type { DemoScenario } from '@/features/sentra/demo/types';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'insurance-rival-campaign-georgia',
    name: 'Insurance Rival Campaign',
    description:
      'Brand manager conversation showing Sentra identity, consultative clarification, and proposal derivation for Georgia.',
    tokenDelayMs: 30,
    stepDelayMs: 480,
    script: [
      { type: 'user_message', content: 'What is Sentra?' },
      {
        type: 'assistant_stream',
        content:
          'Sentra is a conversational monitoring assistant. It helps teams define what to track, turns that into a structured listening job, and then delivers analysis on public campaign narratives and sentiment.',
      },
      { type: 'user_message', content: 'Can you elaborate a bit and give me an example use case?' },
      {
        type: 'assistant_stream',
        content:
          'Sure. For example, an insurance brand team can use Sentra to monitor a rival campaign, track how audiences react across channels, and identify which messages are driving positive or negative responses before adjusting strategy.',
      },
      {
        type: 'user_message',
        content:
          'I am a brand manager at an insurance company and I want to understand how well a rival insurance company marketing campaign is doing.',
      },
      {
        type: 'assistant_stream',
        content:
          'Great use case. To draft a strong monitoring proposal, please share three specifics: the rival brand name, the primary channel to monitor, and your preferred timeframe.',
      },
      {
        type: 'user_message',
        content:
          'The rival is AlphaInsure Georgia. Monitor Facebook and Instagram for the last 30 days.',
      },
      {
        type: 'assistant_stream',
        content:
          'Perfect. Final clarification before I draft the query: confirm geographic scope as Georgia only, and whether we should focus specifically on campaign effectiveness signals such as engagement quality, message resonance, and sentiment shifts.',
      },
      {
        type: 'user_message',
        content: 'Yes, Georgia only, and yes focus on campaign effectiveness signals.',
      },
      {
        type: 'assistant_stream',
        content:
          'Understood. I can now propose a monitoring query that tracks AlphaInsure Georgia campaign performance in Georgia over the last 30 days across Facebook and Instagram.',
      },
      {
        type: 'proposal_ready',
        normalizedQuery:
          'Monitor AlphaInsure Georgia marketing campaign performance in Georgia over the last 30 days across Facebook and Instagram, focusing on engagement quality, message resonance, and audience sentiment shifts',
        filters: {
          country: 'Georgia',
          channels: ['facebook', 'instagram'],
          timeframe: 'last_30_days',
          domain: 'insurance',
        },
        collectionPlan: {
          sources: ['facebook_posts', 'facebook_comments', 'instagram_posts', 'instagram_comments'],
          entities: ['AlphaInsure Georgia'],
          intents: ['campaign_effectiveness', 'engagement_quality', 'message_resonance', 'sentiment_shift'],
        },
      },
      { type: 'job_start', jobId: 'demo-job-insurance-1' },
      { type: 'job_complete' },
    ],
    analysisPayload: {
      query:
        'AlphaInsure Georgia campaign performance in Georgia across Facebook and Instagram (last 30 days)',
      summary:
        'AlphaInsure Georgia achieved high visibility in Tbilisi and Batumi with strongest engagement on family-coverage creatives. Positive sentiment clustered around perceived affordability and clarity of messaging, while negative sentiment focused on claim-response credibility and trust concerns.',
      sentimentOverview: { positive: 41, neutral: 24, negative: 35 },
      sentimentTimeseries: [
        { date: '2026-01-25', positive: 29, neutral: 27, negative: 44 },
        { date: '2026-02-01', positive: 33, neutral: 26, negative: 41 },
        { date: '2026-02-08', positive: 37, neutral: 25, negative: 38 },
        { date: '2026-02-15', positive: 40, neutral: 24, negative: 36 },
        { date: '2026-02-22', positive: 41, neutral: 24, negative: 35 },
      ],
    },
  },
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
