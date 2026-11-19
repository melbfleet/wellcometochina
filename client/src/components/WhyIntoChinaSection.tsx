import { CalendarCheck, ClipboardList, MapPin, Route, Users } from 'lucide-react';

/**
 * Why Into China Section
 * Design: Five feature cards with icons, titles, and descriptions
 * Layout: Centered title with 5-column grid of feature cards
 * Features: Clean, minimal design with icon-based visual hierarchy
 */

const features = [
  {
    icon: MapPin,
    title: 'Local experiences',
    description: 'Meet traditional makers and explore the markets and neighbourhoods where local life happens.',
  },
  {
    icon: Route,
    title: 'Routes at your pace',
    description: 'Build in time for the places and activities you’re most interested in.',
  },
  {
    icon: Users,
    title: 'Family-friendly planning',
    description: 'Shape travel days and activities around your children’s ages.',
  },
  {
    icon: CalendarCheck,
    title: 'Specialist visit coordination',
    description: 'We request access for specialist visits and check availability for your dates.',
  },
  {
    icon: ClipboardList,
    title: 'Clear trip details',
    description: 'Review your itinerary, what’s included and any optional extras before you book.',
  },
];

export default function WhyIntoChinaSection() {
  return (
    <section className="relative bg-[#F5F3EF] overflow-hidden" style={{backgroundColor: '#fafafa'}}>
      <div className="container max-w-7xl mx-auto px-4" style={{paddingTop: '32px', paddingBottom: '32px'}}>
        {/* Section Title */}
        <div className="flex flex-col items-center justify-center" style={{marginBottom: '32px'}}>
          <h2 className="font-display text-3xl md:text-4xl text-black text-center uppercase font-semibold" style={{fontSize: '28px', fontFamily: 'Lato, sans-serif', letterSpacing: '0.05em'}}>
            WHY WELCOMETOCHINA?
          </h2>
          <div className="w-16 h-px bg-black mt-6"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-6 flex items-center justify-center">
                <Icon aria-hidden="true" size={36} color="#374151" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="font-sans mb-3 font-semibold tracking-wide" style={{color: '#666666', fontSize: '14px'}}>
                {title}
              </h3>
              <p className="max-w-[15rem] font-sans text-sm leading-relaxed text-[#52575c]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
