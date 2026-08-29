import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

const ACCENT = "#F5569B";

const TAG_TYPES = [
  { value: "city", label: "City" },
  { value: "experience_type", label: "Experience Type" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  name: "",
  type: "other" as "city" | "experience_type" | "other",
  color: "#888888",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "#888", marginBottom: "8px",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: "13px",
  background: "#f2f2f2", border: "1px solid #ddd", outline: "none",
  color: "#2d2d2d", boxSizing: "border-box",
};
const iconBtnStyle = (color: string): React.CSSProperties => ({
  background: "none", border: "none", cursor: "pointer", color,
  padding: "4px", display: "flex", alignItems: "center", opacity: 0.7,
});

const PRESET_COLORS = [
  "#F5569B", "#c9a96e", "#6e9ec9", "#6ec98b", "#c96e9e",
  "#9e6ec9", "#c9896e", "#6ec9c9", "#888888", "#2d2d2d",
];

function TagForm({ initial, onSave, onCancel, saving }: {
  initial: typeof emptyForm;
  onSave: (data: typeof emptyForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof emptyForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: "24px", marginBottom: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "end" }}>
        <div>
          <label style={labelStyle}>Tag Name *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Chengdu" style={inputStyle} onFocus={e => { e.target.style.borderColor = ACCENT; }} onBlur={e => { e.target.style.borderColor = "#ddd"; }} />
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={form.type} onChange={e => set("type", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {TAG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Color</label>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input type="color" value={form.color} onChange={e => set("color", e.target.value)} style={{ width: "40px", height: "36px", border: "1px solid #ddd", background: "#f2f2f2", cursor: "pointer", padding: "2px" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  style={{
                    width: "18px", height: "18px", background: c, border: form.color === c ? "2px solid #333" : "1px solid rgba(0,0,0,0.1)",
                    cursor: "pointer", borderRadius: "2px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()} style={{ padding: "9px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer", opacity: saving || !form.name.trim() ? 0.5 : 1 }}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} style={{ padding: "9px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminTags() {
  const utils = trpc.useUtils();
  const { data: tags = [], isLoading } = trpc.admin.listTags.useQuery();
  const createTag = trpc.admin.createTag.useMutation({ onSuccess: () => { utils.admin.listTags.invalidate(); setShowForm(false); } });
  const updateTag = trpc.admin.updateTag.useMutation({ onSuccess: () => { utils.admin.listTags.invalidate(); setEditId(null); } });
  const deleteTag = trpc.admin.deleteTag.useMutation({ onSuccess: () => utils.admin.listTags.invalidate() });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<typeof emptyForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const groupedTags = TAG_TYPES.map(t => ({
    ...t,
    tags: tags.filter(tag => tag.type === t.value),
  }));

  return (
    <AdminLayout title="Tags">
      <div style={{ padding: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>Tags</h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{tags.length} tags total</p>
          </div>
          {!showForm && editId === null && (
            <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: ACCENT, color: "#fff", border: "none", cursor: "pointer" }}>
              <Plus size={14} /> New Tag
            </button>
          )}
        </div>

        {showForm && (
          <TagForm initial={emptyForm} onSave={data => createTag.mutate(data)} onCancel={() => setShowForm(false)} saving={createTag.isPending} />
        )}

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {groupedTags.map(group => (
              <div key={group.value}>
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#888", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e8e8e8" }}>
                  {group.label} Tags ({group.tags.length})
                </div>

                {group.tags.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#aaa", padding: "16px 0" }}>No {group.label.toLowerCase()} tags yet.</div>
                ) : (
                  <div style={{ background: "#fff", border: "1px solid #eee" }}>
                    {group.tags.map((tag, idx) => {
                      const bg = idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8";
                      const isEditing = editId === tag.id;

                      if (isEditing) {
                        return (
                          <div key={tag.id} style={{ background: "#fff", padding: "16px 20px", borderBottom: "1px solid #ddd" }}>
                            <TagForm
                              initial={editForm}
                              onSave={data => updateTag.mutate({ id: tag.id, ...data })}
                              onCancel={() => setEditId(null)}
                              saving={updateTag.isPending}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={tag.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: bg, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          {/* Color swatch */}
                          <div style={{ width: "16px", height: "16px", background: tag.color || "#888", marginRight: "14px", flexShrink: 0, borderRadius: "2px" }} />
                          {/* Name */}
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "14px", color: "#1a1a1a" }}>{tag.name}</span>
                          </div>
                          {/* Type badge */}
                          <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", background: "#e8e8e8", padding: "3px 8px", marginRight: "16px" }}>
                            {TAG_TYPES.find(t => t.value === tag.type)?.label}
                          </span>
                          {/* Actions */}
                          <div style={{ display: "flex", gap: "8px" }}>
                            {deleteConfirm === tag.id ? (
                              <>
                                <button onClick={() => { deleteTag.mutate({ id: tag.id }); setDeleteConfirm(null); }} style={iconBtnStyle("#e53e3e")}><Check size={14} /></button>
                                <button onClick={() => setDeleteConfirm(null)} style={iconBtnStyle("#888")}><X size={14} /></button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditId(tag.id);
                                    setEditForm({ name: tag.name, type: tag.type as any, color: tag.color || "#888888" });
                                    setShowForm(false);
                                  }}
                                  style={iconBtnStyle("#888")}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => setDeleteConfirm(tag.id)} style={iconBtnStyle("#e53e3e")}><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
