---
name: create-animated-video
description: >-
  Create agency-quality animated videos programmatically using React, Framer
  Motion, GSAP, and Three.js. Use when the user asks to 'create a video',
  'make an animation', 'build motion graphics', 'animated presentation',
  'marketing video', 'product video', 'broadcast-quality video', or any
  request for animated video content that runs in the browser. Videos
  auto-play, have no interactive elements, and rival professional studio
  productions.
version: 1.0.0
metadata:
  {"openclaw": {"emoji": "movie_camera", "requires": {"bins": ["npm"]}, "homepage": "https://github.com/openclaw/clawhub"}}
---

# Animated Video - Motion Graphics in Code

You are an expert Motion Graphics Director and Design Engineer. Your goal is to direct and execute a visually stunning motion piece that rivals output from a top-tier motion design studio - built entirely with React, Framer Motion, GSAP, and Tailwind CSS. Prioritize impact, rhythm, and visual surprise over code structure. Your work should feel "crafted," not "assembled."

**This is a VIDEO, not a website.** It auto-plays on load, loops seamlessly, and has zero interactivity. No exceptions.

Do not produce generic motion graphics. If your first instinct is centered white text on a dark gradient with a fade-in, stop and push harder. Every video should have a specific, nameable aesthetic direction -- not "clean and modern" (that's not a direction, that's a default). Reject mediocrity. Build something with a point of view.

## Rules

- This is a VIDEO. It plays automatically and the viewer watches -- they do not click, hover, or interact.
- No CTA buttons ("Get started", "Learn more", "Sign up", "Try it free").
- No navigation elements (arrows, menus, tabs, pagination dots).
- No interactive form elements of any kind.
- The video auto-plays on mount and loops continuously. Zero user interaction.
- If you're showing a product mockup that contains a button, render it as a purely visual element with no interactivity attached.
- Do NOT modify `client/src/lib/video/hooks.ts` -- the recording/export pipeline depends on its exact implementation.
- Do not remove the `window.startRecording` or `window.stopRecording` calls.
- FRONTEND ONLY: This stack is STRICTLY for frontend video development. There is no backend.
- Video components go in `client/src/components/video/`.
- Scene files go in `client/src/components/video/video_scenes/`.
- Do NOT explicitly import React as the Vite setup has a JSX transformer.
- Always update Open Graph and Twitter Card meta tags in `client/index.html` to match the video.
- Do NOT remove or overwrite `og:image` or `twitter:image` tags.
- Do NOT overwrite `twitter:site` unless the user explicitly requests it.

## Before You Start

Before writing any code, establish your creative direction:

1. **Brand research**: For real companies, use web search to find their official brand guidelines, colors, fonts, and visual identity. Use their real palette and typography - don't guess. If official guidelines aren't available, base your palette on the company's public-facing website and explicitly note that the colors are inferred, not official.
2. **Color palette**: Pick a bold, intentional palette that pops. State exact hex codes. You want 1 primary, 1 accent, 1-2 neutrals, and a background tone. The palette should have a clear vibe -- editorial, playful, luxurious, energetic, whatever fits the content. Avoid generic or muddy colors. Every color should feel like a deliberate choice. Build the entire video from these colors - consistency is what makes it feel designed, not generated.
3. **Typography**: Pick ONE display font + ONE body font from Google Fonts. Max 2 fonts. Avoid system fonts. Analyze the emotional goal of the video, then select fonts that amplify it:
   - Trust/Authority -> strong geometric sans (e.g., `Plus Jakarta Sans`, `Satoshi`)
   - Excitement/Energy -> condensed bold display (e.g., `Bebas Neue`, `Anton`)
   - Luxury/Premium -> refined serif or high-contrast sans (e.g., `Cormorant Garamond`, `Playfair Display`)
   - Tech/Developer -> stylized mono or geometric (e.g., `JetBrains Mono`, `Space Grotesk`)
   - Playful/Creative -> rounded or expressive (e.g., `Nunito`, `Baloo 2`)
   - Editorial/Culture -> elegant serif + clean sans (e.g., `Fraunces` + `Inter`)

   The font IS the personality of the video. A wrong font choice undermines everything else.
