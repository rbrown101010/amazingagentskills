// Complete Launch Video Template for Remotion
// This is a production-ready example of a launch/product video.
// Copy this structure and customize for your brand.

import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
  Easing,
  staticFile,
} from 'remotion';
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {loadFont} from '@remotion/google-fonts/PlusJakartaSans';

// ============================================================
// DESIGN TOKENS
// ============================================================

const {fontFamily} = loadFont();

const COLORS = {
  bg: '#0a0a0a',
  bgAlt: '#111111',
  primary: '#e94560',
  accent: '#3b82f6',
  text: '#fafafa',
  textMuted: 'rgba(250, 250, 250, 0.5)',
  textDim: 'rgba(250, 250, 250, 0.25)',
};

// ============================================================
// PERSISTENT BACKGROUND LAYER
// Lives outside TransitionSeries — never unmounts
// ============================================================

const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      {/* Gradient blob 1 — drifts across video */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.primary}25, transparent 70%)`,
          filter: 'blur(120px)',
          transform: `translate(${interpolate(frame, [0, 500], [-300, 800])}px, ${interpolate(frame, [0, 250, 500], [50, -150, 100])}px)`,
        }}
      />

      {/* Gradient blob 2 */}
      <div
        style={{
          position: 'absolute',
          right: -200,
          bottom: -200,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}20, transparent 70%)`,
          filter: 'blur(100px)',
          transform: `translate(${interpolate(frame, [0, 500], [100, -400])}px, ${interpolate(frame, [0, 500], [0, -300])}px)`,
        }}
      />

      {/* Noise texture overlay */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Floating particles */}
      {Array.from({length: 25}).map((_, i) => {
        const x = random(`bg-x-${i}`) * 1920;
        const baseY = random(`bg-y-${i}`) * 1080;
        const size = random(`bg-size-${i}`) * 5 + 1;
        const speed = random(`bg-speed-${i}`) * 0.3 + 0.1;
        const phase = random(`bg-phase-${i}`) * Math.PI * 2;
        const opacity = random(`bg-opacity-${i}`) * 0.2 + 0.05;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(frame * speed * 0.03 + phase) * 15,
              top: baseY + Math.sin(frame * speed * 0.05 + phase) * 30,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: COLORS.text,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// PERSISTENT MIDGROUND LAYER
// Shapes that transform position based on overall timeline
// ============================================================

const PersistentMidground: React.FC = () => {
  const frame = useCurrentFrame();

  // Accent circle that moves across scenes
  const circleX = interpolate(
    frame,
    [0, 90, 210, 360, 500],
    [960, 200, 1400, 500, 960],
    {extrapolateRight: 'clamp'}
  );
  const circleY = interpolate(
    frame,
    [0, 90, 210, 360, 500],
    [540, 150, 800, 300, 540],
    {extrapolateRight: 'clamp'}
  );
  const circleScale = interpolate(
    frame,
    [0, 90, 210, 360, 500],
    [2.5, 0.8, 1.4, 0.6, 1.8],
    {extrapolateRight: 'clamp'}
  );

  // Accent line
  const lineLeft = interpolate(
    frame,
    [0, 90, 210, 360, 500],
    [200, 600, 50, 900, 400],
    {extrapolateRight: 'clamp'}
  );
  const lineWidth = interpolate(
    frame,
    [0, 90, 210, 360, 500],
    [300, 700, 400, 500, 200],
    {extrapolateRight: 'clamp'}
  );
  const lineTop = interpolate(
    frame,
    [0, 90, 210, 360, 500],
    [50, 15, 85, 35, 60],
    {extrapolateRight: 'clamp'}
  );

  return (
    <>
      {/* Persistent circle */}
      <div
        style={{
          position: 'absolute',
          left: circleX - 80,
          top: circleY - 80,
          width: 160,
          height: 160,
          borderRadius: '50%',
          backgroundColor: `${COLORS.primary}50`,
          filter: 'blur(8px)',
          transform: `scale(${circleScale})`,
        }}
      />

      {/* Persistent accent line */}
      <div
        style={{
          position: 'absolute',
          left: lineLeft,
          top: `${lineTop}%`,
          width: lineWidth,
          height: 3,
          backgroundColor: COLORS.primary,
          opacity: 0.5,
        }}
      />
    </>
  );
};

// ============================================================
// SCENE 1 — HOOK
// Grab attention with bold typography and energy
// ============================================================

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const title = 'LAUNCH';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      {/* Accent line draws across */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: 100,
          width: interpolate(frame, [0, 18], [0, 500], {
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          }),
          height: 3,
          backgroundColor: COLORS.primary,
        }}
      />

      {/* Per-character title stagger */}
      <div style={{textAlign: 'center'}}>
        <h1
          style={{
            fontSize: 160,
            fontWeight: 900,
            letterSpacing: -6,
            color: COLORS.text,
            lineHeight: 1,
            margin: 0,
          }}
        >
          {title.split('').map((char, i) => {
            const s = spring({
              fps,
              frame: frame - 6 - i * 3,
              config: {damping: 200},
            });
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  transform: `translateY(${interpolate(
                    Math.max(0, s),
                    [0, 1],
                    [80, 0]
                  )}px)`,
                  opacity: Math.max(0, s),
                }}
              >
                {char}
              </span>
            );
          })}
        </h1>

        {/* Subtitle blur reveal */}
        <p
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: COLORS.textMuted,
            marginTop: 20,
            opacity: interpolate(frame, [35, 55], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            filter: `blur(${interpolate(frame, [35, 55], [12, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          The future of video, in code
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 2 — PROBLEM / CONTEXT
// Establish why this matters
// ============================================================

const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const lines = [
    'Video creation is stuck in the past.',
    'Manual editing. Slow iterations.',
    'What if you could code your videos?',
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        padding: '0 200px',
        fontFamily,
      }}
    >
      {lines.map((line, i) => {
        const lineSpring = spring({
          fps,
          frame: frame - i * 12,
          config: {damping: 200},
        });
        const x = interpolate(Math.max(0, lineSpring), [0, 1], [-50, 0]);

        return (
          <p
            key={i}
            style={{
              fontSize: i === 2 ? 56 : 44,
              fontWeight: i === 2 ? 700 : 400,
              color: i === 2 ? COLORS.text : COLORS.textMuted,
              opacity: Math.max(0, lineSpring),
              transform: `translateX(${x}px)`,
              marginBottom: 24,
              lineHeight: 1.3,
            }}
          >
            {line}
          </p>
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 3 — PRODUCT REVEAL
// The hero moment — show the product
// ============================================================

const ProductRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Product card scales in
  const cardScale = spring({
    fps,
    frame: frame - 10,
    config: {damping: 100, mass: 0.8},
  });

  // Feature badges stagger in
  const features = ['React-based', '30fps Render', 'MP4 Export', 'TypeScript'];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      {/* Product mockup / card */}
      <div
        style={{
          transform: `scale(${Math.max(0, cardScale)})`,
          opacity: Math.max(0, cardScale),
          width: 800,
          padding: '60px 80px',
          borderRadius: 24,
          background: `linear-gradient(135deg, ${COLORS.bgAlt}, #1a1a2e)`,
          border: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: -2,
            marginBottom: 16,
          }}
        >
          Remotion
        </h2>
        <p
          style={{
            fontSize: 24,
            color: COLORS.textMuted,
            marginBottom: 40,
          }}
        >
          Programmatic video creation
        </p>

        {/* Feature badges */}
        <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
          {features.map((feat, i) => {
            const badgeSpring = spring({
              fps,
              frame: frame - 30 - i * 6,
              config: {damping: 200},
            });
            return (
              <div
                key={i}
                style={{
                  padding: '10px 20px',
                  borderRadius: 100,
                  backgroundColor: `${COLORS.primary}20`,
                  border: `1px solid ${COLORS.primary}40`,
                  color: COLORS.primary,
                  fontSize: 16,
                  fontWeight: 600,
                  opacity: Math.max(0, badgeSpring),
                  transform: `scale(${Math.max(0, badgeSpring)})`,
                }}
              >
                {feat}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 4 — KEY FEATURES
// Show what makes it special
// ============================================================

const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const stats = [
    {label: 'Faster', value: '10x', suffix: ''},
    {label: 'Frame-perfect', value: '100', suffix: '%'},
    {label: 'Lines of code', value: '50', suffix: ''},
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      <div style={{display: 'flex', gap: 100}}>
        {stats.map((stat, i) => {
          const statSpring = spring({
            fps,
            frame: frame - i * 10,
            config: {damping: 200},
          });
          const numberValue = interpolate(
            frame,
            [i * 10, i * 10 + 40],
            [0, parseInt(stat.value)],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}
          );

          return (
            <div
              key={i}
              style={{
                textAlign: 'center',
                opacity: Math.max(0, statSpring),
                transform: `translateY(${interpolate(
                  Math.max(0, statSpring),
                  [0, 1],
                  [30, 0]
                )}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  color: COLORS.primary,
                  letterSpacing: -3,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {Math.round(numberValue)}
                {stat.suffix}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: COLORS.textMuted,
                  fontWeight: 500,
                  marginTop: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// SCENE 5 — OUTRO / CTA
// Strong closing with brand lockup
// ============================================================

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoSpring = spring({
    fps,
    frame: frame - 5,
    config: {damping: 100, mass: 0.8},
  });

  const taglineOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      {/* Logo / Brand name */}
      <div
        style={{
          transform: `scale(${Math.max(0, logoSpring)})`,
          opacity: Math.max(0, logoSpring),
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: -4,
          }}
        >
          Remotion
        </h1>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: 28,
          color: COLORS.textMuted,
          opacity: taglineOpacity,
          marginTop: 20,
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}
      >
        Make videos programmatically
      </p>
    </AbsoluteFill>
  );
};

// ============================================================
// MAIN COMPOSITION
// Wires everything together
// ============================================================

export const LaunchVideo: React.FC<{title?: string}> = ({title = 'LAUNCH'}) => {
  return (
    <AbsoluteFill style={{fontFamily}}>
      {/* Layer 1: Persistent animated background */}
      <PersistentBackground />

      {/* Layer 2: Persistent midground shapes */}
      <PersistentMidground />

      {/* Layer 3: Scene content with transitions */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={springTiming({config: {damping: 200}})}
          presentation={slide({direction: 'from-right'})}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <ProblemScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={linearTiming({durationInFrames: 15})}
          presentation={wipe({direction: 'from-left'})}
        />

        <TransitionSeries.Sequence durationInFrames={150}>
          <ProductRevealScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={springTiming({config: {damping: 200}})}
          presentation={fade()}
        />

        <TransitionSeries.Sequence durationInFrames={150}>
          <FeaturesScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={linearTiming({durationInFrames: 20})}
          presentation={slide({direction: 'from-bottom'})}
        />

        <TransitionSeries.Sequence durationInFrames={90}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Total duration: 90 + 120 + 150 + 150 + 90 = 600 frames = 20 seconds at 30fps
// (transitions overlap, so actual duration is slightly less)
