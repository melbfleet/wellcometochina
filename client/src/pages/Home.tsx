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

  // 动态首页资产
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const getObjectPosition = useMediaObjectPosition();
  // 首页管理模块公开数据（hero/intro/stories/sponsors）
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();
  
  // Load published itineraries for Explore Our Trips.
  const { data: itineraries = [] } = trpc.cms.listItineraries.useQuery();
  
  const featuredTrips = itineraries.filter(trip => familySampleTripSlugs.has(trip.slug));
  const exploreTrips = [
    ...featuredTrips,
    ...itineraries.filter(trip => !familySampleTripSlugs.has(trip.slug)),
  ];
  const showExploreTrips = homepageData?.sectionVisibility?.explore_trips !== false && exploreTrips.length > 0;
  // 始终使用静态图片作为 fallback，只有 API 返回且有数据时才替换
  const FALLBACK_BANNER = '';
  const apiBanners = homepageAssets?.banners as Array<{ url: string; id: number }> | undefined;
  // 若 homepage_hero 有 backgroundImage，优先使用；否则回退到 media assets banners
  const heroBackgroundImages = normalizeHeroImages(homepageData?.hero?.backgroundImage);
  const activeBanners = heroBackgroundImages.length > 0
    ? heroBackgroundImages
    : (apiBanners && apiBanners.length > 0) ? apiBanners.map((b) => b.url) : [FALLBACK_BANNER];
  const heroTitle = homepageData?.hero?.title || 'Private, Tailor-Made Journeys Across China';
  const heroSubtitle = homepageData?.hero?.subtitle || 'Choose one of our multi-day itineraries, or have our local team design a private trip elsewhere in China around your group, interests and needs.';

  const [currentSlide, setCurrentSlide] = useState(0);
  const activeBanner = activeBanners[currentSlide % activeBanners.length];

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Homepage hero */}
      {homepageData?.hero?.isVisible !== false && (
      <section className="relative flex min-h-svh w-full flex-col overflow-hidden bg-[#24201D] md:block md:h-screen md:min-h-[32rem] md:bg-black">
        <div className="relative h-[clamp(13rem,48svh,23rem)] shrink-0 overflow-hidden md:absolute md:inset-0 md:h-full">
          {activeBanner && (
            <img
              src={activeBanner}
              alt=""
              fetchPriority="high"
              className="h-full w-full object-cover"
              style={{ objectPosition: getObjectPosition(activeBanner) }}
            />
          )}
          <div className="absolute inset-0 bg-black/10 md:bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#24201D] to-transparent md:hidden" />
        </div>

        <div className="relative z-30 flex grow items-center justify-center px-5 pb-8 pt-3 md:absolute md:inset-0 md:px-6 md:py-0 md:pt-[6vh]">
          <div style={{ width: 'min(980px, 92vw)', textAlign: 'center', color: '#fff' }}>
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
            <div className="mx-auto mt-4 grid w-full max-w-72 gap-2 text-left sm:mt-6 sm:max-w-[38rem] sm:grid-flow-col sm:auto-cols-fr sm:gap-3">
              {showExploreTrips && (
                <a
                  href="#sample-trips-heading"
                  className="group flex min-h-12 items-center justify-between gap-2 rounded-sm sm:min-h-16 sm:gap-3 border border-white bg-white px-3 py-1.5 sm:px-4 sm:py-2.5 text-[#24201D] hover:bg-[#F5F3EF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>
                    <span className="block text-sm font-semibold leading-tight sm:text-base">View Multi-Day Itineraries</span>
                    <span className="mt-0.5 block text-xs leading-tight sm:mt-1 sm:text-sm text-[#58524D]">
                      Explore our signature multi-day trip
                    </span>
                  </span>
                  <ArrowRight size={19} className="size-4 shrink-0 sm:size-[19px]" aria-hidden="true" />
                </a>
              )}
              <Link
                href="/make-an-enquiry?trip=tailor-made"
                className="group flex min-h-12 items-center justify-between gap-2 rounded-sm sm:min-h-16 sm:gap-3 border border-white/80 bg-[#24201D] px-3 py-1.5 sm:px-4 sm:py-2.5 text-white hover:bg-[#37302B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>
                  <span className="block text-sm font-semibold leading-tight sm:text-base">Enquire About a Private Trip</span>
                  <span className="mt-0.5 block text-xs leading-tight sm:mt-1 sm:text-sm text-[#EEE8E1]">Tailor-made trips to other cities</span>
                </span>
                <ArrowRight size={19} className="size-4 shrink-0 sm:size-[19px]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}

      {showExploreTrips && (
        <section className="bg-[#24201D] px-4 py-12 text-white sm:px-8 md:py-16" aria-labelledby="sample-trips-heading">
          <div className="mx-auto max-w-6xl">
            <h2 id="sample-trips-heading" tabIndex={-1} className="mb-3 scroll-mt-24 font-display text-4xl uppercase md:text-5xl">Explore Our Trips</h2>
            <p className="mb-7 max-w-xl text-[#EEE8E1]">
              Explore our planned multi-day routes for a clear idea of what each trip includes. Our local team can adjust a route for you or design a private itinerary for another destination.
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