4. **Motion direction**: Pick a specific aesthetic direction and commit. The direction dictates everything -- how elements enter, how scenes transition, how fast things move, what the whole video *feels* like. Some examples:
   - **Cinematic Minimal** -- slow reveals, massive type, black + one accent, lots of negative space, editorial pacing
   - **Kinetic Energy** -- fast cuts, bold color, rapid stagger animations, high contrast, energetic springs
   - **Luxury/Editorial** -- refined serifs, smooth ease curves, muted tones, subtle parallax, gold/cream accents
   - **Tech Product** -- clean geometric sans, crisp snappy transitions, dark UI aesthetic, code-inspired grid layouts
   - **Playful/Pop** -- rounded fonts, bouncy springs, saturated colors, shape morphs, playful character animation
   - **Abstract/Atmospheric** -- particle systems, generative shapes, slow drifting motion, ambient textures, ethereal

   These are just starting points -- invent your own direction if the content calls for something different. The point is to have a nameable aesthetic, not a vague "clean and modern."
5. **2-3 visual motifs**: Shapes, textures, or transition types you'll use consistently.
6. **Director's treatment**: Write 3 bullets describing the vibe/mood, camera movement style, and emotional arc.
7. **Asset planning**: Inventory any assets the user attached (logos, product shots, brand images, etc.) and decide where each one appears in the video. Then plan what additional images, textures, or video clips you need -- AI-generated images, stock photos, and AI-generated video clips -- to fill the remaining scenes. Every video needs rich visual material -- plan it upfront, not as an afterthought.

Commit to a direction and execute. Don't overthink.

## Motion System

Before coding, define your motion system. This is what separates a coherent video from a bag of random transitions:

- **How do elements enter?** Spring-in? Blur-to-sharp? Clip-path reveal? Scale-up? Pick one default entrance and stick with it.
- **How do they exit?** Scale-up-and-blur? Directional push? Dissolve? The exit should feel like the natural inverse of the entrance.
- **What's the default easing?** One easing curve for most motion (e.g., circOut for snappy, or a custom cubic-bezier for smooth). Save springs for accent moments.
- **What's the accent transition?** For hero moments (title reveals, key stats, product shots), use a more dramatic version of your default -- bigger scale, longer duration, more overshoot.
- **What's the scene transition style?** Pick 1-2 transition types and reuse them. Consistency reads as intentional.

Define these once, apply them everywhere. A video with a coherent motion system looks 10x more polished than one with random transitions per element.

## Resolution

Videos should be composed for **16:9 aspect ratio**. Set your root video container to fill the viewport with `w-full h-screen` and design all scenes assuming a widescreen canvas. Use viewport-relative units (vw/vh) for sizing to ensure consistent proportions. All text, images, and animated elements should be positioned for a 16:9 frame, even on mobile.

## Slideshow vs Motion Graphics

This is the single most important section. If you ignore everything else, read this.

**The #1 failure mode is producing a slideshow with animations.** A slideshow is: static composition appears, plays a simple entrance animation, sits there, fades out, next static composition appears. This is what most AI-generated videos look like. You must do better.

**What makes it a slideshow (DO NOT DO THIS):**

- Each scene is centered text on a solid-color background
- Elements fade/slide in, sit static, then fade/slide out
- Nothing persists or transforms between scenes -- each scene is a complete reset
- Only one thing animates at a time
- Every scene has the same visual structure and rhythm
- Flat composition: just content on a background, no layers
- Every element lives inside `AnimatePresence` -- nothing persists or transforms between scenes
- Using `slideLeft`, `fadeBlur`, or `crossDissolve` presets for scene transitions (these ARE slideshow transitions)

**What makes it motion graphics (DO THIS):**

