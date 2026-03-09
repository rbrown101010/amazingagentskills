// ============================================================================
// YouTube Channel Intelligence — SerpApi Client
// ============================================================================
//
// Wrapper for SerpApi's YouTube search engine (https://serpapi.com).
// SerpApi provides YouTube search results, related searches, and trending
// content WITHOUT consuming YouTube Data API quota.
//
// IMPORTANT: This file is a reference implementation for the agent to adapt.
// It is NOT executed directly — the agent reads this code and uses the
// patterns when making API calls.
// ============================================================================

import type {
  SerpApiYouTubeResult,
  SerpApiVideoResult,
  KeywordOpportunity,
  KeywordTopVideo,
} from "./types";

const BASE_URL = "https://serpapi.com/search";

// ---------------------------------------------------------------------------
// Core Request Function
// ---------------------------------------------------------------------------

async function serpApiGet(
  params: Record<string, string>,
  apiKey: string,
): Promise<any> {
  const url = new URL(BASE_URL);
  url.searchParams.set("engine", "youtube");
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `SerpApi error (${response.status}): ${error?.error || response.statusText}`,
    );
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// YouTube Search
// ---------------------------------------------------------------------------

/**
 * Search YouTube via SerpApi.
 * Quota cost: 0 YouTube API units; 1 SerpApi search credit.
 *
 * @param query - Search query
 * @param apiKey - SerpApi API key
 * @param options - Search options
 */
export async function searchYouTube(
  query: string,
  apiKey: string,
  options?: {
    gl?: string; // Country code (e.g., "us", "uk")
    hl?: string; // Language code (e.g., "en", "es")
    sp?: string; // YouTube filter parameter
  },
): Promise<SerpApiYouTubeResult> {
  const params: Record<string, string> = {
    search_query: query,
  };
  if (options?.gl) params.gl = options.gl;
  if (options?.hl) params.hl = options.hl;
  if (options?.sp) params.sp = options.sp;

  const data = await serpApiGet(params, apiKey);

  return {
    video_results: data.video_results || [],
    searches_related_to: data.searches_related_to?.map((r: any) => r.query) || [],
  };
}

// ---------------------------------------------------------------------------
// Related Searches
// ---------------------------------------------------------------------------

/**
 * Extract related search queries for a given keyword.
 * Useful for discovering long-tail keywords and content ideas.
 * Quota cost: 1 SerpApi search credit.
 *
 * @param query - Seed keyword
 * @param apiKey - SerpApi API key
 */
export async function getRelatedSearches(
  query: string,
  apiKey: string,
): Promise<string[]> {
  const result = await searchYouTube(query, apiKey);
  return result.searches_related_to || [];
}

// ---------------------------------------------------------------------------
// Keyword Competition Analysis
// ---------------------------------------------------------------------------

/**
 * Analyze the competition for a keyword by examining top search results.
 * Returns competition metrics and top videos for the keyword.
 * Quota cost: 1 SerpApi search credit.
 *
 * @param query - Target keyword
 * @param apiKey - SerpApi API key
 */
export async function getKeywordCompetition(
  query: string,
  apiKey: string,
): Promise<{
  topVideos: SerpApiVideoResult[];
  relatedSearches: string[];
  avgViews: number;
  medianViews: number;
  totalResults: number;
}> {
  const result = await searchYouTube(query, apiKey);
  const videos = result.video_results || [];

  const views = videos.map((v) => v.views || 0).filter((v) => v > 0);
  const avgViews = views.length > 0 ? views.reduce((s, v) => s + v, 0) / views.length : 0;

  // Median views
  const sorted = [...views].sort((a, b) => a - b);
  const medianViews =
    sorted.length > 0
      ? sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      : 0;

  return {
    topVideos: videos,
    relatedSearches: result.searches_related_to || [],
    avgViews,
    medianViews,
    totalResults: videos.length,
  };
}

// ---------------------------------------------------------------------------
// Full Keyword Research
// ---------------------------------------------------------------------------

/**
 * Perform comprehensive keyword research for a set of seed keywords.
 * Combines search results, competition analysis, and related keywords.
 * Quota cost: 1 SerpApi credit per seed keyword.
 *
 * @param seedKeywords - Array of seed keywords to research
 * @param apiKey - SerpApi API key
 */
