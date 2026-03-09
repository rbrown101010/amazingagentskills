// ============================================================================
// YouTube Channel Intelligence — Report Formatters
// ============================================================================

import type {
  WeeklyReport,
  CompetitorComparison,
  VideoSnapshot,
  SEOScore,
  TranscriptAnalysis,
  KeywordOpportunity,
  TrendingVideo,
  SEOAuditReport,
  ChannelAnalysis,
  ChannelHealthScore,
  ContentStrategyReport,
  DeltaValue,
} from "./types";

// ---------------------------------------------------------------------------
// Number & Delta Formatting
// ---------------------------------------------------------------------------

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatDelta(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100% ↑" : "—";
  const delta = current - previous;
  const pct = ((delta / previous) * 100).toFixed(1);
  if (delta > 0) return `+${pct}% ↑`;
  if (delta < 0) return `${pct}% ↓`;
  return "0% →";
}

export function formatDeltaValue(dv: DeltaValue): string {
  const pct = dv.deltaPercent.toFixed(1);
  const sign = dv.delta >= 0 ? "+" : "";
  const arrow = dv.direction === "up" ? "↑" : dv.direction === "down" ? "↓" : "→";
  return `${sign}${formatNumber(Math.abs(dv.delta))} (${sign}${pct}%) ${arrow}`;
}