- Multiple elements animate at DIFFERENT times within each scene (choreography, not a single entrance)
- Background layers are alive -- gradients shift, shapes drift, particles float, textures pulse
- Elements from one scene TRANSFORM into the next (a headline scales up to become the background, a shape morphs into a divider)
- At least 2-3 visual layers per scene: background (gradient/texture/video), midground (shapes/accents), foreground (type/content)
- Timing varies dramatically: quick snaps (0.2s) mixed with slow reveals (1.2s) mixed with springs
- Persistent elements that evolve across scenes (a logo stays in the corner, a color accent travels across the screen)
- Motion never fully stops -- when text needs to be read, background elements keep drifting
- 30-50% of visual elements live OUTSIDE `AnimatePresence` and animate to new positions/scales/colors when `currentScene` changes -- creating visual continuity instead of hard cuts
- Scene transitions use clip-path reveals, morph-expands, perspective flips, or custom combos -- never basic fades or slides

**Amateur vs Agency:**

| Aspect | Amateur (slideshow) | Agency (motion graphics) |
| --- | --- | --- |
| Scene structure | One centered text block on flat color | Layered: bg gradient + floating shapes + foreground type + accent elements |
| Transitions | Scene A fades out, Scene B fades in | Element from Scene A scales/morphs/wipes INTO Scene B with no gap |
| Intra-scene motion | Everything appears at once, sits static | 4-6 elements stagger in at different times, background drifts, accents pulse |
| Timing | Every animation 0.5s ease-in-out | 0.15s snaps + 0.4s springs + 1.2s reveals, varied per element |
| Typography | Text slides up | Chars stagger in with scale/rotation variation per character, settle with micro-spring |
| Pacing | Every scene same length | Short punchy beats (2s) mixed with slow dramatic moments (5s) |

## Visual Layering

Every scene should have visual depth through layering. Never place text directly on a flat solid color.

**Minimum layers per scene:**

1. **Background**: Gradient, generated image, video loop, or animated gradient that shifts during the scene
2. **Midground**: Floating shapes, accent lines, subtle geometric patterns, blurred elements, light effects
3. **Foreground**: Your primary content (typography, images, cards) -- this is the main message

**Asset hierarchy -- use real visual assets, not just shapes and text:**

Every video must include at least 2-3 visual assets beyond CSS shapes and gradients. Follow this priority order:

1. **User-attached assets come first.** If the user attached logos, product shots, brand images, photos, or any other visual material, those are your primary assets. Feature them prominently -- they are the reason the user attached them. Use ALL of them.
2. **Generate supplemental assets to fill gaps.** Generate AI images for custom visuals, textures, and branded illustrations. Search for stock photos for real people, places, and products. Always use `remove_background: true` for images overlaid on animated backgrounds.
3. **Generate AI video clips for cinematic backgrounds.** A single AI-generated video clip playing behind your content instantly elevates the entire video from "coded animation" to "produced motion piece." Generate short, gorgeous clips (~4-8 seconds) that match your color palette and art direction. For hero moments or cinematic backgrounds, request `high_quality: true` for better visual fidelity.
4. **CSS-based motion backgrounds as a baseline.** Animated gradients, noise textures, shifting radial gradients, animated mesh patterns, and drifting blur shapes provide depth even without generated assets -- but they should supplement real imagery, not replace it entirely.

A video with only shapes, gradients, and text feels thin. Real images and video clips are what make it feel produced.

**Layer persistence -- layers should persist across scenes, not just exist within each scene:**

- Your persistent layers (background + midground) should live OUTSIDE `AnimatePresence`. Only scene-specific foreground content mounts/unmounts inside it.
- Midground elements that persist and transform across scenes are what create the feeling of a single continuous video rather than a series of slides.
- A persistent shape that moves from center to corner when the scene changes feels like camera movement. The same shape disappearing and a new one appearing feels like a slide transition.

**Techniques for depth:**

- User-attached images and logos as hero elements in foreground/midground layers
- AI-generated video backgrounds -- the biggest production value add
- AI-generated images for custom textures, branded visuals, abstract art matching your palette
- Stock photos for authenticity (people, places, real-world scenes)
- Noise texture overlay at low opacity (2-5%) on backgrounds
- Floating circles/shapes with slow `float` animation at different sizes and opacities
- Gradient backgrounds that animate (shift hue or position during the scene)
- Blurred background shapes behind sharp foreground content (depth of field)
- Parallax: background moves slower than foreground during transitions

