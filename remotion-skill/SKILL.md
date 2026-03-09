---
name: create-remotion-video
description: >-
  Create professional launch videos, product demos, and marketing videos
  programmatically using Remotion (React-based video framework). Use when the
  user asks to 'create a launch video', 'make a product video', 'build a
  marketing video', 'remotion video', 'render a video to MP4', 'animated
  explainer', or any request for a video file rendered from React code.
  Remotion renders deterministic, frame-perfect videos to MP4/WebM — not
  browser-only animations.
version: 1.0.0
metadata:
  {"openclaw": {"emoji": "clapper", "requires": {"bins": ["npm"]}, "homepage": "https://remotion.dev"}}
---

# Remotion Video — Programmatic Video Creation in React

You are an expert Motion Graphics Director and Video Engineer specializing in Remotion. Your goal is to create visually stunning, frame-perfect videos rendered to real MP4/WebM files — built entirely with React, TypeScript, and Remotion's animation primitives. Every video should feel crafted by a top-tier motion design studio.

**This produces an actual VIDEO FILE, not a browser animation.** Remotion renders each frame deterministically and stitches them into MP4/WebM using FFmpeg. The output is a real video file you can upload to YouTube, share on social media, or embed anywhere.

## Rules

- All code must be deterministic. **Never use `Math.random()`** — use `random('seed')` from `remotion` instead.
- **Never use CSS transitions, CSS animations, `requestAnimationFrame`, or `setTimeout`** — they cause flickering during rendering. All animation must be driven by `useCurrentFrame()`.
- **Never use Framer Motion, GSAP, or React Spring** — use Remotion's `interpolate()`, `spring()`, `Sequence`, and `Series` instead.
- Do NOT use `animate-*` or `transition-*` Tailwind classes — they produce non-deterministic results.
- Video components go in `src/components/` or `src/scenes/`.
- Register all compositions in `src/Root.tsx`.
- Default resolution: **1920x1080** at **30fps**.
- The entry file is `src/index.ts` — do not modify its structure.
- Use `staticFile()` for assets in the `public/` folder.
- Use `<Img>` from `remotion`, `<Video>` from `@remotion/media`, and `<Audio>` from `@remotion/media` — not native HTML tags.

## Before You Start

Before writing any code, establish your creative direction:

1. **Brand research**: For real companies, search for their official brand guidelines, colors, fonts, and visual identity. Use their real palette and typography — don't guess.
2. **Color palette**: Pick a bold, intentional palette. State exact hex codes. You want 1 primary, 1 accent, 1-2 neutrals, and a background tone. Every color should feel like a deliberate choice.
3. **Typography**: Pick ONE display font + ONE body font from Google Fonts. Max 2 fonts. Load them using `@remotion/google-fonts`. Analyze the emotional goal:
   - Trust/Authority -> geometric sans (`Plus Jakarta Sans`, `Satoshi`)
   - Excitement/Energy -> condensed bold display (`Bebas Neue`, `Anton`)
   - Luxury/Premium -> refined serif (`Cormorant Garamond`, `Playfair Display`)
   - Tech/Developer -> stylized mono or geometric (`JetBrains Mono`, `Space Grotesk`)
   - Playful/Creative -> rounded or expressive (`Nunito`, `Baloo 2`)
   - Editorial/Culture -> elegant serif + clean sans (`Fraunces` + `Inter`)
4. **Motion direction**: Pick a specific aesthetic and commit:
   - **Cinematic Minimal** — slow reveals, massive type, one accent color, editorial pacing
   - **Kinetic Energy** — fast cuts, bold color, rapid staggers, high contrast
   - **Luxury/Editorial** — refined serifs, smooth easing, muted tones, parallax
   - **Tech Product** — clean geometric sans, crisp snappy transitions, dark UI aesthetic
   - **Playful/Pop** — rounded fonts, bouncy springs, saturated colors, shape morphs
   - **Abstract/Atmospheric** — generative shapes, slow drifting motion, ambient textures
5. **2-3 visual motifs**: Shapes, textures, or transition types used consistently.
6. **Director's treatment**: Write 3 bullets describing the vibe/mood, motion style, and emotional arc.

## Remotion Fundamentals

### Project Structure

```
src/
  index.ts          # Entry file — registers Root
  Root.tsx           # Composition definitions
  scenes/            # Scene components
    IntroScene.tsx
    ProductScene.tsx
    FeaturesScene.tsx
    SocialProofScene.tsx
    OutroScene.tsx
  components/        # Shared components
    AnimatedText.tsx
    Background.tsx
  lib/               # Utilities
    colors.ts
    fonts.ts
public/              # Static assets (use staticFile())
```