export function formatScoreBar(score: number, max: number): string {
  const filled = Math.round((score / max) * 20);
  const empty = 20 - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${score}/${max}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Weekly Channel Report
// ---------------------------------------------------------------------------

export function formatWeeklyReport(data: WeeklyReport): string {
  const { channel, previousChannel, metrics, videos } = data;

  const lines: string[] = [];

  lines.push(`# Weekly Channel Report: ${channel.name}`);
  lines.push(
    `**Period**: ${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}  |  **Generated**: ${formatDateTime(data.generatedAt)}`,
  );
  lines.push("---");
  lines.push("");

  // Executive Summary
  lines.push("## Key Findings");
  lines.push("");

  if (previousChannel) {
    const subDelta = metrics.subscribersDelta;
    const subDir = subDelta >= 0 ? "grew" : "declined";
    lines.push(
      `- Subscriber count ${subDir} by **${subDelta >= 0 ? "+" : ""}${formatNumber(subDelta)}** (${formatPercent(metrics.subscribersDeltaPercent)}) to **${formatNumber(channel.subscriberCount)}**`,
    );
  } else {
    lines.push(
      `- Current subscribers: **${formatNumber(channel.subscriberCount)}** (baseline — trend data available next week)`,
    );
  }

  if (metrics.topVideoId && data.topVideo) {
    lines.push(
      `- Top video "${data.topVideo.title}" earned **${formatNumber(data.topVideo.viewCount)} views**`,
    );
  }
  lines.push(
    `- Average engagement rate: **${formatPercent(metrics.avgEngagementRate)}** across ${metrics.uploadCount} upload(s)`,
  );
  lines.push("");

  // Channel Overview
  lines.push("## Channel Overview");
  lines.push("");
  lines.push("| Metric | Current | Change |");
  lines.push("|--------|--------:|-------:|");
  lines.push(
    `| Subscribers | ${formatNumber(channel.subscriberCount)} | ${previousChannel ? formatDelta(channel.subscriberCount, previousChannel.subscriberCount) : "—"} |`,
  );
  lines.push(
    `| Total Views | ${formatNumber(channel.totalViews)} | ${previousChannel ? formatDelta(channel.totalViews, previousChannel.totalViews) : "—"} |`,
  );
  lines.push(
    `| Videos Published | ${metrics.uploadCount} | — |`,
  );
  lines.push(
    `| Avg Views/Video | ${formatNumber(metrics.avgViewsPerVideo)} | — |`,
  );
  lines.push("");

  // Top Performing Videos
  if (videos.length > 0) {
    lines.push("## This Week's Videos");
    lines.push("");
    lines.push("| # | Video | Views | Likes | Comments | Engagement |");
    lines.push("|---|-------|------:|------:|---------:|-----------:|");

    const sorted = [...videos].sort((a, b) => b.viewCount - a.viewCount);
    sorted.forEach((v, i) => {
      const eng = v.viewCount > 0
        ? (((v.likeCount + v.commentCount * 4.5) / v.viewCount) * 100).toFixed(1)
        : "0.0";
      lines.push(
        `| ${i + 1} | ${truncate(v.title, 45)} | ${formatNumber(v.viewCount)} | ${formatNumber(v.likeCount)} | ${formatNumber(v.commentCount)} | ${eng}% |`,
      );
    });
    lines.push("");
  }

  // Action Items
  lines.push("## Recommended Actions");
  lines.push("");
  if (metrics.avgEngagementRate < 3) {
    lines.push(
      "1. **HIGH IMPACT**: Engagement is below 3% — add a question or poll to each video's first comment to encourage interaction.",
    );
  }
  if (metrics.uploadCount === 0) {
    lines.push(
      "1. **HIGH IMPACT**: No uploads this week — consistent uploads are critical for algorithm visibility.",
    );
  }
  if (data.topVideo && data.topVideo.viewCount > metrics.avgViewsPerVideo * 2) {
    lines.push(
      `- **OPPORTUNITY**: "${truncate(data.topVideo.title, 40)}" performed ${(data.topVideo.viewCount / metrics.avgViewsPerVideo).toFixed(1)}x above average — create follow-up content on this topic.`,
    );
  }
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Competitor Analysis Report
// ---------------------------------------------------------------------------

export function formatCompetitorReport(data: CompetitorComparison): string {
  const lines: string[] = [];

  lines.push("# Competitor Analysis Report");
  lines.push(`**Generated**: ${formatDateTime(data.generatedAt)}`);
  lines.push("---");
  lines.push("");

  // Comparison Table
  lines.push("## Channel Comparison");
  lines.push("");
  lines.push("| Channel | Subscribers | Avg Views | Upload Freq | Engagement | Growth |");
  lines.push("|---------|------------:|----------:|:-----------:|-----------:|-------:|");

  const allChannels = [data.userChannel, ...data.competitors];
  for (const ch of allChannels) {
    const isUser = ch === data.userChannel;
    const name = isUser ? `**${ch.channel.name}** (you)` : ch.channel.name;
    lines.push(
      `| ${name} | ${formatNumber(ch.channel.subscriberCount)} | ${formatNumber(ch.avgViews)} | ${ch.uploadFrequency.toFixed(1)}/wk | ${formatPercent(ch.avgEngagement)} | ${formatPercent(ch.growthRate)} |`,
    );
  }
  lines.push("");

  // Content Gaps
  if (data.contentGaps.length > 0) {
    lines.push("## Content Gaps");
    lines.push("");
    lines.push("Topics your competitors cover that you haven't:");
    lines.push("");
    for (const gap of data.contentGaps.slice(0, 10)) {
      lines.push(`- ${gap}`);
    }
    lines.push("");
  }

  // Recommendations
  if (data.recommendations.length > 0) {
    lines.push("## Recommendations");
    lines.push("");
    for (let i = 0; i < data.recommendations.length; i++) {
      lines.push(`${i + 1}. ${data.recommendations[i]}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Video Deep-Dive Analysis
// ---------------------------------------------------------------------------

export function formatVideoAnalysis(
  video: VideoSnapshot,
  seoScore: SEOScore,
  transcript?: TranscriptAnalysis,
): string {
  const lines: string[] = [];

  lines.push(`# Video Analysis: ${video.title}`);
  lines.push(`**Video ID**: ${video.videoId}  |  **Published**: ${formatDate(video.publishedAt)}`);
  lines.push("---");
  lines.push("");

  // Performance Metrics
  lines.push("## Performance");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|------:|`);
  lines.push(`| Views | ${formatNumber(video.viewCount)} |`);
  lines.push(`| Likes | ${formatNumber(video.likeCount)} |`);
  lines.push(`| Comments | ${formatNumber(video.commentCount)} |`);
  const eng = video.viewCount > 0
    ? (((video.likeCount + video.commentCount * 4.5) / video.viewCount) * 100).toFixed(1)
    : "0.0";
  lines.push(`| Engagement Rate | ${eng}% |`);
  lines.push(`| Duration | ${video.duration} |`);
  lines.push("");

  // SEO Scorecard
  lines.push("## SEO Scorecard");
  lines.push("");
  lines.push(`Title:       ${formatScoreBar(seoScore.titleScore, 25)}`);
  lines.push(`Description: ${formatScoreBar(seoScore.descriptionScore, 25)}`);
  lines.push(`Tags:        ${formatScoreBar(seoScore.tagsScore, 15)}`);
  lines.push(`Engagement:  ${formatScoreBar(seoScore.engagementScore, 20)}`);
  lines.push(`Freshness:   ${formatScoreBar(seoScore.freshnessScore, 15)}`);
  lines.push(`**Overall:   ${formatScoreBar(seoScore.overall, 100)}**`);
  lines.push("");

  // Issues
  if (seoScore.issues.length > 0) {
    lines.push("## Issues Found");
    lines.push("");
    for (const issue of seoScore.issues) {
      const icon =
        issue.severity === "critical" ? "🔴" : issue.severity === "warning" ? "🟡" : "🔵";
      lines.push(`${icon} **${issue.field}**: ${issue.message}`);
      lines.push(`   → ${issue.suggestion}`);
      lines.push("");
    }
  }

  // Suggestions
  if (seoScore.suggestions.length > 0) {
    lines.push("## Improvement Suggestions");
    lines.push("");
    for (let i = 0; i < seoScore.suggestions.length; i++) {
      lines.push(`${i + 1}. ${seoScore.suggestions[i]}`);
    }
    lines.push("");
  }

  // Transcript Analysis
  if (transcript) {
    lines.push("## Transcript Analysis");
    lines.push("");
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|------:|`);
    lines.push(`| Word Count | ${formatNumber(transcript.wordCount)} |`);
    lines.push(`| Est. Duration | ${transcript.estimatedDurationMinutes.toFixed(0)} min |`);
    lines.push(`| Reading Level | ${transcript.readingLevel} |`);
    lines.push("");

    if (transcript.topKeywords.length > 0) {
      lines.push("**Top Keywords**:");
      lines.push("");
      for (const kw of transcript.topKeywords.slice(0, 10)) {
        lines.push(`- "${kw.word}" (${kw.count}x)`);
      }
      lines.push("");
    }

    if (transcript.topics.length > 0) {
      lines.push(`**Topics Covered**: ${transcript.topics.join(", ")}`);
      lines.push("");
    }

    if (transcript.summary) {
      lines.push(`**Summary**: ${transcript.summary}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Keyword Research Report
// ---------------------------------------------------------------------------

export function formatKeywordReport(keywords: KeywordOpportunity[]): string {
  const lines: string[] = [];

  lines.push("# Keyword Research Report");
  lines.push("---");
  lines.push("");

  // Opportunity Table
  lines.push("## Keyword Opportunities");
  lines.push("");
  lines.push(
    "| Keyword | Opportunity | Competition | Demand | Avg Views | Avg Age |",
  );
  lines.push(
    "|---------|:----------:|:-----------:|:------:|----------:|--------:|",
  );

  const sorted = [...keywords].sort((a, b) => b.opportunityScore - a.opportunityScore);
  for (const kw of sorted) {
    lines.push(
      `| ${kw.keyword} | ${kw.opportunityScore}/100 | ${kw.competitionScore}/100 | ${kw.searchVolEstimate} | ${formatNumber(kw.avgTopResultViews)} | ${kw.avgTopResultAge.toFixed(0)}d |`,
    );
  }
  lines.push("");

  // Related Keywords
  const allRelated = new Set<string>();
  for (const kw of sorted) {
    for (const rel of kw.relatedKeywords) {
      allRelated.add(rel);
    }
  }

  if (allRelated.size > 0) {
    lines.push("## Related Keywords to Explore");
    lines.push("");
    for (const rel of Array.from(allRelated).slice(0, 15)) {
      lines.push(`- ${rel}`);
    }
    lines.push("");
  }

  // Top Videos Per Keyword
  for (const kw of sorted.slice(0, 5)) {
    if (kw.topVideos.length > 0) {
      lines.push(`### Top Results: "${kw.keyword}"`);
      lines.push("");
      for (const tv of kw.topVideos.slice(0, 5)) {
        lines.push(`- **${truncate(tv.title, 60)}** — ${formatNumber(tv.viewCount)} views (${tv.channelName})`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Trending Content Report
// ---------------------------------------------------------------------------

export function formatTrendingReport(
  niche: string,
  trendingVideos: TrendingVideo[],
  emergingTopics: string[],
  suggestedAngles: string[],
): string {
  const lines: string[] = [];

  lines.push(`# Trending Content Report: ${niche}`);
  lines.push("---");
  lines.push("");

  // Trending Videos
  lines.push("## Trending Videos");
  lines.push("");
  lines.push("| # | Video | Views | Velocity | Channel | Small Ch? |");
  lines.push("|---|-------|------:|---------:|---------|:---------:|");

  const sorted = [...trendingVideos].sort((a, b) => b.velocityScore - a.velocityScore);
  sorted.forEach((tv, i) => {
    lines.push(
      `| ${i + 1} | ${truncate(tv.video.title, 40)} | ${formatNumber(tv.video.viewCount)} | ${formatNumber(tv.velocityScore)}/day | ${tv.channel.name} | ${tv.isFromSmallChannel ? "Yes" : "No"} |`,
    );
  });
  lines.push("");

  // Trend Signals
  lines.push("## Why These Are Trending");
  lines.push("");
  for (const tv of sorted.slice(0, 5)) {
    if (tv.trendSignals.length > 0) {
      lines.push(`**${truncate(tv.video.title, 50)}**`);
      for (const signal of tv.trendSignals) {
        lines.push(`- ${signal}`);
      }
      lines.push("");
    }
  }

  // Emerging Topics
  if (emergingTopics.length > 0) {
    lines.push("## Emerging Topics");
    lines.push("");
    for (const topic of emergingTopics) {
      lines.push(`- ${topic}`);
    }
    lines.push("");
  }

  // Suggested Angles
  if (suggestedAngles.length > 0) {
    lines.push("## Suggested Video Angles");
    lines.push("");
    for (let i = 0; i < suggestedAngles.length; i++) {
      lines.push(`${i + 1}. ${suggestedAngles[i]}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// SEO Audit Report
// ---------------------------------------------------------------------------

export function formatSEOAudit(data: SEOAuditReport): string {
  const lines: string[] = [];

  lines.push("# Channel SEO Audit Report");
  lines.push(`**Videos Audited**: ${data.videosAudited}  |  **Generated**: ${formatDateTime(data.generatedAt)}`);
  lines.push("---");
  lines.push("");

  // Overall Health
  lines.push("## Overall SEO Health");
  lines.push("");
  lines.push(`**Channel Score: ${formatScoreBar(data.overallHealthScore, 100)}**`);
  lines.push(`**Average Video SEO: ${formatScoreBar(Math.round(data.avgSEOScore), 100)}**`);
  lines.push("");

  // Score Distribution
  if (data.scoreDistribution.length > 0) {
    lines.push("## Score Distribution");
    lines.push("");
    lines.push("| Range | Count |");
    lines.push("|-------|------:|");
    for (const dist of data.scoreDistribution) {
      lines.push(`| ${dist.range} | ${dist.count} |`);
    }
    lines.push("");
  }

  // Worst Videos
  if (data.worstVideos.length > 0) {
    lines.push("## Videos Needing Attention");
    lines.push("");
    for (const { video, score } of data.worstVideos) {
      lines.push(`### ${truncate(video.title, 60)} — Score: ${score.overall}/100`);
      lines.push("");
      lines.push(`Title:       ${formatScoreBar(score.titleScore, 25)}`);
      lines.push(`Description: ${formatScoreBar(score.descriptionScore, 25)}`);
      lines.push(`Tags:        ${formatScoreBar(score.tagsScore, 15)}`);
      lines.push("");

      if (score.issues.length > 0) {
        for (const issue of score.issues.slice(0, 3)) {
          lines.push(`- **${issue.field}**: ${issue.message}`);
        }
        lines.push("");
      }
    }
  }

  // Common Issues
  if (data.commonIssues.length > 0) {
    lines.push("## Most Common Issues");
    lines.push("");
    for (const ci of data.commonIssues) {
      lines.push(`- ${ci.issue} (${ci.count} videos)`);
    }
    lines.push("");
  }

  // Recommendations
  if (data.recommendations.length > 0) {
    lines.push("## Recommendations");
    lines.push("");
    for (let i = 0; i < data.recommendations.length; i++) {
      lines.push(`${i + 1}. ${data.recommendations[i]}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Channel Health Report
// ---------------------------------------------------------------------------

export function formatChannelHealth(
  channelName: string,
  health: ChannelHealthScore,
): string {
  const lines: string[] = [];

  lines.push(`## Channel Health: ${channelName}`);
  lines.push("");
  lines.push(`Upload Consistency: ${formatScoreBar(health.uploadConsistency, 25)}`);
  lines.push(`Engagement Trend:   ${formatScoreBar(health.engagementTrend, 25)}`);
  lines.push(`Subscriber Growth:  ${formatScoreBar(health.subscriberGrowth, 25)}`);
  lines.push(`SEO Health:         ${formatScoreBar(health.seoHealth, 25)}`);
  lines.push(`**Overall:          ${formatScoreBar(health.overall, 100)}**`);
  lines.push("");

  const d = health.details;
  lines.push(`- Avg upload interval: ${d.avgUploadInterval.toFixed(1)} days`);
  lines.push(`- Engagement trend: ${d.engagementDirection} (${d.engagementDelta > 0 ? "+" : ""}${d.engagementDelta.toFixed(1)}%)`);
  lines.push(`- Subscriber growth rate: ${d.subscriberGrowthRate.toFixed(1)}%/month`);
  lines.push(`- Avg video SEO score: ${d.avgSEOScore.toFixed(0)}/100`);
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Content Strategy Report
// ---------------------------------------------------------------------------

export function formatContentStrategy(data: ContentStrategyReport): string {
  const lines: string[] = [];

  lines.push("# Content Strategy Report");
  lines.push(`**Generated**: ${formatDateTime(data.generatedAt)}`);
  lines.push("---");
  lines.push("");

  // Suggested Topics
  if (data.suggestedTopics.length > 0) {
    lines.push("## Suggested Video Topics");
    lines.push("");
    lines.push("| # | Topic | Target Keyword | Demand | Competition | Rationale |");
    lines.push("|---|-------|----------------|:------:|:-----------:|-----------|");
    data.suggestedTopics.forEach((t, i) => {
      lines.push(
        `| ${i + 1} | ${t.topic} | ${t.targetKeyword} | ${t.estimatedDemand} | ${t.competitionLevel} | ${truncate(t.rationale, 50)} |`,
      );
    });
    lines.push("");
  }

  // Upload Schedule
  lines.push("## Optimal Upload Schedule");
  lines.push("");
  lines.push(`- **Best days**: ${data.optimalUploadSchedule.bestDays.join(", ")}`);
  lines.push(`- **Best times**: ${data.optimalUploadSchedule.bestTimeRanges.join(", ")}`);
  lines.push(`- **Recommended frequency**: ${data.optimalUploadSchedule.recommendedFrequency}`);
  lines.push(`- _${data.optimalUploadSchedule.rationale}_`);
  lines.push("");

  // Title Formulas
  if (data.titleFormulas.length > 0) {
    lines.push("## Title Formulas That Work For You");
    lines.push("");
    for (const f of data.titleFormulas) {
      lines.push(`- ${f}`);
    }
    lines.push("");
  }

  // Top Performing Patterns
  if (data.topPerformingPatterns.length > 0) {
    lines.push("## What's Working");
    lines.push("");
    for (const p of data.topPerformingPatterns) {
      lines.push(`- **${p.pattern}**: Avg ${formatNumber(p.avgViews)} views, ${formatPercent(p.avgEngagement)} engagement (${p.videoCount} videos)`);
    }
    lines.push("");
  }

  // Underperforming Patterns
  if (data.underperformingPatterns.length > 0) {
    lines.push("## What to Reconsider");
    lines.push("");
    for (const p of data.underperformingPatterns) {
      lines.push(`- **${p.pattern}**: Avg ${formatNumber(p.avgViews)} views, ${formatPercent(p.avgEngagement)} engagement (${p.videoCount} videos)`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Utility Helpers
// ---------------------------------------------------------------------------

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
