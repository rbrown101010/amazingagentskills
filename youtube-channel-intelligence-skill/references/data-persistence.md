# Data Persistence Guidelines

This document defines how the YouTube Channel Intelligence skill stores and retrieves historical data for trend analysis, delta calculations, and recurring reports.

## Directory Structure

All data is stored under a `data/` directory relative to the project root:

```
data/
├── config.json                              # Skill configuration (channel, competitors, keywords)
├── quota-log.json                           # API quota tracking
├── channel-{channelId}/
│   ├── snapshots/
│   │   └── {YYYY-MM-DD}.json                # Daily channel snapshots (ChannelSnapshot)
│   ├── weekly-reports/
│   │   └── {YYYY-MM-DD}.json                # Weekly report data (WeeklyReport)
│   ├── video-snapshots/
│   │   └── {videoId}.json                   # Per-video detail snapshots (VideoSnapshot + SEOScore)
│   ├── seo-audits/
│   │   └── {YYYY-MM-DD}.json               # Full audit reports (SEOAuditReport)
│   ├── competitor-snapshots/
│   │   └── {YYYY-MM-DD}.json               # Competitor comparison data (CompetitorComparison)
│   └── keyword-research/
│       └── {YYYY-MM-DD}-{keyword-slug}.json # Keyword research results (KeywordOpportunity[])
```

## JSON Schemas

### config.json

```json
{
  "channelId": "UCxxxxxxxxxx",
  "channelHandle": "@channelname",
  "channelName": "Channel Display Name",
  "competitors": ["UCyyyyyy", "@competitor1", "@competitor2"],
  "targetKeywords": ["keyword1", "keyword2"],
  "niche": "tech tutorials",
  "reportSchedule": "0 9 * * 1",
  "quotaBudget": {
    "dailyLimit": 10000,
    "usedToday": 0,
    "lastReset": "2026-03-09",
    "warningThreshold": 0.8
  }
}
```

### quota-log.json

```json
{
  "youtube": { "date": "2026-03-09", "used": 42, "limit": 10000 },
  "serpapi": { "month": "2026-03", "used": 8, "limit": 100 },
  "supadata": { "date": "2026-03-09", "requestCount": 15 }
}
```

### Channel Snapshot ({YYYY-MM-DD}.json)

Stores the full `ChannelSnapshot` interface from `types.ts`. One file per day the skill runs.

### Weekly Report ({YYYY-MM-DD}.json)

Stores the full `WeeklyReport` interface including `WeeklyMetrics` and all `VideoSnapshot` items from that week. The date in the filename is the report generation date (typically Monday).

### Video Snapshot ({videoId}.json)

Stores `VideoSnapshot` combined with its `SEOScore`. Updated each time the video is analyzed. Includes a `history` array tracking view count over time:

```json
{
  "video": { "...VideoSnapshot fields" },
  "seoScore": { "...SEOScore fields" },
  "history": [
    { "date": "2026-03-02", "viewCount": 12340, "likeCount": 890 },
    { "date": "2026-03-09", "viewCount": 15670, "likeCount": 1102 }
  ]
}
```

## Data Loading Procedures

### Loading Previous Snapshot for Delta Calculation

1. Determine the current date and the comparison date (e.g., 7 days ago for weekly)
2. Look for `data/channel-{id}/snapshots/{comparison-date}.json`
3. If exact date not found, find the nearest available snapshot by listing directory contents and sorting by date
4. If no previous snapshot exists (first run), set all deltas to `null` and note "baseline — trend data available next run"

### First-Run Initialization

On the very first run:

1. Create `data/config.json` with user-provided channel info
2. Create `data/quota-log.json` with zeroed counters
3. Create the channel directory structure
4. Fetch and save the initial channel snapshot
5. Generate the report with `previousChannel: null` (no deltas)
6. Clearly indicate in the report that this is a baseline snapshot

## Retention Policy

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Channel snapshots | 90 days | Sufficient for 12-week trend analysis |
| Weekly reports | 6 months | Quarterly comparison and seasonal patterns |
| Video snapshots | Indefinite | Lightweight; useful for long-term tracking |
| SEO audits | 6 months | Track SEO improvement over time |
| Competitor snapshots | 90 days | Short-term competitive tracking |
| Keyword research | 30 days | Keywords shift quickly; old data misleads |
| Quota log | 7 days | Only need recent usage; resets daily |

## File Naming Conventions

- Dates: `YYYY-MM-DD` format (ISO 8601 date only)
- Keyword slugs: lowercase, hyphens for spaces, no special characters (e.g., `react-tutorial`, `how-to-edit-videos`)
- Video IDs: use the raw YouTube video ID as-is (e.g., `dQw4w9WgXcQ`)
- Channel IDs: use the raw YouTube channel ID as-is (e.g., `UCxxxxxxxxxx`)

## Important Notes

- Always write JSON with 2-space indentation for readability
- Include a `fetchedAt` or `generatedAt` timestamp in every saved file
- Never store API keys in data files
- When reading data, handle missing files gracefully — a missing file means no history, not an error
- Use `fs.existsSync` or try/catch before reading to prevent crashes on first run
