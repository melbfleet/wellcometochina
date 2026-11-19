import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useMediaObjectPosition } from '@/lib/media-position';

export const familySampleTripSlugs = new Set([
  'changzhou-family-discovery',
  'zhuhai-coast-villages-cantonese-flavours',
]);

interface SampleTrip {
  slug: string;
  name: string;
  place: string | null;
  howLong: string | null;
  shortDescription: string | null;
  coverImage: string | null;
  bannerImage: string | null;
}

export default function SampleTripCards({ trips }: { trips: SampleTrip[] }) {
  const getObjectPosition = useMediaObjectPosition();

  return (
    <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
      {trips.map(trip => {
        const image = trip.coverImage || trip.bannerImage;
        const tripDetails = [trip.place, trip.howLong].filter(Boolean).join(' · ');

        return (
          <li key={trip.slug} className="min-w-0">
            <Link
              href={`/itinerary/${trip.slug}`}
              className="group flex h-full flex-col overflow-hidden border border-black/10 bg-[#F5F3EF] text-[#191817] focus-visible:outline-2 focus-visible:outline-offset-4"
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
              <div className="flex flex-1 flex-col items-start gap-2 p-5 sm:p-6">
                {tripDetails && <p className="text-sm text-[#58524D]">{tripDetails}</p>}
                <h3 className="font-display text-2xl leading-tight">{trip.name}</h3>
                {trip.shortDescription && <p className="text-sm leading-relaxed text-[#58524D]">{trip.shortDescription}</p>}
                <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold group-hover:underline">
                  View itinerary <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
