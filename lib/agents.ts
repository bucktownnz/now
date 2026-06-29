import Anthropic from '@anthropic-ai/sdk'
import type { NewsItem } from './news'

const MODEL = 'claude-sonnet-4-6'

// ─── Agent 3: Swing Setup Analyser ───────────────────────────────────────────

export interface SwingAnalysis {
  setup_quality: 'good' | 'fair' | 'poor'
  catalyst: string
  entry_rationale: string
  target_rationale: string
  invalidation: string
  conviction: 'high' | 'medium' | 'low'
  horizon: string
}

const SWING_SYSTEM = `You are an expert short-term trader focused on identifying swing trade setups with a 1–4 week holding horizon.

A good swing trade has: a clear catalyst (news, earnings, sector rotation, technical breakout), a defined entry zone, a logical exit target, and a specific invalidation condition.

Assess the recent news and watchlist notes to determine the quality of the current setup. Be honest — "poor" is the right answer when there is no clear near-term catalyst. Do not manufacture conviction.

Respond only via the provided tool.`

export async function analyzeSwingSetup(params: {
  ticker: string
  companyName: string
  news: NewsItem[]
  watchlistNotes: string
  currentPrice: number | null
}): Promise<SwingAnalysis> {
  const client = getClient()
  const { ticker, companyName, news, watchlistNotes, currentPrice } = params

  const newsSummary = news.length > 0
    ? news
        .slice(0, 8)
        .map((n, i) => {
          const date = n.publishedAt
            ? n.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : 'Unknown'
          return `${i + 1}. [${date}] "${n.title}" — ${n.publisher}`
        })
        .join('\n')
    : 'No recent news found.'

  const priceContext = currentPrice != null ? `Current price: ${currentPrice.toFixed(2)}` : 'Current price: unavailable'

  const userMessage = `Assess the swing trade setup for ${ticker} (${companyName}).

${priceContext}

Watchlist notes:
${watchlistNotes || 'No notes.'}

Recent news (last 10 items):
${newsSummary}

Is there a compelling swing trade setup here right now? What is the catalyst, entry rationale, realistic target, and what would invalidate the trade?`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: SWING_SYSTEM,
    tools: [
      {
        name: 'record_swing_analysis',
        description: 'Record the swing trade setup analysis',
        input_schema: {
          type: 'object' as const,
          properties: {
            setup_quality: {
              type: 'string',
              enum: ['good', 'fair', 'poor'],
              description: 'Overall quality of the current swing trade setup',
            },
            catalyst: {
              type: 'string',
              description: 'The specific near-term catalyst or trigger for this trade (1–2 sentences)',
            },
            entry_rationale: {
              type: 'string',
              description: 'Why and where to enter — context for timing the entry (1–2 sentences)',
            },
            target_rationale: {
              type: 'string',
              description: 'What would constitute a successful exit and rough upside potential (1–2 sentences)',
            },
            invalidation: {
              type: 'string',
              description: 'Specific condition that would prove the trade thesis wrong and trigger an exit (1 sentence)',
            },
            conviction: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Conviction level in this setup',
            },
            horizon: {
              type: 'string',
              description: 'Expected holding duration e.g. "3–5 days", "1–2 weeks", "2–4 weeks"',
            },
          },
          required: ['setup_quality', 'catalyst', 'entry_rationale', 'target_rationale', 'invalidation', 'conviction', 'horizon'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'record_swing_analysis' },
    messages: [{ role: 'user', content: userMessage }],
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`[agents] analyzeSwingSetup: no tool_use block returned for ${ticker}`)
  }

  const input = toolUse.input as SwingAnalysis
  return {
    setup_quality: input.setup_quality,
    catalyst: input.catalyst,
    entry_rationale: input.entry_rationale,
    target_rationale: input.target_rationale,
    invalidation: input.invalidation,
    conviction: input.conviction,
    horizon: input.horizon,
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey })
}

// ─── Agent 1: Announcement Analyst ───────────────────────────────────────────

export interface AnnouncementAnalysis {
  impact: 'strengthens' | 'weakens' | 'neutral'
  explanation: string
  confidence: 'high' | 'medium' | 'low'
}

const ANALYST_SYSTEM = `You are an expert investment analyst. Your job is to assess company news and announcements against an investor's written investment thesis for a stock.

Be concise and objective. Focus on fundamental business impact — not short-term market noise or sentiment. A quarterly earnings beat is neutral unless it changes the underlying thesis. A strategic pivot, management change, or regulatory threat would be more significant.

Respond only via the provided tool.`