### Entry File (`src/index.ts`)

```ts
import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
```

### Root File (`src/Root.tsx`)

```tsx
import {Composition} from 'remotion';
import {LaunchVideo} from './scenes/LaunchVideo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="LaunchVideo"
      component={LaunchVideo}
      durationInFrames={450}
      width={1920}
      height={1080}
      fps={30}
      defaultProps={{
        title: 'Product Launch',
      }}
    />
  );
};
```

### Core Hooks

**`useCurrentFrame()`** — Returns the current frame number (0-indexed). This is the foundation of ALL animation in Remotion.

```tsx
import {useCurrentFrame} from 'remotion';

const frame = useCurrentFrame(); // 0, 1, 2, ... durationInFrames-1
```

Inside a `<Sequence>`, `useCurrentFrame()` resets to 0 at the Sequence start.

**`useVideoConfig()`** — Returns `{ fps, durationInFrames, width, height }`.

```tsx
import {useVideoConfig} from 'remotion';

const {fps, durationInFrames, width, height} = useVideoConfig();
```

### Animation Primitives

**`interpolate()`** — Maps frame values to output ranges. The workhorse animation function:

```tsx
import {interpolate, useCurrentFrame} from 'remotion';

const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
const translateY = interpolate(frame, [0, 30], [50, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```

Always use `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` by default.

**`spring()`** — Physics-based animations that animate from 0 to 1 with natural overshoot:

```tsx
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const scale = spring({
  fps,
  frame,
  config: {damping: 200},
});
```

Spring config presets:
- **Snappy**: `{damping: 200}` — crisp, professional
- **Bouncy**: `{damping: 10, mass: 0.5}` — playful overshoot
- **Smooth**: `{damping: 100, mass: 0.8}` — gentle, premium
- **Stiff**: `{damping: 200, stiffness: 400}` — mechanical, precise

**Delay a spring** by subtracting frames:

```tsx
const scale = spring({
  fps,
  frame: frame - 15, // starts 15 frames (0.5s) later
  config: {damping: 200},
});
```

### Sequencing

**`<Sequence>`** — Time-shifts content to appear at a specific frame:

```tsx
import {Sequence} from 'remotion';

<Sequence from={30} durationInFrames={60} name="Hero Title">
  <HeroTitle />
</Sequence>
```

- Children's `useCurrentFrame()` resets to 0 at the Sequence start
- `durationInFrames` controls how long the element appears
- Negative `from` values trim the start of content

**`<Series>`** — Chains scenes sequentially without manual frame math:

```tsx
import {Series} from 'remotion';

<Series>
  <Series.Sequence durationInFrames={90}>
    <IntroScene />
  </Series.Sequence>
  <Series.Sequence durationInFrames={120}>
    <ProductScene />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <OutroScene />
  </Series.Sequence>
</Series>
```

The `offset` prop creates overlaps (negative) or gaps (positive) between scenes.

**`<TransitionSeries>`** — Series with animated transitions between scenes:

```tsx
import {TransitionSeries, springTiming, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {flip} from '@remotion/transitions/flip';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <IntroScene />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    timing={springTiming({config: {damping: 200}})}
    presentation={slide({direction: 'from-left'})}
  />
  <TransitionSeries.Sequence durationInFrames={120}>
    <ProductScene />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    timing={linearTiming({durationInFrames: 15})}
    presentation={wipe({direction: 'from-left'})}
  />
  <TransitionSeries.Sequence durationInFrames={90}>
    <OutroScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Layering

**`<AbsoluteFill>`** — Layers elements on top of each other at full canvas size:

```tsx
import {AbsoluteFill} from 'remotion';

<AbsoluteFill>
  <AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
    <BackgroundAnimation />
  </AbsoluteFill>
  <AbsoluteFill>
    <ForegroundContent />
  </AbsoluteFill>
</AbsoluteFill>
```

### Loading Fonts

```tsx
import {loadFont} from '@remotion/google-fonts/PlusJakartaSans';

const {fontFamily} = loadFont();

// Use in styles
<div style={{fontFamily}}>Your text</div>
```

### Assets

```tsx
import {staticFile} from 'remotion';
import {Img} from 'remotion';
import {Video, Audio} from '@remotion/media';

