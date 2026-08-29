import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ExperienceCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [, setLocation] = useLocation();

  const { data: navData } = trpc.cms.listExperienceTypesWithNav.useQuery();

  // 找到匹配的类型
  const category = navData?.find(t => toSlug(t.name) === categorySlug);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '120px', paddingBottom: '80px' }}>
        {category ? (
          <>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 300,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#1a1a1a',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              {category.name}
            </h1>
            <p style={{ fontFamily: 'sans-serif', fontSize: '13px', letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: '48px' }}>
              Experiences
            </p>

            {category.items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%', maxWidth: '560px', padding: '0 24px' }}>
                {category.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLocation(`/experiences/${categorySlug}/${item.slug}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 0',
                      background: 'none', border: 'none', borderBottom: '1px solid #eee',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1a1a',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F5569B')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#1a1a1a')}
                  >
                    <span>{item.name}</span>
                    <span style={{ fontSize: '20px', opacity: 0.4 }}>›</span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#aaa', letterSpacing: '0.1em' }}>
                  Coming Soon
                </p>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: '#1a1a1a',
              marginBottom: '16px',
            }}>
              Coming Soon
            </h1>
            <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#aaa', letterSpacing: '0.1em' }}>
              This experience category is being curated.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