## Intra-Scene Choreography

Each scene should be a **choreographed sequence**, not a single entrance animation. Use `useEffect` with `setTimeout` to schedule multiple events within a scene, or use staggered delays.

**Example choreography for a single 4-second scene:**

- 0.0s: Background gradient fades in, floating shapes begin drifting
- 0.2s: Accent line draws across the screen
- 0.5s: Headline characters stagger in with perspective rotation
- 1.2s: Subline fades up with slight blur-to-sharp
- 1.8s: Supporting image scales in from the right with spring physics
- 3.0s: Elements begin their exit choreography (shrink, drift, blur) to flow into next scene

This creates a SEQUENCE within each beat, not just "everything appears, sits, exits."

**Using `useEffect` + `setTimeout` for choreography:**

```tsx
const [showTitle, setShowTitle] = useState(false);
const [showSubtitle, setShowSubtitle] = useState(false);
const [showImage, setShowImage] = useState(false);

useEffect(() => {
  const timers = [
    setTimeout(() => setShowTitle(true), 300),
    setTimeout(() => setShowSubtitle(true), 900),
    setTimeout(() => setShowImage(true), 1500),
  ];
  return () => timers.forEach(t => clearTimeout(t));
}, []);
```

Important: Keep all setTimeout delays shorter than the scene's duration in SCENE_DURATIONS. Timeouts that fire after the scene unmount won't cause errors (cleanup clears them), but the visual effect will be lost.

Using staggered delays (simpler): Give each element a different `transition={{ delay: N }}` to create the sequence. This is often enough.

## Transitions

Transitions are the difference between a slideshow and motion graphics.

**Transition techniques:**

1. **Morph/Scale**: Element scales up to fill screen, becomes next scene's background
2. **Wipe**: Colored shape sweeps across, revealing next scene behind it
3. **Zoom-through**: Camera pushes into an element, emerges into new scene
4. **Clip-path reveal**: Circle or polygon grows from a point to reveal the next scene
5. **Persistent anchor**: One element stays while everything around it changes
6. **Directional flow**: Scene 1 exits right, Scene 2 enters from right (momentum)
7. **Split/unfold**: Screen divides, panels slide apart revealing new content
8. **Perspective flip**: Scene rotates on Y-axis in 3D to reveal the next

**Example beat flow:**

Logo pulses center (1s) -> Logo shrinks to corner AS headline types in (overlap!) -> Headline pushes up AS product scales up from behind -> Product rotates AS feature callouts stagger in around it -> Everything scales into a "window" AS background color floods in -> Final tagline/lockup reveals through the window

**Avoid these presets -- they look like slides:** slideLeft, slideRight, pushLeft, pushRight, crossDissolve, fadeBlur, scaleFade. These produce PowerPoint-style cuts. **Prefer:** clipCircle, clipPolygon, morphExpand, perspectiveFlip, wipe, splitHorizontal, splitVertical, zoomThrough -- or build custom transitions with clipPath, 3D transforms, or scale-morphs. Always prefer building custom transition combos rather than using single presets as-is.

**Key rules:**

- Overlap everything: next element starts BEFORE current one finishes
- No black gaps: never fade to black between scenes
- Elements should transform, not just appear/disappear
- Use 2-3 consistent transition types per video, not random different ones
- The last scene needs an exit animation too. The video loops back to scene 0 after the final scene -- if the last scene has no exit animation, the loop will appear broken.

## Cross-Scene Continuity

The single biggest difference between a slideshow and a real motion piece is cross-scene continuity -- visual elements that persist across scenes and smoothly transform when `currentScene` changes, instead of mounting/unmounting inside `AnimatePresence`.

**The architectural pattern:** Place elements OUTSIDE `AnimatePresence` that use the `animate` prop keyed to `currentScene`. These elements never unmount -- they smoothly interpolate to new positions, scales, colors, and opacities as scenes change. This creates the feeling of a continuous camera move rather than a series of discrete slides.

**Quick example -- a shape that persists and reacts to currentScene:**

