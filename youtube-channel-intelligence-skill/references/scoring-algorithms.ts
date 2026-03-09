// ============================================================================
// YouTube Channel Intelligence — Scoring Algorithms
// ============================================================================

import type {
  VideoSnapshot,
  SEOScore,
  SEOIssue,
  ChannelSnapshot,
  ChannelHealthScore,
  KeywordOpportunity,
  DeltaValue,
  TrendDirection,
  SerpApiVideoResult,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPTIMAL_TITLE_LENGTH = { min: 40, max: 70 };
const OPTIMAL_DESC_LENGTH = { min: 200, ideal: 500 };
const OPTIMAL_TAG_COUNT = { min: 8, max: 30 };

const POWER_WORDS = [
  "ultimate",
  "proven",
  "secret",
  "essential",
  "complete",
  "powerful",
  "incredible",
  "surprising",
  "easy",
  "fast",
  "free",
  "best",
  "top",
  "new",
  "guide",
  "tutorial",
  "tips",
  "tricks",
  "hack",
  "step-by-step",
  "beginner",
  "advanced",
  "master",
  "why",
  "how",
  "what",
  "boost",
  "transform",
  "instantly",
  "exactly",
];

const ENGAGEMENT_BENCHMARKS = {
  excellent: 0.08, // 8% engagement rate
  good: 0.05,
  average: 0.03,
  poor: 0.01,
};

// ---------------------------------------------------------------------------
// SEO Scoring — Master Function
// ---------------------------------------------------------------------------

export function calculateSEOScore(
  video: VideoSnapshot,
  channelAvgEngagement?: number,
  targetKeyword?: string,
): SEOScore {
  const issues: SEOIssue[] = [];
  const suggestions: string[] = [];

  const titleScore = scoreTitleSEO(video.title, targetKeyword, issues, suggestions);
  const descriptionScore = scoreDescriptionSEO(video.description, targetKeyword, issues, suggestions);
  const tagsScore = scoreTagsSEO(video.tags, targetKeyword, issues, suggestions);
  const engagementScore = scoreEngagement(video, channelAvgEngagement, issues, suggestions);
  const freshnessScore = scoreFreshness(video.publishedAt, issues);

  const overall = titleScore + descriptionScore + tagsScore + engagementScore + freshnessScore;

  return {
    overall,
    titleScore,
    descriptionScore,
    tagsScore,
    engagementScore,
    freshnessScore,
    issues,
    suggestions,
  };
}

// ---------------------------------------------------------------------------
// Title Scoring (0-25)
// ---------------------------------------------------------------------------

function scoreTitleSEO(
  title: string,
  targetKeyword: string | undefined,
  issues: SEOIssue[],
  suggestions: string[],
): number {
  let score = 0;
  const len = title.length;

  // Length scoring (0-8)
  if (len >= OPTIMAL_TITLE_LENGTH.min && len <= OPTIMAL_TITLE_LENGTH.max) {
    score += 8;
  } else if (len >= 30 && len <= 80) {
    score += 5;
  } else {
    score += 2;
    issues.push({
      field: "title",
      severity: len < 20 ? "critical" : "warning",
      message: len < OPTIMAL_TITLE_LENGTH.min
        ? `Title too short (${len} chars). Optimal: ${OPTIMAL_TITLE_LENGTH.min}-${OPTIMAL_TITLE_LENGTH.max}.`
        : `Title too long (${len} chars). Optimal: ${OPTIMAL_TITLE_LENGTH.min}-${OPTIMAL_TITLE_LENGTH.max}.`,
      suggestion: len < OPTIMAL_TITLE_LENGTH.min
        ? "Add descriptive keywords to make the title more searchable."
        : "Shorten the title — YouTube truncates after ~60 characters in search results.",
    });
  }

  // Keyword presence (0-7)
  if (targetKeyword) {
    const lowerTitle = title.toLowerCase();
    const lowerKeyword = targetKeyword.toLowerCase();
    if (lowerTitle.includes(lowerKeyword)) {
      // Bonus if keyword is near the beginning
      score += lowerTitle.indexOf(lowerKeyword) < 30 ? 7 : 5;
    } else {
      score += 0;
      issues.push({
        field: "title",
        severity: "warning",
        message: `Target keyword "${targetKeyword}" not found in title.`,
        suggestion: `Include "${targetKeyword}" in the first half of the title for better search ranking.`,
      });
    }
  } else {
    score += 4; // Neutral score when no target keyword specified
  }

  // Power words (0-5)
  const lowerTitle = title.toLowerCase();
  const powerWordCount = POWER_WORDS.filter((w) => lowerTitle.includes(w)).length;
  if (powerWordCount >= 2) {
    score += 5;
  } else if (powerWordCount === 1) {
    score += 3;
  } else {
    score += 1;
    suggestions.push("Add a power word to the title (e.g., \"Ultimate\", \"Complete\", \"Step-by-Step\") to increase CTR.");
  }

  // Penalties
  if (title === title.toUpperCase() && title.length > 5) {
    score -= 3;
    issues.push({
      field: "title",
      severity: "warning",
      message: "Title is ALL CAPS — this can appear spammy and reduce CTR.",
      suggestion: "Use title case or sentence case instead of all caps.",
    });
  }

  // Number/year in title (0-5)
  const hasNumber = /\d/.test(title);
  const hasYear = /20\d{2}/.test(title);
  if (hasYear) {
    score += 5;
  } else if (hasNumber) {
    score += 3;
  } else {
    score += 0;
    suggestions.push("Consider adding a number or the current year to the title (e.g., \"Top 10...\", \"... in 2026\").");
  }

  return Math.max(0, Math.min(25, score));
}

// ---------------------------------------------------------------------------
// Description Scoring (0-25)
// ---------------------------------------------------------------------------

function scoreDescriptionSEO(
  description: string,
  targetKeyword: string | undefined,
  issues: SEOIssue[],
  suggestions: string[],
): number {
  let score = 0;
  const len = description.length;

  // Length scoring (0-7)
  if (len >= OPTIMAL_DESC_LENGTH.ideal) {
    score += 7;
  } else if (len >= OPTIMAL_DESC_LENGTH.min) {
    score += 5;
  } else if (len >= 100) {
    score += 3;
  } else {
    score += 1;
    issues.push({
      field: "description",
      severity: len < 50 ? "critical" : "warning",
      message: `Description too short (${len} chars). Aim for ${OPTIMAL_DESC_LENGTH.min}+ chars.`,
      suggestion: "Write a detailed description with relevant keywords, timestamps, and links.",
    });
  }

  // Keyword in first 150 chars (0-5)
  if (targetKeyword) {
    const first150 = description.slice(0, 150).toLowerCase();
    if (first150.includes(targetKeyword.toLowerCase())) {
      score += 5;
    } else if (description.toLowerCase().includes(targetKeyword.toLowerCase())) {
      score += 3;
    } else {
      score += 0;
      issues.push({
        field: "description",
        severity: "warning",
        message: `Target keyword "${targetKeyword}" not found in description.`,
        suggestion: `Include "${targetKeyword}" in the first 2-3 sentences of the description.`,
      });
    }
  } else {
    score += 3;
  }

  // Has links (0-4)
  const hasLinks = /https?:\/\//.test(description);
  if (hasLinks) {
    score += 4;
  } else {
    score += 0;
    suggestions.push("Add relevant links to the description (website, social media, related videos).");
  }

  // Has timestamps (0-5)
  const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
  if (hasTimestamps) {
    score += 5;
  } else {
    score += 0;
    suggestions.push("Add timestamps to the description — YouTube creates chapters from them, improving viewer retention.");
  }

  // Has hashtags (0-4)
  const hashtagCount = (description.match(/#\w+/g) || []).length;
  if (hashtagCount >= 3) {
    score += 4;
  } else if (hashtagCount >= 1) {
    score += 2;
  } else {
    score += 0;
    suggestions.push("Add 3-5 relevant hashtags at the end of the description for additional discoverability.");
  }

  return Math.max(0, Math.min(25, score));
}

// ---------------------------------------------------------------------------
// Tags Scoring (0-15)
// ---------------------------------------------------------------------------

function scoreTagsSEO(
  tags: string[],
  targetKeyword: string | undefined,
  issues: SEOIssue[],
  suggestions: string[],
): number {
  let score = 0;
  const count = tags.length;

  if (count === 0) {
    issues.push({
      field: "tags",
      severity: "info",
      message: "No tags found. Note: YouTube may not return tags for videos you don't own.",
      suggestion: "If this is your video, add 15-30 relevant tags mixing broad and specific terms.",
    });
    return 0;
  }

  // Tag count (0-6)
  if (count >= OPTIMAL_TAG_COUNT.min && count <= OPTIMAL_TAG_COUNT.max) {
    score += 6;
  } else if (count > 0 && count < OPTIMAL_TAG_COUNT.min) {
    score += 3;
    suggestions.push(`Add more tags (currently ${count}, aim for ${OPTIMAL_TAG_COUNT.min}-${OPTIMAL_TAG_COUNT.max}).`);
  } else if (count > OPTIMAL_TAG_COUNT.max) {
    score += 4;
    issues.push({
      field: "tags",
      severity: "info",
      message: `Too many tags (${count}). YouTube may dilute relevance above ${OPTIMAL_TAG_COUNT.max} tags.`,
      suggestion: "Remove the least relevant tags to keep focus on core keywords.",
    });
  }

  // Tag relevance — keyword presence (0-5)
  if (targetKeyword) {
    const lowerTags = tags.map((t) => t.toLowerCase());
    const lowerKeyword = targetKeyword.toLowerCase();
    const exactMatch = lowerTags.some((t) => t === lowerKeyword);
    const partialMatch = lowerTags.some((t) => t.includes(lowerKeyword) || lowerKeyword.includes(t));
    if (exactMatch) {
      score += 5;
    } else if (partialMatch) {
      score += 3;
    } else {
      score += 0;
      issues.push({
        field: "tags",
        severity: "warning",
        message: `Target keyword "${targetKeyword}" not found in tags.`,
        suggestion: `Add "${targetKeyword}" and variations as tags.`,
      });
    }
  } else {
    score += 3;
  }

  // Mix of broad and specific (0-4)
  const avgTagLength = tags.reduce((sum, t) => sum + t.length, 0) / count;
  const hasShortTags = tags.some((t) => t.split(" ").length <= 2);
  const hasLongTags = tags.some((t) => t.split(" ").length >= 3);
  if (hasShortTags && hasLongTags) {
    score += 4; // Good mix of broad and long-tail
  } else {
    score += 2;
    suggestions.push("Mix broad tags (1-2 words) with specific long-tail tags (3+ words) for better reach.");
  }

  return Math.max(0, Math.min(15, score));
}

// ---------------------------------------------------------------------------
// Engagement Scoring (0-20)
// ---------------------------------------------------------------------------

function scoreEngagement(
  video: VideoSnapshot,
  channelAvgEngagement: number | undefined,
  issues: SEOIssue[],
  suggestions: string[],
): number {
  const engRate = calculateEngagementRate(video);

  let score = 0;

  // Absolute engagement rate (0-12)
  if (engRate >= ENGAGEMENT_BENCHMARKS.excellent) {
    score += 12;
  } else if (engRate >= ENGAGEMENT_BENCHMARKS.good) {
    score += 9;
  } else if (engRate >= ENGAGEMENT_BENCHMARKS.average) {
    score += 6;
  } else if (engRate >= ENGAGEMENT_BENCHMARKS.poor) {
    score += 3;
  } else {
    score += 1;
  }

  // Relative to channel average (0-8)
  if (channelAvgEngagement !== undefined && channelAvgEngagement > 0) {
    const ratio = engRate / channelAvgEngagement;
    if (ratio >= 1.5) {
      score += 8; // Significantly above average
    } else if (ratio >= 1.0) {
      score += 6; // At or above average
    } else if (ratio >= 0.7) {
      score += 4; // Slightly below average
    } else {
      score += 2; // Well below average
      suggestions.push(
        "This video's engagement is below your channel average. Consider adding a question or poll in the comments to boost interaction.",
      );
    }
  } else {
    score += 4; // Neutral when no channel average available
  }

  return Math.max(0, Math.min(20, score));
}

// ---------------------------------------------------------------------------
// Freshness Scoring (0-15)
// ---------------------------------------------------------------------------

function scoreFreshness(publishedAt: string, issues: SEOIssue[]): number {
  const published = new Date(publishedAt);
  const now = new Date();
  const daysSincePublish = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSincePublish <= 7) return 15;
  if (daysSincePublish <= 14) return 13;
  if (daysSincePublish <= 30) return 10;
  if (daysSincePublish <= 90) return 7;
  if (daysSincePublish <= 180) return 4;
  return 2;
}

// ---------------------------------------------------------------------------
// Engagement Rate
// ---------------------------------------------------------------------------

/**
 * Calculates engagement rate with comments weighted 4.5x (comments require
 * significantly more effort than likes and indicate deeper engagement).
 *
 * Formula: (likeCount + commentCount * 4.5) / viewCount * 100
 * Returns a percentage (e.g., 5.2 means 5.2%).
 */
export function calculateEngagementRate(video: VideoSnapshot): number {
  if (video.viewCount === 0) return 0;
  return ((video.likeCount + video.commentCount * 4.5) / video.viewCount) * 100;
}

// ---------------------------------------------------------------------------
// Channel Health Score (0-100)
// ---------------------------------------------------------------------------

export function calculateChannelHealthScore(
  channel: ChannelSnapshot,
  recentVideos: VideoSnapshot[],
  historicalSnapshots: ChannelSnapshot[],
): ChannelHealthScore {
  const uploadConsistency = scoreUploadConsistency(recentVideos);
  const engagementTrend = scoreEngagementTrend(recentVideos);
  const subscriberGrowth = scoreSubscriberGrowth(channel, historicalSnapshots);
  const seoHealth = scoreChannelSEOHealth(recentVideos);

  const overall = uploadConsistency.score + engagementTrend.score + subscriberGrowth.score + seoHealth.score;

  return {
    overall,
    uploadConsistency: uploadConsistency.score,
    engagementTrend: engagementTrend.score,
    subscriberGrowth: subscriberGrowth.score,
    seoHealth: seoHealth.score,
    details: {
      avgUploadInterval: uploadConsistency.avgInterval,
      uploadVariance: uploadConsistency.variance,
      engagementDirection: engagementTrend.direction,
      engagementDelta: engagementTrend.delta,
      subscriberGrowthRate: subscriberGrowth.growthRate,
      avgSEOScore: seoHealth.avgScore,
    },
  };
}

function scoreUploadConsistency(
  videos: VideoSnapshot[],
): { score: number; avgInterval: number; variance: number } {
  if (videos.length < 2) return { score: 5, avgInterval: 0, variance: 0 };

  const sorted = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (new Date(sorted[i].publishedAt).getTime() - new Date(sorted[i - 1].publishedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    intervals.push(diff);
  }

  const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  const variance =
    intervals.reduce((s, v) => s + Math.pow(v - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  let score = 0;
  // Regular uploading (0-15)
  if (avgInterval <= 7) score += 15; // Weekly or more frequent
  else if (avgInterval <= 14) score += 12;
  else if (avgInterval <= 30) score += 8;
  else score += 4;

  // Consistency bonus/penalty (0-10)
  const coeffOfVariation = avgInterval > 0 ? stdDev / avgInterval : 0;
  if (coeffOfVariation < 0.3) score += 10; // Very consistent
  else if (coeffOfVariation < 0.5) score += 7;
  else if (coeffOfVariation < 0.8) score += 4;
  else score += 1;

  return { score: Math.min(25, score), avgInterval, variance };
}

function scoreEngagementTrend(
  videos: VideoSnapshot[],
): { score: number; direction: TrendDirection; delta: number } {
  if (videos.length < 4)
    return { score: 12, direction: "flat", delta: 0 };

  const sorted = [...videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );

  const half = Math.floor(sorted.length / 2);
  const olderHalf = sorted.slice(0, half);
  const newerHalf = sorted.slice(half);

  const olderAvg =
    olderHalf.reduce((s, v) => s + calculateEngagementRate(v), 0) / olderHalf.length;
  const newerAvg =
    newerHalf.reduce((s, v) => s + calculateEngagementRate(v), 0) / newerHalf.length;

  const delta = olderAvg > 0 ? ((newerAvg - olderAvg) / olderAvg) * 100 : 0;
  const direction: TrendDirection = delta > 5 ? "up" : delta < -5 ? "down" : "flat";

  let score = 0;
  if (direction === "up") {
    score = delta > 20 ? 25 : delta > 10 ? 20 : 17;
  } else if (direction === "flat") {
    score = 12;
  } else {
    score = delta < -20 ? 3 : delta < -10 ? 6 : 9;
  }

  return { score: Math.min(25, score), direction, delta };
}

function scoreSubscriberGrowth(
  channel: ChannelSnapshot,
  history: ChannelSnapshot[],
): { score: number; growthRate: number } {
  if (history.length === 0) return { score: 12, growthRate: 0 };

  const oldest = history[0];
  const daysBetween =
    (new Date(channel.fetchedAt).getTime() - new Date(oldest.fetchedAt).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysBetween < 1) return { score: 12, growthRate: 0 };

  const growthRate =
    oldest.subscriberCount > 0
      ? ((channel.subscriberCount - oldest.subscriberCount) / oldest.subscriberCount) *
        (30 / daysBetween) *
        100
      : 0;

  let score = 0;
  if (growthRate >= 10) score = 25; // 10%+ monthly growth
  else if (growthRate >= 5) score = 20;
  else if (growthRate >= 2) score = 15;
  else if (growthRate >= 0.5) score = 10;
  else if (growthRate >= 0) score = 7;
  else score = 3; // Losing subscribers

  return { score: Math.min(25, score), growthRate };
}

function scoreChannelSEOHealth(
  videos: VideoSnapshot[],
): { score: number; avgScore: number } {
  if (videos.length === 0) return { score: 12, avgScore: 0 };

  const scores = videos.map((v) => calculateSEOScore(v));
  const avgScore = scores.reduce((s, sc) => s + sc.overall, 0) / scores.length;

  let score = 0;
  if (avgScore >= 80) score = 25;
  else if (avgScore >= 65) score = 20;
  else if (avgScore >= 50) score = 15;
  else if (avgScore >= 35) score = 10;
  else score = 5;

  return { score: Math.min(25, score), avgScore };
}

// ---------------------------------------------------------------------------
// Keyword Opportunity Score (0-100)
// ---------------------------------------------------------------------------

export function calculateKeywordOpportunity(
  searchResults: SerpApiVideoResult[],
): {
  opportunityScore: number;
  competitionScore: number;
  demandSignal: number;
  freshness: number;
} {
  if (searchResults.length === 0) {
    return { opportunityScore: 50, competitionScore: 50, demandSignal: 0, freshness: 0 };
  }

  const top10 = searchResults.slice(0, 10);

  // Demand signal: average views of top results (higher = more demand)
  const avgViews = top10.reduce((s, v) => s + (v.views || 0), 0) / top10.length;
  let demandSignal = 0;
  if (avgViews >= 1_000_000) demandSignal = 100;
  else if (avgViews >= 500_000) demandSignal = 85;
  else if (avgViews >= 100_000) demandSignal = 70;
  else if (avgViews >= 50_000) demandSignal = 55;
  else if (avgViews >= 10_000) demandSignal = 40;
  else if (avgViews >= 1_000) demandSignal = 25;
  else demandSignal = 10;

  // Competition: how many top results are from large channels
  // Lower competition = better opportunity
  // Since SerpApi doesn't always return subscriber counts, we estimate
  // using view count as a proxy for channel size
  const highViewCount = top10.filter((v) => (v.views || 0) > 500_000).length;
  const competitionScore = Math.min(100, highViewCount * 12);

  // Freshness: average age of top results
  const now = new Date();
  const ages = top10
    .map((v) => {
      if (!v.published_date) return 365;
      // SerpApi returns relative dates like "2 months ago"
      return estimateDaysFromRelativeDate(v.published_date);
    });
  const avgAge = ages.reduce((s, a) => s + a, 0) / ages.length;
  const freshness = avgAge < 30 ? 90 : avgAge < 90 ? 70 : avgAge < 180 ? 50 : avgAge < 365 ? 30 : 15;

  // Opportunity = high demand + low competition + freshness
  const opportunityScore = Math.round(
    demandSignal * 0.5 + (100 - competitionScore) * 0.3 + freshness * 0.2,
  );

  return {
    opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
    competitionScore,
    demandSignal,
    freshness,
  };
}

// ---------------------------------------------------------------------------
// View Velocity
// ---------------------------------------------------------------------------

export function calculateViewVelocity(video: VideoSnapshot): number {
  const published = new Date(video.publishedAt);
  const now = new Date();
  const days = Math.max(1, (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));
  return video.viewCount / days;
}

// ---------------------------------------------------------------------------
// Delta Calculation
// ---------------------------------------------------------------------------

export function calculateDelta(current: number, previous: number): DeltaValue {
  const delta = current - previous;
  const deltaPercent = previous !== 0 ? (delta / previous) * 100 : current > 0 ? 100 : 0;
  const direction: TrendDirection = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return { current, previous, delta, deltaPercent, direction };
}

// ---------------------------------------------------------------------------
// Content Gap Detection
// ---------------------------------------------------------------------------

export function detectContentGaps(
  userVideoTitles: string[],
  competitorVideoTitles: string[],
): string[] {
  const userKeywords = extractKeywordsFromTitles(userVideoTitles);
  const competitorKeywords = extractKeywordsFromTitles(competitorVideoTitles);

  const gaps: string[] = [];
  for (const keyword of competitorKeywords) {
    if (!userKeywords.has(keyword) && keyword.length > 3) {
      gaps.push(keyword);
    }
  }

  // Return top 20 most frequent gaps
  return gaps.slice(0, 20);
}

function extractKeywordsFromTitles(titles: string[]): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to",
    "for", "of", "and", "or", "but", "not", "with", "this", "that", "it",
    "be", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "i", "you", "he", "she",
    "we", "they", "my", "your", "his", "her", "our", "its", "me",
    "him", "us", "them", "vs", "how", "what", "why", "when", "where",
  ]);

  const keywords = new Set<string>();
  for (const title of titles) {
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
    for (const word of words) {
      keywords.add(word);
    }
  }
  return keywords;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function estimateDaysFromRelativeDate(relativeDate: string): number {
  const lower = relativeDate.toLowerCase();
  const match = lower.match(/(\d+)/);
  const num = match ? parseInt(match[1], 10) : 1;

  if (lower.includes("hour")) return 0;
  if (lower.includes("day")) return num;
  if (lower.includes("week")) return num * 7;
  if (lower.includes("month")) return num * 30;
  if (lower.includes("year")) return num * 365;
  return 365; // Default to old if unparseable
}
