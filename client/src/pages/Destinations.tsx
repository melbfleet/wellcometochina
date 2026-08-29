import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MapView } from '@/components/Map';
import { trpc } from '@/lib/trpc';

/**
 * Destinations Page
 * Design: White background with left content and right map (2/3 width)
 * Data: Dynamically loaded from backend API
 */

interface DestinationDetail {
  id: number;
  name: string;
  description: string;
  cityCardImage: string;
  lat: number;
  lng: number;
}

export default function Destinations() {
  const [selectedDestination, setSelectedDestination] = useState<DestinationDetail | null>(null);
  const [destinations, setDestinations] = useState<DestinationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cities with experiences from backend
  const { data: citiesData } = trpc.cms.listCitiesWithExperiences.useQuery();

  useEffect(() => {
    if (citiesData && citiesData.length > 0) {
      // Transform backend data to destination format
      const transformedDestinations: DestinationDetail[] = citiesData.map((city: any) => ({
        id: city.id,
        name: city.name,
        description: city.description || 'Discover the beauty and culture of this enchanting destination.',
        cityCardImage: city.cityCardImage || '',
        lat: city.latitude || 30.5728,
        lng: city.longitude || 114.3055,
      }));

      setDestinations(transformedDestinations);
      setSelectedDestination(transformedDestinations[0]);
      setIsLoading(false);
    }
  }, [citiesData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F3EF]">
        <Navigation />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading destinations...</p>
        </section>
        <Footer />
      </div>
    );
  }

  if (!selectedDestination) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F3EF]">
        <Navigation />
        <section className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No destinations available</p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EF]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full bg-[#F5F3EF] py-16 mt-20">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-normal text-black mb-4">
            Destinations
          </h1>
          <p className="font-sans text-lg text-gray-600 max-w-2xl">
            Discover China's most enchanting regions and iconic landmarks
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 bg-[#F5F3EF]">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Destination List */}
                <div>
                  <h2 className="font-display text-2xl font-normal text-black mb-6">
                    Select Destination
                  </h2>
                  <div className="space-y-3">
                    {destinations.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => setSelectedDestination(dest)}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                          selectedDestination.id === dest.id
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        <p className="font-display text-lg font-normal">
                          {dest.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Destination Details */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-display text-xl font-normal text-black mb-4">
                    {selectedDestination.name}
                  </h3>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed">
                    {selectedDestination.description}
                  </p>
                </div>

                {/* City Card Image */}
                {selectedDestination.cityCardImage && (
                  <div className="pt-6 border-t border-gray-200">
                    <img
                      src={selectedDestination.cityCardImage}
                      alt={selectedDestination.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Map - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="w-full h-96 lg:h-full min-h-[600px] rounded-lg overflow-hidden shadow-lg">
                <MapView
                  initialCenter={{
                    lat: selectedDestination.lat,
                    lng: selectedDestination.lng,
                  }}
                  initialZoom={10}
                  onMapReady={(map: google.maps.Map) => {
                    // Add marker for selected destination
                    if (window.google?.maps?.Marker) {
                      new window.google.maps.Marker({
                        position: {
                          lat: selectedDestination.lat,
                          lng: selectedDestination.lng,
                        },
                        map: map,
                        title: selectedDestination.name,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#F5F3EF] border-t border-gray-200 py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-normal text-black mb-6">
            Ready to Explore?
          </h2>
          <p className="font-sans text-gray-600 mb-8 max-w-2xl mx-auto">
            Our travel designers will craft a personalized itinerary combining your favorite destinations with exclusive experiences.
          </p>
          <button className="px-8 py-3 bg-black text-white text-sm font-normal tracking-wider uppercase rounded border-2 border-black hover:bg-[#F5F3EF] hover:text-black transition-all duration-300 active:scale-95 active:shadow-lg">
            Get in Touch
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
