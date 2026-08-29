import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '../lib/trpc';

interface Trip {
  id: string;
  nights: number;
  destination: string;
  title: string;
  description: string;
  price: string;
  image: string;
  slug?: string;
}

const defaultTrips: Trip[] = [
  {
    id: '1',
    nights: 12,
    destination: 'Sichuan',
    title: 'Ancient Wonders & Modern Marvels',
    description: 'Explore the mystical temples and natural beauty of Sichuan Province, from the Giant Panda sanctuaries to the breathtaking landscapes of Jiuzhaigou.',
    price: 'From £8,500 per person',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  },
  {
    id: '2',
    nights: 10,
    destination: 'Yunnan',
    title: 'Ethnic Cultures & Mountain Trails',
    description: 'Journey through Yunnan\'s diverse ethnic communities, ancient tea plantations, and stunning karst mountains in this immersive cultural adventure.',
    price: 'From £7,200 per person',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  },
  {
    id: '3',
    nights: 8,
    destination: 'Xi\'an',
    title: 'Imperial Legacy & Terracotta Treasures',
    description: 'Stand before the iconic Terracotta Army and explore the ancient capital\'s rich history, from the City Walls to the Pagodas of Buddhist temples.',
    price: 'From £6,800 per person',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  },
  {
    id: '4',
    nights: 9,
    destination: 'Hangzhou',
    title: 'West Lake Serenity & Silk Heritage',
    description: 'Experience the poetic beauty of West Lake, traditional tea plantations, and the vibrant culture of this enchanting city that inspired poets for centuries.',
    price: 'From £6,500 per person',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  },
  {
    id: '5',
    nights: 11,
    destination: 'Beijing',
    title: 'The Great Wall & Forbidden City',
    description: 'Walk along the iconic Great Wall, explore the grandeur of the Forbidden City, and immerse yourself in Beijing\'s blend of ancient tradition and modern energy.',
    price: 'From £7,500 per person',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  },
  {
    id: '6',
    nights: 7,
    destination: 'Guilin',
    title: 'Karst Mountains & River Cruises',
    description: 'Cruise along the Li River surrounded by dramatic karst peaks, visit traditional villages, and experience the timeless beauty that has inspired artists for generations.',
    price: 'From £5,800 per person',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  },
];

export default function ExploreOurTrips() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 3;
  
  // Fetch itineraries from backend
  const { data: itineraries, isLoading } = trpc.admin.listItineraries.useQuery();
  
  // Transform itineraries to Trip format
  const trips: Trip[] = (itineraries || []).map(itin => ({
    id: itin.id.toString(),
    nights: itin.days || 1,
    destination: itin.place || 'China',
    title: itin.name,
    description: itin.shortDescription || itin.description || '',
    price: itin.price || 'Contact for pricing',
    image: itin.coverImage || itin.bannerImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    slug: itin.slug,
  })).slice(0, 6); // Limit to 6 items

  const handlePrev = () => {
    if (trips.length <= itemsPerView) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (trips.length <= itemsPerView) return;
    setCurrentIndex((prev) => Math.min(Math.max(0, trips.length - itemsPerView), prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < Math.max(0, trips.length - itemsPerView);

  if (isLoading) {
    return (
      <section className="w-full py-16 md:py-24 relative overflow-hidden" style={{ minHeight: '700px', backgroundColor: '#0a0a0a' }}>
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="text-white">Loading trips...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full py-16 md:py-24 relative overflow-hidden"
      style={{
        minHeight: '700px',
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark frosted glass overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(10, 10, 10, 0.62)',
        }}
      />
      {/* Main container with full width */}
      <div className="w-full h-full relative flex items-center" style={{ zIndex: 1 }}>
        {/* Left Navigation Button - Fixed at left edge */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="absolute left-0 z-20 p-3 rounded-full transition-all duration-300"
          style={{
            backgroundColor: canGoPrev ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <ChevronLeft size={24} className="text-white" />
        </button>

        {/* Carousel Container */}
        <div className="w-full flex items-center justify-center px-0 flex-1">
          <div className="w-full relative overflow-hidden">
            <div
              ref={containerRef}
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / Math.max(1, trips.length))}%)`,
              }}
            >
              {trips.length > 0 ? trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex-shrink-0 w-full px-4 md:px-8"
                  style={{ minWidth: '100%' }}
                >
                  {/* Slide Container: Text + Cards as one unit */}
                  <div className="flex items-center justify-between max-w-7xl mx-auto gap-12">
                    {/* Left: Title and Description - 1/3 width */}
                    <div className="w-1/3 flex-shrink-0">
                      <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wider">
                        Explore Our Trips
                      </h2>
                      <p className="text-sm md:text-base text-white/80 italic leading-relaxed">
                        Remarkable experiences to inspire the mind
                      </p>
                    </div>

                    {/* Right: Cards carousel - 2/3 width */}
                    {trips.length > 0 && (
                    <div className="w-2/3 flex-shrink-0">
                      <div className="grid grid-cols-3 gap-6">
                        {trips.slice(currentIndex, currentIndex + itemsPerView).map((card) => (
                          <div
                            key={card.id}
                            className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                          >
                            {/* Card Image - 65% of card height */}
                            <div className="relative h-96 overflow-hidden">
                              <img
                                src={card.image}
                                alt={card.destination}
                                className="w-full h-full object-cover"
                              />
                              {/* Night badge */}
                              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold text-gray-800">
                                {card.nights} NIGHTS
                              </div>
                              {/* Destination badge */}
                              <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded text-xs font-bold text-gray-800">
                                {card.destination}
                              </div>
                            </div>

                            {/* Card Content - 35% of card height */}
                            <div className="flex-1 p-6 flex flex-col justify-between bg-white">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                  {card.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {card.description}
                                </p>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-900 mb-3">
                                  {card.price}
                                </p>
                                <a 
                                href={`/itinerary/${card.slug}`}
                                className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors duration-200 inline-block text-center"
                              >
                                EXPLORE TRIP
                              </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="w-full flex items-center justify-center text-white">
                  <p>No trips available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Navigation Button - Fixed at right edge */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="absolute right-0 z-20 p-3 rounded-full transition-all duration-300"
          style={{
            backgroundColor: canGoNext ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </section>
  );
}