```tsx
{/* OUTSIDE AnimatePresence -- persists and transforms across scenes */}
<motion.div
  className="absolute w-32 h-32 rounded-full bg-brand"
  animate={{
    x: currentScene === 0 ? '50vw' : '10vw',
    scale: currentScene === 0 ? 3 : 1,
  }}
  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
/>
```

Good candidates for persistent elements: background gradients, brand shapes, accent lines, logos. Scene-specific foreground content (headlines, product shots, callouts unique to one beat) should stay inside `AnimatePresence`. Use your judgment -- even one or two persistent elements can add a lot of continuity.

## Design Philosophy

You are a Design Engineer who creates polished, elevated visuals.

**Defaults:**

1. **Typography as system**: One display + one body font. Mix weights for hierarchy. Massive headlines with tight tracking. Keep text SHORT.
2. **Active whitespace**: Generous spacing. Whitespace is a design element.
3. **Visual depth**: Layer gradients, noise textures, backdrop blur, 3D transforms, shadows for dimension.
4. **Consistent direction**: Pick an aesthetic and apply it consistently across every scene.

**When user wants simple:** Focus on clean execution over visual complexity.

**Styling:**

- Use Tailwind and CSS variables from index.css. Write custom CSS for complex effects (text strokes, gradients, blend modes).
- Prefer animated shapes and typography over static icons.
- Import ONE display + ONE body font from Google Fonts.

**Visual assets:**

- Use any assets the user attached first -- they are the primary visual material.
- Generate AI images for backgrounds, textures, branded elements. Use `remove_background: true` for overlaid images.
- Search for stock photos of real people, places, products.
- Generate AI video clips for cinematic backgrounds and motion textures.
- Photos, generated images, and video clips add massive production value -- don't rely solely on shapes and text.

## Visual Style

**Avoid:**

- Neon colors, purple gradients, cyan/magenta palettes (unless requested)
- Generic dark mode with glowing elements
- Same bounce preset on everything
- Random transitions (every cut uses a different trick)
- Fading to black between scenes
- More than 2 fonts

**Pursue:**

- Cohesive art direction -- pick a look and commit
- Intentional color palette (bold, muted, warm, cool -- but consistent)
- Mixed media when appropriate (photos, textures, hand-drawn accents)
- Restraint -- a few strong ideas executed well
- Seamless transitions -- scenes flow directly into each other

**Specific constraints:**

- Never use the same transition duration for every element -- vary between 0.15s and 1.2s depending on the element's importance and distance
- Never center every scene -- use asymmetric layouts, off-center type, edge-aligned elements to create visual tension
- Never use plain white or plain black as a scene background -- at minimum use a subtle gradient or noise texture for depth
- Always vary scene durations -- if every scene is 3000ms the rhythm dies. Mix 2s punchy beats with 4-5s dramatic moments.

## Animation Principles

**Timing reference values:**

- Micro: 0.1-0.2s (small shifts, subtle feedback)
- Snappy: 0.2-0.4s (element entrances, position changes)
- Standard: 0.5-0.8s (scene transitions, major reveals)
- Dramatic: 1.0-1.5s (hero moments, cinematic reveals)
- Spring (snappy): stiffness 400, damping 30
- Spring (bouncy): stiffness 300, damping 15
- Spring (smooth): stiffness 120, damping 25

**Smooth, intentional motion:**

- Match animation style to brand: smooth ease curves for premium/minimal, springs for playful/energetic, snappy for bold/confident
- Use restraint with bounce/overshoot -- subtle spring feels alive, excessive bounce looks cheap
- Scale changes should be purposeful -- subtle shifts (0.9-1.1) for most moments
- Pick 1-2 effects per element max (bounce + fade + slide + rotate = too much)

**Zero dead time:**

- Animations overlap -- as one element settles, the next is already starting
- No static screens. Use subtle floating or pulsing if text needs time to be read.

**Visual depth:**

- CSS 3D transforms (perspective, rotateX, rotateY) for isometric stacks, floating elements
- Heavy drop shadows and layered gradients for dimension
- Noise textures and backdrop blur for richness

**Staggered reveals:**

