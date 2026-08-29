import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';

/**
 * Experiences Page
 * Design: Showcase curated luxury experiences
 */

interface Experience {
  id: number;
  title: string;
  category: string;
  description: string;
  details: string[];
  image: string;
}

const experiences: Experience[] = [
  {
    id: 1,
    title: 'Luxury Culinary Journey',
    category: 'Gastronomy',
    description: 'Embark on a gastronomic adventure through China\'s diverse regional cuisines. From Michelin-starred restaurants in Shanghai to intimate cooking classes with master chefs in traditional villages, discover the art and soul of Chinese cuisine.',
    details: [
      'Private chef experiences in luxury hotels',
      'Regional cooking classes with local experts',
      'Visits to renowned food markets and farms',
      'Wine and tea pairing sessions',
      'Dinner in historic imperial kitchens',
    ],
    image: '',
  },
  {
    id: 2,
    title: 'Private Cultural Immersion',
    category: 'Culture',
    description: 'Engage deeply with China\'s rich heritage through exclusive access to artisans, scholars, and cultural guardians. Learn traditional crafts, participate in ancient ceremonies, and gain insights into the philosophies that shaped Chinese civilization.',
    details: [
      'Private meetings with calligraphy masters',
      'Traditional ink painting workshops',
      'Martial arts training with Shaolin monks',
      'Visits to artisan workshops',
      'Exclusive museum tours with expert historians',
    ],
    image: '',
  },
  {
    id: 3,
    title: 'Wellness & Spiritual Retreat',
    category: 'Wellness',
    description: 'Rejuvenate your mind, body, and spirit at China\'s most exclusive wellness destinations. Experience ancient healing practices, luxury spa treatments, and mindfulness sessions in serene natural settings.',
    details: [
      'Traditional Chinese medicine consultations',
      'Luxury spa and wellness treatments',
      'Tai Chi and Qigong training',
      'Meditation and mindfulness retreats',
      'Yoga sessions in mountain temples',
    ],
    image: '',
  },
  {
    id: 4,
    title: 'Adventure & Nature Exploration',
    category: 'Adventure',
    description: 'Discover China\'s breathtaking natural landscapes through carefully curated outdoor adventures. From mountain trekking to river expeditions, experience nature\'s grandeur with expert guides and luxury accommodations.',
    details: [
      'Private mountain trekking expeditions',
      'Scenic river cruises and bamboo rafting',
      'Photography tours in iconic landscapes',
      'Wildlife observation in nature reserves',
      'Luxury glamping in remote locations',
    ],
    image: '',
  },
];

export default function Experiences() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full h-96 mt-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(''), url('')`
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl font-normal mb-4 tracking-tight">
            Experiences
          </h1>
          <p className="font-sans text-lg md:text-xl max-w-2xl opacity-90">
            Curated luxury activities and cultural immersions
          </p>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="section-padding bg-black">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {experiences.map((exp) => (
              <article key={exp.id} className="group">
                <div className="relative h-80 overflow-hidden rounded-lg mb-6">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-sans text-xs tracking-widest text-primary uppercase mb-2">
                  {exp.category}
                </p>
                <h3 className="font-heading-md text-foreground mb-4 group-hover:text-primary transition-colors">
                  {exp.title}
                </h3>
                <p className="font-body text-foreground/70 mb-6">
                  {exp.description}
                </p>
                <button className="btn-luxury inline-flex items-center gap-2">
                  Learn More
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>

          {/* Divider */}
          <div className="divider-gold my-12"></div>

          {/* Detailed Experiences */}
          <div className="space-y-16">
            {experiences.map((exp, idx) => (
              <div key={exp.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                    <h2 className="font-heading-lg text-foreground mb-6">{exp.title}</h2>
                    <p className="font-body text-foreground/80 mb-8">{exp.description}</p>
                    <div className="space-y-3 mb-8">
                      {exp.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-primary font-bold mt-1">✓</span>
                          <p className="font-body text-foreground/70">{detail}</p>
                        </div>
                      ))}
                    </div>
                    <button className="btn-luxury-solid">
                      Customize This Experience
                    </button>
                  </div>
                  <div className={`relative h-96 overflow-hidden rounded-lg ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {idx < experiences.length - 1 && (
                  <div className="divider-gold my-12"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-[#F5F3EF] text-black">
        <div className="container text-center">
          <h2 className="font-display text-black mb-6">Create Your Perfect Experience</h2>
          <p className="font-body text-black/80 mb-12 max-w-2xl mx-auto">
            Our team will work with you to design a bespoke itinerary that matches your interests and preferences.
          </p>
          <button className="px-8 py-4 border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-sans tracking-widest uppercase text-sm">
            Start Planning
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
