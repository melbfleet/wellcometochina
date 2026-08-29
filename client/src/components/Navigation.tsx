import { useState, useRef, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Link, useLocation } from 'wouter';
import { X, ChevronLeft } from 'lucide-react';

/**
 * Navigation Component — Detached overlay architecture
 * Nav bar is always exactly 55px. Dropdown menus are independent fixed layers.
 * Logo: Only shows when fully loaded, blank otherwise.
 */

// ── Destinations data ──────────────────────────────────────────────────────
interface Destination {
  id: string;
  name: string;
  previewImage: string;
  experiences: string[];
  route?: string;
  experienceRoutes?: { label: string; route: string }[];
}

// ── Slug helper ────────────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Experiences data (dynamic) ─────────────────────────────────────────────
interface ExperienceItem {
  label: string;
  route?: string;
}
interface ExperienceCategory {
  id: string;
  name: string;
  previewImage: string;
  items: ExperienceItem[];
}

interface AboutMenuItem {
  label: string;
  route: string;
}

const DEFAULT_ABOUT_ITEMS: AboutMenuItem[] = [
  { label: 'WHY US', route: '/about/why-us' },
  { label: 'Our Team', route: '/about/our-team' },
];

const NAV_SANS = "var(--font-travel-sans, 'Cabin', 'Helvetica Neue', Arial, sans-serif)";
const NAV_DISPLAY = "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)";

// ── Component ──────────────────────────────────────────────────────────────
interface NavigationProps {
  forceHide?: boolean;
  darkText?: boolean;
}