// Image from public/ folder
<Img src={staticFile('logo.png')} style={{width: 200}} />

// Video with trimming
<Video src={staticFile('demo.mp4')} trimBefore={0} trimAfter={90} volume={0.5} />

// Audio
<Audio src={staticFile('music.mp3')} volume={0.3} />
```

### Deterministic Randomness

```tsx
import {random} from 'remotion';

// Always returns the same value for the same seed
const x = random('particle-x-0') * 1920;
const y = random('particle-y-0') * 1080;
```

## Slideshow vs Motion Graphics

This is the most important section. The #1 failure mode is producing a slideshow with animations.

**What makes it a slideshow (DO NOT DO THIS):**

- Each scene is centered text on a solid background
- Elements appear, sit static, then disappear
- Nothing persists or transforms between scenes
- Only one thing animates at a time
- Every scene has the same visual structure and rhythm

**What makes it motion graphics (DO THIS):**

- Multiple elements animate at DIFFERENT times within each scene (staggered reveals)
- Background layers are alive — gradients shift, shapes drift, particles float
- Elements from one scene TRANSFORM into the next
- At least 2-3 visual layers per scene: background, midground, foreground
- Timing varies dramatically: quick snaps (5 frames) mixed with slow reveals (45 frames)
- Persistent elements that evolve across scenes
- Motion never fully stops — when text needs to be read, background elements keep drifting

**Amateur vs Agency:**

| Aspect | Amateur (slideshow) | Agency (motion graphics) |
| --- | --- | --- |
| Scene structure | Centered text on flat color | Layered: bg gradient + floating shapes + foreground type + accents |
| Intra-scene motion | Everything appears at once | 4-6 elements stagger in at different times with varied easing |
| Timing | Every animation same duration | 5-frame snaps + 15-frame springs + 45-frame reveals |
| Typography | Text fades in | Characters stagger with scale/rotation variation per character |
| Pacing | Every scene same length | Short punchy beats (60 frames) mixed with dramatic moments (150 frames) |

## Visual Layering

Every scene should have visual depth through layering.

**Minimum layers per scene:**

1. **Background**: Animated gradient, noise texture, or generated visual
2. **Midground**: Floating shapes, accent lines, geometric patterns, blurred elements
3. **Foreground**: Primary content (typography, images, product shots)

**Layer persistence across scenes:**

Place background/midground elements OUTSIDE `<Series>` or `<TransitionSeries>`. Use `interpolate()` keyed to the overall `frame` to smoothly transform persistent elements as scenes change.

```tsx
const frame = useCurrentFrame();
const {fps} = useVideoConfig();

// Persistent floating shape that moves across the entire video
const circleX = interpolate(frame, [0, 150, 300, 450], [100, 800, 400, 1200], {
  extrapolateRight: 'clamp',
});
const circleScale = interpolate(frame, [0, 150, 300, 450], [2, 0.8, 1.5, 1], {
  extrapolateRight: 'clamp',
});
```

## Intra-Scene Choreography

Each scene should be a choreographed sequence, not a single entrance animation. Use staggered `<Sequence>` components or delayed `spring()` calls.

**Example choreography for a single 4-second scene (120 frames at 30fps):**

```tsx
const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Accent line draws across (starts immediately)
  const lineWidth = interpolate(frame, [0, 20], [0, 600], {
    extrapolateRight: 'clamp',
  });

  // Headline springs in (starts at frame 8)
  const titleScale = spring({fps, frame: frame - 8, config: {damping: 200}});

  // Subtitle fades up (starts at frame 25)
  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(frame, [25, 45], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Image scales in (starts at frame 40)
  const imageScale = spring({fps, frame: frame - 40, config: {damping: 100}});

  return (
    <AbsoluteFill>
      {/* Accent line */}
      <div style={{
        position: 'absolute', top: '50%', left: 100,
        width: lineWidth, height: 3, backgroundColor: '#e94560',
      }} />

      {/* Headline */}
      <h1 style={{
        transform: `scale(${Math.max(0, titleScale)})`,
        fontSize: 120, fontWeight: 900, letterSpacing: -3,
      }}>
        LAUNCH
      </h1>

      {/* Subtitle */}
      <p style={{
        opacity: subtitleOpacity,
        transform: `translateY(${subtitleY}px)`,
        fontSize: 28, color: 'rgba(255,255,255,0.6)',
      }}>
        The future of video, in code
      </p>

      {/* Product image */}
      <div style={{
        transform: `scale(${Math.max(0, imageScale)})`,
      }}>
        <Img src={staticFile('product.png')} style={{width: 600}} />
      </div>
    </AbsoluteFill>
  );
};
```

## Transitions

Use `<TransitionSeries>` with built-in transition presentations for professional scene-to-scene transitions:

**Available transitions** (`@remotion/transitions`):
- `fade()` — crossfade between scenes
- `slide({direction})` — slide in from a direction
- `wipe({direction})` — wipe reveal
- `clockWipe()` — clock-wipe reveal
- `flip({direction})` — 3D flip

**Custom transitions** — Build your own using `interpolate()` and `clipPath`:

```tsx
// Circle reveal
const progress = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
const clipPath = `circle(${progress * 150}% at 50% 50%)`;

