import { useState } from 'react';
import { useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChinaMap from '@/components/ChinaMap';
import { toast } from 'sonner';

export default function DestinationsMap() {
  const [, setLocation] = useLocation();

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    // Map province IDs to detail page routes
    const provinceRoutes: { [key: string]: string } = {
      'sichuan': '/destinations/sichuan',
      // Add more provinces as detail pages are created
    };

    const route = provinceRoutes[provinceId.toLowerCase()];
    
    if (route) {
      setLocation(route);
    } else {
      toast.info(`Exploring ${provinceName}`, {
        description: 'Province detail page coming soon!',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navigation />

      {/* Map Section - Full Page with Background */}
      <section 
        className="flex-1 w-full pb-16 relative"
        style={{
          backgroundImage: ', ',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-normal text-white mb-6 pt-24">
              Explore Mainland China
            </h1>
            <p className="font-body text-lg text-white/70 max-w-2xl mx-auto">
              Click on any province to discover unique destinations, cultural experiences, and travel itineraries
            </p>
          </div>

          {/* Interactive Map */}
          <div className="max-w-6xl mx-auto">
            <ChinaMap onProvinceClick={handleProvinceClick} />
          </div>


        </div>
      </section>

      <Footer />
    </div>
  );
}
