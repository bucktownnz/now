import { createClient } from '@/lib/supabase/server'
import { fetchNews } from '@/lib/news'
import { analyzeAnnouncement, evaluatePosition, type RecentAnalysisSummary } from '@/lib/agents'

// Node.js runtime — Edge times out on multi-model calls
export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Fetch holdings and portfolio thesis ──────────────────────────────────────
  const [holdingsResult, settingsResult] = await Promise.all([
    supabase.from('holdings').select('*').eq('user_id', user.id),
    supabase.from('portfolio_settings').select('portfolio_thesis').eq('user_id', user.id).single(),
  ])

  const holdings = holdingsResult.data ?? []
  const portfolioThesis = settingsResult.data?.portfolio_thesis ?? ''

  // ── Determine analysis window ────────────────────────────────────────────────
  // Only process announcements published after: max(lastAnalyzedAt, 7 days ago)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const { data: lastAnalysis } = await supabase
    .from('thesis_analyses')
    .select('analyzed_at')
    .eq('user_id', user.id)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastAnalyzedAt = lastAnalysis?.analyzed_at ? new Date(lastAnalysis.analyzed_at) : null
  const cutoffDate = lastAnalyzedAt && lastAnalyzedAt > sevenDaysAgo ? lastAnalyzedAt : sevenDaysAgo

  // ── Process each holding ─────────────────────────────────────────────────────
  let totalNewAnalyses = 0
  let analysedHoldings = 0

  for (const holding of holdings) {
    // Skip holdings with no thesis — nothing to assess against
    if (!holding.thesis?.trim()) continue

    try {
      // 1. Fetch news and filter to new announcements only
      const news = await fetchNews(holding.ticker)
      const newAnnouncements = news.filter(
        (item) => item.publishedAt && item.publishedAt > cutoffDate
      )

      // 2. Analyze each new announcement against the thesis
      if (newAnnouncements.length > 0) {
        const analysisRows: Array<{
          user_id: string
          holding_id: string
          ticker: string
          announcement_title: string
          announcement_publisher: string
          announcement_url: string
          announcement_date: string | null
          thesis_impact: string
          impact_explanation: string
          impact_confidence: string
        }> = []

        for (const announcement of newAnnouncements) {
          try {
            const analysis = await analyzeAnnouncement({
              ticker: holding.ticker,
              companyName: holding.name,
              announcement,
              thesis: holding.thesis,
            })

            analysisRows.push({
              user_id: user.id,
              holding_id: holding.id,
              ticker: holding.ticker,
              announcement_title: announcement.title,
              announcement_publisher: announcement.publisher,
              announcement_url: announcement.url,
              announcement_date: announcement.publishedAt?.toISOString() ?? null,
              thesis_impact: analysis.impact,
              impact_explanation: analysis.explanation,
              impact_confidence: analysis.confidence,
            })
          } catch (err) {
            console.error(`[analyze] announcement analysis failed for ${holding.ticker}:`, err)
          }
        }

        if (analysisRows.length > 0) {
          await supabase.from('thesis_analyses').insert(analysisRows)
          totalNewAnalyses += analysisRows.length
        }
      }

      // 3. Fetch all recent analyses for this holding (last 7 days) for position evaluation
      const { data: recentRows } = await supabase
        .from('thesis_analyses')
        .select('announcement_title, thesis_impact, impact_explanation, announcement_date')
        .eq('user_id', user.id)
        .eq('ticker', holding.ticker)
        .gte('analyzed_at', sevenDaysAgo.toISOString())
        .order('analyzed_at', { ascending: false })
        .limit(10)

      if (!recentRows || recentRows.length === 0) continue

      // 4. Evaluate overall position based on accumulated thesis impacts
      const recentAnalyses: RecentAnalysisSummary[] = recentRows.map((r) => ({
        announcement_title: r.announcement_title,
        thesis_impact: r.thesis_impact as 'strengthens' | 'weakens' | 'neutral',
        impact_explanation: r.impact_explanation,
        announcement_date: r.announcement_date,
      }))

      const recommendation = await evaluatePosition({
        ticker: holding.ticker,
        companyName: holding.name,
        individualThesis: holding.thesis,
        portfolioThesis,
        recentAnalyses,
        shares: holding.shares,
      })

      // 5. Upsert recommendation (one per user+ticker, updated each run)
      await supabase.from('position_recommendations').upsert(
        {
          user_id: user.id,
          holding_id: holding.id,
          ticker: holding.ticker,
          recommendation: recommendation.recommendation,
          rationale: recommendation.rationale,
          urgency: recommendation.urgency,
          portfolio_alignment: recommendation.portfolio_alignment,
          recommended_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,ticker' }
      )

      analysedHoldings++
    } catch (err) {
      console.error(`[analyze] failed for ${holding.ticker}:`, err)
    }
  }

  return Response.json({
    analysedHoldings,
    newAnalyses: totalNewAnalyses,
    cutoffDate: cutoffDate.toISOString(),
  })
}