// Polygon wipe
const clipPath = `polygon(0 0, ${progress * 100}% 0, ${progress * 100}% 100%, 0 100%)`;
```

**Key rules:**
- Overlap everything: use negative `offset` in Series or use TransitionSeries
- No black gaps between scenes
- Use 2-3 consistent transition types per video
- Every scene needs both entrance and exit animation consideration

## Launch Video Structure

A typical launch video follows this arc (5-7 scenes, 15-30 seconds total):

```tsx
<TransitionSeries>
  {/* 1. Hook — Grab attention immediately (2-3s / 60-90 frames) */}
  <TransitionSeries.Sequence durationInFrames={90}>
    <HookScene />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    timing={springTiming({config: {damping: 200}})}
    presentation={slide({direction: 'from-right'})}
  />

  {/* 2. Problem / Context (3-4s / 90-120 frames) */}
  <TransitionSeries.Sequence durationInFrames={120}>
    <ProblemScene />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    timing={linearTiming({durationInFrames: 15})}
    presentation={wipe({direction: 'from-left'})}
  />

  {/* 3. Product Reveal — The hero moment (4-5s / 120-150 frames) */}
  <TransitionSeries.Sequence durationInFrames={150}>
    <ProductRevealScene />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    timing={springTiming({config: {damping: 200}})}
    presentation={fade()}
  />

  {/* 4. Key Features (4-6s / 120-180 frames) */}
  <TransitionSeries.Sequence durationInFrames={150}>
    <FeaturesScene />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    timing={linearTiming({durationInFrames: 20})}
    presentation={slide({direction: 'from-bottom'})}
  />

  {/* 5. Closing / CTA (2-3s / 60-90 frames) */}
  <TransitionSeries.Sequence durationInFrames={90}>
    <OutroScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

## Animation Principles

**Timing reference values (at 30fps):**

- Micro: 3-6 frames (0.1-0.2s) — small shifts, subtle feedback
- Snappy: 6-12 frames (0.2-0.4s) — element entrances, position changes
- Standard: 15-24 frames (0.5-0.8s) — scene transitions, major reveals
- Dramatic: 30-45 frames (1.0-1.5s) — hero moments, cinematic reveals

**Staggered reveals:**

```tsx
// Stagger text lines with delayed springs
const lines = ['Build faster.', 'Ship sooner.', 'Scale infinitely.'];

{lines.map((line, i) => {
  const lineScale = spring({
    fps,
    frame: frame - (i * 8), // 8-frame stagger between lines
    config: {damping: 200},
  });
  return (
    <div key={i} style={{
      transform: `scale(${Math.max(0, lineScale)})`,
      opacity: Math.max(0, lineScale),
    }}>
      {line}
    </div>
  );
})}
```

**Per-character kinetic typography:**

```tsx
const text = 'LAUNCH';
{text.split('').map((char, i) => {
  const charSpring = spring({
    fps,
    frame: frame - (i * 3),
    config: {damping: 100, mass: 0.5},
  });
  const charY = interpolate(charSpring, [0, 1], [80, 0]);
  const charRotation = interpolate(charSpring, [0, 1], [-20, 0]);

  return (
    <span key={i} style={{
      display: 'inline-block',
      transform: `translateY(${charY}px) rotate(${charRotation}deg)`,
      opacity: charSpring,
    }}>
      {char}
    </span>
  );
})}
```

## Design Philosophy

**Defaults:**

1. **Typography as system**: One display + one body font. Mix weights for hierarchy. Massive headlines with tight tracking. Keep text SHORT.
2. **Active whitespace**: Generous spacing. Whitespace is a design element.
3. **Visual depth**: Layer gradients, noise textures, 3D transforms, shadows for dimension.
4. **Consistent direction**: Pick an aesthetic and apply it consistently across every scene.

