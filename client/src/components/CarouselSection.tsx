import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CarouselItem {
  id: number;
  name: string;
  description: string;
  image: string;
  videoId?: string;
}

function extractYouTubeId(value?: string) {
  const input = (value ?? '').trim();
  if (!input) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }
  return input;
}



// ── Shared drag/scroll logic ──────────────────────────────────────────────────
function StoriesStrip({
  onPlayVideo,
  didDragRef,
  items,
  showPlayButton = true,
}: {
  onPlayVideo?: (videoId: string) => void;
  didDragRef: React.MutableRefObject<boolean>;
  items: CarouselItem[];
  showPlayButton?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const localDragRef = useRef(false);

  const cancelInertia = () => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const startInertia = () => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      velocityRef.current *= 0.92;
      if (Math.abs(velocityRef.current) < 0.5) { velocityRef.current = 0; return; }
      track.scrollLeft -= velocityRef.current;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelInertia(), []);

  const onMouseDown = (e: React.MouseEvent) => {
    cancelInertia();
    draggingRef.current = true;
    localDragRef.current = false;
    didDragRef.current = false;
    startXRef.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
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
    const x = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startXRef.current) * 1.0;
    velocityRef.current = e.pageX - lastXRef.current;
    lastXRef.current = e.pageX;
    if (Math.abs(walk) > 4) { localDragRef.current = true; didDragRef.current = true; }
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    cancelInertia();
    draggingRef.current = true;
    localDragRef.current = false;
    didDragRef.current = false;
    startXRef.current = e.touches[0].pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollStartRef.current = trackRef.current?.scrollLeft ?? 0;
    lastXRef.current = e.touches[0].pageX;
    velocityRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const x = e.touches[0].pageX - (trackRef.current?.offsetLeft ?? 0);
    const walk = (x - startXRef.current) * 1.0;
    velocityRef.current = e.touches[0].pageX - lastXRef.current;
    lastXRef.current = e.touches[0].pageX;
    if (Math.abs(walk) > 4) { localDragRef.current = true; didDragRef.current = true; }
    if (trackRef.current) trackRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const onTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    startInertia();
  };

  return (
    <div
      ref={trackRef}
      className="similar-track"
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden',
        cursor: 'grab',
        userSelect: 'none',
        paddingLeft: '24px',
        paddingRight: '24px',
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start', minWidth: 'max-content', paddingBottom: '8px' }}>
        {items.map((item) => {
            const videoId = extractYouTubeId(item.videoId);
            return (
          <div
            key={item.id}
            className="relative group overflow-hidden flex-shrink-0"
            style={{ width: '600px', aspectRatio: '16/9', userSelect: 'none' }}
          >
            {showPlayButton && videoId ? (
              <>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={item.name}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (!localDragRef.current && videoId && onPlayVideo) onPlayVideo(videoId);
                    }}
                    className="w-16 h-16 rounded-full bg-[#F5F3EF]/90 group-hover:bg-[#F5F3EF] transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110"
                  >
                    <svg className="w-8 h-8 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              /* Image-only card: no overlay, no play button */
              <img
                src={videoId
                  ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  : item.image}
                alt={item.name}
                className="w-full h-full object-cover select-none"
                draggable={false}
                onError={videoId ? (e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                } : undefined}
              />
            )}
          </div>
            );
          })}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="w-full flex flex-col justify-start flex-shrink-0 select-none" style={{ backgroundColor: '#ffffff', paddingLeft: '24px', paddingRight: '24px' }}>
      <h2
        className="text-left text-black"
        style={{
          fontFamily: "'Barlow Condensed', 'Arial Narrow', 'Impact', sans-serif",
          fontWeight: '700',
          fontSize: '35px',
          letterSpacing: '0.04em',
          lineHeight: 1,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        {title}
      </h2>
      <p className="text-sm leading-relaxed mb-10 text-gray-700 font-light" style={{ fontFamily: 'Alternate Gothic No1 D, sans-serif' }}>
        {subtitle}
      </p>
    </div>
  );
}

export default function CarouselSection() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const didDragRefImage = useRef(false);
  const didDragRefVideo = useRef(false);
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();

  // Image section items — empty array if no DB data (section will be hidden)
  const imageItems: CarouselItem[] = (homepageData?.imageStories && homepageData.imageStories.length > 0)
    ? homepageData.imageStories.map(s => ({
        id: s.id,
        name: s.name,
        description: '',
        image: s.image || '',
        videoId: undefined,
      }))
    : [];

  // Video section items — empty array if no DB data (section will be hidden)
  const videoItems: CarouselItem[] = (homepageData?.videoStories && homepageData.videoStories.length > 0)
    ? homepageData.videoStories.map(s => ({
        id: s.id,
        name: s.name,
        description: '',
        image: s.image || '',
        videoId: s.videoId || undefined,
      }))
    : [];

  // Section titles/subtitles from DB, fallback to defaults
  const imageSectionTitle = homepageData?.imageSection?.title ?? 'Stories From the Road';
  const imageSectionSubtitle = homepageData?.imageSection?.subtitle ?? 'Real stories. Meaningful journeys.';
  const videoSectionTitle = homepageData?.videoSection?.title ?? 'Stories From the Road';
  const videoSectionSubtitle = homepageData?.videoSection?.subtitle ?? 'Real stories. Meaningful journeys.';

  // Section visibility: hide if no items or explicitly hidden in DB
  const showImageSection = imageItems.length > 0 && (homepageData ? (homepageData.imageSection?.isVisible !== false) : false);
  const showVideoSection = videoItems.length > 0 && (homepageData ? (homepageData.videoSection?.isVisible !== false) : false);

  useEffect(() => {
    if (selectedVideoId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedVideoId]);

  return (
    <>
      {/* ── Section 1: Image Stories (no play button) ── */}
      {showImageSection && (
      <section style={{ backgroundColor: '#ffffff', paddingTop: '48px', paddingBottom: '0' }}>
        <div className="flex flex-col h-auto w-full">
          <SectionHeader title={imageSectionTitle} subtitle={imageSectionSubtitle} />
          <StoriesStrip
            didDragRef={didDragRefImage}
            items={imageItems}
            showPlayButton={false}
          />
        </div>
      </section>
      )}

      {/* ── Section 2: Video Stories (with play button) ── */}
      {showVideoSection && (
      <section style={{ backgroundColor: '#ffffff', paddingTop: '48px', paddingBottom: '0' }}>
        <div className="flex flex-col h-auto w-full">
          <SectionHeader title={videoSectionTitle} subtitle={videoSectionSubtitle} />
          <StoriesStrip
            onPlayVideo={setSelectedVideoId}
            didDragRef={didDragRefVideo}
            items={videoItems}
            showPlayButton={true}
          />
        </div>
        <div className="w-full flex justify-center" style={{ backgroundColor: '#ffffff', paddingTop: '48px', paddingBottom: '64px' }}>
          <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-white hover:text-black transition-all duration-300 active:scale-95 active:shadow-lg">
            View our channel
          </button>
        </div>
      </section>
      )}

      {/* Video modal */}
      {selectedVideoId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedVideoId(null)}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              aspectRatio: '16 / 9',
              width: '100%',
              maxWidth: '1024px',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&controls=1&modestbranding=1`}
              title="Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
            />
            <button
              onClick={() => setSelectedVideoId(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#F5F3EF]/90 hover:bg-[#F5F3EF] flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <X size={24} className="text-black" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
