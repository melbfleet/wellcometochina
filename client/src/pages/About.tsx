import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import WhatWeDoAndPursuitOfFeeling from '@/components/WhatWeDoAndPursuitOfFeeling';
import OurGuideToLuxuryTravel from '@/components/OurGuideToLuxuryTravel';

/**
 * About Page
 * Design: What We Do, Pursuit of Feeling, Our Guide to Luxury Travel
 */

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* What We Do and Pursuit of Feeling */}
      <WhatWeDoAndPursuitOfFeeling />

      {/* Our Guide to Luxury Travel */}
      <OurGuideToLuxuryTravel />

      <Footer />
    </div>
  );
}
