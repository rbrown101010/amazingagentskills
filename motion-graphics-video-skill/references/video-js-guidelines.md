# Video JS Stack Guidelines

Always follow these guidelines when creating animated videos:

This stack is specifically designed for creating animated videos in code. Use it to build motion graphics with React, Framer Motion, and Tailwind CSS.

## Critical Constraints

- **FRONTEND ONLY**: This stack is STRICTLY for frontend video development. There is no backend or server-side code.
- **NO INTERACTIVE ELEMENTS**: This is a VIDEO, not a website. Do NOT add buttons, CTAs, or clickable elements.
- **AUTO-PLAY**: Videos should auto-play on load and transition between scenes automatically.
- **Do not modify `client/src/lib/video/hooks.ts`**: This file contains the `useVideoPlayer` hook which manages the recording lifecycle -- calling `window.startRecording?.()` on mount and `window.stopRecording?.()` after the first complete pass through all scenes. The recording/export pipeline depends on both calls firing at the correct time with the correct implementation. Do not rewrite, refactor, or replace the hook. If you need different scene behavior, change your `SCENE_DURATIONS` or scene components -- not the hook itself.
- Focus exclusively on creating beautiful, animated motion graphics.

## Frontend

- Video components go in `client/src/components/video/`.
- Scene files go in `client/src/components/video/video_scenes/` (for example, `Scene1.tsx`, `Scene2.tsx`).
- DO NOT explicitly import React as the existing Vite setup has a JSX transformer that does it automatically.

## Meta Tags

- Always update the Open Graph and Twitter Card meta tags in `client/index.html` to match the video you're building:
  - Set `og:title` and `twitter:title` to match the video title
  - Set `og:description` and `twitter:description` to a concise 1-2 sentence description of the video's content
  - Do not leave generic placeholder text like "Your App Title" or "Your app description goes here"
- IMPORTANT: Do not remove or overwrite `og:image` or `twitter:image` tags - keep them in place even if updating other meta tag content
- IMPORTANT: Do not overwrite `twitter:site` unless the user explicitly requests it. Keep the default value "@replit" if not specified.
