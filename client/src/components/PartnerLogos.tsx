import React, { useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

const fallbackLogos = [
  { src: '', alt: 'Virtuoso', invert: true },
  { src: '', alt: 'Fan Club', invert: true },
  { src: '', alt: 'Pen Club', invert: true },
  { src: '', alt: 'Forbes', invert: false },
  { src: '', alt: 'Ensemble', invert: true },
  { src: '', alt: 'EF Education First', invert: false, height: 80 },
  { src: '', alt: 'Coveteur', invert: false },
  { src: '', alt: 'CNBC', invert: false },
  { src: '', alt: 'Travel + Leisure A-List 2026', invert: false },
];

export default function PartnerLogos() {
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();

  if (homepageData && (!homepageData.sponsors || homepageData.sponsors.length === 0)) {
    return null;
  }

  // 使用 DB sponsors，若无数据则 fallback
  const logos = (homepageData?.sponsors && homepageData.sponsors.length > 0)
    ? homepageData.sponsors.flatMap(sp => {
        // logoUrls 是 JSON 数组字符串，需要解析
        const urls = typeof sp.logoUrls === 'string' ? JSON.parse(sp.logoUrls) : sp.logoUrls || [];
        return urls.map((logoUrl: string) => ({
          src: logoUrl,
          alt: sp.name,
          invert: false,
          url: sp.websiteUrl || undefined
        }));
      })
    : fallbackLogos;

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const cancelInertia = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.5) {
        velocityRef.current = 0;
        return;
      }
      track.scrollLeft -= velocityRef.current;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelInertia(), []);

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    draggingRef.current = true;
    startXRef.current = e.pageX;
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.pageX;
    velocityRef.current = 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };

  const onMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    startInertia();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const walk = e.pageX - startXRef.current;
    velocityRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    cancelInertia();
    draggingRef.current = true;
    startXRef.current = e.touches[0].pageX;
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.touches[0].pageX;
    velocityRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const walk = e.touches[0].pageX - startXRef.current;
    velocityRef.current = e.touches[0].pageX - lastXRef.current;
    lastXRef.current = e.touches[0].pageX;
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const onTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startInertia();
  };

  return (
    <section className="bg-white" style={{ paddingTop: '48px', paddingBottom: '48px', overflow: 'hidden' }}>
      {/* Outer wrapper: clips overflow */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        {/* Scrollable track */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'scroll',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            cursor: 'grab',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingLeft: '24px',
            paddingRight: '24px',
            gap: '56px',
            alignItems: 'center',
          }}
        >
          {logos.map((logo, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              height: '120px',
              minWidth: '200px',
              }}
            >
              {(logo as any).url ? (
                <a href={(logo as any).url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    draggable={false}
                    style={{
                    height: (logo as any).height ? `${(logo as any).height}px` : '100%',
                    width: 'auto',
                    maxWidth: '320px',
                      objectFit: 'contain',
                      filter: 'brightness(0)',
                      opacity: 1,
                      transition: 'opacity 0.2s',
                    }}
                  />
                </a>
              ) : (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  draggable={false}
                  style={{
                  height: (logo as any).height ? `${(logo as any).height}px` : '100%',
                  width: 'auto',
                  maxWidth: '320px',
                    objectFit: 'contain',
                    filter: 'brightness(0)',
                    opacity: 1,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
