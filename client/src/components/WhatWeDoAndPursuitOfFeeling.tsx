import React from 'react';

/**
 * What We Do and Why We Do It + Pursuit of Feeling Combined Section
 * Design: Two-part section with minimal spacing (8px) between them
 * Part 1: Left text, right image (1354×900px)
 * Part 2: Left image, right text (1354×900px)
 * Features: Unified container, responsive layout
 */

export default function WhatWeDoAndPursuitOfFeeling() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden">
      {/* Container with max-width and padding */}
      <div className="container max-w-7xl mx-auto px-4 py-0">
        {/* Part 1: What We Do and Why We Do It */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-2xl md:text-3xl text-black mb-6 leading-tight uppercase tracking-wider font-semibold">
              What We Do<br />and Why We Do It
            </h2>

            <div className="text-sm md:text-base text-gray-700 leading-relaxed font-sans mb-8">
              <p>
                Since our founding in 2005, Into China Trip has always been about crafting remarkable, tailor made trips for clients around the world. Tom and James – our co-founders – know this better than anyone. You can meet them in our new video.
              </p>
            </div>

            <div>
              <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-[#F5F3EF] hover:text-black transition-all duration-300 active:scale-95 active:shadow-lg">
                Watch the Film
              </button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1354&h=900&fit=crop"
              alt="Founders meeting - luxury travel experience"
              className="w-full max-w-[1354px] h-auto object-cover"
              style={{ aspectRatio: '1354/900' }}
            />
          </div>
        </div>

        {/* Minimal spacing between sections (8px = py-2) */}
        <div className="py-2"></div>

        {/* Part 2: Pursuit of Feeling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Image */}
          <div className="relative w-full h-full flex items-center justify-center order-2 md:order-1">
            <img
              src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=800&fit=crop"
              alt="Person experiencing emotional travel moment overlooking misty mountains"
              className="w-full max-w-[1354px] h-auto object-cover"
              style={{ aspectRatio: '1354/900' }}
            />
          </div>

          {/* Right: Text Content */}
          <div className="flex flex-col justify-center order-1 md:order-2">
            <h2 className="font-display text-2xl md:text-3xl text-black mb-6 leading-tight uppercase tracking-wider font-semibold">
              Pursuit of Feeling
            </h2>

            <div className="text-sm md:text-base text-gray-700 leading-relaxed font-sans mb-8 space-y-4">
              <p>
                Travel has always been about more than just going 'somewhere else'. For us, travel – breathless and beautiful – is about feeling somewhere else; a kind of emotional high that stays with you for the rest of your life.
              </p>
              <p>
                The Pursuit of Feeling – our brand-new collection of trips, features, and luxury travel experiences – bottles this soulful, sensual desire, taking us back to one of our founding philosophies:
              </p>
              <p className="italic font-medium">
                It's not where you want to go; it's how you want to feel.
              </p>
            </div>

            <div>
              <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-[#F5F3EF] hover:text-black transition-all duration-300 active:scale-95 active:shadow-lg">
                Find out More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
