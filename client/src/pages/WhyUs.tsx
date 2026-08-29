import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { useMediaObjectPosition } from '@/lib/media-position';

/**
 * WhyUs Page — Full-screen paged layout
 *
 * FORWARD (scroll down):
 *   Left  panel exits: translateY(0 → -100%)  [slides UP out]
 *   Left  panel enters: translateY(+100% → 0) [slides UP in from bottom]
 *   Right panel exits: translateY(0 → +100%)  [slides DOWN out]
 *   Right panel enters: translateY(-100% → 0) [slides DOWN in from top]
 *
 * BACKWARD (scroll up) — mirror:
 *   Left  panel exits: translateY(0 → +100%)  [slides DOWN out]
 *   Left  panel enters: translateY(-100% → 0) [slides DOWN in from top]
 *   Right panel exits: translateY(0 → -100%)  [slides UP out]
 *   Right panel enters: translateY(+100% → 0) [slides UP in from bottom]
 *
 * Text / Image alternates per slide (odd=text-left, even=text-right)
 */

interface Slide {
  num?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  backgroundColor?: string;
  isCover?: boolean;
}


const DURATION = 900;
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const DISPLAY_FONT = "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)";
const BODY_FONT = "var(--font-travel-sans, 'Cabin', 'Helvetica Neue', Arial, sans-serif)";

type Direction = 'forward' | 'backward';
type AnimRole = 'entering' | 'exiting';

interface SlideState {
  index: number;
  role: AnimRole | 'idle';
  direction: Direction;
}

// Returns the CSS animation name for a panel
function animName(panel: 'left' | 'right', role: AnimRole, dir: Direction) {
  return `ws_${panel}_${role}_${dir}`;
}

// Preload all slide images so they are cached before the user navigates
function preloadImages(slides: Slide[]) {
  slides.forEach(slide => {
    if (slide.image) {
      const img = new Image();
      img.src = slide.image;
    }
  });
}