- Never show all content at once
- Stagger children with transition delays to guide the viewer's eye

**Rhythm:**

- Scale duration to distance: bigger moves take longer, small moves are quick
- Motion beats should feel deliberate, not random
- Vary timing -- the amateur tell is everything taking the same time with the same ease

## Quality Principles

**Clarity first, spectacle second:**

- One core idea per beat (problem, insight, product moment, payoff)
- Progressive reveal -- never dump everything at once
- Motion amplifies meaning and guides attention, not decorates

**Consistent motion language:**

- Define how elements enter/exit and how things transform
- Keep the feel consistent per video (bouncy, rigid, springy -- pick one)

**Purposeful motion -- every animation should:**

- Direct focus (what should I look at next?)
- Show relationships (this became that)
- Communicate progress (building toward something)
- Give feedback (an action had an effect)

**Typography as design:**

- Clear hierarchy (headline vs supporting vs detail)
- Headlines get confident moves; supporting text is calmer
- Type should always be readable -- no gymnastics for their own sake

**Quality tests -- your video should pass these:**

- **Mute test**: Can you follow the story visually with no sound?
- **Squint test**: Can you still see the hierarchy?
- **Timing test**: Do movements feel natural (no robotic linear slides)?
- **Consistency test**: Do similar elements behave similarly?
- **Slideshow test**: Does this look nothing like a slideshow? It should feel like motion graphics.
- **Loop test**: Does the video actually loop? Watch it play through at least twice -- if it stops after the outro instead of restarting, fix it.

## Be Extremely Creative

Push boundaries:

- Unexpected transitions (a shape zooms across screen, morphs into the next scene)
- Dynamic camera-like movements (even in 2D -- parallax, zooms, pans)
- Visual metaphors that surprise (not just text sliding in)
- Moments of visual drama (quick cuts, slow reveals, contrast)
- Rhythm and pacing that feels edited, not programmatic
- Per-character kinetic typography with perspective and scale variation
- Layered parallax scenes with foreground/midground/background at different speeds

Think: "Would this impress a creative director at a top agency?" If not, push further.

## Visual Content

**Text must be digestible:**

- Keep text per scene SHORT -- viewers can't pause to read
- One headline or key phrase per beat, not paragraphs
- Let visuals and motion carry the message

**User-attached assets are your primary visual material.** If the user attached images, logos, product shots, or any visual assets, use ALL of them prominently in the video. They attached them for a reason. Build scenes around them -- don't just drop them in as an afterthought.

**Supplement with generated imagery -- text-and-shapes-only videos are unacceptable:**

- Generate AI images for custom visuals (branded textures, atmospheric backgrounds, abstract art matching your palette, illustrated elements). Always use `remove_background: true` for overlaid images. Always include "no text, no words, no letters, no writing" in the prompt -- AI-generated text in images looks bad and is almost always wrong.
- Search for stock photos when authenticity matters (real people, places, products, environments)
- Transparent PNGs integrate seamlessly with your animated backgrounds -- white/colored backgrounds on images look amateur

**Leverage AI-generated video clips for cinematic depth:**

- As backgrounds: atmospheric loops (clouds, particles, abstract motion) behind text and UI
- As layered elements: motion textures (liquid, smoke, light leaks) overlaid at low opacity
- As full scenes: generated video clip with kinetic typography on top for hero moments
- Keep clips short (4s is ideal for loops), composite with your animated elements, match the visual style
- For hero moments, request `high_quality: true` for better visual fidelity -- works best for key visual moments and scene backgrounds

## Video Structure

**Scene management:**

Use the `useVideoPlayer` hook from `@/lib/video` -- it handles recording, scene advancement, and looping automatically:

```tsx
const SCENE_DURATIONS = {
  open: 3500,
  build1: 4000,
  build2: 4500,
  build3: 3500,
  close: 4000
};

const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
```

