import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/image-upload";
import { toast } from "sonner";
import { Plus, Trash2, X, ArrowLeft, Save, Upload, GripVertical } from "lucide-react";

// ─── Detail Block ─────────────────────────────────────────────────────────────
type DetailBlock = {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
};

function DetailBlockEditor({
  block,
  index,
  total,
  onChange,
  onDelete,
}: {
  block: DetailBlock;
  index: number;
  total: number;
  onChange: (b: DetailBlock) => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ border: "1px solid #e0e0e0", background: "#fafafa", padding: "20px", position: "relative" }}>
      {/* Block number */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>Block {index + 1}</span>
        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "4px" }}
          title="Remove block"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Title</label>
          <input
            value={block.title}
            onChange={e => onChange({ ...block, title: e.target.value })}
            placeholder="Enter block title..."
            style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Description</label>
          <textarea
            value={block.description}
            onChange={e => onChange({ ...block, description: e.target.value })}
            rows={4}
            placeholder="Enter description text..."
            style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box", resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>

        {/* Image */}
        <div>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Image</label>
          <ImageUploader
            value={block.imageUrl}
            onChange={url => onChange({ ...block, imageUrl: url })}
            category="experience_detail"
            label=""
          />
        </div>
      </div>
    </div>
  );
}

// ─── Label Tag Input ──────────────────────────────────────────────────────────
function LabelTagInput({
  labels,
  onChange,
}: {
  labels: string[];
  onChange: (labels: string[]) => void;
}) {
  const { data: allTags = [] } = trpc.admin.listTags.useQuery();

  function addLabel(name: string) {
    if (!name || labels.includes(name)) return;
    onChange([...labels, name]);
  }

  function removeLabel(label: string) {
    onChange(labels.filter(l => l !== label));
  }

  // Tags not yet selected
  const availableTags = allTags.filter(t => !labels.includes(t.name));

  return (
    <div>
      {/* Selected labels */}
      {labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {labels.map(label => (
            <span
              key={label}
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245,86,155,0.1)", border: "1px solid #F5569B", color: "#F5569B", fontSize: "12px", padding: "4px 12px" }}
            >
              {label}
              <button
                onClick={() => removeLabel(label)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#F5569B", padding: "0", display: "flex" }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available tags to pick from */}
      {availableTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px", background: "#f9f9f9", border: "1px solid #eee" }}>
          {availableTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addLabel(tag.name)}
              style={{
                padding: "4px 12px", fontSize: "12px", letterSpacing: "0.06em",
                border: "1px solid #ddd", background: "#fff", color: "#666",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5569B"; e.currentTarget.style.color = "#F5569B"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#666"; }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {availableTags.length === 0 && labels.length === 0 && (
        <p style={{ fontSize: "12px", color: "#bbb" }}>No tags available. Add tags in the Tags section first.</p>
      )}

      <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px" }}>Click a tag to add it. Selected tags are used to match similar experiences.</p>
    </div>
  );
}

// ─── Gallery Manager ──────────────────────────────────────────────────────────
function GalleryManager({
  gallery,
  onChange,
}: {
  gallery: string[];
  onChange: (urls: string[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMut = trpc.images.upload.useMutation();

  function addUrl() {
    const val = newUrl.trim();
    if (!val) return;
    onChange([...gallery, val]);
    setNewUrl("");
  }

  function removeUrl(idx: number) {
    onChange(gallery.filter((_, i) => i !== idx));
  }

  function reorderUrl(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const next = [...gallery];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    onChange(next);
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) { toast.error("No image files selected"); return; }
    
    setUploading(true);
    setUploadProgress({ current: 0, total: imageFiles.length });
    const newUrls: string[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setUploadProgress({ current: i + 1, total: imageFiles.length });
      
      try {
        const uploadFile = await prepareImageForUpload(file);
        
        const result = await uploadImageMut.mutateAsync({
          filename: uploadFile.filename,
          base64: uploadFile.base64,
          mimeType: uploadFile.mimeType,
        });
        newUrls.push(result.url);
      } catch (err: any) {
        toast.error(`${file.name}: ${err.message ?? "Upload failed"}`);
      }
    }
    
    if (newUrls.length > 0) {
      onChange([...gallery, ...newUrls]);
      toast.success(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`);
    }
    
    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      {/* Existing images grid */}
      {gallery.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
          {gallery.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              draggable
              onDragStart={e => {
                setDraggedIndex(idx);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(idx));
              }}
              onDragOver={e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragTargetIndex(idx);
              }}
              onDragLeave={() => setDragTargetIndex(current => current === idx ? null : current)}
              onDrop={e => {
                e.preventDefault();
                const fromIndex = draggedIndex ?? Number(e.dataTransfer.getData("text/plain"));
                reorderUrl(fromIndex, idx);
                setDraggedIndex(null);
                setDragTargetIndex(null);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragTargetIndex(null);
              }}
              style={{
                position: "relative",
                aspectRatio: "16/9",
                background: "#f2f2f2",
                border: dragTargetIndex === idx ? "2px solid #F5569B" : "1px solid #ddd",
                overflow: "hidden",
                cursor: "grab",
                opacity: draggedIndex === idx ? 0.55 : 1,
                transition: "border-color 0.15s, opacity 0.15s",
              }}
              title="Drag to reorder"
            >
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div
                style={{
                  position: "absolute", top: "4px", left: "4px",
                  background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
                  padding: "4px 6px", display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "10px", letterSpacing: "0.08em", lineHeight: 1,
                }}
              >
                <GripVertical size={11} />
                {String(idx + 1).padStart(2, "0")}
              </div>
              <button
                onClick={() => removeUrl(idx)}
                style={{
                  position: "absolute", top: "4px", right: "4px",
                  background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
                  cursor: "pointer", padding: "4px", display: "flex", opacity: 1,
                  transition: "opacity 0.15s",
                }}
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add image: URL input + Upload area (both visible) */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="Paste URL or upload file"
          style={{ flex: 1, padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d" }}
          onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
          onBlur={e => { e.target.style.borderColor = "#ddd"; }}
        />
        <button
          onClick={addUrl}
          style={{ padding: "9px 16px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#f2f2f2", border: "1px solid #ddd", color: "#888", cursor: "pointer" }}
        >
          Add
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => handleFileUpload(e.target.files)}
      />
      <div
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          width: "100%",
          border: `1px dashed ${dragOver ? "#F5569B" : "#ccc"}`,
          color: dragOver ? "#F5569B" : "#aaa",
          padding: "16px",
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          background: dragOver ? "#fff0f6" : "#fafafa",
          cursor: uploading ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.15s",
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        {uploading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Uploading
            {uploadProgress && uploadProgress.total > 1 && (
              <span style={{ fontWeight: 700, color: "#F5569B" }}>{uploadProgress.current}/{uploadProgress.total}</span>
            )}
          </span>
        ) : (
          <>
            <Upload size={14} />
            <span>Upload images (drag & drop or click) — multiple files supported</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #e8e8e8" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminExperienceEdit() {
  const params = useParams<{ id: string }>();
  const expId = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();

  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [ctaBgColor, setCtaBgColor] = useState("#1a1a1a");
  const [isActive, setIsActive] = useState(true);
  const [details, setDetails] = useState<DetailBlock[]>([
    { title: "", description: "", imageUrl: "", sortOrder: 0 },
    { title: "", description: "", imageUrl: "", sortOrder: 1 },
    { title: "", description: "", imageUrl: "", sortOrder: 2 },
  ]);
  const [labels, setLabels] = useState<string[]>([]);
  const [recommendationImage, setRecommendationImage] = useState("");
  const [recommendationTitle, setRecommendationTitle] = useState("");
  const [recommendationDescription, setRecommendationDescription] = useState("");
  const [cityDisplayImage, setCityDisplayImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Queries
  const { data: exp } = trpc.admin.getExperience.useQuery({ id: expId }, { enabled: !!expId });

  // Load data into form
  useEffect(() => {
    if (!exp || loaded) return;
    setName(exp.name ?? "");
    setTitle((exp as any).title ?? "");
    setWhen((exp as any).when ?? "");
    setPrice(exp.price ?? "");
    setDuration(exp.duration ?? "");
    setDescription(exp.description ?? "");
    setCtaBgColor((exp as any).ctaBgColor ?? "#1a1a1a");
    setIsActive(exp.isActive ?? true);
    // Gallery
    try {
      const g = JSON.parse((exp as any).gallery ?? "[]");
      setGallery(Array.isArray(g) ? g : []);
    } catch { setGallery([]); }
    // Details
    if (exp.details && exp.details.length > 0) {
      setDetails(exp.details.map((d: any, i: number) => ({
        id: d.id,
        title: d.title ?? "",
        description: d.description ?? "",
        imageUrl: d.imageUrl ?? "",
        sortOrder: d.sortOrder ?? i,
      })));
    }
    // Labels
    if (exp.labels) setLabels(exp.labels);
    // Recommendation card
    setRecommendationImage((exp as any).recommendationImage ?? "");
    setRecommendationTitle((exp as any).recommendationTitle ?? "");
    setRecommendationDescription((exp as any).recommendationDescription ?? "");
    setCityDisplayImage((exp as any).cityDisplayImage ?? "");
    setLoaded(true);
  }, [exp, loaded]);

  // Copy to state
  const [copyTargetId, setCopyTargetId] = useState<string>("");
  const [copyTargetSlug, setCopyTargetSlug] = useState<string>("");
  const [copying, setCopying] = useState(false);

  // Load cities + experience types for Copy to dropdown
  const { data: allCities = [] } = trpc.admin.listCities.useQuery();
  const { data: allExpTypes = [] } = trpc.admin.listExperienceTypes.useQuery();

  // Mutations
  const updateMut = trpc.admin.updateExperience.useMutation();
  const saveDetailsMut = trpc.admin.saveExperienceDetails.useMutation();
  const saveLabelsMut = trpc.admin.saveExperienceLabels.useMutation();
  const copyMut = trpc.admin.copyExperience.useMutation();

  async function handleSave() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await updateMut.mutateAsync({
        id: expId,
        name: name.trim(),
        title: title || undefined,
        when: when || undefined,
        price: price || undefined,
        duration: duration || undefined,
        description: description || undefined,
        gallery: JSON.stringify(gallery),
        ctaBgColor,
        recommendationImage: recommendationImage || undefined,
        recommendationTitle: recommendationTitle || undefined,
        recommendationDescription: recommendationDescription || undefined,
        cityDisplayImage: cityDisplayImage || undefined,
        isActive,
      });
      await saveDetailsMut.mutateAsync({
        experienceId: expId,
        details: details.map((d, i) => ({
          title: d.title || undefined,
          description: d.description || undefined,
          imageUrl: d.imageUrl || undefined,
          sortOrder: i,
        })),
      });
      await saveLabelsMut.mutateAsync({ experienceId: expId, labels });
      toast.success("Experience saved");
    } catch (e: any) {
      toast.error(e.message ?? "Error saving");
    } finally {
      setSaving(false);
    }
  }

  function addDetailBlock() {
    setDetails(prev => [...prev, { title: "", description: "", imageUrl: "", sortOrder: prev.length }]);
  }

  function updateDetail(idx: number, block: DetailBlock) {
    setDetails(prev => prev.map((d, i) => i === idx ? block : d));
  }

  function removeDetail(idx: number) {
    setDetails(prev => prev.filter((_, i) => i !== idx));
  }

  const backUrl = exp ? `/admin/experiences/type/${(exp as any).typeId ?? ""}` : "/admin/experiences";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: "13px",
    background: "#f2f2f2", border: "1px solid #ddd", outline: "none",
    color: "#2d2d2d", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#888", marginBottom: "8px",
  };

  return (
    <AdminLayout>
      <div style={{ padding: "32px", maxWidth: "768px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(backUrl)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            color: "#888", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={13} />
          Back
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
              {exp?.name ?? "Loading..."}
            </h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Edit experience details</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>

        {/* ── Basic Info ── */}
        <Section title="Basic Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Experience Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Experience name"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>When</label>
              <input
                value={when}
                onChange={e => setWhen(e.target.value)}
                placeholder="e.g. Year-round / Spring"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Price</label>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. From $200pp"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>How Long</label>
              <input
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. Half day / 3 hours"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "24px" }}>
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#F5569B" }}
              />
              <label htmlFor="isActive" style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", cursor: "pointer" }}>
                Active (visible on site)
              </label>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <SectionTitle>Short Description</SectionTitle>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title shown above the short description"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>
            <label style={labelStyle}>Short Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief overview of this experience..."
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
              onBlur={e => { e.target.style.borderColor = "#ddd"; }}
            />
          </div>
        </Section>

        {/* ── Gallery ── */}
        <Section title="Gallery Images">
          <GalleryManager gallery={gallery} onChange={setGallery} />
        </Section>

        {/* ── Detail Blocks ── */}
        <Section title="Detail Blocks">
          <div className="space-y-4">
            {details.map((block, idx) => (
              <DetailBlockEditor
                key={idx}
                block={block}
                index={idx}
                total={details.length}
                onChange={b => updateDetail(idx, b)}
                onDelete={() => removeDetail(idx)}
              />
            ))}
          </div>
          <button
            onClick={addDetailBlock}
            style={{
              marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", border: "1px dashed #ccc", color: "#aaa", padding: "12px",
              width: "100%", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: "none", cursor: "pointer", transition: "all 0.15s", boxSizing: "border-box",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#F5569B"; (e.currentTarget as HTMLButtonElement).style.color = "#F5569B"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ccc"; (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
          >
            <Plus size={13} />
            Add Block
          </button>
        </Section>

        {/* ── Similar Recommendations ── */}
        <Section title="Similar Recommendations (Labels)">
          <LabelTagInput labels={labels} onChange={setLabels} />
        </Section>

        {/* ── Recommendation Card ── */}
        <Section title="Recommendation Card">
          <div className="space-y-4">
            {/* Recommendation Image */}
            <div>
              <label style={labelStyle}>Preview Image</label>
              <ImageUploader
                value={recommendationImage}
                onChange={setRecommendationImage}
                category="recommendation"
                label=""
              />
            </div>

            {/* Recommendation Title */}
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={recommendationTitle}
                onChange={e => setRecommendationTitle(e.target.value)}
                placeholder="Enter recommendation title..."
                style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box" }}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>

            {/* Recommendation Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={recommendationDescription}
                onChange={e => setRecommendationDescription(e.target.value)}
                placeholder="Enter recommendation description..."
                rows={3}
                style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box", resize: "vertical" }}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
            </div>

            {/* City Display Image */}
            <div>
              <label style={labelStyle}>City Display Image (What to See and Do)</label>
              <ImageUploader
                value={cityDisplayImage}
                onChange={setCityDisplayImage}
                category="city_display"
                label=""
              />
            </div>
          </div>
        </Section>

        {/* ── CTA Settings ── */}
        <Section title="CTA Settings">
          <div>
            <label style={labelStyle}>Background Color</label>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <input
                type="color"
                value={ctaBgColor}
                onChange={e => setCtaBgColor(e.target.value)}
                style={{ width: "48px", height: "40px", cursor: "pointer", border: "1px solid #ddd", background: "transparent" }}
              />
              <input
                value={ctaBgColor}
                onChange={e => setCtaBgColor(e.target.value)}
                placeholder="#1a1a1a"
                style={{ width: "160px", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", fontFamily: "monospace" }}
                onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
              <div
                style={{ flex: 1, height: "40px", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "rgba(255,255,255,0.6)", background: ctaBgColor }}
              >
                Preview
              </div>
            </div>
          </div>
        </Section>

        {/* Bottom Save + Copy to */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #e8e8e8", gap: "16px" }}>
          {/* Copy to — left side */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", whiteSpace: "nowrap" }}>Copy to:</span>
            <select
              value={copyTargetId}
              onChange={e => {
                const opt = e.target.options[e.target.selectedIndex];
                setCopyTargetId(e.target.value);
                setCopyTargetSlug(opt.dataset.slug ?? "");
              }}
              style={{
                padding: "10px 12px", fontSize: "12px", letterSpacing: "0.06em",
                background: "#f2f2f2", border: "1px solid #ddd", color: "#555",
                cursor: "pointer", outline: "none", minWidth: "180px",
              }}
              onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
              onBlur={e => { e.target.style.borderColor = "#ddd"; }}
            >
              <option value="">-- Select destination --</option>
              {allCities.length > 0 && (
                <optgroup label="Cities">
                  {allCities.map((c: any) => (
                    <option key={`city-${c.id}`} value={`city-${c.id}`} data-slug={c.slug}>{c.name}</option>
                  ))}
                </optgroup>
              )}
              {allExpTypes.length > 0 && (
                <optgroup label="Experience Types">
                  {allExpTypes.map((t: any) => (
                    <option key={`type-${t.id}`} value={`type-${t.id}`} data-slug={t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}>{t.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            {copyTargetId && (
              <button
                onClick={async () => {
                  if (!copyTargetId || !exp?.slug) return;
                  const isType = copyTargetId.startsWith("type-");
                  const isCity = copyTargetId.startsWith("city-");
                  const targetId = parseInt(copyTargetId.replace(/^(city|type)-/, ""));
                  setCopying(true);
                  try {
                    const result = await copyMut.mutateAsync({
                      id: expId,
                      targetTypeId: isType ? targetId : null,
                      targetCityId: isCity ? targetId : null,
                      targetSlugPrefix: copyTargetSlug,
                    });
                    toast.success(`Copied! New slug: ${result.newSlug}`);
                    navigate(`/admin/experiences/edit/${result.newId}`);
                  } catch (e: any) {
                    toast.error(e.message ?? "Copy failed");
                  } finally {
                    setCopying(false);
                  }
                }}
                disabled={copying}
                style={{
                  padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                  background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer",
                  opacity: copying ? 0.5 : 1,
                }}
              >
                {copying ? "Copying..." : "Confirm"}
              </button>
            )}
          </div>

          {/* Save All — right side */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 32px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        {/* Preview */}
        {exp?.slug && (
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "12px" }}>
            <button
              onClick={() => window.open(`/experience-preview/${exp.slug}`, '_blank')}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 32px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer",
              }}
            >
              View Experience Page
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