export default function WhyUs() {
  const { data: dbSections } = trpc.about.listWhyUsSections.useQuery();
  const { data: homeSettings } = trpc.about.getWhyUsHomeSettings.useQuery();
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const getObjectPosition = useMediaObjectPosition();
  const backgroundTexture = homepageAssets?.cta?.url;
  const textureOpacity = Math.max(0, Math.min(1, Number((homepageAssets?.cta as any)?.opacity ?? 28) / 100));

  // Build slides from CMS data once per data update so navigation callbacks use the latest count.
  const SLIDES = useMemo<Slide[]>(() => {
    const dbSlides = dbSections && dbSections.length > 0
      ? dbSections
        .filter(s => s.title || s.content || s.image)
        .map((s, i) => ({
          num: String(i + 1).padStart(2, '0'),
          title: s.title,
          description: s.content,
          image: s.image ?? undefined,
          backgroundColor: (s as any).backgroundColor || '#12334c',
        }))
      : [];

    return [
      { isCover: true, title: 'WHY US?', subtitle: 'What sets us apart', description: `${dbSlides.length} reasons to book\nwith WaySeekChina`, backgroundColor: homeSettings?.backgroundColor || '#12334c' },
      ...dbSlides,
    ];
  }, [dbSections, homeSettings?.backgroundColor]);

  const [current, setCurrent] = useState<SlideState>({ index: 0, role: 'idle', direction: 'forward' });
  const [prev, setPrev] = useState<SlideState | null>(null);

  // Preload all images on mount
  useEffect(() => { preloadImages(SLIDES); }, [SLIDES]);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((nextIdx: number) => {
    if (lockRef.current) return;
    if (nextIdx === current.index) return;
    if (nextIdx < 0 || nextIdx >= SLIDES.length) return;

    lockRef.current = true;
    const dir: Direction = nextIdx > current.index ? 'forward' : 'backward';

    setPrev({ index: current.index, role: 'exiting', direction: dir });
    setCurrent({ index: nextIdx, role: 'entering', direction: dir });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPrev(null);
      setCurrent(s => ({ ...s, role: 'idle' }));
      lockRef.current = false;
    }, DURATION + 60);
  }, [current.index, SLIDES.length]);

  useEffect(() => {
    if (current.index < SLIDES.length) return;
    setCurrent({ index: Math.max(0, SLIDES.length - 1), role: 'idle', direction: 'forward' });
    setPrev(null);
    lockRef.current = false;
  }, [current.index, SLIDES.length]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current.index + 1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(current.index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current.index, goTo]);

  // Wheel
  const wheelLock = useRef(false);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      wheelLock.current = true;
      setTimeout(() => { wheelLock.current = false; }, DURATION + 150);
      if (e.deltaY > 0) goTo(current.index + 1);
      else goTo(current.index - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [current.index, goTo]);

  // Touch
  const touchY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 50) return;
    if (dy > 0) goTo(current.index + 1);
    else goTo(current.index - 1);
  };

  // ── Render a single slide ─────────────────────────────────────────────────
  const renderSlide = (state: SlideState) => {
    const slide = SLIDES[state.index] ?? SLIDES[0];
    const { role, direction } = state;
    const slideBg = slide.backgroundColor || '#12334c';
    const textureLayer = backgroundTexture
      ? {
          backgroundImage: `url(${backgroundTexture})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '420px 420px',
          opacity: textureOpacity,
          mixBlendMode: 'normal' as const,
          filter: 'contrast(1.45) brightness(1.08)',
        }
      : {
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 30%)',
          opacity: 0.2,
        };

    // Odd slide index (1,3,5) = text left / image right
    // Even slide index (2,4) = image left / text right
    // Cover (0) = text left / decorative right
    const textOnLeft = slide.isCover || state.index % 2 === 1;

    const anim = (panel: 'left' | 'right') =>
      role === 'idle'
        ? 'none'
        : `${animName(panel, role as AnimRole, direction)} ${DURATION}ms ${EASE} both`;

    if (slide.isCover) {
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: slideBg, zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, ...textureLayer }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden', zIndex: 1 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 'clamp(48px,12vw,240px)', willChange: 'transform', animation: anim('left') }}>
              <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(88px,13vw,188px)', fontWeight: 400, color: '#42b8a8', lineHeight: 0.86, letterSpacing: '0.05em', margin: 0, textTransform: 'uppercase' }}>
                WHY US?
              </h1>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%', overflow: 'hidden', zIndex: 1 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 'clamp(40px,8vw,140px)', paddingRight: 'clamp(56px,8vw,150px)', willChange: 'transform', animation: anim('right') }}>
              <p style={{ fontFamily: BODY_FONT, fontSize: 'clamp(12px,1vw,16px)', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#42b8a8', margin: '0 0 24px 0' }}>
                What sets us apart
              </p>
              <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(42px,4.4vw,78px)', fontWeight: 400, color: '#ffffff', lineHeight: 0.98, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'pre-line', margin: 0 }}>
                {slide.description}
              </h2>
            </div>
          </div>
        </>
      );
    }

    const leftContent = textOnLeft ? 'text' : 'image';
    const rightContent = textOnLeft ? 'image' : 'text';

    const textBlock = (
      <div style={{ willChange: 'transform', animation: anim('left') }}>
        {slide.isCover ? (
          <>
            <p style={{ fontFamily: BODY_FONT, fontSize: 'clamp(10px,1vw,13px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8b89a', margin: '0 0 24px 0' }}>
              {slide.subtitle}
            </p>
            <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(72px,10vw,140px)', fontWeight: 400, color: '#fff', lineHeight: 0.9, letterSpacing: '0.05em', margin: 0, textTransform: 'uppercase' }}>
              WHY<br />US?
            </h1>
            <p style={{ fontFamily: BODY_FONT, fontSize: 'clamp(11px,1.1vw,14px)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '32px 0 0 0' }}>
              {slide.description}
            </p>
            <button
              onClick={() => goTo(1)}
              style={{ marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontFamily: BODY_FONT, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 28px', cursor: 'pointer', transition: 'border-color 0.25s,background 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8b89a'; e.currentTarget.style.background = 'rgba(200,184,154,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'none'; }}
            >
              Begin ›
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: BODY_FONT, fontSize: 'clamp(10px,1vw,13px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8b89a', margin: '0 0 20px 0' }}>
              {slide.num} / {String(SLIDES.length - 1).padStart(2, '0')}
            </p>
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(48px,5vw,86px)', fontWeight: 400, color: '#fff', lineHeight: 0.95, letterSpacing: '0.07em', margin: '0 0 28px 0', textTransform: 'uppercase' }}>
              {slide.title}
            </h2>
            <p style={{ fontFamily: BODY_FONT, fontSize: 'clamp(14px,1.15vw,17px)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, letterSpacing: '0.03em', maxWidth: '430px', margin: 0 }}>
              {slide.description}
            </p>
          </>
        )}
      </div>
    );

    const imageBlock = (
      slide.image ? (
        <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: getObjectPosition(slide.image), display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: slideBg, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, ...textureLayer }} />
        </div>
      )
    );

    return (
      <>
        {/* Left panel — outer is static clip container, inner slides */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
          overflow: 'hidden', zIndex: 1,
        }}>
          {leftContent === 'text' ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: slideBg,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              paddingLeft: 'clamp(40px,8vw,120px)', paddingRight: '40px',
              willChange: 'transform', animation: anim('left'),
            }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...textureLayer }} />
              {textBlock.props.children}
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, willChange: 'transform', animation: anim('left') }}>
              {imageBlock}
            </div>
          )}
        </div>

        {/* Right panel — outer is static clip container, inner slides */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%',
          overflow: 'hidden', zIndex: 1,
        }}>
          {rightContent === 'text' ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: slideBg,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              paddingLeft: 'clamp(40px,5vw,80px)', paddingRight: '40px',
              willChange: 'transform', animation: anim('right'),
            }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...textureLayer }} />
              {textBlock.props.children}
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, willChange: 'transform', animation: anim('right') }}>
              {imageBlock}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#12334c' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Navigation />

      {/* Exiting slide — z 1 */}
      {prev && (
        <div key={`prev-${prev.index}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {renderSlide(prev)}
        </div>
      )}

      {/* Entering slide — z 2 */}
      <div key={`curr-${current.index}`} style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        {renderSlide(current)}
      </div>

      {/* Number nav */}
      <div style={{ position: 'fixed', right: 'clamp(20px,3vw,48px)', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}>
        {SLIDES.slice(1).map((_, i) => {
          const idx = i + 1;
          const active = current.index === idx;
          const isLast = idx === SLIDES.length - 1;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={() => goTo(idx)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: DISPLAY_FONT, fontSize: '30px', fontWeight: 400,
                  letterSpacing: '0.12em',
                  color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)',
                  padding: '6px 0', transition: 'color 0.3s',
                  lineHeight: 1,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)'; }}
              >
                {String(idx).padStart(2, '0')}
              </button>
              {!isLast && (
                <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.25)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll hint / prev button */}
      {current.index === 0 && (
        <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 30, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', animation: 'wsBounce 2s ease-in-out infinite' }}>
            <span style={{ fontFamily: BODY_FONT, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Scroll</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px' }}>↓</span>
          </div>
        </div>
      )}
      {current.index > 0 && (
        <div style={{ position: 'fixed', bottom: '32px', left: 'clamp(40px,8vw,120px)', zIndex: 30 }}>
          <button onClick={() => goTo(current.index - 1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: BODY_FONT, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; }}
          >
            ← Previous
          </button>
        </div>
      )}

      {/* ── Keyframes ── */}
      <style>{`
        /* FORWARD: left exits UP, right exits DOWN */
        @keyframes ws_left_exiting_forward  { from{transform:translateY(0)}  to{transform:translateY(-100%)} }
        @keyframes ws_right_exiting_forward { from{transform:translateY(0)}  to{transform:translateY(100%)}  }
        /* FORWARD: left enters from BOTTOM, right enters from TOP */
        @keyframes ws_left_entering_forward  { from{transform:translateY(100%)}  to{transform:translateY(0)} }
        @keyframes ws_right_entering_forward { from{transform:translateY(-100%)} to{transform:translateY(0)} }

        /* BACKWARD: left exits DOWN, right exits UP */
        @keyframes ws_left_exiting_backward  { from{transform:translateY(0)}  to{transform:translateY(100%)}  }
        @keyframes ws_right_exiting_backward { from{transform:translateY(0)}  to{transform:translateY(-100%)} }
        /* BACKWARD: left enters from TOP, right enters from BOTTOM */
        @keyframes ws_left_entering_backward  { from{transform:translateY(-100%)} to{transform:translateY(0)} }
        @keyframes ws_right_entering_backward { from{transform:translateY(100%)}  to{transform:translateY(0)} }

        @keyframes wsBounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)}
        }
      `}</style>
    </div>
  );
}
