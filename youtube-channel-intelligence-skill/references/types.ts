// ============================================================================
// YouTube Channel Intelligence — Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Channel
// ---------------------------------------------------------------------------

export interface ChannelSnapshot {
  channelId: string;
  handle: string;
  name: string;
  description: string;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  customUrl: string;
  thumbnailUrl: string;
  publishedAt: string; // ISO 8601
  fetchedAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

export interface VideoSnapshot {
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: string; // ISO 8601
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string; // ISO 8601 duration (PT4M13S)
  tags: string[];
  categoryId: string;
  thumbnailUrl: string;
  hasCustomThumbnail: boolean;
  defaultLanguage: string;
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// SEO Scoring
// ---------------------------------------------------------------------------

export interface SEOScore {
  overall: number; // 0-100
  titleScore: number; // 0-25
  descriptionScore: number; // 0-25
  tagsScore: number; // 0-15
  engagementScore: number; // 0-20
  freshnessScore: number; // 0-15
  issues: SEOIssue[];
  suggestions: string[];
}

export interface SEOIssue {
  field: "title" | "description" | "tags" | "thumbnail";
  severity: "critical" | "warning" | "info";
  message: string;
  suggestion: string;
}

// ---------------------------------------------------------------------------
// Keyword Research
// ---------------------------------------------------------------------------

export interface KeywordOpportunity {
  keyword: string;
  searchVolEstimate: "high" | "medium" | "low";
  competitionScore: number; // 0-100 (lower = less competition)
  opportunityScore: number; // 0-100 (higher = better)
  avgTopResultViews: number;
  avgTopResultAge: number; // days since publish
  relatedKeywords: string[];
  topVideos: KeywordTopVideo[];
}

export interface KeywordTopVideo {
  videoId: string;
  title: string;
  channelName: string;
  channelSubscribers: number;
  viewCount: number;
  publishedAt: string;
}

// ---------------------------------------------------------------------------
// Weekly Report
// ---------------------------------------------------------------------------

export interface WeeklyReport {
  channelId: string;
  periodStart: string; // ISO 8601 date
  periodEnd: string;
  channel: ChannelSnapshot;
  previousChannel: ChannelSnapshot | null;
  videos: VideoSnapshot[];
  topVideo: VideoSnapshot | null;
  metrics: WeeklyMetrics;
  generatedAt: string;
}

export interface WeeklyMetrics {
  totalViews: number;
  viewsDelta: number;
  viewsDeltaPercent: number;
  subscribersDelta: number;
  subscribersDeltaPercent: number;
  avgViewsPerVideo: number;
  avgEngagementRate: number;
  uploadCount: number;
  topVideoId: string;
  totalLikes: number;
  totalComments: number;
}

// ---------------------------------------------------------------------------
// Competitor Analysis
// ---------------------------------------------------------------------------

export interface CompetitorComparison {
  userChannel: ChannelAnalysis;
  competitors: ChannelAnalysis[];
  contentGaps: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface ChannelAnalysis {
  channel: ChannelSnapshot;
  recentVideos: VideoSnapshot[];
  uploadFrequency: number; // videos per week
  avgViews: number;
  avgEngagement: number;
  growthRate: number; // subscriber growth % over period
  topPerformingVideo: VideoSnapshot | null;
  contentTopics: string[];
}

// ---------------------------------------------------------------------------
// Trending Content
// ---------------------------------------------------------------------------

export interface TrendingVideo {
  video: VideoSnapshot;
  channel: ChannelSnapshot;
  velocityScore: number; // views per day since publish
  isFromSmallChannel: boolean; // subscriber count < 10k
  trendSignals: string[];
}

export interface TrendingReport {
  niche: string;
  period: string;
  trendingVideos: TrendingVideo[];
  emergingTopics: string[];
  suggestedAngles: string[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Transcript Analysis
// ---------------------------------------------------------------------------

export interface TranscriptChunk {
  text: string;
  offset: number; // seconds
  duration: number; // seconds
}

export interface TranscriptAnalysis {
  videoId: string;
  wordCount: number;
  estimatedDurationMinutes: number;
  topKeywords: { word: string; count: number }[];
  readingLevel: string;
  topics: string[];
  summary: string;
  chunks: TranscriptChunk[];
}

// ---------------------------------------------------------------------------
// Content Strategy
// ---------------------------------------------------------------------------

export interface ContentStrategyReport {
  channelId: string;
  topPerformingPatterns: ContentPattern[];
  underperformingPatterns: ContentPattern[];
  suggestedTopics: SuggestedTopic[];
  optimalUploadSchedule: UploadSchedule;
  titleFormulas: string[];
  descriptionTemplate: string;
  generatedAt: string;
}

export interface ContentPattern {
  pattern: string;
  avgViews: number;
  avgEngagement: number;
  videoCount: number;
  exampleVideoIds: string[];
}

export interface SuggestedTopic {
  topic: string;
  targetKeyword: string;
  estimatedDemand: "high" | "medium" | "low";
  competitionLevel: "high" | "medium" | "low";
  rationale: string;
}

export interface UploadSchedule {
  bestDays: string[];
  bestTimeRanges: string[];
  recommendedFrequency: string;
  rationale: string;
}

// ---------------------------------------------------------------------------
// SEO Audit
// ---------------------------------------------------------------------------

export interface SEOAuditReport {
  channelId: string;
  overallHealthScore: number; // 0-100
  videosAudited: number;
  avgSEOScore: number;
  scoreDistribution: { range: string; count: number }[];
  worstVideos: { video: VideoSnapshot; score: SEOScore }[];
  commonIssues: { issue: string; count: number }[];
  recommendations: string[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Channel Health
// ---------------------------------------------------------------------------

export interface ChannelHealthScore {
  overall: number; // 0-100
  uploadConsistency: number; // 0-25
  engagementTrend: number; // 0-25
  subscriberGrowth: number; // 0-25
  seoHealth: number; // 0-25
  details: {
    avgUploadInterval: number; // days
    uploadVariance: number;
    engagementDirection: "up" | "down" | "flat";
    engagementDelta: number;
    subscriberGrowthRate: number; // percent per month
    avgSEOScore: number;
  };
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface SkillConfig {
  channelId: string;
  channelHandle: string;
  channelName: string;
  competitors: string[]; // channel IDs or handles
  targetKeywords: string[];
  niche: string;
  reportSchedule: string; // cron expression
  quotaBudget: QuotaBudget;
}

export interface QuotaBudget {
  dailyLimit: number; // default 10000
  usedToday: number;
  lastReset: string; // ISO date
  warningThreshold: number; // default 0.8 (80%)
}

export interface QuotaLogEntry {
  timestamp: string;
  endpoint: string;
  unitsCost: number;
  taskType: string;
  cumulativeToday: number;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface SupadataTranscriptResponse {
  content: TranscriptChunk[] | string;
  lang: string;
}

export interface SerpApiYouTubeResult {
  video_results: SerpApiVideoResult[];
  searches_related_to?: string[];
}

export interface SerpApiVideoResult {
  position: number;
  title: string;
  link: string;
  channel: { name: string; link: string };
  published_date: string;
  views: number;
  length: string;
  description: string;
  thumbnail: { static: string };
}

export interface YouTubeAPISearchResult {
  id: { kind: string; videoId?: string; channelId?: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
  };
}

// ---------------------------------------------------------------------------
// Report Formatting Helpers
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "flat";

export interface DeltaValue {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
  direction: TrendDirection;
}
