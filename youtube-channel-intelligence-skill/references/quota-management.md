# Quota Management Guidelines

This document defines API quota budgeting, tracking, and routing strategies for the YouTube Channel Intelligence skill.

## YouTube Data API v3 Quota

**Daily limit**: 10,000 units (resets at midnight Pacific Time)

### Quota Cost Per Endpoint

| Endpoint | Operation | Cost |
|----------|-----------|------|
| `search.list` | Search videos/channels | **100 units** |
| `videos.list` | Get video details (batch up to 50 IDs) | **1 unit** |
| `channels.list` | Get channel details | **1 unit** |
| `playlistItems.list` | List playlist items (per page) | **1 unit** |
| `commentThreads.list` | List comments | **1 unit** |

### Per-Task Budget Estimates

| Task | Estimated Units | Notes |
|------|----------------|-------|
| Weekly Channel Report | 2-3 | Channel stats + batched video stats |
| Competitor Analysis (5 channels) | 3-10 | Per-channel stats + batched video stats |
| Video Deep-Dive | 1-2 | Single video stats + channel avg |
| Keyword Research | **0** | Uses SerpApi + Supadata only |
| Trending Discovery | 0-5 | Optional channel stat lookups |
| Content Strategy | 5-20 | Combines multiple data pulls |
| SEO Audit (20 videos) | 1-2 | Batched video stats |

## API Routing Decision Tree

Before making any API call, use this decision tree to pick the cheapest source:

1. **Need a transcript?** → **Supadata** (0 YouTube units)
2. **Need channel metadata** (name, subscribers, description)? → **Supadata** `youtube.channel` (0 units)
3. **Need a channel's recent video list?** → **Supadata** `youtube.channel.videos` (0 units)
4. **Need YouTube search results for keyword research?** → **SerpApi** `engine=youtube` (0 YouTube units)
5. **Need detailed video statistics** (exact view count, like count, comment count)? → **YouTube Data API** `videos.list` (1 unit per batch of up to 50)
6. **Need to search within a specific channel's content?** → **YouTube Data API** `search.list` with `channelId` filter (100 units — try Supadata search first)

**Rule**: Never use YouTube `search.list` (100 units) when SerpApi or Supadata search can provide equivalent data.

## Batch Optimization

- **Always batch video IDs**: The `videos.list` endpoint accepts up to 50 comma-separated video IDs for 1 unit total. Never call it with a single ID when you have more to fetch.
- **Paginate efficiently**: When using `playlistItems.list`, set `maxResults=50` to minimize page count.
- **Cache channel stats**: Channel metadata rarely changes within a day. Cache the first fetch and reuse it.

## Quota Tracking Procedure

1. Before every YouTube Data API call, read `data/quota-log.json`
2. Check if `lastReset` date is today; if not, reset `usedToday` to 0
3. Estimate the cost of the pending call
4. If `usedToday + cost > dailyLimit * warningThreshold` (default 80%), warn the user
5. If `usedToday + cost > dailyLimit * 0.95`, refuse the call and suggest deferring non-critical tasks
6. After a successful call, update `usedToday` and append to the log

## When Quota Runs Low

1. **Defer non-critical tasks**: Keyword research and trending discovery cost 0 YouTube units — run those instead
2. **Use cached data**: If a video or channel was fetched earlier today, reuse the cached snapshot
3. **Reduce scope**: For competitor analysis, reduce from 5 channels to 2-3
4. **Skip optional enrichment**: In weekly reports, skip fetching individual video stats and report channel-level deltas only
5. **Wait for reset**: YouTube quota resets at midnight PT daily

## SerpApi Budget

- Free plan: 100 searches/month
- Developer plan: 5,000 searches/month
- Track monthly usage in `data/quota-log.json` under `serpapi.month` and `serpapi.used`
- Each `searchYouTube()` or `getRelatedSearches()` call = 1 search

## Supadata Budget

- Rate limits vary by plan
- Use batch endpoints (`transcript.batch`, `video.batch`) whenever processing multiple items
- Implement retry with exponential backoff for 429 responses
- Track daily request count in `data/quota-log.json` under `supadata.requestCount`
