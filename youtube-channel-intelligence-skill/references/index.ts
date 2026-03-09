// ============================================================================
// YouTube Channel Intelligence — Reference Library Exports
// ============================================================================

// Types & Interfaces
export type * from "./types";

// API Clients
export {
  fetchChannelStats,
  fetchVideoStats,
  searchVideos,
  fetchPlaylistItems,
  getUploadsPlaylistId,
} from "./youtube-api-client";

export {
  getTranscript,
  batchTranscripts,
  getChannelInfo,
  getChannelVideos,
  searchYouTube as supadataSearch,
  getVideoMetadata,
  analyzeTranscript,
} from "./supadata-client";

export {
  searchYouTube as serpApiSearch,
  getRelatedSearches,
  getKeywordCompetition,
  researchKeywords,
  discoverTrending,
  SEARCH_FILTERS,
} from "./serpapi-client";

// Scoring & Analysis
export {
  calculateSEOScore,
  calculateEngagementRate,
  calculateChannelHealthScore,
  calculateKeywordOpportunity,
  calculateViewVelocity,
  calculateDelta,
  detectContentGaps,
} from "./scoring-algorithms";

// Report Formatting
export {
  formatWeeklyReport,
  formatCompetitorReport,
  formatVideoAnalysis,
  formatKeywordReport,
  formatTrendingReport,
  formatSEOAudit,
  formatChannelHealth,
  formatContentStrategy,
  formatNumber,
  formatDelta,
  formatDeltaValue,
  formatScoreBar,
  formatPercent,
} from "./report-formatters";
