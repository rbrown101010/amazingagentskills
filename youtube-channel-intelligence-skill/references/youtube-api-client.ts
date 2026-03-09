// ============================================================================
// YouTube Channel Intelligence — YouTube Data API v3 Client
// ============================================================================
//
// Wrapper for the YouTube Data API v3 with built-in quota tracking.
// Every call logs its quota cost to data/quota-log.json.
//
// IMPORTANT: This file is a reference implementation for the agent to adapt.
// It is NOT executed directly — the agent reads this code and uses the
// patterns when making API calls via fetch or the YouTube SDK.
// ============================================================================

import type {
  VideoSnapshot,
  ChannelSnapshot,
  QuotaBudget,
  QuotaLogEntry,
  YouTubeAPISearchResult,
} from "./types";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

// ---------------------------------------------------------------------------
// Quota Costs (per YouTube Data API documentation)
// ---------------------------------------------------------------------------

const QUOTA_COSTS = {
  "search.list": 100,
  "videos.list": 1,
  "channels.list": 1,
  "playlistItems.list": 1,
  "commentThreads.list": 1,
} as const;

// ---------------------------------------------------------------------------
// Core Request Function
// ---------------------------------------------------------------------------

async function youtubeGet<T>(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
  quotaBudget: QuotaBudget,
  taskType: string,
): Promise<T> {
  const quotaCost = QUOTA_COSTS[endpoint as keyof typeof QUOTA_COSTS] || 1;

  // Check quota budget before calling
  if (quotaBudget.usedToday + quotaCost > quotaBudget.dailyLimit * 0.95) {
    throw new Error(
      `YouTube API quota would exceed 95% limit (${quotaBudget.usedToday + quotaCost}/${quotaBudget.dailyLimit}). ` +
        `Defer non-critical tasks or use Supadata/SerpApi alternatives.`,
    );
  }

  if (quotaBudget.usedToday + quotaCost > quotaBudget.dailyLimit * quotaBudget.warningThreshold) {
    console.warn(
      `[QUOTA WARNING] YouTube API usage at ${((quotaBudget.usedToday + quotaCost) / quotaBudget.dailyLimit * 100).toFixed(0)}% ` +
        `(${quotaBudget.usedToday + quotaCost}/${quotaBudget.dailyLimit} units).`,
    );
  }

  const url = new URL(`${BASE_URL}/${endpoint.replace(".", "/")}`);
  url.searchParams.set("key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const reason = error?.error?.errors?.[0]?.reason;

    if (reason === "quotaExceeded") {
      throw new Error("YouTube API daily quota exceeded. Wait for midnight PT reset.");
    }
    throw new Error(
      `YouTube API error (${response.status}): ${error?.error?.message || response.statusText}`,
    );
  }

  // Track quota usage after successful call
  quotaBudget.usedToday += quotaCost;

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Channel Stats
// ---------------------------------------------------------------------------

/**
 * Fetch channel statistics and metadata.
 * Quota cost: 1 unit.
 *
 * @param channelId - YouTube channel ID (starts with "UC")
 * @param apiKey - YouTube Data API key
 * @param budget - Quota budget tracker
 */
export async function fetchChannelStats(
  channelId: string,
  apiKey: string,
  budget: QuotaBudget,
): Promise<ChannelSnapshot> {
  const data = await youtubeGet<any>(
    "channels.list",
    {
      part: "snippet,statistics,contentDetails",
      id: channelId,
    },
    apiKey,
    budget,
    "fetchChannelStats",
  );

  const item = data.items?.[0];
  if (!item) throw new Error(`Channel not found: ${channelId}`);

  return {
    channelId: item.id,
    handle: item.snippet.customUrl || "",
    name: item.snippet.title,
    description: item.snippet.description,
    subscriberCount: parseInt(item.statistics.subscriberCount, 10) || 0,
    totalViews: parseInt(item.statistics.viewCount, 10) || 0,
    videoCount: parseInt(item.statistics.videoCount, 10) || 0,
    customUrl: item.snippet.customUrl || "",
    thumbnailUrl: item.snippet.thumbnails?.default?.url || "",
    publishedAt: item.snippet.publishedAt,
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Video Stats (Batched)
// ---------------------------------------------------------------------------

/**
 * Fetch detailed video statistics for up to 50 videos at once.
 * Quota cost: 1 unit per call (regardless of how many IDs, up to 50).
 *
 * @param videoIds - Array of YouTube video IDs (max 50 per call)
 * @param apiKey - YouTube Data API key
 * @param budget - Quota budget tracker
 */
export async function fetchVideoStats(
  videoIds: string[],
  apiKey: string,
  budget: QuotaBudget,
): Promise<VideoSnapshot[]> {
  const results: VideoSnapshot[] = [];

  // Batch in groups of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await youtubeGet<any>(
      "videos.list",
      {
        part: "snippet,statistics,contentDetails,topicDetails",
        id: batch.join(","),
      },
      apiKey,
      budget,
      "fetchVideoStats",
    );

    for (const item of data.items || []) {
      results.push({
        videoId: item.id,
        channelId: item.snippet.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount, 10) || 0,
        likeCount: parseInt(item.statistics.likeCount, 10) || 0,
        commentCount: parseInt(item.statistics.commentCount, 10) || 0,
        duration: item.contentDetails.duration,
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId || "",
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.default?.url || "",
        hasCustomThumbnail: !!item.snippet.thumbnails?.maxres,
        defaultLanguage: item.snippet.defaultLanguage || "",
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Search Videos
// ---------------------------------------------------------------------------

/**
 * Search YouTube for videos matching a query.
 * Quota cost: 100 units — USE SPARINGLY. Prefer SerpApi or Supadata search.
 *
 * @param query - Search query string
 * @param apiKey - YouTube Data API key
 * @param budget - Quota budget tracker
 * @param options - Optional search parameters
 */
export async function searchVideos(
  query: string,
  apiKey: string,
  budget: QuotaBudget,
  options?: {
    maxResults?: number;
    order?: "date" | "rating" | "viewCount" | "relevance";
    channelId?: string;
    publishedAfter?: string;
    type?: "video" | "channel" | "playlist";
  },
): Promise<YouTubeAPISearchResult[]> {
  const params: Record<string, string> = {
    part: "snippet",
    q: query,
    type: options?.type || "video",
    maxResults: String(options?.maxResults || 25),
    order: options?.order || "relevance",
  };

  if (options?.channelId) params.channelId = options.channelId;
  if (options?.publishedAfter) params.publishedAfter = options.publishedAfter;

  const data = await youtubeGet<any>(
    "search.list",
    params,
    apiKey,
    budget,
    "searchVideos",
  );

  return data.items || [];
}

// ---------------------------------------------------------------------------
// Playlist Items (Channel Uploads)
// ---------------------------------------------------------------------------

/**
 * Fetch video IDs from a playlist (typically the channel uploads playlist).
 * Quota cost: 1 unit per page.
 *
 * @param playlistId - Playlist ID (use getUploadsPlaylistId to convert channel ID)
 * @param apiKey - YouTube Data API key
 * @param budget - Quota budget tracker
 * @param maxResults - Maximum number of video IDs to return
 */
export async function fetchPlaylistItems(
  playlistId: string,
  apiKey: string,
  budget: QuotaBudget,
  maxResults: number = 50,
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (videoIds.length < maxResults) {
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId,
      maxResults: String(Math.min(50, maxResults - videoIds.length)),
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await youtubeGet<any>(
      "playlistItems.list",
      params,
      apiKey,
      budget,
      "fetchPlaylistItems",
    );

    for (const item of data.items || []) {
      videoIds.push(item.contentDetails.videoId);
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return videoIds;
}

// ---------------------------------------------------------------------------
// Helper: Channel ID → Uploads Playlist ID
// ---------------------------------------------------------------------------

/**
 * Converts a YouTube channel ID to its uploads playlist ID.
 * Channel IDs start with "UC", uploads playlists start with "UU".
 * No API call needed — this is a string transformation.
 */
export function getUploadsPlaylistId(channelId: string): string {
  if (channelId.startsWith("UC")) {
    return "UU" + channelId.slice(2);
  }
  return channelId;
}
