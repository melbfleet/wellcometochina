import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CarouselSection from '@/components/CarouselSection';
import PartnerLogos from '@/components/PartnerLogos';
import LuxuryTravelExperts from '@/components/LuxuryTravelExperts';
import WhyIntoChinaSection from '@/components/WhyIntoChinaSection';
import ReadyToStart from '@/components/ReadyToStart';
import HomepageWayToTravel from '@/components/HomepageWayToTravel';
import PlanYourTrip from '@/pages/PlanYourTrip';
import ResponsiveImage from '@/components/ResponsiveImage';
import SampleTripCards, { familySampleTripSlugs } from '@/components/SampleTripCards';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useMediaObjectPosition } from '@/lib/media-position';


/**
 * Home Page
 * Design: Elegant luxury travel landing page with cultural carousel hero and travel package collages
 * Features: Auto-rotating hero carousel, travel package grid with collage images (2 per row)
 */

interface HeroSlide {
  id: number;
  image: string;
  title: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    image: '',
    title: 'Rural Life',
  },
  {
    id: 2,
    image: '',
    title: 'Mountain Majesty',
  },
];

function normalizeHeroImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((url): url is string => typeof url === 'string' && url.length > 0);
  }
  if (typeof value !== 'string' || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((url): url is string => typeof url === 'string' && url.length > 0);
    }
  } catch {
    return [value];
  }
  return [];
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  // Image loading states
  const [heroBannerLoaded, setHeroBannerLoaded] = useState(false);
  const [heroLogoLoaded, setHeroLogoLoaded] = useState(false);

  // 动态首页资产
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const getObjectPosition = useMediaObjectPosition();
  // 首页管理模块公开数据（hero/intro/stories/sponsors）
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();
  
  // Load published itineraries for Explore Our Trips.
  const { data: itineraries = [] } = trpc.cms.listItineraries.useQuery();
  
  const exploreTrips = [
    ...itineraries.filter(trip => familySampleTripSlugs.has(trip.slug)),
    ...itineraries.filter(trip => !familySampleTripSlugs.has(trip.slug)),
  ];
  // 始终使用静态图片作为 fallback，只有 API 返回且有数据时才替换
  const FALLBACK_BANNER = '';
  const apiBanners = homepageAssets?.banners as Array<{ url: string; id: number }> | undefined;
  const activeLogo = '';
  // 若 homepage_hero 有 backgroundImage，优先使用；否则回退到 media assets banners
  const heroBackgroundImages = normalizeHeroImages(homepageData?.hero?.backgroundImage);
  const activeBanners = heroBackgroundImages.length > 0
    ? heroBackgroundImages
    : (apiBanners && apiBanners.length > 0) ? apiBanners.map((b) => b.url) : [FALLBACK_BANNER];
  const heroTitle = homepageData?.hero?.title || 'The Immersive China Experts';
  const heroSubtitle = homepageData?.hero?.subtitle || 'Tailor-made experiences, crafted with local insight.';

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setHeroBannerLoaded(false);
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section - Full Screen Image Background */}
      {homepageData?.hero?.isVisible !== false && (
      <section className="relative h-[100svh] min-h-[32rem] w-full overflow-hidden bg-black md:h-screen">
        {/* Image Background */}
        <div className="relative w-full h-full">
          <div className="w-full h-full">
            {heroBannerLoaded && (
              <img
                src={activeBanners[currentSlide % activeBanners.length]}
                alt="China countryside landscape"
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: getObjectPosition(activeBanners[currentSlide % activeBanners.length]) }}
                onLoad={() => setHeroBannerLoaded(true)}
                onError={() => setHeroBannerLoaded(false)}
              />
            )}
            {!heroBannerLoaded && (
              <img
                src={activeBanners[currentSlide % activeBanners.length]}
                alt="China countryside landscape"
                className="w-full h-full object-cover object-center"
                style={{ display: 'none' }}
                onLoad={() => setHeroBannerLoaded(true)}
                onError={() => setHeroBannerLoaded(false)}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Hero Logo - Center */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-4">
            {heroLogoLoaded && (
              <img
                src={activeLogo || ''}
                alt="Wellcometochina"
                style={{ height: 'clamp(60px, 12vw, 160px)', width: 'auto', maxWidth: '60vw', objectFit: 'contain' }}
                onLoad={() => setHeroLogoLoaded(true)}
                onError={() => setHeroLogoLoaded(false)}
              />
            )}
            {!heroLogoLoaded && activeLogo && (
              <img
                src={activeLogo}
                alt="Wellcometochina"
                style={{ height: 'clamp(60px, 12vw, 160px)', width: 'auto', maxWidth: '60vw', objectFit: 'contain', display: 'none' }}
                onLoad={() => setHeroLogoLoaded(true)}
                onError={() => setHeroLogoLoaded(false)}
              />
            )}
            {heroLogoLoaded && <div className="w-32 h-px bg-[#F5F3EF]"></div>}
          </div>
        </div>

        {/* Hero Text - Center */}
        <div className="absolute inset-0 flex items-center justify-center z-30 px-6">
          <div style={{ width: 'min(980px, 92vw)', textAlign: 'center', color: '#fff', transform: 'translateY(3vh)' }}>
            <h1
              style={{
                fontFamily: "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)",
                fontSize: 'clamp(36px, 6vw, 77px)',
                fontWeight: 400,
                letterSpacing: '0.045em',
                lineHeight: 0.88,
                textTransform: 'uppercase',
                margin: '0 0 18px',
                textShadow: '0 3px 20px rgba(0,0,0,0.38)',
              }}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-travel-sans, 'Cabin', 'Josefin Sans', 'Helvetica Neue', Arial, sans-serif)",
                fontSize: 'clamp(10px, 1.03vw, 14px)',
                fontWeight: 500,
                letterSpacing: '0.13em',
                lineHeight: 1.45,
                textTransform: 'uppercase',
                margin: 0,
                textShadow: '0 2px 14px rgba(0,0,0,0.42)',
              }}
            >
              {heroSubtitle}
            </p>
            <Link href="/experiences" className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-white px-5 text-sm font-semibold text-[#24201d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden">
              Explore experiences
            </Link>
          </div>
        </div>
      </section>
      )}

      {homepageData?.sectionVisibility?.explore_trips !== false && exploreTrips.length > 0 && (
        <section className="bg-[#24201D] px-4 py-12 text-white sm:px-8 md:py-16" aria-labelledby="sample-trips-heading">
          <div className="mx-auto max-w-6xl">
            <h2 id="sample-trips-heading" className="mb-3 font-display text-4xl uppercase md:text-5xl">Explore Our Trips</h2>
            <p className="mb-7 max-w-xl text-[#EEE8E1]">
              Browse our sample itineraries for ideas for your own tailor-made trip to China.
            </p>
            <SampleTripCards trips={exploreTrips} />
          </div>
        </section>
      )}

      {/* Luxury Travel Experts Section */}
      {homepageData?.intro?.isVisible !== false && (
      <div className="bg-[#F5F3EF]">
        <LuxuryTravelExperts />
      </div>
      )}

      {/* Plan Your Trip Section */}
      {homepageData?.sectionVisibility?.plan_your_trip !== false && <PlanYourTrip />}

      {/* Way to Travel first-level categories */}
      <HomepageWayToTravel settings={homepageData?.wayToTravelSection} />

      {/* Discover China Carousel Section */}
      <CarouselSection />

      {/* Partner Logos Section */}
      <div style={{ marginTop: '48px' }}>
        <PartnerLogos />
      </div>

      {/* Why Into China Section */}
      {homepageData?.sectionVisibility?.why_us !== false && <WhyIntoChinaSection />}

      {/* Ready To Start CTA */}
      {homepageData?.sectionVisibility?.ready_to_start !== false && <ReadyToStart settings={homepageData?.cta} />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
