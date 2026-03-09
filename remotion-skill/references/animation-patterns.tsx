// Remotion Animation Patterns — Reference Examples
// These patterns demonstrate professional motion graphics techniques in Remotion.
// All animations are frame-driven and deterministic.

import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  random,
  Easing,
} from 'remotion';

// ============================================================
// SPRING PRESETS
// ============================================================

export const springPresets = {
  snappy: {damping: 200},
  bouncy: {damping: 10, mass: 0.5},
  smooth: {damping: 100, mass: 0.8},
  stiff: {damping: 200, stiffness: 400},
  gentle: {damping: 50, mass: 1},
  poppy: {damping: 12, mass: 0.4, stiffness: 200},
} as const;

// ============================================================
// FADE IN WITH TRANSLATE
// ============================================================

export const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}> = ({children, delay = 0, distance = 40}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    fps,
    frame: frame - delay,
    config: springPresets.snappy,
  });

  const opacity = Math.max(0, progress);
  const translateY = interpolate(Math.max(0, progress), [0, 1], [distance, 0]);

  return (
    <div style={{opacity, transform: `translateY(${translateY}px)`}}>
      {children}
    </div>
  );
};

// ============================================================
// PER-CHARACTER KINETIC TYPOGRAPHY
// ============================================================

export const KineticText: React.FC<{
  text: string;
  delay?: number;
  staggerFrames?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
}> = ({
  text,
  delay = 0,
  staggerFrames = 3,
  fontSize = 120,
  color = '#fafafa',
  fontWeight = 900,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div style={{display: 'flex', overflow: 'hidden'}}>
      {text.split('').map((char, i) => {
        const charSpring = spring({
          fps,
          frame: frame - delay - i * staggerFrames,
          config: {damping: 200},
        });
        const y = interpolate(Math.max(0, charSpring), [0, 1], [80, 0]);
        const rotation = interpolate(Math.max(0, charSpring), [0, 1], [-15, 0]);

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontSize,
              fontWeight,
              color,
              letterSpacing: -3,
              transform: `translateY(${y}px) rotate(${rotation}deg)`,
              opacity: Math.max(0, charSpring),
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};

// ============================================================
// TYPEWRITER EFFECT
// ============================================================

export const Typewriter: React.FC<{
  text: string;
  delay?: number;
  framesPerChar?: number;
  fontSize?: number;
  color?: string;
  showCursor?: boolean;
}> = ({
  text,
  delay = 0,
  framesPerChar = 2,
  fontSize = 48,
  color = '#fafafa',
  showCursor = true,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;

  if (adjustedFrame < 0) return null;

  const charsToShow = Math.min(
    text.length,
    Math.floor(adjustedFrame / framesPerChar)
  );
  const displayedText = text.slice(0, charsToShow);
  const cursorOpacity = Math.round(frame / 15) % 2 === 0 ? 1 : 0;

  return (
    <div style={{fontSize, color, fontFamily: 'monospace'}}>
      {displayedText}
      {showCursor && (
        <span style={{opacity: cursorOpacity, color}}>|</span>
      )}
    </div>
  );
};

// ============================================================
// BLUR-TO-SHARP REVEAL
// ============================================================

export const BlurReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  durationFrames?: number;
}> = ({children, delay = 0, durationFrames = 20}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + durationFrames],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const blur = interpolate(
    frame,
    [delay, delay + durationFrames],
    [15, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <div style={{opacity, filter: `blur(${blur}px)`}}>
      {children}
    </div>
  );
};

// ============================================================
// ANIMATED LINE DRAW
// ============================================================

export const LineReveal: React.FC<{
  delay?: number;
  durationFrames?: number;
  width?: number;
  height?: number;
  color?: string;
  direction?: 'horizontal' | 'vertical';
}> = ({
  delay = 0,
  durationFrames = 20,
  width = 500,
  height = 3,
  color = '#e94560',
  direction = 'horizontal',
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [delay, delay + durationFrames],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}
  );

  const style: React.CSSProperties = direction === 'horizontal'
    ? {width: width * progress, height, backgroundColor: color}
    : {width, height: height * progress, backgroundColor: color};

  return <div style={style} />;
};

// ============================================================
// FLOATING PARTICLES BACKGROUND
// ============================================================

export const ParticleField: React.FC<{
  count?: number;
  color?: string;
  maxSize?: number;
}> = ({count = 30, color = '#ffffff', maxSize = 8}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`particle-x-${i}`) * 1920;
        const baseY = random(`particle-y-${i}`) * 1080;
        const size = random(`particle-size-${i}`) * maxSize + 1;
        const speed = random(`particle-speed-${i}`) * 0.4 + 0.1;
        const phase = random(`particle-phase-${i}`) * Math.PI * 2;
        const opacity = random(`particle-opacity-${i}`) * 0.4 + 0.05;

        const y = baseY + Math.sin((frame * speed * 0.05) + phase) * 40;
        const drift = Math.cos((frame * speed * 0.03) + phase) * 20;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + drift,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================================
// ANIMATED GRADIENT BACKGROUND
// ============================================================

export const AnimatedGradient: React.FC<{
  color1?: string;
  color2?: string;
  color3?: string;
}> = ({
  color1 = '#0a0a0a',
  color2 = '#1a1a2e',
  color3 = '#16213e',
}) => {
  const frame = useCurrentFrame();

  const angle = interpolate(frame, [0, 300], [0, 360]);
  const shift = interpolate(frame, [0, 300], [0, 50]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${color1}, ${color2} ${50 + shift}%, ${color3})`,
      }}
    />
  );
};

// ============================================================
// CIRCLE CLIP REVEAL
// ============================================================

export const CircleReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  durationFrames?: number;
  originX?: string;
  originY?: string;
}> = ({
  children,
  delay = 0,
  durationFrames = 30,
  originX = '50%',
  originY = '50%',
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [delay, delay + durationFrames],
    [0, 150],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}
  );

  return (
    <div style={{clipPath: `circle(${progress}% at ${originX} ${originY})`}}>
      {children}
    </div>
  );
};

// ============================================================
// STAGGERED LIST REVEAL
// ============================================================

export const StaggeredList: React.FC<{
  items: string[];
  delay?: number;
  staggerFrames?: number;
  fontSize?: number;
  color?: string;
}> = ({
  items,
  delay = 0,
  staggerFrames = 8,
  fontSize = 36,
  color = '#fafafa',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {items.map((item, i) => {
        const itemSpring = spring({
          fps,
          frame: frame - delay - i * staggerFrames,
          config: {damping: 200},
        });
        const x = interpolate(Math.max(0, itemSpring), [0, 1], [-40, 0]);

        return (
          <div
            key={i}
            style={{
              fontSize,
              color,
              opacity: Math.max(0, itemSpring),
              transform: `translateX(${x}px)`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// SCALE POP-IN
// ============================================================

export const ScalePopIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({children, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = spring({
    fps,
    frame: frame - delay,
    config: springPresets.poppy,
  });

  return (
    <div style={{
      transform: `scale(${Math.max(0, scale)})`,
      opacity: Math.max(0, scale),
    }}>
      {children}
    </div>
  );
};

// ============================================================
// NUMBER COUNTER
// ============================================================

export const AnimatedCounter: React.FC<{
  from?: number;
  to: number;
  delay?: number;
  durationFrames?: number;
  fontSize?: number;
  color?: string;
  prefix?: string;
  suffix?: string;
}> = ({
  from = 0,
  to,
  delay = 0,
  durationFrames = 45,
  fontSize = 96,
  color = '#fafafa',
  prefix = '',
  suffix = '',
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame,
    [delay, delay + durationFrames],
    [from, to],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}
  );

  return (
    <div style={{fontSize, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums'}}>
      {prefix}{Math.round(value).toLocaleString()}{suffix}
    </div>
  );
};