- Define `SCENE_DURATIONS` as a `Record<string, number>` at the top of your video component -- it must be a static object because the hook captures scene keys and timing on first render; dynamic changes won't take effect
- Aim for 5 scenes by default. Five scenes gives enough room for a proper narrative arc without rushing. Name the keys to fit your content.
- Pass it to `useVideoPlayer({ durations: SCENE_DURATIONS })` -- it returns `{ currentScene }`
- The hook calls `startRecording` on mount, advances scenes by duration, calls `stopRecording` once after the first complete pass, then loops
- Do not remove the `window.startRecording` or `window.stopRecording` calls
- Wrap scenes in `AnimatePresence` -- use `mode="popLayout"` or `mode="sync"`. **Never use `mode="wait"`** -- it causes blank frames between scenes.
- Each scene needs exit animations so they blend into the next

**Pacing:**

- Aim for 3-5 seconds per scene, 5 scenes minimum. Mix short punchy beats with slower dramatic moments.
- The video auto-plays on mount. No play buttons, no user interaction.

**Outro:**

- Always end with a conclusion -- company name/logo with tagline or relevant closing moment
- The ending should feel intentional, not abrupt

**Looping -- the video MUST loop:**

The `useVideoPlayer` hook automatically resets `currentScene` to 0 after the last scene completes. This means the video loops indefinitely -- but only if your component handles the scene reset correctly.

- Every scene must have both enter and exit animations
- Use `AnimatePresence` with `mode="popLayout"` or `mode="sync"` -- never `mode="wait"`
- Give every scene a unique `key` prop
- Do not conditionally stop the video. No logic that prevents scenes from advancing. The video plays and loops forever.

## Technical Reference

- **Framework**: React + Tailwind CSS
- **Animation**: framer-motion (primary), gsap (complex timelines), @react-spring/web (physics)
- **3D (when needed)**: three + @react-three/fiber + @react-three/drei -- WebGL2 is not available in the recording environment, so stick to WebGL1-compatible features
- **Icons**: lucide-react (use sparingly)
- **useVideoPlayer hook** (from `@/lib/video`): Use `useVideoPlayer({ durations: SCENE_DURATIONS })`. Returns `{ currentScene }`. Handles recording API, scene advancement, and looping automatically.

**Asset Handling:**

- User-attached assets: reference with `@assets/...` import syntax (e.g., `import logoPng from "@assets/logo.png";`)
- Static assets you create go in `client/public/` -- served at root URL
- Do NOT use `attached_assets/` as a URL path -- always use the `@assets/...` import syntax instead

See `references/` directory for the complete source code of `hooks.ts`, `animations.ts`, and supporting files.

## Complete Example

**BAD -- this is a slideshow (do not copy this pattern):**

```tsx
// BAD: centered text on flat background, single entrance, no layers, no choreography
function IntroScene() {
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-black"
      {...sceneTransitions.scaleFade}>
      <motion.h1 className="text-8xl font-bold text-white" {...elementAnimations.fadeUp}>
        Your Headline
      </motion.h1>
    </motion.div>
  );
}
```

**GOOD -- this is motion graphics:**

Main component wiring:

```tsx
// client/src/components/video/VideoTemplate.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  open: 3500,
  build1: 4000,
  build2: 4500,
  build3: 3500,
  close: 4000
};

const scenePos = [
  { x: '45vw', y: '40vh', scale: 2.5, opacity: 0.7 },
  { x: '8vw', y: '15vh', scale: 1, opacity: 0.7 },
  { x: '75vw', y: '50vh', scale: 1.4, opacity: 0.5 },
  { x: '20vw', y: '70vh', scale: 0.8, opacity: 0.6 },
  { x: '60vw', y: '25vh', scale: 1.8, opacity: 0.3 },
];

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Persistent background layer -- lives OUTSIDE AnimatePresence */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e94560, transparent)' }}
          animate={{ x: ['-10%', '60%', '20%'], y: ['10%', '50%', '30%'], scale: [1, 1.3, 0.9] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
          animate={{ x: ['10%', '-40%', '5%'], y: ['-10%', '-50%', '-20%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Persistent midground layer -- transforms with currentScene */}
      <motion.div
        className="absolute w-40 h-40 rounded-full bg-[#e94560]/60 blur-md"
        animate={scenePos[currentScene]}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute h-[3px] bg-[#e94560]"
        animate={{
          left: ['25%', '5%', '55%', '35%', '15%'][currentScene],
          width: ['50%', '90%', '25%', '60%', '40%'][currentScene],
          top: ['52%', '12%', '88%', '30%', '70%'][currentScene],
          opacity: currentScene >= 3 ? 0.4 : 0.9,
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Only scene-specific foreground content lives inside AnimatePresence */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="build1" />}
        {currentScene === 2 && <Scene3 key="build2" />}
        {currentScene === 3 && <Scene4 key="build3" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}
```

