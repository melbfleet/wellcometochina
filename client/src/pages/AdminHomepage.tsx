import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";
import MultiImageUploader from "@/components/MultiImageUploader";
import AdminLayout from "@/components/AdminLayout";
import { prepareImageForUpload } from "@/lib/image-upload";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoStoryForm {
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

interface SponsorForm {
  name: string;
  logoUrls: string[];
  websiteUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

const emptyVideoStory: VideoStoryForm = { title: "", youtubeId: "", thumbnailUrl: "", isVisible: true, sortOrder: 0 };
const emptySponsor: SponsorForm = { name: "", logoUrls: [], websiteUrl: "", isVisible: true, sortOrder: 0 };

function extractYouTubeId(value: string) {
  const input = value.trim();
  if (!input) return "";
  const directId = input.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directId) return input;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }
  return input;
}

function normalizeLogoUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((url): url is string => typeof url === "string" && url.length > 0);
  }
  if (typeof value !== "string" || value.length === 0) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((url): url is string => typeof url === "string" && url.length > 0);
    }
  } catch {
    return [value];
  }

  return [];
}

function normalizeImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((url): url is string => typeof url === "string" && url.length > 0);
  }
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((url): url is string => typeof url === "string" && url.length > 0);
    }
  } catch {
    return [value];
  }
  return [];
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, visible, onToggle }: { title: string; visible: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <h2 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#1a1a1a", textTransform: "uppercase", margin: 0 }}>
        {title}
      </h2>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#666", fontFamily: "Lato, sans-serif" }}>
        <span>Show on homepage</span>
        <div
          onClick={onToggle}
          style={{
            width: 40, height: 22, borderRadius: 11, background: visible ? "#F5569B" : "#ccc",
            position: "relative", cursor: "pointer", transition: "background 0.2s",
          }}
        >
          <div style={{
            position: "absolute", top: 3, left: visible ? 21 : 3, width: 16, height: 16,
            borderRadius: "50%", background: "#fff", transition: "left 0.2s",
          }} />
        </div>
      </label>
    </div>
  );
}

type HomepageVisibilityKey = "plan_your_trip" | "explore_trips" | "why_us" | "ready_to_start";

function VisibilityOnlySection({
  title,
  description,
  visible,
  onToggle,
}: {
  title: string;
  description: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ ...cardStyle, marginBottom: 32 }}>
      <SectionHeader title={title} visible={visible} onToggle={onToggle} />
      <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: "-12px 0 0" }}>
        {description}
      </p>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 4,
  fontFamily: "Lato, sans-serif", fontSize: 14, color: "#1a1a1a", background: "#fff",
  outline: "none", boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", minHeight: 100,
};

const btnPrimary: React.CSSProperties = {
  background: "#F5569B", color: "#fff", border: "none", borderRadius: 4,
  padding: "9px 22px", fontFamily: "Lato, sans-serif", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  background: "transparent", color: "#1a1a1a", border: "1px solid #e0e0e0", borderRadius: 4,
  padding: "9px 22px", fontFamily: "Lato, sans-serif", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  background: "transparent", color: "#e53e3e", border: "1px solid #e53e3e", borderRadius: 4,
  padding: "7px 14px", fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid #f0f0f0", borderRadius: 8, padding: 20, marginBottom: 12,
};

