import React from 'react';

/**
 * What We Do and Why We Do It Section
 * Design: Left text (narrow), right image (wide), inspired by Black Tomato's layout
 * Features: Simplified copy, "Watch the Film" button (VIEW MORE style), responsive layout
 */

export default function WhatWeDoSection() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden">
      {/* Container with max-width and padding */}
      <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Grid layout: text on left (narrow), image on right (full right half) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content (1 column) */}
          <div className="flex flex-col justify-center">
            {/* Main Title - using same font as body */}
            <h2 className="font-sans text-2xl md:text-3xl text-black mb-6 leading-tight uppercase tracking-wider font-semibold">
              What We Do<br />and Why We Do It
            </h2>

            {/* Body Text - Regular */}
            <div className="text-sm md:text-base text-gray-700 leading-relaxed font-sans mb-8">
              <p>
                Since our founding in 2005, Into China Trip has always been about crafting remarkable, tailor made trips for clients around the world. Tom and James – our co-founders – know this better than anyone. You can meet them in our new video.
              </p>
            </div>

            {/* Watch the Film Button - same style as Get In Touch */}
            <div>
              <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded hover:bg-[#F5F3EF] hover:text-black hover:border hover:border-black transition-colors duration-300">
                Watch the Film
              </button>
            </div>
          </div>

          {/* Right: Image (1 column, fixed 800×450px) */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop"
              alt="Founders meeting - luxury travel experience"
              className="w-full max-w-[800px] h-auto object-cover"
              style={{ aspectRatio: '800/450' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