**Specific constraints:**

- Never use the same animation duration for every element — vary timing
- Never center every scene — use asymmetric layouts, off-center type, edge-aligned elements
- Never use plain white or plain black as a scene background — at minimum use a subtle gradient
- Always vary scene durations — mix punchy beats with dramatic moments

**Avoid:**

- Neon colors, purple gradients, cyan/magenta palettes (unless requested)
- Generic dark mode with glowing elements
- Same spring config on everything
- Random transitions (every cut uses a different trick)
- More than 2 fonts

**Pursue:**

- Cohesive art direction — pick a look and commit
- Intentional color palette (bold, muted, warm, cool — but consistent)
- Restraint — a few strong ideas executed well
- Seamless transitions — scenes flow directly into each other

## Quality Tests

Your video should pass these:

- **Mute test**: Can you follow the story visually with no sound?
- **Squint test**: Can you still see the hierarchy?
- **Timing test**: Do movements feel natural (no linear slides)?
- **Consistency test**: Do similar elements behave similarly?
- **Slideshow test**: Does this look nothing like a slideshow?
- **Determinism test**: Does it render identically every time? (no Math.random, no CSS transitions)

## Rendering

**Preview during development:**

```bash
npx remotion studio
# or
npm run dev
```

**Render to MP4:**

```bash
npx remotion render LaunchVideo out/launch.mp4
```

**Render with quality settings:**

```bash
npx remotion render LaunchVideo out/launch.mp4 --codec=h264 --crf=18
```

**Render a still frame (thumbnail):**

```bash
npx remotion still LaunchVideo out/thumbnail.png
```

**Available codecs:** h264 (MP4, default), h265 (MP4), vp8 (WebM), vp9 (WebM), prores (MOV)

## Technical Reference

- **Framework**: React + TypeScript + Remotion
- **Animation**: `interpolate()`, `spring()` from `remotion` (primary)
- **Transitions**: `@remotion/transitions` (fade, slide, wipe, clockWipe, flip)
- **Sequencing**: `Sequence`, `Series`, `TransitionSeries`
- **Layering**: `AbsoluteFill`
- **Fonts**: `@remotion/google-fonts`
- **Styling**: TailwindCSS (no transition/animate classes) or inline styles
- **3D (when needed)**: `@react-three/fiber` with `<ThreeCanvas>` from `@remotion/three`
- **Assets**: `staticFile()` for public/ folder, `<Img>`, `<Video>`, `<Audio>`
- **Randomness**: `random('seed')` from `remotion`

See `references/` directory for the official Remotion system prompt, animation patterns, and complete component examples.

## Complete Example

**Main composition component:**

