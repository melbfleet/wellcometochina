import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';

export default function ReadyToStart() {
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const ctaBg = homepageAssets?.cta?.url;
  const textureOpacity = Math.max(0, Math.min(1, Number((homepageAssets?.cta as any)?.opacity ?? 28) / 100));

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(260px, 30vw, 275px)',
        backgroundColor: '#a84900',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${ctaBg || ''})`,
          backgroundSize: '420px 420px',
          backgroundRepeat: 'repeat',
          opacity: textureOpacity,
          mixBlendMode: 'normal',
          filter: 'contrast(1.45) brightness(1.08)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'AlternateGotNo1D',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          So, ready to start?
        </h2>

        <Link href="/make-an-enquiry">
          <button
            style={{
          backgroundColor: '#111111',
          color: '#ffffff',
          fontFamily: 'Lato, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '14px 36px',
          border: '2px solid #111111',
          cursor: 'pointer',
          transition: 'background-color 0.2s, color 0.2s, transform 0.1s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#111111';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = '#111111';
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Get in Touch
          </button>
        </Link>
      </div>
    </section>
  );
}
