import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { Plus, Edit2, Trash2, X, Check, ArrowRight, GripVertical } from "lucide-react";
import { normalizeSlug, SLUG_HELP_TEXT } from "@/lib/slug";

const ACCENT = "#F5569B";

type City = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  sortOrder: number | null;
  isActive: boolean;
  experienceCount?: number;
};

const emptyForm = { name: "", slug: "", description: "", coverImage: "", sortOrder: 0, isActive: true };

function CityForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: typeof emptyForm;
  onSave: (data: typeof emptyForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const set = (k: keyof typeof emptyForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: "28px", marginBottom: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Name */}
        <div>
          <label style={labelStyle}>City Name *</label>
          <input
            value={form.name}
            onChange={e => {
              set("name", e.target.value);
              if (!slugEdited) set("slug", normalizeSlug(e.target.value));
            }}
            placeholder="e.g. Chengdu"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>
        {/* Slug */}
        <div>
          <label style={labelStyle}>URL Slug *</label>
          <input
            value={form.slug}
            onChange={e => {
              setSlugEdited(true);
              set("slug", normalizeSlug(e.target.value));
            }}
            placeholder="auto-generated"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "11px", lineHeight: 1.5, color: "#999" }}>
            {SLUG_HELP_TEXT}
          </p>
        </div>
        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            rows={3}
            placeholder="Brief description of the city..."
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>
        {/* Cover image */}
        <div style={{ gridColumn: "1 / -1" }}>
          <ImageUploader
            value={form.coverImage}
            onChange={url => set("coverImage", url)}
            category="city"
            label="Cover Image"
          />
        </div>
        {/* Active */}
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set("isActive", e.target.checked)}
              style={{ accentColor: ACCENT, width: "16px", height: "16px" }}
            />
            <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#888" }}>Active</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          onClick={() => onSave({ ...form, slug: normalizeSlug(form.slug || form.name) })}
          disabled={saving || !form.name.trim()}
          style={{
            padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
            opacity: saving || !form.name.trim() ? 0.5 : 1, transition: "opacity 0.18s",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCities() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: cities = [], isLoading } = trpc.admin.listCities.useQuery();
  const createCity = trpc.admin.createCity.useMutation({ onSuccess: () => { utils.admin.listCities.invalidate(); setShowForm(false); } });
  const updateCity = trpc.admin.updateCity.useMutation({ onSuccess: () => { utils.admin.listCities.invalidate(); setEditId(null); } });
  const deleteCity = trpc.admin.deleteCity.useMutation({ onSuccess: () => utils.admin.listCities.invalidate() });
  const reorderCity = trpc.admin.reorderCity.useMutation({ onSuccess: () => utils.admin.listCities.invalidate() });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [draggedCityId, setDraggedCityId] = useState<number | null>(null);

  const handleCreate = (data: typeof emptyForm) => {
    createCity.mutate({ ...data, sortOrder: data.sortOrder ?? 0 });
  };

  const handleUpdate = (id: number, data: typeof emptyForm) => {
    updateCity.mutate({ id, ...data, sortOrder: data.sortOrder ?? 0 });
  };

  const handleCityDrop = async (targetId: number) => {
    if (!draggedCityId || draggedCityId === targetId) {
      setDraggedCityId(null);
      return;
    }
    const fromIndex = cities.findIndex(city => city.id === draggedCityId);
    const toIndex = cities.findIndex(city => city.id === targetId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggedCityId(null);
      return;
    }
    const next = [...cities];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    try {
      await Promise.all(next.map((city, index) => reorderCity.mutateAsync({ id: city.id, sortOrder: index })));
    } finally {
      setDraggedCityId(null);
    }
  };

  return (
    <AdminLayout title="Cities">
      <div style={{ padding: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>Cities</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{cities.length} cities</p>
          </div>
          {!showForm && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => navigate("/template/city")}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                  background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                }}
              >
                View Template
              </button>
              <button
                onClick={() => { setShowForm(true); setEditId(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                  background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                }}
              >
                <Plus size={14} /> New City
              </button>
            </div>
          )}
        </div>

        {/* New city form */}
        {showForm && (
          <CityForm
            initial={emptyForm}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={createCity.isPending}
          />
        )}

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : cities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888" }}>
            <MapPinIcon />
            <p style={{ fontSize: "13px", marginTop: "12px" }}>No cities yet. Add your first city above.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: "#e8e8e8", borderBottom: "1px solid #d8d8d8" }}>
              <span style={{ width: "36px" }} />
              <span style={{ flex: 1, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>City</span>
              <span style={{ width: "110px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Experiences</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Status</span>
              <span style={{ width: "220px" }} />
            </div>

            {cities.map((city, idx) => {
              const bg = idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8";
              const isEditing = editId === city.id;

              if (isEditing) {
                return (
                  <div key={city.id} style={{ background: "#fff", padding: "20px", borderBottom: "1px solid #ddd" }}>
                    <CityForm
                      initial={{
                        name: city.name,
                        slug: city.slug,
                        description: city.description || "",
                        coverImage: city.coverImage || "",
                        sortOrder: city.sortOrder ?? 0,
                        isActive: city.isActive,
                      }}
                      onSave={data => handleUpdate(city.id, data)}
                      onCancel={() => setEditId(null)}
                      saving={updateCity.isPending}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={city.id}
                  draggable
                  onDragStart={e => {
                    setDraggedCityId(city.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(city.id));
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    handleCityDrop(city.id);
                  }}
                  onDragEnd={() => setDraggedCityId(null)}
                  style={{
                    display: "flex", alignItems: "center", padding: "14px 20px", background: bg, borderBottom: "1px solid rgba(0,0,0,0.04)",
                    cursor: "grab",
                    opacity: draggedCityId === city.id ? 0.55 : 1,
                    outline: draggedCityId === city.id ? "2px solid #F5569B" : "none",
                    outlineOffset: -2,
                  }}
                >
                  <div title="Drag to reorder" style={{ width: "36px", display: "flex", alignItems: "center", color: "#aaa", flexShrink: 0 }}>
                    <GripVertical size={15} />
                  </div>
                  {/* Cover thumb */}
                  <div style={{ width: "48px", height: "32px", background: "#ddd", marginRight: "14px", flexShrink: 0, overflow: "hidden" }}>
                    {city.coverImage && (
                      <img src={city.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", color: "#1a1a1a" }}>{city.name}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>/{city.slug}</div>
                  </div>
                  {/* Experience count */}
                  <div style={{ width: "110px", textAlign: "center", fontSize: "12px", color: "#888", letterSpacing: "0.04em" }}>
                    {city.experienceCount ?? 0}
                  </div>
                  {/* Status */}
                  <div style={{ width: "80px", textAlign: "center" }}>
                    <span style={{ fontSize: "11px", color: city.isActive ? "#4caf50" : "#aaa", letterSpacing: "0.05em" }}>
                      {city.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  {/* Experiences entry */}
                  <div style={{ width: "120px", display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => navigate(`/admin/cities/${city.id}/experiences`)}
                      style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "#888", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px", transition: "color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#F5569B"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#888"; }}
                      title="Manage experiences"
                    >
                      Experiences <ArrowRight size={12} />
                    </button>
                  </div>
                  {/* Actions */}
                  <div style={{ width: "100px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    {deleteConfirm === city.id ? (
                      <>
                        <button
                          onClick={() => { deleteCity.mutate({ id: city.id }); setDeleteConfirm(null); }}
                          style={iconBtnStyle("#e53e3e")}
                          title="Confirm delete"
                        >
                          <Check size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} style={iconBtnStyle("#888")} title="Cancel">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => navigate(`/admin/cities/${city.id}/edit`)} style={iconBtnStyle("#888")} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(city.id)} style={iconBtnStyle("#e53e3e")} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function MapPinIcon() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: "13px",
  background: "#f2f2f2",
  border: "1px solid #ddd",
  outline: "none",
  color: "#2d2d2d",
  boxSizing: "border-box",
};

const iconBtnStyle = (color: string): React.CSSProperties => ({
  background: "none",
  border: "none",
  cursor: "pointer",
  color,
  padding: "4px",
  display: "flex",
  alignItems: "center",
  opacity: 0.7,
  transition: "opacity 0.15s",
});