export async function researchKeywords(
  seedKeywords: string[],
  apiKey: string,
): Promise<KeywordOpportunity[]> {
  const opportunities: KeywordOpportunity[] = [];

  for (const keyword of seedKeywords) {
    const competition = await getKeywordCompetition(keyword, apiKey);

    // Calculate age of top results
    const now = new Date();
    const ages = competition.topVideos
      .map((v) => estimateDaysFromRelativeDate(v.published_date))
      .filter((a) => a > 0);
    const avgAge = ages.length > 0 ? ages.reduce((s, a) => s + a, 0) / ages.length : 365;

    // Estimate search volume from view counts
    let searchVolEstimate: "high" | "medium" | "low";
    if (competition.avgViews > 100_000) searchVolEstimate = "high";
    else if (competition.avgViews > 10_000) searchVolEstimate = "medium";
    else searchVolEstimate = "low";

    // Competition score (0-100, lower = less competition)
    const highViewVideos = competition.topVideos.filter((v) => (v.views || 0) > 500_000).length;
    const competitionScore = Math.min(100, highViewVideos * 12);

    // Opportunity score
    const demandSignal = Math.min(100, Math.log10(Math.max(1, competition.avgViews)) * 20);
    const freshnessFactor = avgAge < 30 ? 90 : avgAge < 90 ? 70 : avgAge < 180 ? 50 : 30;
    const opportunityScore = Math.round(
      demandSignal * 0.5 + (100 - competitionScore) * 0.3 + freshnessFactor * 0.2,
    );

    // Map top videos
    const topVideos: KeywordTopVideo[] = competition.topVideos.slice(0, 5).map((v) => ({
      videoId: extractVideoId(v.link) || "",
      title: v.title,
      channelName: v.channel?.name || "",
      channelSubscribers: 0, // SerpApi doesn't provide this directly
      viewCount: v.views || 0,
      publishedAt: v.published_date || "",
    }));

    opportunities.push({
      keyword,
      searchVolEstimate,
      competitionScore,
      opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
      avgTopResultViews: competition.avgViews,
      avgTopResultAge: avgAge,
      relatedKeywords: competition.relatedSearches,
      topVideos,
    });
  }

  // Sort by opportunity score descending
  return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

// ---------------------------------------------------------------------------
// Trending Content Discovery
// ---------------------------------------------------------------------------

/**
 * Discover trending content in a niche by searching for recent uploads
 * with high view velocity.
 * Quota cost: 1-2 SerpApi search credits.
 *
 * @param niche - Topic or niche to explore
 * @param apiKey - SerpApi API key
 * @param options - Optional region and language settings
 */
export async function discoverTrending(
  niche: string,
  apiKey: string,
  options?: { gl?: string; hl?: string },
): Promise<SerpApiVideoResult[]> {
  // Search with recency filter (sp parameter for "this week")
  // sp=EgQIAxAB filters for videos uploaded this week
  const result = await searchYouTube(niche, apiKey, {
    gl: options?.gl,
    hl: options?.hl,
    sp: "EgQIAxAB",
  });

  // Sort by views to find high-velocity recent content
  const videos = (result.video_results || []).sort(
    (a, b) => (b.views || 0) - (a.views || 0),
  );

  return videos;
}

// ---------------------------------------------------------------------------
// YouTube Search Filters (sp parameter values)
// ---------------------------------------------------------------------------

/**
 * Common YouTube search filter parameters for the `sp` query parameter.
 * These can be combined by encoding them together.
 */
export const SEARCH_FILTERS = {
  // Upload date
  LAST_HOUR: "EgQIARAB",
  TODAY: "EgQIAhAB",
  THIS_WEEK: "EgQIAxAB",
  THIS_MONTH: "EgQIBBAB",
  THIS_YEAR: "EgQIBRAB",

  // Sort by
  SORT_RELEVANCE: "", // default
  SORT_UPLOAD_DATE: "CAISAhAB",
  SORT_VIEW_COUNT: "CAMSAhAB",
  SORT_RATING: "CAESAhAB",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function estimateDaysFromRelativeDate(relativeDate: string): number {
  if (!relativeDate) return 365;
  const lower = relativeDate.toLowerCase();
  const match = lower.match(/(\d+)/);
  const num = match ? parseInt(match[1], 10) : 1;

  if (lower.includes("hour") || lower.includes("minute")) return 0;
  if (lower.includes("day")) return num;
  if (lower.includes("week")) return num * 7;
  if (lower.includes("month")) return num * 30;
  if (lower.includes("year")) return num * 365;
  if (lower.includes("stream")) return 0; // live streams
  return 365;
}
