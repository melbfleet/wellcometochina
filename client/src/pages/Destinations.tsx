import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useMediaObjectPosition } from '@/lib/media-position';
import { trpc } from '@/lib/trpc';

export default function Destinations() {
  const { data: destinations = [], isLoading, isError } = trpc.cms.listCitiesWithExperiences.useQuery();
  const getObjectPosition = useMediaObjectPosition();

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F3EF]">
      <Navigation />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-28 sm:px-8 md:pt-36">
        <h1 className="mb-4 font-display text-4xl text-black md:text-5xl">Destinations</h1>
        <p className="mb-8 max-w-2xl text-lg text-[#58524D]">
          Explore our destinations across China and discover what to do in each one.
        </p>

        {isLoading && <p role="status">Loading destinations...</p>}
        {isError && <p role="status">We could not load the destinations. Please refresh to try again.</p>}
        {!isLoading && !isError && destinations.length === 0 && <p>No destinations are available right now.</p>}

        <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map(city => {
            const image = city.cityCardImage || city.coverImage;

            return (
              <li key={city.id} className="min-w-0">
                <Link
                  href={`/destinations/${city.slug}`}
                  className="group flex h-full flex-col overflow-hidden border border-black/10 bg-white text-[#191817] focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {image && (
                    <div className="aspect-[16/10] overflow-hidden bg-[#E5DFD5]">
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                        style={{ objectPosition: getObjectPosition(image) }}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 items-center justify-between gap-3 p-5">
                    <h2 className="font-display text-2xl leading-tight group-hover:underline">{city.name}</h2>
                    <ArrowRight size={20} className="shrink-0" aria-hidden="true" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>

      <section className="border-t border-black/10 px-4 py-12 text-center">
        <h2 className="mb-3 font-display text-3xl text-black">Ready to Explore?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-[#58524D]">
          Our travel designers can build an itinerary around the places you want to visit.
        </p>
        <Link href="/make-an-enquiry" className="inline-block bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white focus-visible:outline-2 focus-visible:outline-offset-4">
          Get in Touch
        </Link>
      </section>

      <Footer />
    </div>
  );
}
