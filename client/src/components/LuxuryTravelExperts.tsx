/**
 * Luxury Travel Experts Section
 * Design: Customer testimonials carousel with responsive layout
 * Features: Single testimonial on mobile, 4-column carousel on desktop with pagination
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function LuxuryTravelExperts() {
  const { data: homepageData } = trpc.homepage.getPublicData.useQuery();
  const { data: homepageAssets } = trpc.media.getHomepageAssets.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const pageTexture = (homepageAssets as any)?.pageBg?.url || '';
  const pageTextureOpacity = Math.max(0, Math.min(1, Number((homepageAssets as any)?.pageBg?.opacity ?? 28) / 100));

  const testimonials = [
    {
      id: 1,
      quote: "The attention to detail was extraordinary. Every moment felt carefully curated just for us.",
      author: "Sarah & Michael",
      location: "Guilin",
    },
    {
      id: 2,
      quote: "From the moment we arrived, we felt like locals. The cultural immersion was absolutely unforgettable.",
      author: "Jennifer",
      location: "Beijing",
    },
    {
      id: 3,
      quote: "Our family had the most magical experience. The guides were knowledgeable and genuinely passionate about sharing China.",
      author: "David & Family",
      location: "Xi'an",
    },
    {
      id: 4,
      quote: "This wasn't just a trip—it was a transformation. We returned home with a completely new perspective on travel.",
      author: "Emma",
      location: "Yunnan",
    },
    {
      id: 5,
      quote: "Every detail was perfectly planned. We felt like VIPs throughout the entire journey.",
      author: "Michael & Lisa",
      location: "Hangzhou",
    },
    {
      id: 6,
      quote: "The local insights and connections made all the difference. A truly authentic experience.",
      author: "Robert",
      location: "Chengdu",
    },
    {
      id: 7,
      quote: "Exceeded all expectations. The guides were not just knowledgeable but genuinely passionate.",
      author: "Catherine & James",
      location: "Suzhou",
    },
    {
      id: 8,
      quote: "An unforgettable adventure that changed how we see travel. Highly recommended!",
      author: "Patricia",
      location: "Yangshuo",
    },
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);
  const visibleTestimonials = testimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - itemsPerPage + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + itemsPerPage) % testimonials.length);
  };

  return (
    <section className="w-full bg-[#F5F3EF] relative overflow-hidden" style={{ paddingTop: 'clamp(50px, 5vw, 64px)', paddingBottom: 'clamp(50px, 5vw, 64px)', backgroundColor: '#ffffff' }}>
      {pageTexture && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${pageTexture})`,
            backgroundSize: '420px 420px',
            backgroundRepeat: 'repeat',
            opacity: pageTextureOpacity,
            mixBlendMode: 'normal',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {/* Left Wave Decoration */}
      <div className="absolute left-0 top-0 bottom-0 w-48 pointer-events-none hidden md:flex items-center justify-start overflow-hidden" style={{ zIndex: 1 }}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 800" 
          preserveAspectRatio="none"
          style={{ opacity: 0.15 }}
        >
          <path d="M 150 0 Q 100 50 120 150 T 100 300 T 120 450 T 100 600 T 140 800" stroke="#9ca3af" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 170 20 Q 120 70 140 170 T 120 320 T 140 470 T 120 620 T 160 800" stroke="#d1d5db" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 130 40 Q 80 90 100 190 T 80 340 T 100 490 T 80 640 T 120 800" stroke="#e5e7eb" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 100 60 Q 50 110 70 210 T 50 360 T 70 510 T 50 660 T 100 800" stroke="#f3f4f6" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right Wave Decoration */}
      <div className="absolute right-0 top-0 bottom-0 w-48 pointer-events-none hidden md:flex items-center justify-end overflow-hidden" style={{ zIndex: 1 }}>
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 800" 
          preserveAspectRatio="none"
          style={{ opacity: 0.15, transform: 'scaleX(-1)' }}
        >
          <path d="M 150 0 Q 100 50 120 150 T 100 300 T 120 450 T 100 600 T 120 800" stroke="#9ca3af" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 170 20 Q 120 70 140 170 T 120 320 T 140 470 T 120 620 T 140 800" stroke="#d1d5db" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 130 40 Q 80 90 100 190 T 80 340 T 100 490 T 80 640 T 100 800" stroke="#e5e7eb" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 100 60 Q 50 110 70 210 T 50 360 T 70 510 T 50 660 T 70 800" stroke="#f3f4f6" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative" style={{ zIndex: 2 }}>
        {/* Title and Description - DB driven, fallback to static */}
        {(!homepageData?.intro || homepageData.intro.isVisible !== false) && (
        <div className="text-center mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 uppercase tracking-wider" style={{ color: 'black', fontSize: '16px', fontFamily: 'Helvetica Neue Bold', fontWeight: '500' }}>
            {homepageData?.intro?.title || 'Wayseek中国之旅'}
          </h2>
          {homepageData?.intro?.content ? (
            <div className="text-sm md:text-base max-w-4xl mx-auto leading-relaxed mb-8" style={{ color: 'rgb(82, 87, 92)', fontFamily: 'Brandon Grotesque, sans-serif', whiteSpace: 'pre-line' }}>
              {homepageData.intro.content}
            </div>
          ) : (
            <>
              <p className="text-sm md:text-base max-w-4xl mx-auto leading-relaxed mb-4" style={{ color: 'rgb(82, 87, 92)', fontFamily: 'Brandon Grotesque, sans-serif' }}>
                China is vast, full of wonders. But information engulfs us. See this, do that, don't miss this. It seems that the more choices there are, the more overwhelmed we feel. What's more, you're rarely asked how you want to feel.
              </p>
              <p className="text-sm md:text-base max-w-4xl mx-auto leading-relaxed mb-4" style={{ color: 'rgb(82, 87, 92)', fontFamily: 'Brandon Grotesque, sans-serif' }}>
                That's not us. WaySeek is a tailor-made immersive travel company that designs fully personalised itineraries.
              </p>
              <p className="text-sm md:text-base max-w-4xl mx-auto leading-relaxed mb-4" style={{ color: 'rgb(82, 87, 92)', fontFamily: 'Brandon Grotesque, sans-serif' }}>
                For the past five years, we've been exploring China through its people, culture, landscapes, and everyday life — searching for experiences that feel genuine, personal, and deeply connected to the place itself. No rushed tours. No generic itineraries. Just a deeper, more personal way to travel through China.
              </p>
              <p className="text-sm md:text-base max-w-4xl mx-auto leading-relaxed mb-8" style={{ color: 'rgb(82, 87, 92)', fontFamily: 'Brandon Grotesque, sans-serif' }}>
                So let's begin. Let's do something remarkable.
              </p>
            </>
          )}
          <a href="/make-an-enquiry" className="inline-block px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-white hover:text-black transition-all duration-300 active:scale-95">
            Get In Touch
          </a>
        </div>
        )}

        {/* Desktop: 4-column carousel with pagination */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-6 mb-12">
            {visibleTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="text-center space-y-4">
                {/* Quote mark */}
                <div className="text-4xl text-teal-600 leading-none">"</div>
                
                {/* Quote text */}
                <p className="text-sm leading-relaxed text-gray-800 font-medium">
                  {testimonial.quote}
                </p>
                
                {/* Author and location */}
                <div className="pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-teal-600 italic mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation and pagination */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>

            {/* Pagination dots */}
            <div className="flex gap-3">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx * itemsPerPage)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentPage ? 'bg-gray-800' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Next testimonials"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>
          </div>


        </div>

        {/* Mobile: Single testimonial */}
        <div className="md:hidden">
          <div className="text-center space-y-4 mb-8">
            {/* Quote mark */}
            <div className="text-4xl text-teal-600 leading-none">"</div>
            
            {/* Quote text */}
            <p className="text-sm leading-relaxed text-gray-800 font-medium">
              {testimonials[currentIndex % testimonials.length].quote}
            </p>
            
            {/* Author and location */}
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-900">
                {testimonials[currentIndex % testimonials.length].author}
              </p>
              <p className="text-xs text-teal-600 italic mt-1">
                {testimonials[currentIndex % testimonials.length].location}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>

            <span className="text-xs text-gray-600">
              {(currentIndex % testimonials.length) + 1} / {testimonials.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          </div>


        </div>
      </div>
    </section>
  );
}
