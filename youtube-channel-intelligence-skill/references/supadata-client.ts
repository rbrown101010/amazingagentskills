// ============================================================================
// YouTube Channel Intelligence — Supadata API Client
// ============================================================================
//
// Wrapper for the Supadata API (https://api.supadata.ai/v1).
// Supadata provides YouTube transcripts, metadata, channel info, and search
// WITHOUT consuming YouTube Data API quota.
//
// IMPORTANT: This file is a reference implementation for the agent to adapt.
// It is NOT executed directly — the agent reads this code and uses the
// patterns when making API calls.
//
// SDK: @supadata/js (npm install @supadata/js)
//      or direct HTTP calls to https://api.supadata.ai/v1
// ============================================================================

import type {
  TranscriptChunk,
  TranscriptAnalysis,
  ChannelSnapshot,
  VideoSnapshot,
} from "./types";

const BASE_URL = "https://api.supadata.ai/v1";

// ---------------------------------------------------------------------------
// Core Request Function
// ---------------------------------------------------------------------------

async function supadataGet<T>(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "x-api-key": apiKey,
      "Accept": "application/json",
    },
  });

  if (response.status === 429) {
    throw new Error("Supadata rate limit exceeded. Retry with exponential backoff.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Supadata API error (${response.status}): ${error?.message || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Transcript Extraction
// ---------------------------------------------------------------------------

/**
 * Get the transcript of a YouTube video.
 * Returns plain text or timestamped chunks.
 * Quota cost: 0 YouTube API units.
 *
 * @param videoUrl - Full YouTube video URL or video ID
 * @param options - Optional language and format settings
 */
export async function getTranscript(
  videoUrl: string,
  apiKey: string,
  options?: { lang?: string; text?: boolean },
): Promise<{ content: TranscriptChunk[] | string; lang: string }> {
  const params: Record<string, string> = {
    url: normalizeVideoUrl(videoUrl),
  };
  if (options?.lang) params.lang = options.lang;
  if (options?.text) params.text = "true";

  return supadataGet("/transcript", params, apiKey);
}

/**
 * Batch fetch transcripts for multiple videos.
 * More efficient than individual calls for bulk processing.
 *
 * @param videoIds - Array of YouTube video IDs
 * @param apiKey - Supadata API key
 */
export async function batchTranscripts(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, { content: TranscriptChunk[] | string; lang: string }>> {
  const results = new Map();

  // Process in parallel batches of 5 to respect rate limits
  for (let i = 0; i < videoIds.length; i += 5) {
    const batch = videoIds.slice(i, i + 5);
    const promises = batch.map((id) =>
      getTranscript(`https://www.youtube.com/watch?v=${id}`, apiKey, { text: true })
        .then((result) => ({ id, result, error: null }))
        .catch((error) => ({ id, result: null, error })),
    );

    const settled = await Promise.all(promises);
    for (const { id, result } of settled) {
      if (result) results.set(id, result);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Channel Information
// ---------------------------------------------------------------------------

/**
 * Get channel metadata via Supadata.
 * Quota cost: 0 YouTube API units.
 *
 * @param channelIdentifier - Channel handle (@name) or channel URL
 * @param apiKey - Supadata API key
 */
export async function getChannelInfo(
  channelIdentifier: string,
  apiKey: string,
): Promise<ChannelSnapshot> {
  const data = await supadataGet<any>(
    "/youtube/channel",
    { id: normalizeChannelIdentifier(channelIdentifier) },
    apiKey,
  );

  return {
    channelId: data.id || data.channelId || "",
    handle: data.handle || data.customUrl || "",
    name: data.name || data.title || "",
    description: data.description || "",
    subscriberCount: data.subscriberCount || data.subscribers || 0,
    totalViews: data.viewCount || data.totalViews || 0,
    videoCount: data.videoCount || 0,
    customUrl: data.customUrl || data.handle || "",
    thumbnailUrl: data.thumbnail || data.thumbnailUrl || "",
    publishedAt: data.publishedAt || "",
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Channel Videos
// ---------------------------------------------------------------------------

/**
 * Get a list of recent videos from a channel.
 * Quota cost: 0 YouTube API units.
 *
 * @param channelIdentifier - Channel handle (@name), channel ID, or URL
 * @param apiKey - Supadata API key
 * @param options - Filtering and pagination options
 */
export async function getChannelVideos(
  channelIdentifier: string,
  apiKey: string,
  options?: { limit?: number; type?: "videos" | "shorts" | "streams" },
): Promise<VideoSnapshot[]> {
  const params: Record<string, string> = {
    id: normalizeChannelIdentifier(channelIdentifier),
  };
  if (options?.limit) params.limit = String(options.limit);
  if (options?.type) params.type = options.type;

  const data = await supadataGet<any[]>(
    "/youtube/channel/videos",
    params,
    apiKey,
  );

  return (data || []).map((item: any) => ({
    videoId: item.id || item.videoId || "",
    channelId: item.channelId || "",
    title: item.title || "",
    description: item.description || "",
    publishedAt: item.publishedAt || item.uploadDate || "",
    viewCount: item.viewCount || item.views || 0,
    likeCount: item.likeCount || item.likes || 0,
    commentCount: item.commentCount || item.comments || 0,
    duration: item.duration || "",
    tags: item.tags || [],
    categoryId: item.categoryId || "",
    thumbnailUrl: item.thumbnail || item.thumbnailUrl || "",
    hasCustomThumbnail: !!item.thumbnail,
    defaultLanguage: item.defaultLanguage || "",
    fetchedAt: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// YouTube Search via Supadata
// ---------------------------------------------------------------------------

/**
 * Search YouTube via Supadata (avoids YouTube API quota).
 * Quota cost: 0 YouTube API units.
 *
 * @param query - Search query
 * @param apiKey - Supadata API key
 * @param options - Search options
 */
export async function searchYouTube(
  query: string,
  apiKey: string,
  options?: {
    limit?: number;
    uploadDate?: "hour" | "day" | "week" | "month" | "year";
    sortBy?: "relevance" | "views" | "date" | "rating";
  },
): Promise<VideoSnapshot[]> {
  const params: Record<string, string> = {
    query,
  };
  if (options?.limit) params.limit = String(options.limit);
  if (options?.uploadDate) params.uploadDate = options.uploadDate;
  if (options?.sortBy) params.sortBy = options.sortBy;

  const data = await supadataGet<any[]>(
    "/youtube/search",
    params,
    apiKey,
  );

  return (data || []).map((item: any) => ({
    videoId: item.id || item.videoId || "",
    channelId: item.channelId || "",
    title: item.title || "",
    description: item.description || "",
    publishedAt: item.publishedAt || "",
    viewCount: item.viewCount || item.views || 0,
    likeCount: item.likeCount || 0,
    commentCount: item.commentCount || 0,
    duration: item.duration || "",
    tags: [],
    categoryId: "",
    thumbnailUrl: item.thumbnail || "",
    hasCustomThumbnail: false,
    defaultLanguage: "",
    fetchedAt: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Video Metadata
// ---------------------------------------------------------------------------

/**
 * Get metadata for a single video via Supadata.
 * Quota cost: 0 YouTube API units.
 *
 * @param videoUrl - YouTube video URL or ID
 * @param apiKey - Supadata API key
 */
export async function getVideoMetadata(
  videoUrl: string,
  apiKey: string,
): Promise<VideoSnapshot> {
  const data = await supadataGet<any>(
    "/youtube/video",
    { url: normalizeVideoUrl(videoUrl) },
    apiKey,
  );

  return {
    videoId: data.id || data.videoId || "",
    channelId: data.channelId || "",
    title: data.title || "",
    description: data.description || "",
    publishedAt: data.publishedAt || "",
    viewCount: data.viewCount || data.views || 0,
    likeCount: data.likeCount || data.likes || 0,
    commentCount: data.commentCount || data.comments || 0,
    duration: data.duration || "",
    tags: data.tags || [],
    categoryId: data.categoryId || "",
    thumbnailUrl: data.thumbnail || data.thumbnailUrl || "",
    hasCustomThumbnail: !!data.thumbnail,
    defaultLanguage: data.defaultLanguage || "",
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Transcript Analysis Helper
// ---------------------------------------------------------------------------

/**
 * Analyze a transcript for keyword density, topics, and word count.
 * This is a local processing function — no API call needed.
 */
export function analyzeTranscript(
  videoId: string,
  transcriptText: string,
): TranscriptAnalysis {
  const words = transcriptText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const estimatedDurationMinutes = wordCount / 150; // ~150 words per minute speaking rate

  // Keyword frequency
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to",
    "for", "of", "and", "or", "but", "not", "with", "this", "that", "it",
    "be", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "can", "i", "you", "he", "she", "we", "they",
    "my", "your", "so", "just", "like", "know", "think", "going",
    "right", "really", "very", "about", "also", "here", "there",
    "then", "now", "well", "some", "get", "got", "been", "being",
    "its", "if", "all", "more", "one", "two", "up", "out",
  ]);

  const freq = new Map<string, number>();
  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (lower.length > 3 && !stopWords.has(lower)) {
      freq.set(lower, (freq.get(lower) || 0) + 1);
    }
  }

  const topKeywords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // Simple reading level estimate based on average word length
  const avgWordLength = words.reduce((s, w) => s + w.length, 0) / words.length;
  let readingLevel: string;
  if (avgWordLength < 4.5) readingLevel = "Easy (conversational)";
  else if (avgWordLength < 5.2) readingLevel = "Moderate";
  else readingLevel = "Advanced";

  return {
    videoId,
    wordCount,
    estimatedDurationMinutes,
    topKeywords,
    readingLevel,
    topics: topKeywords.slice(0, 5).map((kw) => kw.word),
    summary: "", // Agent should generate this using LLM
    chunks: [],
  };
}

// ---------------------------------------------------------------------------
// URL Normalization Helpers
// ---------------------------------------------------------------------------

function normalizeVideoUrl(input: string): string {
  // If it's already a full URL, return as-is
  if (input.startsWith("http")) return input;
  // If it looks like a video ID, construct URL
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return `https://www.youtube.com/watch?v=${input}`;
  }
  return input;
}

function normalizeChannelIdentifier(input: string): string {
  // Handle @handle format
  if (input.startsWith("@")) return input;
  // Handle full URL
  if (input.includes("youtube.com")) {
    const match = input.match(/(?:channel\/|@)([\w-]+)/);
    if (match) return match[1].startsWith("UC") ? match[1] : `@${match[1]}`;
  }
  // Assume it's a channel ID or handle
  return input;
}