// ─── Video Story Modal ────────────────────────────────────────────────────────
function VideoStoryModal({ initial, onSave, onClose }: {
  initial?: VideoStoryForm & { id?: number };
  onSave: (data: VideoStoryForm & { id?: number }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<VideoStoryForm>(initial ?? emptyVideoStory);
  const set = (k: keyof VideoStoryForm, v: any) => setForm(f => ({ ...f, [k]: v }));
  const parsedVideoId = extractYouTubeId(form.youtubeId);

  // Auto-derive YouTube thumbnail when youtubeId changes
  const youtubeThumbnail = parsedVideoId
    ? `https://img.youtube.com/vi/${parsedVideoId}/maxresdefault.jpg`
    : "";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24, color: "#1a1a1a" }}>
          {initial?.id ? "Edit Video Card" : "Add Video Card"}
        </h3>
        <Field label="Title (internal label)">
          <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Guilin Journey" />
        </Field>
        <Field label="YouTube Link or Video ID">
          <input
            style={inputStyle}
            value={form.youtubeId}
            onChange={e => set("youtubeId", e.target.value)}
            placeholder="Paste a YouTube link or 11-character video ID"
          />
          {parsedVideoId && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#888", fontFamily: "Lato, sans-serif", marginBottom: 6 }}>
                Auto-fetched cover: {parsedVideoId}
              </div>
              <img
                src={youtubeThumbnail}
                alt="YouTube thumbnail"
                style={{ width: "100%", maxWidth: 320, height: "auto", borderRadius: 4, border: "1px solid #eee" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${parsedVideoId}/hqdefault.jpg`;
                }}
              />
            </div>
          )}
        </Field>
        <Field label="Sort Order">
          <input style={inputStyle} type="number" value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </Field>
        <Field label="Visible">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isVisible} onChange={e => set("isVisible", e.target.checked)} />
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 13 }}>Show on homepage</span>
          </label>
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={() => { if (!form.title) return; onSave({ ...form, youtubeId: parsedVideoId, id: initial?.id }); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sponsor Modal ────────────────────────────────────────────────────────────
function SponsorModal({ initial, onSave, onClose }: { initial?: SponsorForm & { id?: number }; onSave: (data: SponsorForm & { id?: number }) => void; onClose: () => void }) {
  const [form, setForm] = useState<SponsorForm>(initial ?? emptySponsor);
  const set = (k: keyof SponsorForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: 480, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24, color: "#1a1a1a" }}>
          {initial?.id ? "Edit Sponsor Logo" : "Add Sponsor Logo"}
        </h3>
        <Field label="Logo Images">
          <MultiImageUploader value={form.logoUrls} onChange={v => set("logoUrls", v)} category="homepage" />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary} onClick={() => { if (form.logoUrls.length === 0) return; onSave({ ...form, id: initial?.id }); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminHomepage() {
  const [, navigate] = useLocation();
  // ── Hero ──────────────────────────────────────────────────────────────────
  const heroQuery = trpc.homepage.getHero.useQuery();
  const updateHero = trpc.homepage.updateHero.useMutation({ onSuccess: () => { heroQuery.refetch(); toast.success("Hero saved"); } });
  const [heroForm, setHeroForm] = useState<{ title: string; subtitle: string; backgroundImages: string[]; isVisible: boolean } | null>(null);

  const hero = heroQuery.data;
  const heroEdit = heroForm ?? { title: hero?.title ?? "", subtitle: hero?.subtitle ?? "", backgroundImages: normalizeImageUrls(hero?.backgroundImage), isVisible: hero?.isVisible ?? true };
  const setHero = (k: string, v: any) => setHeroForm(f => ({ ...(f ?? heroEdit), [k]: v }));

  // ── Intro ─────────────────────────────────────────────────────────────────
  const introQuery = trpc.homepage.getIntro.useQuery();
  const updateIntro = trpc.homepage.updateIntro.useMutation({ onSuccess: () => { introQuery.refetch(); toast.success("Intro saved"); } });
  const [introForm, setIntroForm] = useState<{ title: string; content: string; isVisible: boolean } | null>(null);

  const intro = introQuery.data;
  const introEdit = introForm ?? { title: intro?.title ?? "", content: intro?.content ?? "", isVisible: intro?.isVisible ?? true };
  const setIntro = (k: string, v: any) => setIntroForm(f => ({ ...(f ?? introEdit), [k]: v }));

  // ── Homepage Section Visibility ──────────────────────────────────────────
  const sectionVisibilityQuery = trpc.homepage.getSectionVisibility.useQuery();
  const updateSectionVisibility = trpc.homepage.updateSectionVisibility.useMutation({
    onSuccess: () => {
      sectionVisibilityQuery.refetch();
      toast.success("Section visibility updated");
    },
  });
  const sectionVisibility = sectionVisibilityQuery.data;
  const toggleSectionVisibility = (sectionKey: HomepageVisibilityKey) => {
    const isVisible = sectionVisibility?.[sectionKey] ?? true;
    updateSectionVisibility.mutate({ sectionKey, isVisible: !isVisible });
  };

  // ── Final CTA ────────────────────────────────────────────────────────────
  const ctaQuery = trpc.homepage.getCta.useQuery();
  const updateCta = trpc.homepage.updateCta.useMutation({
    onSuccess: () => {
      ctaQuery.refetch();
      setCtaForm(null);
      toast.success("CTA saved");
    },
    onError: error => toast.error(error.message || "Unable to save CTA"),
  });
  const [ctaForm, setCtaForm] = useState<{ title: string; buttonText: string } | null>(null);
  const cta = ctaQuery.data;
  const ctaEdit = ctaForm ?? {
    title: cta?.title ?? "So, ready to start?",
    buttonText: cta?.buttonText ?? "Get in Touch",
  };
  const setCta = (key: keyof typeof ctaEdit, value: string) => setCtaForm(form => ({ ...(form ?? ctaEdit), [key]: value }));

  // ── Way to Travel Homepage Section ───────────────────────────────────────
  const wayToTravelSectionQuery = trpc.homepage.getStorySection.useQuery({ sectionType: "way_to_travel" });
  const wayToTravelTypesQuery = trpc.admin.listWayToTravelTypes.useQuery();
  const updateWayToTravelSection = trpc.homepage.updateStorySection.useMutation({
    onSuccess: () => { wayToTravelSectionQuery.refetch(); toast.success("Way to Travel section saved"); },
  });
  const [wayToTravelSectionForm, setWayToTravelSectionForm] = useState<{ title: string; subtitle: string; isVisible: boolean } | null>(null);
  const wayToTravelSection = wayToTravelSectionQuery.data;
  const wayToTravelSectionEdit = wayToTravelSectionForm ?? {
    title: wayToTravelSection?.title ?? "Way to Travel",
    subtitle: wayToTravelSection?.subtitle ?? "Discover China through the way you want to travel.",
    isVisible: wayToTravelSection?.isVisible ?? true,
  };
  const setWayToTravelSection = (k: string, v: any) => setWayToTravelSectionForm(form => ({ ...(form ?? wayToTravelSectionEdit), [k]: v }));
  const wayToTravelTypes = wayToTravelTypesQuery.data ?? [];

  // ── Image Stories Section ─────────────────────────────────────────────────
  const imageSectionQuery = trpc.homepage.getStorySection.useQuery({ sectionType: "image" });
  const updateImageSection = trpc.homepage.updateStorySection.useMutation({ onSuccess: () => { imageSectionQuery.refetch(); toast.success("Image section saved"); } });
  const [imageSectionForm, setImageSectionForm] = useState<{ title: string; subtitle: string; isVisible: boolean } | null>(null);

  const imageSection = imageSectionQuery.data;
  const imageSectionEdit = imageSectionForm ?? { title: imageSection?.title ?? "Stories From the Road", subtitle: imageSection?.subtitle ?? "Real stories. Meaningful journeys.", isVisible: imageSection?.isVisible ?? true };
  const setImageSection = (k: string, v: any) => setImageSectionForm(f => ({ ...(f ?? imageSectionEdit), [k]: v }));

  const imageStoriesQuery = trpc.homepage.listStoriesByType.useQuery({ type: "image" });
  const createImageStory = trpc.homepage.createStory.useMutation({ onSuccess: () => { imageStoriesQuery.refetch(); } });
  const deleteImageStory = trpc.homepage.deleteStory.useMutation({ onSuccess: () => { imageStoriesQuery.refetch(); toast.success("Image deleted"); } });
  const uploadImageMutation = trpc.media.upload.useMutation();
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [imageDragOver, setImageDragOver] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);

  // Sponsor upload state
  const [sponsorUploading, setSponsorUploading] = useState(false);
  const [sponsorUploadProgress, setSponsorUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [sponsorDragOver, setSponsorDragOver] = useState(false);
  const sponsorFileRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setImageUploading(true);
    setImageUploadProgress({ current: 0, total: imageFiles.length });
    let addedCount = 0;
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setImageUploadProgress({ current: i + 1, total: imageFiles.length });
      try {
        const prepared = await prepareImageForUpload(file);
        const result = await uploadImageMutation.mutateAsync({
          filename: prepared.filename, base64: prepared.base64, mimeType: prepared.mimeType, fileSize: prepared.fileSize,
          source: "homepage", assetType: "general",
        });
        await createImageStory.mutateAsync({
          title: prepared.filename.replace(/\.[^.]+$/, ""),
          type: "image",
          thumbnailUrl: result.url,
          isVisible: true,
          sortOrder: 0,
        });
        addedCount++;
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      }
    }
    setImageUploading(false);
    setImageUploadProgress(null);
    if (imageFileRef.current) imageFileRef.current.value = "";
    if (addedCount > 0) toast.success(`${addedCount} image${addedCount > 1 ? "s" : ""} added`);
  };

  const handleSponsorFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setSponsorUploading(true);
    setSponsorUploadProgress({ current: 0, total: imageFiles.length });
    const logoUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setSponsorUploadProgress({ current: i + 1, total: imageFiles.length });
      try {
        const prepared = await prepareImageForUpload(file);
        const result = await uploadImageMutation.mutateAsync({
          filename: prepared.filename, base64: prepared.base64, mimeType: prepared.mimeType, fileSize: prepared.fileSize,
          source: "homepage", assetType: "general",
        });
        logoUrls.push(result.url);
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      }
    }
    if (logoUrls.length > 0) {
      try {
        await createSponsor.mutateAsync({
          name: `Sponsor ${Date.now()}`,
          logoUrls,
          websiteUrl: "",
          isVisible: true,
          sortOrder: 0,
        });
        toast.success(`${logoUrls.length} logo${logoUrls.length > 1 ? "s" : ""} added`);
      } catch (e: any) {
        toast.error(e.message || "Failed to save sponsor");
      }
    }
    setSponsorUploading(false);
    setSponsorUploadProgress(null);
    if (sponsorFileRef.current) sponsorFileRef.current.value = "";
  };

  // ── Video Stories Section ─────────────────────────────────────────────────
  const videoSectionQuery = trpc.homepage.getStorySection.useQuery({ sectionType: "video" });
  const updateVideoSection = trpc.homepage.updateStorySection.useMutation({ onSuccess: () => { videoSectionQuery.refetch(); toast.success("Video section saved"); } });
  const [videoSectionForm, setVideoSectionForm] = useState<{ title: string; subtitle: string; isVisible: boolean } | null>(null);

  const videoSection = videoSectionQuery.data;
  const videoSectionEdit = videoSectionForm ?? { title: videoSection?.title ?? "Stories From the Road", subtitle: videoSection?.subtitle ?? "Real stories. Meaningful journeys.", isVisible: videoSection?.isVisible ?? true };
  const setVideoSection = (k: string, v: any) => setVideoSectionForm(f => ({ ...(f ?? videoSectionEdit), [k]: v }));

  const videoStoriesQuery = trpc.homepage.listStoriesByType.useQuery({ type: "video" });
  const createVideoStory = trpc.homepage.createStory.useMutation({ onSuccess: () => { videoStoriesQuery.refetch(); setVideoStoryModal(null); toast.success("Video card added"); } });
  const updateVideoStory = trpc.homepage.updateStory.useMutation({ onSuccess: () => { videoStoriesQuery.refetch(); setVideoStoryModal(null); toast.success("Video card updated"); } });
  const deleteVideoStory = trpc.homepage.deleteStory.useMutation({ onSuccess: () => { videoStoriesQuery.refetch(); toast.success("Video card deleted"); } });
  const [videoStoryModal, setVideoStoryModal] = useState<(VideoStoryForm & { id?: number }) | null>(null);

  // ── Sponsors ──────────────────────────────────────────────────────────────
  const sponsorsQuery = trpc.homepage.listSponsors.useQuery();
  const createSponsor = trpc.homepage.createSponsor.useMutation({ onSuccess: () => { sponsorsQuery.refetch(); setSponsorModal(null); toast.success("Sponsor added"); } });
  const updateSponsor = trpc.homepage.updateSponsor.useMutation({ onSuccess: () => { sponsorsQuery.refetch(); setSponsorModal(null); toast.success("Sponsor updated"); } });
  const deleteSponsor = trpc.homepage.deleteSponsor.useMutation({ onSuccess: () => { sponsorsQuery.refetch(); toast.success("Sponsor deleted"); } });
  const [sponsorModal, setSponsorModal] = useState<(SponsorForm & { id?: number }) | null>(null);

  const imageStories = imageStoriesQuery.data ?? [];
  const videoStories = videoStoriesQuery.data ?? [];
  const sponsors = sponsorsQuery.data ?? [];
  const sponsorsVisible = sponsors.length > 0 ? sponsors.some(sp => sp.isVisible) : true;
  const toggleSponsorsVisibility = () => {
    const nextVisible = !sponsorsVisible;
    sponsors.forEach(sp => {
      updateSponsor.mutate({
        id: sp.id,
        name: sp.name,
        logoUrls: normalizeLogoUrls(sp.logoUrls),
        websiteUrl: sp.websiteUrl ?? undefined,
        isVisible: nextVisible,
        sortOrder: sp.sortOrder,
      });
    });
  };

  const handleVideoStorySave = (data: VideoStoryForm & { id?: number }) => {
    const youtubeId = extractYouTubeId(data.youtubeId);
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined;
    if (data.id) {
      updateVideoStory.mutate({ id: data.id, title: data.title, youtubeId: youtubeId || undefined, thumbnailUrl, isVisible: data.isVisible, sortOrder: data.sortOrder });
    } else {
      createVideoStory.mutate({ title: data.title, type: "video", youtubeId: youtubeId || undefined, thumbnailUrl, isVisible: data.isVisible, sortOrder: data.sortOrder });
    }
  };

  const handleSponsorSave = (data: SponsorForm & { id?: number }) => {
    if (data.id) {
      updateSponsor.mutate({ id: data.id, name: data.name, logoUrls: data.logoUrls, websiteUrl: data.websiteUrl || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    } else {
      createSponsor.mutate({ name: data.name, logoUrls: data.logoUrls, websiteUrl: data.websiteUrl || undefined, isVisible: data.isVisible, sortOrder: data.sortOrder });
    }
  };

  return (
    <AdminLayout title="Homepage Management">
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", fontFamily: "Lato, sans-serif" }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Hero Banner"
          visible={heroEdit.isVisible}
          onToggle={() => { setHero("isVisible", !heroEdit.isVisible); updateHero.mutate({ isVisible: !heroEdit.isVisible }); }}
        />
        <Field label="Background Images">
          <MultiImageUploader value={heroEdit.backgroundImages} onChange={v => setHero("backgroundImages", v)} category="homepage" label="" sortable />
        </Field>
        <Field label="Main Title">
          <input style={inputStyle} value={heroEdit.title} onChange={e => setHero("title", e.target.value)} placeholder="The Immersive China Experts" />
        </Field>
        <Field label="Subtitle / Description">
          <input style={inputStyle} value={heroEdit.subtitle} onChange={e => setHero("subtitle", e.target.value)} placeholder="Tailor-made experiences, crafted with local insight." />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnPrimary} onClick={() => updateHero.mutate({ title: heroEdit.title, subtitle: heroEdit.subtitle, backgroundImage: heroEdit.backgroundImages.length > 0 ? JSON.stringify(heroEdit.backgroundImages) : null, isVisible: heroEdit.isVisible })}>
            Save Hero
          </button>
        </div>
      </div>

      {/* ── Intro Section ───────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Introduction Section"
          visible={introEdit.isVisible}
          onToggle={() => { setIntro("isVisible", !introEdit.isVisible); updateIntro.mutate({ isVisible: !introEdit.isVisible }); }}
        />
        <Field label="Title">
          <input style={inputStyle} value={introEdit.title} onChange={e => setIntro("title", e.target.value)} placeholder="Section title" />
        </Field>
        <Field label="Content">
          <textarea style={textareaStyle} value={introEdit.content} onChange={e => setIntro("content", e.target.value)} placeholder="Introduction text..." />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button style={btnPrimary} onClick={() => updateIntro.mutate({ title: introEdit.title, content: introEdit.content, isVisible: introEdit.isVisible })}>
            Save Intro
          </button>
        </div>
      </div>

      {/* ── Start Your Journey ────────────────────────────────────────────── */}
      <VisibilityOnlySection
        title="Start Your Journey"
        description="Controls the destination and experience card grid shown below the introduction."
        visible={sectionVisibility?.plan_your_trip ?? true}
        onToggle={() => toggleSectionVisibility("plan_your_trip")}
      />

      {/* ── Way to Travel Homepage Section ────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Way to Travel Homepage Section"
          visible={wayToTravelSectionEdit.isVisible}
          onToggle={() => {
            const next = !wayToTravelSectionEdit.isVisible;
            setWayToTravelSection("isVisible", next);
            updateWayToTravelSection.mutate({
              sectionType: "way_to_travel",
              title: wayToTravelSectionEdit.title,
              subtitle: wayToTravelSectionEdit.subtitle,
              isVisible: next,
            });
          }}
        />
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: "-12px 0 20px" }}>
          Displays the first-level Way to Travel categories below Start Your Journey. Category images and order come from Way to Travel management.
        </p>
        <Field label="Section Title">
          <input style={inputStyle} value={wayToTravelSectionEdit.title} onChange={e => setWayToTravelSection("title", e.target.value)} placeholder="Way to Travel" />
        </Field>
        <Field label="Section Subtitle">
          <input style={inputStyle} value={wayToTravelSectionEdit.subtitle} onChange={e => setWayToTravelSection("subtitle", e.target.value)} placeholder="Discover China through the way you want to travel." />
        </Field>

        <div style={{ margin: "20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase" }}>
              First-level Categories
            </span>
            <button style={btnSecondary} onClick={() => navigate("/admin/ways-to-travel")}>Manage Categories</button>
          </div>
          {wayToTravelTypes.length === 0 ? (
            <div style={{ padding: "18px", border: "1px dashed #ddd", color: "#aaa", fontSize: 12, textAlign: "center" }}>No Way to Travel categories yet.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10 }}>
              {wayToTravelTypes.map(type => (
                <div key={type.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid #eee", background: "#fafafa", minWidth: 0 }}>
                  <div style={{ width: 58, height: 42, flexShrink: 0, background: "#e8e8e8", overflow: "hidden" }}>
                    {type.coverImage && <img src={type.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{type.name}</div>
                    <div style={{ fontSize: 10, color: "#999", marginTop: 3 }}>{(type as any).itemCount ?? 0} pages</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={btnPrimary}
            onClick={() => updateWayToTravelSection.mutate({
              sectionType: "way_to_travel",
              title: wayToTravelSectionEdit.title,
              subtitle: wayToTravelSectionEdit.subtitle,
              isVisible: wayToTravelSectionEdit.isVisible,
            })}
          >
            Save Section
          </button>
        </div>
      </div>

      {/* ── Explore Our Trips ─────────────────────────────────────────────── */}
      <VisibilityOnlySection
        title="Explore Our Trips"
        description="Controls the itinerary cards displayed in the Explore Our Trips section."
        visible={sectionVisibility?.explore_trips ?? true}
        onToggle={() => toggleSectionVisibility("explore_trips")}
      />

      {/* ── Section 1: Image Stories ─────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Section 1 — Image Stories"
          visible={imageSectionEdit.isVisible}
          onToggle={() => {
            const next = !imageSectionEdit.isVisible;
            setImageSection("isVisible", next);
            updateImageSection.mutate({ sectionType: "image", title: imageSectionEdit.title, subtitle: imageSectionEdit.subtitle, isVisible: next });
          }}
        />
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: "-12px 0 20px 0" }}>
          Pure image carousel. No play button. Drag to scroll.
        </p>

        {/* Section title/subtitle edit */}
        <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 6, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 12 }}>
            Section Heading
          </div>
          <Field label="Section Title">
            <input style={inputStyle} value={imageSectionEdit.title} onChange={e => setImageSection("title", e.target.value)} placeholder="Stories From the Road" />
          </Field>
          <Field label="Section Subtitle">
            <input style={inputStyle} value={imageSectionEdit.subtitle} onChange={e => setImageSection("subtitle", e.target.value)} placeholder="Real stories. Meaningful journeys." />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btnPrimary} onClick={() => updateImageSection.mutate({ sectionType: "image", title: imageSectionEdit.title, subtitle: imageSectionEdit.subtitle })}>
              Save Heading
            </button>
          </div>
        </div>

        {/* Image cards list */}
        <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 10 }}>
          Image Cards
        </div>
        {imageStories.length === 0 && !imageUploading && (
          <div style={{ color: "#aaa", fontFamily: "Lato, sans-serif", fontSize: 13, padding: "12px 0", textAlign: "center" }}>
            No images yet. Upload below.
          </div>
        )}
        {imageStories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {imageStories.map(s => (
              <div key={s.id} style={{ position: "relative", width: 100, height: 70, borderRadius: 4, overflow: "hidden", border: "1px solid #eee", background: "#f5f5f5", flexShrink: 0 }}>
                {s.image && (
                  <img src={s.image} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
                <button
                  onClick={() => { if (confirm("Delete this image?")) deleteImageStory.mutate({ id: s.id }); }}
                  style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Direct upload area */}
        <div
          onDrop={e => { e.preventDefault(); setImageDragOver(false); handleImageFiles(e.dataTransfer.files); }}
          onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
          onDragLeave={() => setImageDragOver(false)}
          onClick={() => !imageUploading && imageFileRef.current?.click()}
          style={{
            border: `1px dashed ${imageDragOver ? "#F5569B" : "#ccc"}`,
            borderRadius: 4,
            padding: "14px 16px",
            cursor: imageUploading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: imageDragOver ? "#F5569B" : "#888",
            fontSize: 12,
            letterSpacing: "0.05em",
            background: imageDragOver ? "#fff0f6" : "#fafafa",
            transition: "all 0.18s",
            userSelect: "none",
          }}
        >
          {imageUploading ? (
            <span style={{ fontFamily: "Lato, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Uploading
              {imageUploadProgress && imageUploadProgress.total > 1 && (
                <span style={{ fontWeight: 700, color: "#F5569B" }}>{imageUploadProgress.current}/{imageUploadProgress.total}</span>
              )}
            </span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style={{ fontFamily: "Lato, sans-serif" }}>Upload images (drag & drop or click) — multiple files supported</span>
            </>
          )}
        </div>
        <input
          ref={imageFileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => handleImageFiles(e.target.files)}
        />
      </div>

      {/* ── Section 2: Video Stories ─────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Section 2 — Video Stories"
          visible={videoSectionEdit.isVisible}
          onToggle={() => {
            const next = !videoSectionEdit.isVisible;
            setVideoSection("isVisible", next);
            updateVideoSection.mutate({ sectionType: "video", title: videoSectionEdit.title, subtitle: videoSectionEdit.subtitle, isVisible: next });
          }}
        />
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: "-12px 0 20px 0" }}>
          YouTube video carousel. Click to play. Auto-fetches cover from YouTube.
        </p>

        {/* Section title/subtitle edit */}
        <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 6, padding: 16, marginBottom: 20 }}>
          <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 12 }}>
            Section Heading
          </div>
          <Field label="Section Title">
            <input style={inputStyle} value={videoSectionEdit.title} onChange={e => setVideoSection("title", e.target.value)} placeholder="Stories From the Road" />
          </Field>
          <Field label="Section Subtitle">
            <input style={inputStyle} value={videoSectionEdit.subtitle} onChange={e => setVideoSection("subtitle", e.target.value)} placeholder="Real stories. Meaningful journeys." />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btnPrimary} onClick={() => updateVideoSection.mutate({ sectionType: "video", title: videoSectionEdit.title, subtitle: videoSectionEdit.subtitle })}>
              Save Heading
            </button>
          </div>
        </div>

        {/* Video cards list */}
        <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 10 }}>
          Video Cards
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {videoStories.length === 0 && (
            <div style={{ color: "#aaa", fontFamily: "Lato, sans-serif", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
              No video cards yet. Add one below.
            </div>
          )}
          {videoStories.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid #f0f0f0", borderRadius: 6, background: "#fafafa" }}>
              {extractYouTubeId(s.videoId ?? "") && (
                <img
                  src={`https://img.youtube.com/vi/${extractYouTubeId(s.videoId ?? "")}/mqdefault.jpg`}
                  alt={s.name}
                  style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "Lato, sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                {extractYouTubeId(s.videoId ?? "") && <div style={{ fontFamily: "Lato, sans-serif", fontSize: 11, color: "#888", marginTop: 2 }}>YouTube: {extractYouTubeId(s.videoId ?? "")}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: s.isVisible ? "#F5569B" : "#aaa", fontFamily: "Lato, sans-serif", fontWeight: 600 }}>
                  {s.isVisible ? "Visible" : "Hidden"}
                </span>
                <button style={btnSecondary} onClick={() => setVideoStoryModal({ id: s.id, title: s.name, youtubeId: s.videoId ?? "", thumbnailUrl: s.image ?? "", isVisible: s.isVisible ?? true, sortOrder: s.sortOrder ?? 0 })}>Edit</button>
                <button style={btnDanger} onClick={() => { if (confirm("Delete this video card?")) deleteVideoStory.mutate({ id: s.id }); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button style={btnPrimary} onClick={() => setVideoStoryModal(emptyVideoStory)}>+ Add Video Card</button>
      </div>

      {/* ── Sponsors ────────────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader title="Sponsor Logos" visible={sponsorsVisible} onToggle={toggleSponsorsVisibility} />
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 12, color: "#888", margin: "-12px 0 20px 0" }}>
          Upload sponsor logos. Drag & drop or click to upload.
        </p>

        {/* Sponsor logos grid */}
        {sponsors.length === 0 && !sponsorUploading && (
          <div style={{ color: "#aaa", fontFamily: "Lato, sans-serif", fontSize: 13, padding: "12px 0", textAlign: "center" }}>
            No logos yet. Upload below.
          </div>
        )}
        {sponsors.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {sponsors.map(sp => {
              const logoUrls = normalizeLogoUrls(sp.logoUrls);
              return (
                <div key={sp.id} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {logoUrls.map((logo: string, idx: number) => (
                    <div key={idx} style={{ position: "relative", width: 100, height: 60, borderRadius: 4, overflow: "hidden", border: "1px solid #eee", background: "#f5f5f5", flexShrink: 0 }}>
                      <img src={logo} alt={`Logo ${idx}`} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                      <button
                        onClick={() => {
                          if (confirm("Delete this logo?")) {
                            const updatedLogos = logoUrls.filter((_: string, i: number) => i !== idx);
                            if (updatedLogos.length === 0) {
                              deleteSponsor.mutate({ id: sp.id });
                            } else {
                              updateSponsor.mutate({ id: sp.id, name: sp.name, logoUrls: updatedLogos, websiteUrl: sp.websiteUrl ?? undefined, isVisible: sp.isVisible, sortOrder: sp.sortOrder });
                            }
                          }
                        }}
                        style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Direct upload area */}
        <div
          onDrop={e => { e.preventDefault(); setSponsorDragOver(false); handleSponsorFiles(e.dataTransfer.files); }}
          onDragOver={e => { e.preventDefault(); setSponsorDragOver(true); }}
          onDragLeave={() => setSponsorDragOver(false)}
          onClick={() => !sponsorUploading && sponsorFileRef.current?.click()}
          style={{
            border: `1px dashed ${sponsorDragOver ? "#F5569B" : "#ccc"}`,
            borderRadius: 4,
            padding: "14px 16px",
            cursor: sponsorUploading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: sponsorDragOver ? "#F5569B" : "#888",
            fontSize: 12,
            letterSpacing: "0.05em",
            background: sponsorDragOver ? "#fff0f6" : "#fafafa",
            transition: "all 0.18s",
            userSelect: "none",
          }}
        >
          {sponsorUploading ? (
            <span style={{ fontFamily: "Lato, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Uploading
              {sponsorUploadProgress && sponsorUploadProgress.total > 1 && (
                <span style={{ fontWeight: 700, color: "#F5569B" }}>{sponsorUploadProgress.current}/{sponsorUploadProgress.total}</span>
              )}
            </span>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style={{ fontFamily: "Lato, sans-serif" }}>Upload logos (drag & drop or click) — multiple files supported</span>
            </>
          )}
        </div>
        <input
          ref={sponsorFileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => handleSponsorFiles(e.target.files)}
        />
      </div>

      {/* ── Why Us ────────────────────────────────────────────────────────── */}
      <VisibilityOnlySection
        title="Why Wellcometochina"
        description="Controls the Why Wellcometochina benefits section near the bottom of the homepage."
        visible={sectionVisibility?.why_us ?? true}
        onToggle={() => toggleSectionVisibility("why_us")}
      />

      {/* ── Ready to Start CTA ────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <SectionHeader
          title="Ready to Start CTA"
          visible={sectionVisibility?.ready_to_start ?? true}
          onToggle={() => toggleSectionVisibility("ready_to_start")}
        />
        <Field label="Title">
          <input style={inputStyle} value={ctaEdit.title} onChange={e => setCta("title", e.target.value)} />
        </Field>
        <Field label="Button Text">
          <input style={inputStyle} value={ctaEdit.buttonText} onChange={e => setCta("buttonText", e.target.value)} />
        </Field>
        <button
          style={{ ...btnPrimary, opacity: updateCta.isPending ? 0.6 : 1 }}
          disabled={updateCta.isPending}
          onClick={() => updateCta.mutate(ctaEdit)}
        >
          {updateCta.isPending ? "Saving..." : "Save CTA"}
        </button>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {videoStoryModal !== null && (
        <VideoStoryModal initial={videoStoryModal} onSave={handleVideoStorySave} onClose={() => setVideoStoryModal(null)} />
      )}
      {sponsorModal !== null && (
        <SponsorModal initial={sponsorModal} onSave={handleSponsorSave} onClose={() => setSponsorModal(null)} />
      )}
    </div>
    </AdminLayout>
  );
}