export default function Navigation({ forceHide = false, darkText = false }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'destinations' | 'experiences' | 'wayToTravel' | 'about' | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [location, setLocation] = useLocation();
  const [logoLoaded, setLogoLoaded] = useState(false);

  // 动态加载 Brand Assets logo
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const logoUrl = homepageAssets?.logo?.url || '';

  // 动态加载体验类型及其子项
  const { data: navData } = trpc.cms.listExperienceTypesWithNav.useQuery();
  const { data: wayToTravelNavData } = trpc.cms.listWayToTravelTypesWithNav.useQuery();
  const { data: aboutSections } = trpc.about.listPublicSections.useQuery();
  const categories: ExperienceCategory[] = useMemo(() => {
    if (!navData || navData.length === 0) return [];
    return navData
      .map(type => ({
        id: String(type.id),
        name: type.name,
        previewImage: type.coverImage || '',
        items: type.items
          .filter(item => item.name && item.slug)
          .map(item => ({
            label: item.name,
            route: `/experiences/${toSlug(type.name)}/${item.slug}`,
          })),
      }))
      .filter(type => type.items.length > 0);
  }, [navData]);
  const wayToTravelCategories: ExperienceCategory[] = useMemo(() => {
    if (!wayToTravelNavData || wayToTravelNavData.length === 0) return [];
    return wayToTravelNavData
      .map(type => ({
        id: String(type.id),
        name: type.name,
        previewImage: type.coverImage || '',
        items: type.items
          .filter(item => item.name && item.slug)
          .map(item => ({
            label: item.name,
            route: `/ways-to-travel/${type.slug || toSlug(type.name)}/${item.slug}`,
          })),
      }))
      .filter(type => type.items.length > 0);
  }, [wayToTravelNavData]);
  const aboutItems: AboutMenuItem[] = useMemo(() => {
    if (!aboutSections) return DEFAULT_ABOUT_ITEMS;
    return aboutSections.map(section => ({
      label: section.name,
      route: `/about/${section.slug || toSlug(section.name)}`,
    }));
  }, [aboutSections]);

  // 动态加载城市列表及其体验（不使用静态 fallback，避免闪现）
  const { data: citiesData } = trpc.cms.listCitiesWithExperiences.useQuery();
  const activeDestinations: Destination[] = useMemo(() => {
    if (!citiesData) return []; // 加载中 → 空数组，不显示静态数据
    return citiesData
      .map(city => {
        const experienceRoutes = city.experiences
          .filter(e => e.name && e.slug && e.typeName)
          .map(e => ({ label: e.name || '', route: `/experiences/${toSlug(e.typeName || '')}/${e.slug}` }));
        return {
          id: String(city.id),
          name: city.name,
          previewImage: city.cityCardImage || city.coverImage || '',
          route: `/destinations/${city.slug}`,
          experiences: experienceRoutes.map(e => e.label),
          experienceRoutes,
        };
      })
      .filter(city => city.experienceRoutes.length > 0);
  }, [citiesData]);

  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  // 当动态数据加载完成后，默认选中第一个
  useEffect(() => {
    if (activeDestinations.length > 0 && (!activeDestination || !activeDestinations.some(dest => dest.id === activeDestination.id))) {
      setActiveDestination(activeDestinations[0]);
    }
  }, [activeDestinations, activeDestination]);
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory | null>(null);
  const [activeWayToTravelCategory, setActiveWayToTravelCategory] = useState<ExperienceCategory | null>(null);
  const [destPortraitPage, setDestPortraitPage] = useState<1 | 2>(1);
  const [expPortraitPage, setExpPortraitPage] = useState<1 | 2>(1);
  const [wayToTravelPortraitPage, setWayToTravelPortraitPage] = useState<1 | 2>(1);

  // 当 categories 加载完成后，默认选中第一个
  const effectiveCategory = activeCategory ?? categories[0] ?? null;
  const effectiveWayToTravelCategory = activeWayToTravelCategory ?? wayToTravelCategories[0] ?? null;

  useEffect(() => {
    if (categories.length > 0 && activeCategory && !categories.some(category => category.id === activeCategory.id)) {
      setActiveCategory(null);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (
      wayToTravelCategories.length > 0 &&
      activeWayToTravelCategory &&
      !wayToTravelCategories.some(category => category.id === activeWayToTravelCategory.id)
    ) {
      setActiveWayToTravelCategory(null);
    }
  }, [wayToTravelCategories, activeWayToTravelCategory]);

  const anyOverlayOpen = activeMenu !== null;

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const bannerH = window.innerHeight;
      const scrollingUp = currentY < lastScrollY.current;
      if (currentY <= bannerH) setNavVisible(true);
      else setNavVisible(scrollingUp);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock/unlock body scroll when overlay open
  useEffect(() => {
    if (anyOverlayOpen) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }
    return () => {
      const scrollY = parseInt(document.body.style.top || '0') * -1;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, scrollY);
    };
  }, [anyOverlayOpen]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleMenu = (menu: 'destinations' | 'experiences' | 'wayToTravel' | 'about') => {
    if (activeMenu === menu) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menu);
      if (menu === 'destinations') {
        setActiveDestination(activeDestinations[0] ?? null);
        setDestPortraitPage(1);
      } else if (menu === 'experiences') {
        setActiveCategory(null); // 重置为 null，自动选中第一个
        setExpPortraitPage(1);
      } else if (menu === 'wayToTravel') {
        setActiveWayToTravelCategory(null);
        setWayToTravelPortraitPage(1);
      }
    }
  };

  const closeMenu = () => setActiveMenu(null);

  // Nav bar text color: white on transparent bg, dark when overlay open
  const textColor = (anyOverlayOpen || darkText) ? '#111' : '#fff';
  const navBg = (anyOverlayOpen || darkText)
    ? '#fff'
    : 'linear-gradient(to bottom, rgba(20,20,20,0.55) 0%, rgba(20,20,20,0.0) 100%)';

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <>
      <style>{`
        /* Hamburger */
        .hamburger-line {
          display: block; width: 22px; height: 2px; background: ${textColor};
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
        }
        .hamburger-open .line-top { transform: translateY(7px) rotate(45deg); }
        .hamburger-open .line-mid { opacity: 0; transform: scaleX(0); }
        .hamburger-open .line-bot { transform: translateY(-7px) rotate(-45deg); }

        /* Nav link underline */
        .nav-link-underline {
          position: relative; padding-bottom: 2px;
        }
        .nav-link-underline::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px; background: #F5569B;
          transition: width 0.25s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.nav-active::after { width: 100%; }

        /* Row styles — destinations */
        .bt-dest-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 0; cursor: pointer;
          font-family: var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif);
          font-size: 23px; font-weight: 400;
          letter-spacing: 0.04em; text-transform: uppercase; color: #111;
          transition: color 0.15s; white-space: nowrap;
        }
        .bt-dest-row:hover, .bt-dest-row.bt-active { color: #F5569B; }
        .bt-dest-row .bt-arr {
          font-size: 20px; margin-left: 10px; opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s; flex-shrink: 0;
        }
        .bt-dest-row:hover .bt-arr, .bt-dest-row.bt-active .bt-arr {
          opacity: 1; transform: translateX(4px);
        }

        /* Row styles — dest experiences (col 2) */
        .bt-exp-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 0; cursor: pointer;
          font-family: var(--font-travel-sans, 'Cabin', 'Helvetica Neue', Arial, sans-serif);
          font-size: 17px; font-weight: 500;
          letter-spacing: 0.05em; color: #444;
          transition: color 0.15s; white-space: nowrap;
        }
        .bt-exp-row:hover { color: #F5569B; }
        .bt-exp-row .bt-arr {
          font-size: 20px; margin-left: 10px; opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s; flex-shrink: 0;
        }
        .bt-exp-row:hover .bt-arr { opacity: 1; transform: translateX(4px); }

        /* Row styles — experiences categories (col 1) */
        .exp-cat-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 0; cursor: pointer;
          font-family: var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif);
          font-size: 23px; font-weight: 400;
          letter-spacing: 0.04em; text-transform: uppercase; color: #111;
          transition: color 0.15s; white-space: nowrap;
        }
        .exp-cat-row:hover, .exp-cat-row.exp-active { color: #F5569B; }
        .exp-cat-row .exp-arr {
          font-size: 20px; margin-left: 10px; opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s; flex-shrink: 0;
        }
        .exp-cat-row:hover .exp-arr, .exp-cat-row.exp-active .exp-arr {
          opacity: 1; transform: translateX(4px);
        }

        /* Row styles — experience sub-items (col 2) */
        .exp-sub-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 5px 0; cursor: pointer;
          font-family: var(--font-travel-sans, 'Cabin', 'Helvetica Neue', Arial, sans-serif);
          font-size: 17px; font-weight: 500;
          letter-spacing: 0.05em; color: #444;
          transition: color 0.15s; white-space: nowrap;
        }
        .exp-sub-row:hover { color: #F5569B; }
        .exp-sub-row .exp-arr {
          font-size: 20px; margin-left: 10px; opacity: 0.4;
          transition: opacity 0.15s, transform 0.2s; flex-shrink: 0;
        }
        .exp-sub-row:hover .exp-arr { opacity: 1; transform: translateX(4px); }

        /* Mobile menu animation */
        .mobile-menu-enter { animation: slideDown 0.2s ease; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Responsive: hide landscape cols on narrow screens */
        @media (max-width: 900px) {
          .bt-preview-col, .bt-landscape-layout,
          .exp-preview-col, .exp-landscape-layout { display: none !important; }
          .bt-portrait-layout, .exp-portrait-layout { display: flex !important; }
        }
        .bt-portrait-layout, .exp-portrait-layout { display: none; }
      `}</style>

      {/* ── Nav bar — always 55px ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          display: (navVisible && !forceHide) ? 'block' : 'none',
          background: navBg,
          transition: 'background 0.25s ease',
        }}
      >
        <div className="w-full">
          <div className="flex items-center relative" style={{ height: '55px' }}>
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 group absolute"
              style={{ left: 'clamp(28px, calc(-645px + 49.82vw), 305px)' }}
            >
              {logoLoaded && (
                <img
                  src={logoUrl}
                  alt="Wellcometochina"
                  className="group-hover:opacity-70 transition-opacity"
                  style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoLoaded(false)}
                />
              )}
              {!logoLoaded && logoUrl && (
                <img
                  src={logoUrl}
                  alt="Wellcometochina"
                  className="group-hover:opacity-70 transition-opacity"
                  style={{ height: '40px', width: 'auto', objectFit: 'contain', display: 'none' }}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoLoaded(false)}
                />
              )}
            </Link>

            {/* Center nav — desktop */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2" style={{ transform: 'translateX(-50%)' }}>
              {[
                { label: 'Destinations', key: 'destinations' as const },
                { label: 'Experiences', key: 'experiences' as const },
                { label: 'Way to Travel', key: 'wayToTravel' as const },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => toggleMenu(item.key)}
                  style={{ color: textColor, fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className={`nav-link-underline${activeMenu === item.key ? ' nav-active' : ''}`}>
                    {item.label}
                  </span>
                </button>
              ))}
              <button
                onClick={() => toggleMenu('about')}
                style={{ color: textColor, fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span className={`nav-link-underline${activeMenu === 'about' ? ' nav-active' : ''}`}>About</span>
              </button>
            </div>

            {/* Enquire Now — desktop */}
            <div
              className="hidden md:flex items-center"
              style={{ position: 'absolute', right: 'clamp(28px, calc(-645px + 49.82vw), 305px)' }}
            >
              <button
                onClick={() => setLocation('/make-an-enquiry')}
                style={{
                  background: '#F5569B', color: '#fff',
                  fontFamily: NAV_SANS, fontSize: '10px',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '8px 20px', border: '2px solid #F5569B', cursor: 'pointer',
                  fontWeight: 500, transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#F5569B';
                  e.currentTarget.style.borderColor = '#F5569B';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F5569B';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#F5569B';
                }}
              >
                Enquire Now
              </button>
            </div>

            {/* Mobile: Enquire + hamburger */}
            <div className="md:hidden flex items-center gap-2 ml-auto pr-3">
              <button
                onClick={() => setLocation('/make-an-enquiry')}
                style={{
                  background: '#F5569B', color: '#fff',
                  fontFamily: NAV_SANS, fontSize: '10px',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '6px 12px', border: 'none', cursor: 'pointer', fontWeight: 500,
                }}
              >
                Enquire
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className={`flex flex-col gap-[5px] ${isOpen ? 'hamburger-open' : ''}`}>
                  <span className="hamburger-line line-top" />
                  <span className="hamburger-line line-mid" />
                  <span className="hamburger-line line-bot" />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {isOpen && (
            <div
              className="md:hidden mobile-menu-enter"
              style={{
                position: 'absolute', right: 0, top: '55px', minWidth: '180px',
                background: 'linear-gradient(to bottom, rgba(20,20,20,0.82) 0%, rgba(20,20,20,0.60) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex flex-col py-3 px-6 gap-1">
                {[
                  { label: 'Destinations', key: 'destinations' as const },
                  { label: 'Experiences', key: 'experiences' as const },
                  { label: 'Way to Travel', key: 'wayToTravel' as const },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => { toggleMenu(item.key); setIsOpen(false); }}
                    style={{ color: '#fff', fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '12px 0' }}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { toggleMenu('about'); setIsOpen(false); }}
                  style={{ color: '#fff', fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '12px 0' }}
                >
                  About
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Dropdown overlay — independent fixed layer, starts at 55px ── */}
      {anyOverlayOpen && (
        <div
          style={{
            position: 'fixed',
            top: '55px',
            left: 0,
            right: 0,
            bottom: 0,
            background: '#fff',
            zIndex: 49,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeMenu}
            style={{
              position: 'absolute', top: '12px',
              right: 'clamp(28px, calc(-645px + 49.82vw), 305px)',
              zIndex: 10, display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#222', padding: '4px',
            }}
          >
            <X size={24} />
          </button>

          {/* ── DESTINATIONS panel ── */}
          {activeMenu === 'destinations' && activeDestination && (
            <>
              {/* Landscape */}
              <div className="bt-landscape-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Col 1 */}
                <div style={{ flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingRight: '20px', paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)', width: '320px', boxSizing: 'content-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {activeDestinations.map(dest => (
                    <div
                      key={dest.id}
                      className={`bt-dest-row${activeDestination.id === dest.id ? ' bt-active' : ''}`}
                      onMouseEnter={() => setActiveDestination(dest)}
                      onClick={() => { if (dest.route) { closeMenu(); setLocation(dest.route); } }}
                    >
                      <span>{dest.name}</span>
                      <span className="bt-arr">›</span>
                    </div>
                  ))}
                </div>
                {/* Col 2 */}
                <div style={{ width: '360px', flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '14px', paddingRight: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {(activeDestination.experienceRoutes || activeDestination.experiences.map(e => ({ label: e, route: undefined }))).map((exp, i) => (
                    <div
                      key={i}
                      className="bt-exp-row"
                      style={{ cursor: (exp as any).route ? 'pointer' : 'default' }}
                      onClick={() => { if ((exp as any).route) { closeMenu(); setLocation((exp as any).route); } }}
                    >
                      <span>{(exp as any).label || exp}</span>
                      <span className="bt-arr">›</span>
                    </div>
                  ))}
                </div>
                {/* Col 3 */}
                <div className="bt-preview-col" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingTop: '60px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: 'clamp(28px, calc(-645px + 49.82vw), 305px)', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100%', maxHeight: '600px', overflow: 'hidden', flexShrink: 1 }}>
                    <img
                      key={activeDestination.id}
                      src={activeDestination.previewImage}
                      alt={activeDestination.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right', transition: 'opacity 0.4s ease', display: 'block' }}
                    />
                  </div>
                </div>
              </div>

              {/* Portrait */}
              <div className="bt-portrait-layout" style={{ flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {destPortraitPage === 1 && (
                  <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                    {activeDestinations.map(dest => (
                      <div key={dest.id} className="bt-dest-row" onClick={() => { setActiveDestination(dest); setDestPortraitPage(2); }}>
                        <span>{dest.name}</span>
                        <span className="bt-arr">›</span>
                      </div>
                    ))}
                  </div>
                )}
                {destPortraitPage === 2 && (
                  <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '12px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '32px', marginBottom: '28px' }}>
                      <button onClick={() => setDestPortraitPage(1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#222', fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', padding: 0 }}>
                        <ChevronLeft size={16} /><span>Back</span>
                      </button>
                    </div>
                    <div style={{ fontFamily: NAV_DISPLAY, fontSize: '23px', fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#222', marginBottom: '16px' }}>
                      {activeDestination.name}
                    </div>
                    {(activeDestination.experienceRoutes || activeDestination.experiences.map(e => ({ label: e, route: undefined }))).map((exp, i) => (
                      <div
                        key={i}
                        className="bt-exp-row"
                        style={{ cursor: (exp as any).route ? 'pointer' : 'default' }}
                        onClick={() => { if ((exp as any).route) { closeMenu(); setLocation((exp as any).route); } }}
                      >
                        <span>{(exp as any).label || exp}</span>
                        <span className="bt-arr">›</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── WAY TO TRAVEL panel ── */}
          {activeMenu === 'wayToTravel' && (
            <>
              {/* Landscape */}
              <div className="exp-landscape-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Col 1 */}
                <div style={{ flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingRight: '20px', paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)', width: '320px', boxSizing: 'content-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {wayToTravelCategories.length === 0 ? (
                    <div style={{ color: '#aaa', fontFamily: NAV_SANS, fontSize: '13px', paddingTop: '8px' }}>Loading...</div>
                  ) : wayToTravelCategories.map(cat => (
                    <div
                      key={cat.id}
                      className={`exp-cat-row${effectiveWayToTravelCategory?.id === cat.id ? ' exp-active' : ''}`}
                      onMouseEnter={() => setActiveWayToTravelCategory(cat)}
                      onClick={() => setActiveWayToTravelCategory(cat)}
                    >
                      <span>{cat.name}</span>
                      <span className="exp-arr">›</span>
                    </div>
                  ))}
                </div>
                {/* Col 2 */}
                <div style={{ width: '360px', flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '14px', paddingRight: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {effectiveWayToTravelCategory?.items.map((item, i) => (
                    item.route ? (
                      <a key={i} href={item.route} className="exp-sub-row" style={{ textDecoration: 'none' }} onClick={() => setActiveMenu(null)}>
                        <span>{item.label}</span>
                        <span className="exp-arr">›</span>
                      </a>
                    ) : (
                      <div key={i} className="exp-sub-row">
                        <span>{item.label}</span>
                        <span className="exp-arr">›</span>
                      </div>
                    )
                  ))}
                </div>
                {/* Col 3 */}
                <div className="exp-preview-col" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingTop: '60px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: 'clamp(28px, calc(-645px + 49.82vw), 305px)', overflow: 'hidden' }}>
                  {effectiveWayToTravelCategory && (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100%', maxHeight: '600px', overflow: 'hidden', flexShrink: 1 }}>
                      <img
                        key={effectiveWayToTravelCategory.id}
                        src={effectiveWayToTravelCategory.previewImage}
                        alt={effectiveWayToTravelCategory.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right', transition: 'opacity 0.4s ease', display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Portrait */}
              <div className="exp-portrait-layout" style={{ flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {wayToTravelPortraitPage === 1 && (
                  <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                    {wayToTravelCategories.map(cat => (
                      <div key={cat.id} className="exp-cat-row" onClick={() => { setActiveWayToTravelCategory(cat); setWayToTravelPortraitPage(2); }}>
                        <span>{cat.name}</span>
                        <span className="exp-arr">›</span>
                      </div>
                    ))}
                  </div>
                )}
                {wayToTravelPortraitPage === 2 && effectiveWayToTravelCategory && (
                  <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '12px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '32px', marginBottom: '28px' }}>
                      <button onClick={() => setWayToTravelPortraitPage(1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#222', fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', padding: 0 }}>
                        <ChevronLeft size={16} /><span>Back</span>
                      </button>
                    </div>
                    <div style={{ fontFamily: NAV_DISPLAY, fontSize: '23px', fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#222', marginBottom: '16px' }}>
                      {effectiveWayToTravelCategory.name}
                    </div>
                    {effectiveWayToTravelCategory.items.map((item, i) => (
                      item.route ? (
                        <a key={i} href={item.route} className="exp-sub-row" style={{ textDecoration: 'none' }} onClick={() => setActiveMenu(null)}>
                          <span>{item.label}</span>
                          <span className="exp-arr">›</span>
                        </a>
                      ) : (
                        <div key={i} className="exp-sub-row">
                          <span>{item.label}</span>
                          <span className="exp-arr">›</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ABOUT panel ── */}
          {activeMenu === 'about' && (
            <>
              {/* Landscape — no preview image, just the two links */}
              <div className="bt-landscape-layout" style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingRight: '20px', paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)', minWidth: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {aboutItems.map((item, i) => (
                    <a
                      key={i}
                      href={item.route}
                      className="bt-dest-row"
                      style={{ textDecoration: 'none' }}
                      onClick={() => closeMenu()}
                    >
                      <span>{item.label}</span>
                      <span className="bt-arr">›</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Portrait — same two links, single column */}
              <div className="exp-portrait-layout" style={{ flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                  {aboutItems.map((item, i) => (
                    <a
                      key={i}
                      href={item.route}
                      className="exp-cat-row"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setActiveMenu(null)}
                    >
                      <span>{item.label}</span>
                      <span className="exp-arr">›</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── EXPERIENCES panel ── */}
          {activeMenu === 'experiences' && (
            <>
              {/* Landscape */}
              <div className="exp-landscape-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Col 1 */}
                <div style={{ flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingRight: '20px', paddingLeft: 'clamp(28px, calc(-645px + 49.82vw), 305px)', width: '320px', boxSizing: 'content-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {categories.length === 0 ? (
                    <div style={{ color: '#aaa', fontFamily: NAV_SANS, fontSize: '13px', paddingTop: '8px' }}>Loading...</div>
                  ) : categories.map(cat => (
                    <div
                      key={cat.id}
                      className={`exp-cat-row${effectiveCategory?.id === cat.id ? ' exp-active' : ''}`}
                      onMouseEnter={() => setActiveCategory(cat)}
                      onClick={() => setActiveCategory(cat)}
                    >
                      <span>{cat.name}</span>
                      <span className="exp-arr">›</span>
                    </div>
                  ))}
                </div>
                {/* Col 2 */}
                <div style={{ width: '360px', flexShrink: 0, overflowY: 'hidden', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '14px', paddingRight: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {effectiveCategory?.items.map((item, i) => (
                    item.route ? (
                      <a key={i} href={item.route} className="exp-sub-row" style={{ textDecoration: 'none' }} onClick={() => setActiveMenu(null)}>
                        <span>{item.label}</span>
                        <span className="exp-arr">›</span>
                      </a>
                    ) : (
                      <div key={i} className="exp-sub-row">
                        <span>{item.label}</span>
                        <span className="exp-arr">›</span>
                      </div>
                    )
                  ))}
                </div>
                {/* Col 3 */}
                <div className="exp-preview-col" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingTop: '60px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: 'clamp(28px, calc(-645px + 49.82vw), 305px)', overflow: 'hidden' }}>
                  {effectiveCategory && (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100%', maxHeight: '600px', overflow: 'hidden', flexShrink: 1 }}>
                      <img
                        key={effectiveCategory.id}
                        src={effectiveCategory.previewImage}
                        alt={effectiveCategory.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right', transition: 'opacity 0.4s ease', display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Portrait */}
              <div className="exp-portrait-layout" style={{ flex: 1, flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {expPortraitPage === 1 && (
                  <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '60px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                    {categories.map(cat => (
                      <div key={cat.id} className="exp-cat-row" onClick={() => { setActiveCategory(cat); setExpPortraitPage(2); }}>
                        <span>{cat.name}</span>
                        <span className="exp-arr">›</span>
                      </div>
                    ))}
                  </div>
                )}
                {expPortraitPage === 2 && effectiveCategory && (
                  <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: '12px', paddingBottom: '40px', paddingLeft: '32px', paddingRight: '64px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '32px', marginBottom: '28px' }}>
                      <button onClick={() => setExpPortraitPage(1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#222', fontFamily: NAV_SANS, fontSize: '13px', fontWeight: 700, letterSpacing: '0.065em', textTransform: 'uppercase', padding: 0 }}>
                        <ChevronLeft size={16} /><span>Back</span>
                      </button>
                    </div>
                    <div style={{ fontFamily: NAV_DISPLAY, fontSize: '23px', fontWeight: 400, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#222', marginBottom: '16px' }}>
                      {effectiveCategory.name}
                    </div>
                    {effectiveCategory.items.map((item, i) => (
                      item.route ? (
                        <a key={i} href={item.route} className="exp-sub-row" style={{ textDecoration: 'none' }} onClick={() => setActiveMenu(null)}>
                          <span>{item.label}</span>
                          <span className="exp-arr">›</span>
                        </a>
                      ) : (
                        <div key={i} className="exp-sub-row">
                          <span>{item.label}</span>
                          <span className="exp-arr">›</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
