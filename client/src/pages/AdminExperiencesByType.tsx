import { useState } from "react";
import { useLocation, useParams } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ArrowLeft, ArrowRight, GripVertical } from "lucide-react";

// ─── New Experience Modal ─────────────────────────────────────────────────────
function NewExperienceModal({
  typeId,
  onClose,
  onSaved,
}: {
  typeId: number;
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const createMut = trpc.admin.createExperience.useMutation();

  async function handleSave() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const result = await createMut.mutateAsync({
        name: name.trim(),
        typeId,
        isActive: true,
        sortOrder: 0,
        ctaBgColor: "#1a1a1a",
      });
      toast.success("Experience created");
      onSaved(result.id);
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Error saving");
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
        className="w-full max-w-sm mx-4 p-6 rounded-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: "#1a1a1a", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "24px" }}>
          New Experience
        </h3>
        <div>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            placeholder="e.g. Tea Mountain Hike"
            autoFocus
            style={{ width: "100%", padding: "9px 12px", fontSize: "13px", background: "#f2f2f2", border: "1px solid #ddd", outline: "none", color: "#2d2d2d", boxSizing: "border-box" }}
            onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: "10px 24px", fontSize: "12px", letterSpacing: "0.1em",
              textTransform: "uppercase", background: "#F5569B", color: "#fff",
              border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Creating..." : "Create & Edit"}
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
export default function AdminExperiencesByType() {
  const params = useParams<{ typeId: string }>();
  const typeId = parseInt(params.typeId ?? "0");
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [draggedExperienceId, setDraggedExperienceId] = useState<number | null>(null);

  const { data: type } = trpc.admin.getExperienceType.useQuery({ id: typeId }, { enabled: !!typeId });
  const { data: experiences = [], refetch, isLoading } = trpc.admin.listExperiencesByType.useQuery({ typeId }, { enabled: !!typeId });
  const deleteMut = trpc.admin.deleteExperience.useMutation();
  const reorderMut = trpc.admin.reorderExperience.useMutation();

  async function handleDelete(id: number) {
    try {
      await deleteMut.mutateAsync({ id });
      toast.success("Experience deleted");
      setDeleteConfirm(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Error deleting");
    }
  }

  async function handleExperienceDrop(targetId: number) {
    if (!draggedExperienceId || draggedExperienceId === targetId) {
      setDraggedExperienceId(null);
      return;
    }
    const fromIndex = experiences.findIndex(e => e.id === draggedExperienceId);
    const toIndex = experiences.findIndex(e => e.id === targetId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggedExperienceId(null);
      return;
    }
    const next = [...experiences];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    try {
      await Promise.all(next.map((experience, index) => reorderMut.mutateAsync({ id: experience.id, sortOrder: index })));
      refetch();
    } finally {
      setDraggedExperienceId(null);
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/admin/experiences")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            color: "#888", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={13} />
          Back to Experience Types
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
              {type?.name ?? "Loading..."}
            </h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
              {experiences.length} experience{experiences.length !== 1 ? "s" : ""} in this type
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
            }}
          >
            <Plus size={14} />
            New Experience
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : experiences.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", border: "1px dashed #ddd", color: "#aaa" }}>
            <p style={{ fontSize: "13px" }}>No experiences in this type yet.</p>
            <p style={{ fontSize: "12px", marginTop: "4px", color: "#ccc" }}>Click "New Experience" to add one.</p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #eee" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", background: "#e8e8e8", borderBottom: "1px solid #d8d8d8" }}>
              <span style={{ width: "48px" }} />
              <span style={{ flex: 1, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Experience Name</span>
              <span style={{ width: "80px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", textAlign: "center" }}>Status</span>
              <span style={{ width: "100px" }} />
            </div>

            {experiences.map((exp, idx) => (
              <div
                key={exp.id}
                draggable
                onDragStart={e => {
                  setDraggedExperienceId(exp.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(exp.id));
                }}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={e => {
                  e.preventDefault();
                  handleExperienceDrop(exp.id);
                }}
                onDragEnd={() => setDraggedExperienceId(null)}
                style={{
                  display: "flex", alignItems: "center", padding: "14px 20px",
                  background: idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  cursor: "grab",
                  opacity: draggedExperienceId === exp.id ? 0.55 : 1,
                  outline: draggedExperienceId === exp.id ? "2px solid #F5569B" : "none",
                  outlineOffset: -2,
                }}
              >
                {/* Drag handle */}
                <div title="Drag to reorder" style={{ width: "48px", display: "flex", alignItems: "center", color: "#aaa", flexShrink: 0 }}>
                  <GripVertical size={15} />
                </div>

                {/* Name — click to edit */}
                <button
                  onClick={() => navigate(`/admin/experiences/edit/${exp.id}`)}
                  style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div>
                    <span style={{ fontSize: "14px", color: "#1a1a1a", display: "block" }}>{exp.name}</span>
                    {exp.description && (
                      <span style={{ fontSize: "11px", color: "#aaa" }}>{exp.description}</span>
                    )}
                  </div>
                  <ArrowRight size={13} style={{ color: "#bbb", marginLeft: "auto", flexShrink: 0 }} />
                </button>

                {/* Status badge */}
                <div style={{ width: "80px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: exp.isActive ? "#4caf50" : "#aaa", letterSpacing: "0.05em" }}>
                    {exp.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ width: "100px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    onClick={() => navigate(`/admin/experiences/edit/${exp.id}`)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px" }}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === exp.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#F5569B", fontSize: "12px" }}>Confirm?</span>
                      <button
                        onClick={() => handleDelete(exp.id)}
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
                      onClick={() => setDeleteConfirm(exp.id)}
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

      {showModal && (
        <NewExperienceModal
          typeId={typeId}
          onClose={() => setShowModal(false)}
          onSaved={id => navigate(`/admin/experiences/edit/${id}`)}
        />
      )}
    </AdminLayout>
  );
}
