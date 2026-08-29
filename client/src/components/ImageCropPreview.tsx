import { useState } from "react";
import { Move, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type FitMode = "cover" | "contain";

type UsageSource = {
  label: string;
  url: string;
  table: string;
  column?: string;
};

type PreviewScene = {
  name: string;
  detail: string;
  aspectRatio: string;
  fit: FitMode;
};

const genericScenes: PreviewScene[] = [
  { name: "Hero", detail: "Generic full-width hero preview", aspectRatio: "16 / 7", fit: "cover" },
  { name: "Wide", detail: "Generic wide image preview", aspectRatio: "16 / 9", fit: "cover" },
  { name: "Card", detail: "Generic card thumbnail preview", aspectRatio: "4 / 3", fit: "cover" },
  { name: "Square", detail: "Generic square preview", aspectRatio: "1 / 1", fit: "cover" },
  { name: "Portrait", detail: "Generic portrait preview", aspectRatio: "3 / 4", fit: "cover" },
  { name: "Logo", detail: "Generic logo preview", aspectRatio: "5 / 2", fit: "contain" },
];

interface ImageCropPreviewProps {
  imageUrl: string;
  onClose: () => void;
  initialPosition?: string;
  onPositionChange?: (position: string) => void;
}

function parsePosition(position?: string) {
  const match = position?.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  return {
    x: match ? Number(match[1]) : 50,
    y: match ? Number(match[2]) : 50,
  };
}

function clampPosition(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sceneForUsage(usage: UsageSource): PreviewScene {
  const key = `${usage.table}.${usage.column ?? ""}`;
  if (usage.table === "homepage_sponsors" || key.includes("logo") || key.includes("logoUrls")) {
    return { name: usage.label, detail: "Sponsor logo container, contain fit", aspectRatio: "5 / 2", fit: "contain" };
  }
  if (key === "homepage_hero.backgroundImage") {
    return { name: usage.label, detail: "Homepage hero background", aspectRatio: "16 / 7", fit: "cover" };
  }
  if (key === "itineraries.bannerImage") {
    return { name: usage.label, detail: "Itinerary full-width banner", aspectRatio: "16 / 7", fit: "cover" };
  }
  if (key === "itineraries.coverImage") {
    return { name: usage.label, detail: "Itinerary card cover", aspectRatio: "4 / 3", fit: "cover" };
  }
  if (key === "itineraries.sections") {
    return { name: usage.label, detail: "Itinerary section/gallery image", aspectRatio: "16 / 9", fit: "cover" };
  }
  if (key === "cities.coverImage") {
    return { name: usage.label, detail: "City banner image", aspectRatio: "16 / 7", fit: "cover" };
  }
  if (usage.table === "cities") {
    return { name: usage.label, detail: "City page image block", aspectRatio: "4 / 3", fit: "cover" };
  }
  if (key === "experiences.gallery") {
    return { name: usage.label, detail: "Experience gallery image", aspectRatio: "16 / 9", fit: "cover" };
  }
  if (key === "experiences.recommendationImage" || key === "experiences.cityDisplayImage") {
    return { name: usage.label, detail: "Experience card image", aspectRatio: "4 / 3", fit: "cover" };
  }
  if (usage.table === "experience_details") {
    return { name: usage.label, detail: "Experience detail image", aspectRatio: "4 / 3", fit: "cover" };
  }
  if (key === "team_members.image") {
    return { name: usage.label, detail: "Team portrait image", aspectRatio: "3 / 4", fit: "cover" };
  }
  if (usage.table === "team_members") {
    return { name: usage.label, detail: "Team story image", aspectRatio: "16 / 9", fit: "cover" };
  }
  if (usage.table === "why_us_sections") {
    return { name: usage.label, detail: "Why Us section image", aspectRatio: "16 / 9", fit: "cover" };
  }
  if (usage.table === "stories" || usage.table === "homepage_stories" || usage.table === "videos") {
    return { name: usage.label, detail: "Story/video card image", aspectRatio: "4 / 3", fit: "cover" };
  }
  return { name: usage.label, detail: usage.column ? `${usage.table}.${usage.column}` : usage.table, aspectRatio: "16 / 9", fit: "cover" };
}

function ScenePreview({
  imageUrl,
  scene,
  objectPosition,
  marker,
  onPointer,
}: {
  imageUrl: string;
  scene: PreviewScene;
  objectPosition: string;
  marker: { x: number; y: number };
  onPointer: (event: React.PointerEvent<HTMLDivElement>, fit: FitMode) => void;
}) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1a1a" }}>{scene.name}</div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{scene.detail}</div>
      </div>
      <div
        onPointerDown={event => onPointer(event, scene.fit)}
        onPointerMove={event => { if (event.buttons === 1) onPointer(event, scene.fit); }}
        style={{
          width: "100%",
          aspectRatio: scene.aspectRatio,
          background: "#151515",
          overflow: "hidden",
          position: "relative",
          cursor: scene.fit === "cover" ? "crosshair" : "default",
        }}
      >
        <img
          src={imageUrl}
          alt={scene.name}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: scene.fit,
            objectPosition,
            display: "block",
            userSelect: "none",
          }}
        />
        {scene.fit === "cover" && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "33.333% 33.333%" }} />
        )}
        {scene.fit === "cover" && (
          <div
            style={{
              position: "absolute",
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: "translate(-50%, -50%)",
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#F5569B",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
              pointerEvents: "none",
            }}
          >
            <Move size={14} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImageCropPreview({
  imageUrl,
  onClose,
  initialPosition = "50% 50%",
  onPositionChange,
}: ImageCropPreviewProps) {
  const [position, setPosition] = useState(parsePosition(initialPosition));
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const { data: usages = [], isLoading } = trpc.media.getUsagePreview.useQuery({ url: imageUrl }, { enabled: !!imageUrl });
  const utils = trpc.useUtils();
  const updatePositionMutation = trpc.media.updateObjectPosition.useMutation({
    onSuccess: (result) => {
      setSaveState(result.saved ? "saved" : "error");
      utils.media.getObjectPositions.invalidate();
      utils.media.list.invalidate();
      utils.media.listByType.invalidate();
    },
    onError: () => setSaveState("error"),
  });

  const objectPosition = `${position.x}% ${position.y}%`;
  const usageScenes = (usages as UsageSource[]).map(sceneForUsage);
  const scenes = usageScenes.length > 0 ? usageScenes : genericScenes;

  const updatePosition = (x: number, y: number) => {
    const next = { x: clampPosition(x), y: clampPosition(y) };
    setPosition(next);
    setSaveState("idle");
    onPositionChange?.(`${next.x}% ${next.y}%`);
  };

  const savePosition = async () => {
    setSaveState("idle");
    try {
      await updatePositionMutation.mutateAsync({ url: imageUrl, objectPosition });
    } catch {
      setSaveState("error");
    }
  };

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>, fit: FitMode) => {
    if (fit !== "cover") return;
    const rect = event.currentTarget.getBoundingClientRect();
    updatePosition(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px",
      }}
    >
      <div
        onClick={event => event.stopPropagation()}
        style={{
          width: "min(1100px, 94vw)",
          maxHeight: "92vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 18px 60px rgba(0,0,0,0.28)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #eee" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a" }}>Usage Preview</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {isLoading ? "Checking where this image is used..." : usageScenes.length > 0 ? `Showing ${usageScenes.length} current usage preview${usageScenes.length === 1 ? "" : "s"}.` : "No current usage found; showing generic preview ratios."}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            style={{ width: 32, height: 32, border: "1px solid #e5e5e5", background: "#fff", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px 22px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {scenes.map((scene, index) => (
              <ScenePreview
                key={`${scene.name}-${scene.detail}-${index}`}
                imageUrl={imageUrl}
                scene={scene}
                objectPosition={objectPosition}
                marker={position}
                onPointer={handlePointer}
              />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              Preview object-position: <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{objectPosition}</span>
            </div>
            <button
              onClick={savePosition}
              disabled={updatePositionMutation.isPending}
              style={{ padding: "8px 13px", border: "1px solid #F5569B", background: "#F5569B", color: "#fff", borderRadius: 6, fontSize: 12, cursor: updatePositionMutation.isPending ? "not-allowed" : "pointer" }}
            >
              {updatePositionMutation.isPending ? "Saving..." : saveState === "saved" ? "Applied" : "Apply crop"}
            </button>
            <button
              onClick={() => updatePosition(50, 50)}
              style={{ padding: "8px 13px", border: "1px solid #ddd", background: "#fff", color: "#555", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
            >
              Reset center
            </button>
          </div>
          {saveState === "error" && (
            <div style={{ fontSize: 12, color: "#d33", marginTop: 8 }}>
              Could not save this display position. Please try again after the image finishes loading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
