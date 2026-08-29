import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ReadyToStart from "@/components/ReadyToStart";
import { trpc } from "@/lib/trpc";
import { useMediaObjectPosition } from "@/lib/media-position";
import "./WaysToTravel.css";

const CATEGORY_COPY: Record<string, { eyebrow: string }> = {
  "family-educational-travel": {
    eyebrow: "Featured Collection",
  },
  "business-concierge": {
    eyebrow: "Business Access",
  },
  "culture-heritage-experiences": {
    eyebrow: "Curated Experiences",
  },
  "wellness-medical-travel": {
    eyebrow: "Restorative Journeys",
  },
};

function firstGalleryImage(value: string | null | undefined): string {
  try {
    const gallery = JSON.parse(value || "[]");
    return Array.isArray(gallery) && typeof gallery[0] === "string" ? gallery[0] : "";
  } catch {
    return "";
  }
}

function getItemImage(item: { gallery?: string | null; recommendationImage?: string | null } | undefined): string {
  if (!item) return "";
  return item.recommendationImage || firstGalleryImage(item.gallery);
}

export default function WaysToTravel() {
  const { data: types = [], isLoading } = trpc.cms.listWayToTravelTypesWithNav.useQuery();
  const getObjectPosition = useMediaObjectPosition();
  const [activeItemByType, setActiveItemByType] = useState<Record<number, number>>({});

  useEffect(() => {
    if (types.length === 0 || !window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => window.scrollBy({ top: -70, behavior: "smooth" }), 250);
    });
  }, [types]);

  return (
    <div className="wtt-page">
      <Navigation darkText />
      <main>
        <header className="wtt-intro">
          <h1>Ways to Travel</h1>
          <p className="wtt-lead">
            Discover China through curated experiences, cultural immersion, business access and restorative journeys.
          </p>
        </header>

        {isLoading ? (
          <div className="wtt-loading">Loading ways to travel...</div>
        ) : types.length === 0 ? (
          <div className="wtt-loading">New ways to travel are coming soon.</div>
        ) : (
          <>
            <section className="wtt-directory" aria-label="Ways to Travel categories">
              {types.map(type => {
                const image = type.coverImage || getItemImage(type.items[0]);
                return (
                  <article key={type.id} className="wtt-directory-card">
                    {image && <img src={image} alt={type.name} style={{ objectPosition: getObjectPosition(image) }} />}
                    <div className="wtt-directory-shade" />
                    <div className="wtt-directory-content">
                      <h2>{type.name}</h2>
                      <nav aria-label={`${type.name} pages`}>
                        {type.items.map(item => (
                          <Link key={item.id} href={`/ways-to-travel/${type.slug}/${item.slug}`}>
                            <span>{item.name}</span>
                            <ChevronRight size={14} aria-hidden="true" />
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="wtt-collections">
              {types.map((type, index) => {
                const copy = CATEGORY_COPY[type.slug];
                const activeItem = type.items.find(item => item.id === activeItemByType[type.id]) || type.items[0];
                const image = getItemImage(activeItem) || type.coverImage || getItemImage(type.items[0]);
                return (
                  <article id={type.slug} key={type.id} className={`wtt-collection${index % 2 === 1 ? " wtt-collection-reverse" : ""}`}>
                    <div className="wtt-collection-copy">
                      <p className="wtt-collection-kicker">{copy?.eyebrow || "Curated Collection"}</p>
                      <h2>{type.name}</h2>
                      <div className="wtt-link-list">
                        {type.items.map(item => (
                          <Link
                            key={item.id}
                            href={`/ways-to-travel/${type.slug}/${item.slug}`}
                            onMouseEnter={() => setActiveItemByType(current => ({ ...current, [type.id]: item.id }))}
                            onFocus={() => setActiveItemByType(current => ({ ...current, [type.id]: item.id }))}
                          >
                            <span>{item.name}</span>
                            <ChevronRight size={16} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="wtt-collection-image">
                      {image && (
                        <img
                          key={image}
                          src={image}
                          alt={activeItem?.name || type.name}
                          style={{ objectPosition: getObjectPosition(image) }}
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        <ReadyToStart />
      </main>
      <Footer />
    </div>
  );
}
