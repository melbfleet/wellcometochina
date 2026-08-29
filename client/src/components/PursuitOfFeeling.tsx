import React from 'react';

/**
 * Pursuit of Feeling Section
 * Design: Left image (wide), right text (narrow), inspired by Black Tomato's layout
 * Features: Emotional travel philosophy, "Find out More" button, responsive layout
 */

export default function PursuitOfFeeling() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden">
      {/* Container with max-width and padding */}
      <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Grid layout: image on left (full left half), text on right (narrow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Image (1 column, fixed 800×450px) */}
          <div className="relative w-full h-full flex items-center justify-center order-2 md:order-1">
            <img
              src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=800&fit=crop"
              alt="Person experiencing emotional travel moment overlooking misty mountains"
              className="w-full max-w-[800px] h-auto object-cover"
              style={{ aspectRatio: '800/450' }}
            />
          </div>

          {/* Right: Text Content (1 column) */}
          <div className="flex flex-col justify-center order-1 md:order-2">
            {/* Main Title - using same font as body */}
            <h2 className="font-sans text-2xl md:text-3xl text-black mb-6 leading-tight uppercase tracking-wider font-semibold">
              Pursuit of Feeling
            </h2>

            {/* Body Text - Regular */}
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

            {/* Find out More Button - same style as Get In Touch */}
            <div>
              <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded hover:bg-[#F5F3EF] hover:text-black hover:border hover:border-black transition-colors duration-300">
                Find out More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