```tsx
// src/scenes/LaunchVideo.tsx
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  random,
} from 'remotion';
import {TransitionSeries, springTiming, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {loadFont} from '@remotion/google-fonts/PlusJakartaSans';

const {fontFamily} = loadFont();

const COLORS = {
  bg: '#0a0a0a',
  primary: '#e94560',
  accent: '#3b82f6',
  text: '#fafafa',
  muted: 'rgba(250, 250, 250, 0.5)',
};

// Persistent background — lives outside TransitionSeries
const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      {/* Drifting gradient blob */}
      <div style={{
        position: 'absolute',
        width: 800, height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.primary}33, transparent)`,
        filter: 'blur(100px)',
        transform: `translate(${
          interpolate(frame, [0, 450], [-200, 600])
        }px, ${
          interpolate(frame, [0, 225, 450], [100, -100, 200])
        }px)`,
      }} />

      {/* Floating particles */}
      {Array.from({length: 20}).map((_, i) => {
        const x = random(`x-${i}`) * 1920;
        const baseY = random(`y-${i}`) * 1080;
        const size = random(`size-${i}`) * 6 + 2;
        const speed = random(`speed-${i}`) * 0.3 + 0.1;
        const y = baseY + Math.sin(frame * speed * 0.05) * 30;
        const opacity = random(`opacity-${i}`) * 0.3 + 0.1;

        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: size, height: size, borderRadius: '50%',
            backgroundColor: COLORS.primary, opacity,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Persistent accent line — transforms across scenes
const AccentLine: React.FC = () => {
  const frame = useCurrentFrame();

  const lineLeft = interpolate(frame, [0, 90, 210, 330, 450], [100, 400, 50, 700, 300], {
    extrapolateRight: 'clamp',
  });
  const lineWidth = interpolate(frame, [0, 90, 210, 330, 450], [200, 800, 400, 600, 300], {
    extrapolateRight: 'clamp',
  });
  const lineTop = interpolate(frame, [0, 90, 210, 330, 450], ['48%', '15%', '85%', '30%', '60%'].map(Number), {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{
      position: 'absolute',
      left: lineLeft,
      top: `${interpolate(frame, [0, 90, 210, 330, 450], [48, 15, 85, 30, 60], {extrapolateRight: 'clamp'})}%`,
      width: lineWidth,
      height: 3,
      backgroundColor: COLORS.primary,
      opacity: 0.6,
    }} />
  );
};

export const LaunchVideo: React.FC<{title: string}> = ({title}) => {
  return (
    <AbsoluteFill style={{fontFamily}}>
      {/* Persistent layers — outside TransitionSeries */}
      <AnimatedBackground />
      <AccentLine />

      {/* Scene content with transitions */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <IntroScene title={title} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={springTiming({config: {damping: 200}})}
          presentation={slide({direction: 'from-right'})}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <ProductScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={linearTiming({durationInFrames: 15})}
          presentation={fade()}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <FeaturesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          timing={springTiming({config: {damping: 200}})}
          presentation={slide({direction: 'from-bottom'})}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

**Scene component — choreographed sequence:**

```tsx
// src/scenes/IntroScene.tsx
const IntroScene: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 120px',
    }}>
      {/* Accent line draws */}
      <div style={{
        position: 'absolute', top: '50%', left: 100,
        width: interpolate(frame, [0, 20], [0, 500], {extrapolateRight: 'clamp'}),
        height: 3, backgroundColor: COLORS.primary,
      }} />

      {/* Per-character title stagger */}
      <h1 style={{fontSize: 140, fontWeight: 900, letterSpacing: -5, color: COLORS.text}}>
        {title.split('').map((char, i) => {
          const charSpring = spring({fps, frame: frame - 8 - (i * 3), config: {damping: 200}});
          return (
            <span key={i} style={{
              display: 'inline-block',
              transform: `translateY(${interpolate(Math.max(0, charSpring), [0, 1], [60, 0])}px)`,
              opacity: Math.max(0, charSpring),
            }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </h1>

      {/* Subtitle with blur-to-sharp */}
      <p style={{
        fontSize: 32,
        color: COLORS.muted,
        opacity: interpolate(frame, [35, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        filter: `blur(${interpolate(frame, [35, 55], [10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
        marginTop: 16,
      }}>
        The future starts now
      </p>
    </AbsoluteFill>
  );
};
```

## Implementation Steps

1. **Director's treatment first** — write the vibe, motion style, and emotional arc
2. **Establish visual direction** — colors, fonts, brand feel, animation style, motifs
3. **Scaffold the project** — `npx create-video@latest --blank` or set up manually
4. **Install dependencies** — `@remotion/google-fonts`, `@remotion/transitions`, TailwindCSS if needed
5. **Define composition** in `src/Root.tsx` — set total `durationInFrames`, `fps`, resolution
6. **Build the persistent background layer first** — animated gradients, floating shapes, drifting particles
7. **Build 5-7 scenes** each in its own file under `src/scenes/`. Each scene is a choreographed sequence with background, midground, and foreground layers.
8. **Open with a hook** — the first scene should grab attention immediately
9. **Develop the narrative** across the middle scenes
10. **Close with a strong ending** — intentional and resolved, not abrupt
11. **Preview** with `npx remotion studio`
12. **Render** with `npx remotion render`
13. **Review against the slideshow test**: If any scene is "centered text on a solid background with a fade," redo it with layers and choreography.

## Parallelization Notes

Execute independent tasks in parallel for speed.

**BATCH 1 — PREPARATION (Parallel):**

1. Scaffold project or verify structure
2. Install dependencies (`@remotion/google-fonts`, `@remotion/transitions`, etc.)
3. Set up fonts and color constants
4. Write the Root.tsx with Composition definition
5. Build the persistent background component

**BATCH 2 — SCENE BUILDING (Parallel after Batch 1):**

- Build all scene files in parallel — they are independent components
- Each scene uses `useCurrentFrame()`, `interpolate()`, `spring()` for animation

**BATCH 3 — FINALIZATION (Sequential after Batch 2):**

1. Wire scenes into main composition with TransitionSeries
2. Verify total frame count and pacing
3. Preview and polish
4. Render to MP4
