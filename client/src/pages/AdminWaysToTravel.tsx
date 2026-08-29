import { useState, useRef } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ArrowRight, Upload, X, GripVertical, Sparkles } from "lucide-react";
import { normalizeSlug, SLUG_HELP_TEXT } from "@/lib/slug";

// ─── Type Form Modal ──────────────────────────────────────────────────────────
function TypeFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: { id: number; name: string; slug?: string; coverImage?: string | null; sortOrder?: number | null };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMut = trpc.images.upload.useMutation();

  async function handleFileUpload(file: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const result = await uploadImageMut.mutateAsync({
          filename: file.name,
          base64,
          mimeType: file.type,
        });
        setCoverImage(result.url);
        setUploading(false);
        toast.success("Image uploaded");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
      setUploading(false);
    }
  }

  const createMut = trpc.admin.createWayToTravelType.useMutation();
  const updateMut = trpc.admin.updateWayToTravelType.useMutation();

  async function handleSave() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) { toast.error("Slug is required"); return; }
    setSaving(true);
    try {
      if (initial) {
        await updateMut.mutateAsync({ id: initial.id, name: name.trim(), slug: normalizedSlug, coverImage: coverImage || undefined });
      } else {
        await createMut.mutateAsync({ name: name.trim(), slug: normalizedSlug, coverImage: coverImage || undefined, sortOrder: 0 });
      }
      toast.success(initial ? "Type updated" : "Type created");
      onSaved();
      onClose();
    } catch (e: any) {
      const msg = e.message ?? "Error saving";
      if (msg.includes("Duplicate") || msg.includes("unique") || msg.includes("UNIQUE")) {
        toast.error("This slug already exists. Please use a different name.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", border: "1px solid #eee" }}
        className="w-full max-w-md mx-4 p-6 rounded-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: "#1a1a1a", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "24px" }}>
          {initial ? "Edit Way to Travel Type" : "New Way to Travel Type"}
        </h3>

        <div className="space-y-4">
          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Name *</label>
            <input
              value={name}
              onChange={e => {
                const newName = e.target.value;
                setName(newName);
                if (!slugEdited) {
                  setSlug(normalizeSlug(newName));
                }
              }}
              placeholder="e.g. Cultural, Adventure, Nature..."
              style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
              onBlur={e => { e.target.style.borderColor = "#ddd"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Slug *</label>
            <input
              value={slug}
              onChange={e => {
                setSlugEdited(true);
                setSlug(normalizeSlug(e.target.value));
              }}
              placeholder="e.g. cultural, adventure, nature..."
              style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
              onBlur={e => { e.target.style.borderColor = "#ddd"; }}
            />
            <p style={{ margin: "6px 0 0", fontSize: "11px", lineHeight: 1.5, color: "#999" }}>
              {SLUG_HELP_TEXT}
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Cover Image</label>

            {/* URL input */}
            <input
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="Paste URL or upload file"
              style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box", marginBottom: "8px" }}
              onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
              onBlur={e => { e.target.style.borderColor = "#ddd"; }}
            />

            {/* Upload area */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f); }}
              style={{
                width: "100%", border: "1px dashed #ccc", color: "#aaa", padding: "16px",
                fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px", transition: "all 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#F5569B"; (e.currentTarget as HTMLButtonElement).style.color = "#F5569B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ccc"; (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
            >
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload image (drag & drop or click)"}
            </button>

            {/* Preview */}
            {coverImage && (
              <div style={{ marginTop: "12px", position: "relative", display: "inline-block" }}>
                <img
                  src={coverImage}
                  alt="Preview"
                  style={{ height: "64px", width: "auto", objectFit: "cover", border: "1px solid #ddd" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  style={{
                    position: "absolute", top: "-8px", right: "-8px",
                    background: "#ddd", color: "#555", borderRadius: "50%",
                    width: "18px", height: "18px", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em",
              textTransform: "uppercase", background: "#F5569B", color: "#fff",
              border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1, transition: "opacity 0.18s",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em",
              textTransform: "uppercase", background: "transparent", color: "#888",
              border: "1px solid #ddd", cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminWaysToTravel() {
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; name: string; coverImage?: string | null; sortOrder?: number | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [draggedTypeId, setDraggedTypeId] = useState<number | null>(null);
  const [creatingTemplates, setCreatingTemplates] = useState(false);

  const { data: types = [], refetch, isLoading } = trpc.admin.listWayToTravelTypes.useQuery();
  const deleteMut = trpc.admin.deleteWayToTravelType.useMutation();
  const reorderMut = trpc.admin.reorderWayToTravelType.useMutation();
  const createTemplatesMut = trpc.admin.createWayToTravelStarterContent.useMutation();

  async function handleCreateTemplates() {
    setCreatingTemplates(true);
    try {
      const result = await createTemplatesMut.mutateAsync();
      await refetch();
      toast.success(
        result.createdItems > 0
          ? `Created ${result.createdItems} pages in ${result.createdTypes || 4} groups using ${result.reusedImageCount} existing images.`
          : `All 19 starter pages already exist. ${result.skippedItems} pages were left unchanged.`,
      );
    } catch (e: any) {
      toast.error(e.message ?? "Unable to create starter content");
    } finally {
      setCreatingTemplates(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMut.mutateAsync({ id });
      toast.success("Type deleted");
      setDeleteConfirm(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Error deleting");
    }
  }

  async function handleTypeDrop(targetId: number) {
    if (!draggedTypeId || draggedTypeId === targetId) {
      setDraggedTypeId(null);
      return;
    }
    const fromIndex = types.findIndex(t => t.id === draggedTypeId);
    const toIndex = types.findIndex(t => t.id === targetId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggedTypeId(null);
      return;
    }
    const next = [...types];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    try {
      await Promise.all(next.map((type, index) => reorderMut.mutateAsync({ id: type.id, sortOrder: index })));
      refetch();
    } finally {
      setDraggedTypeId(null);
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>Ways to Travel</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Manage way to travel types and their content</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleCreateTemplates}
              disabled={creatingTemplates}
              title="Create the four starter groups and 19 editable pages. Existing slugs are not overwritten."
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "#1a1a1a", color: "#fff", border: "none", cursor: creatingTemplates ? "wait" : "pointer",
                opacity: creatingTemplates ? 0.55 : 1,
              }}
            >
              <Sparkles size={14} />
              {creatingTemplates ? "Creating..." : "Create 19 Templates"}
            </button>
            <button
              onClick={() => navigate("/ways-to-travel")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
              }}
            >
              View Template
            </button>
            <button
              onClick={() => { setEditItem(null); setShowModal(true); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
              }}
            >
              <Plus size={14} />
              New Type
            </button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : types.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", border: "1px dashed #ddd", color: "#aaa" }}>
            <p style={{ fontSize: "13px" }}>No way to travel types yet.</p>
            <p style={{ fontSize: "12px", marginTop: "4px", color: "#ccc" }}>Click "New Type" to create your first one.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: "#e8e8e8", borderBottom: "1px solid #d8d8d8" }}>
              <span style={{ width: "48px" }} />
              <span style={{ flex: 1, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Type Name</span>
              <span style={{ width: "140px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Ways to Travel</span>
              <span style={{ width: "100px" }} />
            </div>

            {types.map((type, idx) => (
              <div
                key={type.id}
                draggable
                onDragStart={e => {
                  setDraggedTypeId(type.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(type.id));
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={e => {
                  e.preventDefault();
                  handleTypeDrop(type.id);
                }}
                onDragEnd={() => setDraggedTypeId(null)}
                style={{
                  display: "flex", alignItems: "center", padding: "14px 20px",
                  background: idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  cursor: "grab",
                  opacity: draggedTypeId === type.id ? 0.55 : 1,
                  outline: draggedTypeId === type.id ? "2px solid #F5569B" : "none",
                  outlineOffset: -2,
                }}
              >
                {/* Drag handle */}
                <div title="Drag to reorder" style={{ width: "48px", display: "flex", alignItems: "center", color: "#aaa", flexShrink: 0 }}>
                  <GripVertical size={15} />
                </div>

                {/* Name — click to enter type */}
                <button
                  onClick={() => navigate(`/admin/ways-to-travel/type/${type.id}`)}
                  style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "14px", color: "#1a1a1a" }}>{type.name}</span>
                  <ArrowRight size={13} style={{ color: "#bbb" }} />
                </button>

                <span style={{ width: "140px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", flexShrink: 0 }}>
                  {(type as any).itemCount ?? 0} item{((type as any).itemCount ?? 0) === 1 ? "" : "s"}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditItem(type); setShowModal(true); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px" }}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === type.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#F5569B", fontSize: "12px" }}>Confirm?</span>
                      <button
                        onClick={() => handleDelete(type.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#F5569B", fontSize: "12px" }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "12px" }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(type.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e", padding: "4px", opacity: 0.7 }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TypeFormModal
          initial={editItem ?? undefined}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSaved={() => refetch()}
        />
      )}
    </AdminLayout>
  );
}
