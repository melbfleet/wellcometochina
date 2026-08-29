import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMediaObjectPosition } from "@/lib/media-position";
import "@/pages/PlanYourTrip.css";

interface HomepageWayToTravelProps {
  settings?: {
    title?: string | null;
    subtitle?: string | null;
    isVisible?: boolean | null;
  } | null;
}

function firstGalleryImage(value: string | null | undefined): string {
  try {
    const gallery = JSON.parse(value || "[]");
    return Array.isArray(gallery) && typeof gallery[0] === "string" ? gallery[0] : "";
  } catch {
    return "";
  }
}

export default function HomepageWayToTravel({ settings }: HomepageWayToTravelProps) {
  const [, navigate] = useLocation();
  const getObjectPosition = useMediaObjectPosition();
  const { data: types = [] } = trpc.cms.listWayToTravelTypesWithNav.useQuery();

  if (settings?.isVisible === false || types.length === 0) return null;

  return (
    <section className="w-full" style={{ backgroundColor: "#f4f4f2", paddingTop: "54px", paddingBottom: "64px" }}>
      <div className="max-w-7xl mx-auto px-4">
        <h2
          className="text-center text-black"
          style={{
            fontFamily: "'Barlow Condensed', 'Arial Narrow', Impact, sans-serif",
            fontWeight: 700,
            fontSize: "35px",
            letterSpacing: "0.04em",
            lineHeight: 1,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {settings?.title || "Way to Travel"}
        </h2>

        {settings?.subtitle && (
          <p style={{ maxWidth: 620, margin: "16px auto 36px", textAlign: "center", fontFamily: "sans-serif", fontSize: 13, lineHeight: 1.6, letterSpacing: "0.04em", color: "#777" }}>
            {settings.subtitle}
          </p>
        )}

        <div className="way-to-travel-home-grid">
          {types.map(type => {
            const firstItem = type.items[0];
            const image = type.coverImage || firstItem?.recommendationImage || firstGalleryImage(firstItem?.gallery);
            return (
              <button
                key={type.id}
                type="button"
                className="relative overflow-hidden group"
                onClick={() => navigate(`/ways-to-travel#${type.slug}`)}
                style={{ padding: 0, border: 0, background: "#dedede", cursor: "pointer", textAlign: "inherit" }}
              >
                {image && (
                  <img
                    src={image}
                    alt={type.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: getObjectPosition(image) }}
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <h3
                    className="text-white text-center"
                    style={{
                      fontFamily: "var(--font-travel-condensed, 'League Gothic', 'Arial Narrow', Impact, sans-serif)",
                      fontSize: "clamp(25px, 2.4vw, 34px)",
                      fontWeight: 400,
                      letterSpacing: "0.06em",
                      lineHeight: 0.95,
                      textTransform: "uppercase",
                      maxWidth: "92%",
                      margin: 0,
                      textShadow: "0 2px 12px rgba(0,0,0,0.35)",
                    }}
                  >
                    {type.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => navigate("/ways-to-travel")}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1)"; }}
            style={{
              padding: "12px 32px", background: "#000", color: "#fff",
              fontSize: 13, fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase",
              border: "2px solid #000", borderRadius: 4, cursor: "pointer",
              transition: "background 0.3s, color 0.3s, transform 0.1s",
            }}
          >
            View More
          </button>
        </div>
      </div>
    </section>
  );
}
