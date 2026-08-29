import React from 'react';

/**
 * Our Guide to Luxury Travel Section
 * Design: Third content block matching What We Do and Pursuit of Feeling
 * Part 1: Left text, right image (1354×900px)
 * Features: Unified container, responsive layout, consistent styling
 */

export default function OurGuideToLuxuryTravel() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden">
      {/* Container with max-width and padding */}
      <div className="container max-w-7xl mx-auto px-4 py-0">
        {/* Our Guide to Luxury Travel Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-2xl md:text-3xl text-black mb-6 leading-tight uppercase tracking-wider font-semibold">
              Our Guide to<br />Luxury Travel
            </h2>

            <div className="text-sm md:text-base text-gray-700 leading-relaxed font-sans mb-8 space-y-4">
              <p>
                We create bespoke luxury vacations for those who seek more than just beauty.
              </p>

              <p>
                Every journey is shaped around you. Our advisors design with insight and emotional intelligence, blending exceptional places with seamless planning. This is travel with intention—thoughtfully planned, impeccably delivered, and designed to stay with you forever.
              </p>
            </div>

            <div>
              <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-[#F5F3EF] hover:text-black transition-all duration-300 active:scale-95 active:shadow-lg">
                Continue Reading
              </button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1354&h=900&fit=crop"
              alt="Luxury travel experience - scenic destination"
              className="w-full max-w-[1354px] h-auto object-cover"
              style={{ aspectRatio: '1354/900' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