export async function analyzeAnnouncement(params: {
  ticker: string
  companyName: string
  announcement: NewsItem
  thesis: string
}): Promise<AnnouncementAnalysis> {
  const client = getClient()
  const { ticker, companyName, announcement, thesis } = params

  const date = announcement.publishedAt
    ? announcement.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown date'

  const userMessage = `Assess this news item for ${ticker} (${companyName}):

News: "${announcement.title}"
Publisher: ${announcement.publisher}
Date: ${date}

Investment Thesis:
${thesis}

Does this news strengthen, weaken, or remain neutral to the investment thesis? Provide a brief explanation (2–3 sentences max).`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: ANALYST_SYSTEM,
    tools: [
      {
        name: 'record_thesis_impact',
        description: 'Record the thesis impact assessment for this announcement',
        input_schema: {
          type: 'object' as const,
          properties: {
            impact: {
              type: 'string',
              enum: ['strengthens', 'weakens', 'neutral'],
              description: 'Whether this announcement strengthens, weakens, or is neutral to the thesis',
            },
            explanation: {
              type: 'string',
              description: 'Brief explanation of the impact (2–3 sentences)',
            },
            confidence: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'How confident you are in this assessment',
            },
          },
          required: ['impact', 'explanation', 'confidence'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'record_thesis_impact' },
    messages: [{ role: 'user', content: userMessage }],
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`[agents] analyzeAnnouncement: no tool_use block returned for ${ticker}`)
  }

  const input = toolUse.input as AnnouncementAnalysis
  return {
    impact: input.impact,
    explanation: input.explanation,
    confidence: input.confidence,
  }
}

// ─── Agent 2: Position Recommender ───────────────────────────────────────────

export interface PositionRecommendation {
  recommendation: 'accumulate' | 'hold' | 'reduce' | 'exit'
  rationale: string
  urgency: 'immediate' | 'consider' | 'monitor'
  portfolio_alignment: string
}

export interface RecentAnalysisSummary {
  announcement_title: string
  thesis_impact: 'strengthens' | 'weakens' | 'neutral'
  impact_explanation: string
  announcement_date: string | null
}

const RECOMMENDER_SYSTEM = `You are a portfolio manager evaluating whether an investor should change their position size in a stock.

Based on the cumulative effect of recent news on the investment thesis — and how the stock fits the portfolio's overall objectives — recommend one of:
- accumulate: thesis is intact and momentum suggests adding to the position
- hold: thesis is intact, no reason to change position size
- reduce: thesis is showing cracks; consider trimming the position
- exit: thesis is materially broken; recommend removing from portfolio

Be direct and decisive. Consider both the individual stock thesis and the portfolio-level objectives. Respond only via the provided tool.`

export async function evaluatePosition(params: {
  ticker: string
  companyName: string
  individualThesis: string
  portfolioThesis: string
  recentAnalyses: RecentAnalysisSummary[]
  shares: number
}): Promise<PositionRecommendation> {
  const client = getClient()
  const { ticker, companyName, individualThesis, portfolioThesis, recentAnalyses, shares } = params

  const analysesSummary = recentAnalyses.length > 0
    ? recentAnalyses
        .map((a) => {
          const date = a.announcement_date
            ? new Date(a.announcement_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : 'Unknown date'
          return `- [${a.thesis_impact.toUpperCase()}] "${a.announcement_title}" (${date})\n  ${a.impact_explanation}`
        })
        .join('\n')
    : 'No recent announcements analysed.'

  const userMessage = `Evaluate position sizing for ${ticker} (${companyName}).

Current position: ${shares} shares

Individual Investment Thesis:
${individualThesis}

Portfolio Investment Objectives:
${portfolioThesis || 'Not specified.'}

Recent News Impact on Thesis (last 7 days):
${analysesSummary}

Based on the cumulative effect of recent news on the thesis integrity, and alignment with portfolio objectives, recommend whether to accumulate, hold, reduce, or exit this position.`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: RECOMMENDER_SYSTEM,
    tools: [
      {
        name: 'record_recommendation',
        description: 'Record the position sizing recommendation',
        input_schema: {
          type: 'object' as const,
          properties: {
            recommendation: {
              type: 'string',
              enum: ['accumulate', 'hold', 'reduce', 'exit'],
              description: 'Whether to accumulate, hold, reduce, or exit the position',
            },
            rationale: {
              type: 'string',
              description: 'Concise rationale for the recommendation (2–3 sentences)',
            },
            urgency: {
              type: 'string',
              enum: ['immediate', 'consider', 'monitor'],
              description: 'How urgently to act: immediate action needed, worth considering, or just monitor',
            },
            portfolio_alignment: {
              type: 'string',
              description: 'One sentence on how this holding aligns (or conflicts) with the portfolio objectives',
            },
          },
          required: ['recommendation', 'rationale', 'urgency', 'portfolio_alignment'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'record_recommendation' },
    messages: [{ role: 'user', content: userMessage }],
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`[agents] evaluatePosition: no tool_use block returned for ${ticker}`)
  }

  const input = toolUse.input as PositionRecommendation
  return {
    recommendation: input.recommendation,
    rationale: input.rationale,
    urgency: input.urgency,
    portfolio_alignment: input.portfolio_alignment,
  }
}