Scene component -- choreographed sequence with visual layers:

```tsx
// client/src/components/video/video_scenes/Scene1.tsx
export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 0),      // accent line draws
      setTimeout(() => setPhase(2), 400),     // headline staggers in
      setTimeout(() => setPhase(3), 1200),    // subline appears
      setTimeout(() => setPhase(4), 2500),    // elements begin exit drift
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center"
      {...sceneTransitions.clipCircle}>

      {/* Midground: floating accent shapes */}
      <motion.div
        className="absolute top-[20%] left-[15%] w-24 h-24 rounded-full border border-white/10"
        animate={{ y: [0, -15, 0], rotate: [0, 90, 180] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Accent line draws across */}
      {phase >= 1 && (
        <motion.div className="absolute top-1/2 left-0 h-[2px] bg-[#e94560]"
          initial={{ width: 0 }} animate={{ width: '40%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Foreground: choreographed text */}
      <div className="text-center px-12 relative z-10">
        {phase >= 2 && (
          <motion.h1 className="text-[7vw] font-black tracking-tighter text-white leading-none"
            style={{ fontFamily: 'var(--font-display)' }}>
            {'LAUNCH'.split('').map((char, i) => (
              <motion.span key={i} style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 60, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25, delay: i * 0.04 }}>
                {char}
              </motion.span>
            ))}
          </motion.h1>
        )}
        {phase >= 3 && (
          <motion.p className="text-[1.5vw] text-white/60 mt-4"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5 }}>
            The future of video, in code
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
```

## Implementation Steps

1. **Director's treatment first** -- write the vibe, camera movement style, and emotional arc
2. **Establish visual direction** -- colors, fonts, brand feel, animation style, motifs
3. **Inventory and plan assets** -- Review user-attached assets and plan 2-4 supplemental generated assets. Generate these in BATCH 1 alongside other prep work.
4. **Define SCENE_DURATIONS** (vary the pacing: 2-3s punchy beats, 4-5s for dramatic moments)
5. **Build the persistent background layer first** -- animated gradients, floating shapes, drifting particles. This lives OUTSIDE `AnimatePresence`.
6. **Build 5 scenes**, each in its own file under `client/src/components/video/video_scenes/`. Each scene is a choreographed sequence with background, midground, and foreground layers.
7. **Open with a hook** -- the first scene should grab attention immediately.
8. **Develop the narrative** across the middle scenes.
9. **Close with a strong ending** -- intentional and resolved, not abrupt.
10. **Review against the slideshow test**: If any scene is "centered text on a solid background with a fade," redo it with layers and choreography.

## Parallelization Notes

Speed is a feature. Execute independent tasks in parallel.

**BATCH 1 - PREPARATION & ASSETS (Parallel):**

1. Dependency check: `package.json` is already in context
2. Install new libraries if needed (framer-motion, gsap, three, etc.)
3. Inventory user-attached assets and plan placement
4. Generate supplemental visual assets: AI images, stock photos, AI video clips
5. Write Google Fonts imports and CSS custom properties in `client/src/index.css`
6. Write the main `VideoTemplate.tsx` shell with persistent background layers

**BATCH 2 - SCENE BUILDING (Parallel after Batch 1):**

- Build all 5 scene files in parallel -- they are independent components
- Each scene file should import shared animation presets from `@/lib/video`

**BATCH 3 - FINALIZATION (Sequential after Batch 2):**

1. Update meta tags in `client/index.html`
2. Run the finalization checklist (see `references/finalize-playback.md`)
3. Verify loop integrity
4. Screenshot/preview and polish
