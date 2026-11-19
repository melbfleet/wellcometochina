import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import ReadyToStart from '@/components/ReadyToStart';
import { useMediaObjectPosition } from '@/lib/media-position';
import { toRouteSlug } from '@/lib/slug';
import { trpc } from '@/lib/trpc';

function firstGalleryImage(value: string | null): string | undefined {
  try {
    const gallery: unknown = JSON.parse(value || '[]');
    return Array.isArray(gallery)
      ? gallery.find((image): image is string => typeof image === 'string' && image.length > 0)
      : undefined;
  } catch {
    return undefined;
  }
}

export default function Experiences() {
  const { data = [], isPending, isError, refetch } = trpc.cms.listExperienceTypesWithNav.useQuery();
  const getObjectPosition = useMediaObjectPosition();
  const categories = data
    .map(category => ({
      ...category,
      slug: toRouteSlug(category.name),
      items: category.items.filter(item => item.name && item.slug),
    }))
    .filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#23211f]">
      <Navigation darkText />
      <main>
        <header className="mx-auto max-w-5xl px-6 pb-10 pt-28 text-center sm:pt-36">
          <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">Experiences</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#5b554f] sm:text-lg">
            Explore the things you can do on a tailor-made trip through China, from tea hills and village crafts to coastal walks and family days out.
          </p>
          {categories.length > 0 && (
            <nav aria-label="Experience categories" className="mt-8 flex flex-wrap justify-center gap-2.5">
              {categories.map(category => (
                <a key={category.id} href={`#${category.slug}`} className="rounded-full border border-[#d9d2c8] px-4 py-2 text-sm hover:border-[#24201d] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2">
                  {category.name}
                </a>
              ))}
            </nav>
          )}
        </header>

        <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 lg:px-12">
          {isPending ? (
            <p role="status" className="py-10 text-center text-[#5b554f]">Loading experiences…</p>
          ) : isError && categories.length === 0 ? (
            <div className="py-10 text-center">
              <p role="status">We couldn’t load the experiences.</p>
              <button type="button" onClick={() => void refetch()} className="mt-3 underline underline-offset-4">Try again</button>
            </div>
          ) : categories.length === 0 ? (
            <p className="py-10 text-center">Please <Link href="/make-an-enquiry" className="underline underline-offset-4">get in touch</Link> for current experiences.</p>
          ) : (
            categories.map(category => (
              <section key={category.id} id={category.slug} aria-labelledby={`${category.slug}-heading`} className="scroll-mt-20 border-t border-[#ddd7cf] py-8 sm:py-10">
                <h2 id={`${category.slug}-heading`} className="mb-5 font-display text-3xl uppercase tracking-wide sm:text-4xl">{category.name}</h2>
                <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {category.items.map(item => {
                    const image = item.cityDisplayImage || item.recommendationImage || firstGalleryImage(item.gallery);
                    return (
                      <li key={item.id}>
                        <Link href={`/experiences/${category.slug}/${item.slug}`} className="group block h-full border border-[#e1dcd4] bg-white text-[#23211f] hover:border-[#6a5b4e] focus-visible:outline-2 focus-visible:outline-offset-2">
                          {image && (
                            <div className="aspect-[4/3] overflow-hidden bg-[#ebe5dc]">
                              <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ objectPosition: getObjectPosition(image) }} />
                            </div>
                          )}
                          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
                            <h3 className="font-sans text-sm font-semibold leading-snug sm:text-base">{item.name}</h3>
                            <ArrowUpRight aria-hidden="true" size={17} className="shrink-0 text-[#63544a] group-hover:text-[#ad350f]" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
        <ReadyToStart settings={{ title: 'Plan your China trip', buttonText: 'Make an enquiry' }} />
      </main>
      <Footer />
    </div>
  );
}
