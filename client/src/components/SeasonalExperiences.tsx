import React, { useRef, useState } from 'react';

interface Experience {
  id: number;
  image: string;
  label: string;
  title: string;
  description: string;
}

const experiences: Experience[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
    label: 'WINTER SUN',
    title: 'Chasing Sunlight',
    description: 'Discover a curated collection of winter sun retreats with Aman.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop',
    label: 'WINTER ADVENTURES',
    title: 'In the Mountains',
    description: 'At Aman destinations in France and Italy, the winter season welcomes ski adventures.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=800&fit=crop',
    label: 'CITY ESCAPES',
    title: 'In the City',
    description: 'The gilded city skyline cultural discovery at every turn.'
  }
];

export default function SeasonalExperiences() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <section className="w-full bg-[#F5F3EF] py-16 md:py-24">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-normal text-black mb-6">
            Seasonal Experiences
          </h2>
          <p className="text-base leading-relaxed text-gray-700 font-light max-w-2xl">
            Across the Aman world, discover new and noteworthy experiences that provide an authentic connection to the soul of a place.
          </p>
        </div>

        {/* Carousel Section - Draggable */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ scrollBehavior: 'smooth', userSelect: 'none' }}
          >
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="flex-shrink-0 w-80 group cursor-pointer select-none pointer-events-none"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-lg bg-black mb-6" style={{ aspectRatio: '1 / 1' }}>
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-light mb-3">
                    {exp.label}
                  </p>
                  <h3 className="font-body text-2xl font-bold text-black mb-3">
                    {exp.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700 font-light">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
