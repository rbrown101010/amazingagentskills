# Remotion Video Guidelines

Always follow these guidelines when creating Remotion videos.

## Critical Constraints

- **DETERMINISTIC CODE ONLY**: Never use `Math.random()`, CSS transitions, CSS animations, `requestAnimationFrame`, or `setTimeout`. All animation must be driven by `useCurrentFrame()` and Remotion's `interpolate()` / `spring()`.
- **No browser animation libraries**: Do NOT use Framer Motion, GSAP, React Spring, or any other browser animation library. Use Remotion's built-in primitives.
- **No Tailwind animation classes**: Do NOT use `animate-*` or `transition-*` Tailwind classes. They produce non-deterministic rendering.
- **TypeScript required**: All code must be valid TypeScript.
- **React components**: Every video is a React component. Use functional components with hooks.

## Project Structure

```
src/
  index.ts          # Entry — registerRoot(Root)
  Root.tsx           # Composition definitions
  scenes/            # Scene components (one per file)
  components/        # Shared reusable components
  lib/               # Utilities, constants, fonts
public/              # Static assets (images, audio, video)
```

## Composition Setup

Register compositions in `src/Root.tsx`:

```tsx
<Composition
  id="LaunchVideo"
  component={LaunchVideo}
  durationInFrames={600}
  width={1920}
  height={1080}
  fps={30}
  defaultProps={{title: 'My Product'}}
/>
```

Defaults: 1920x1080, 30fps, id "MyComp".

## Animation Rules

1. **Use `useCurrentFrame()` as the animation clock** — everything derives from the frame number.
2. **Use `interpolate()` with clamping** — always pass `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'`.
3. **Use `spring()` for natural motion** — pass `fps` and `frame`, configure with `damping`.
4. **Delay animations** by subtracting frames: `spring({fps, frame: frame - 15, ...})`.
5. **Use `random('seed')` for randomness** — deterministic, same result every render.

## Asset Rules

- Use `staticFile('filename.ext')` for assets in `public/`.
- Use `<Img>` from `remotion` for images (not `<img>`).
- Use `<Video>` from `@remotion/media` for video (not `<video>`).
- Use `<Audio>` from `@remotion/media` for audio (not `<audio>`).

## Fonts

Load Google Fonts via `@remotion/google-fonts`:

```tsx
import {loadFont} from '@remotion/google-fonts/PlusJakartaSans';
const {fontFamily} = loadFont();
```

## Rendering

```bash
# Preview
npx remotion studio

# Render MP4
npx remotion render LaunchVideo out/video.mp4

# Render with quality
npx remotion render LaunchVideo --codec=h264 --crf=18

# Render still
npx remotion still LaunchVideo out/thumb.png
```
