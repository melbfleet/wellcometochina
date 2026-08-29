import { useState } from "react";
import { useLocation, useParams } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import AddExperienceModal from "@/components/AddExperienceModal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, ArrowLeft, ArrowRight } from "lucide-react";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminExperiencesByCity() {
  const params = useParams<{ cityId: string }>();
  const cityId = parseInt(params.cityId ?? "0");
  const [, navigate] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: city } = trpc.admin.getCityById.useQuery({ id: cityId }, { enabled: !!cityId });
  const { data: cityExperiences = [], refetch, isLoading } = trpc.admin.listCityExperiences.useQuery(
    { cityId },
    { enabled: !!cityId }
  );
  const deleteMut = trpc.admin.removeCityExperience.useMutation();
  const reorderMut = trpc.admin.updateCityExperience.useMutation();

  async function handleDelete(id: number) {
    try {
      await deleteMut.mutateAsync({ id });
      toast.success("Experience removed");
      setDeleteConfirm(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Error removing");
    }
  }

  async function handleReorder(id: number, direction: "up" | "down") {
    const idx = cityExperiences.findIndex(e => e.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= cityExperiences.length) return;
    const current = cityExperiences[idx];
    const swap = cityExperiences[swapIdx];
    await reorderMut.mutateAsync({ id: current.id, sortOrder: swap.sortOrder ?? swapIdx });
    await reorderMut.mutateAsync({ id: swap.id, sortOrder: current.sortOrder ?? idx });
    refetch();
  }

  return (
    <AdminLayout>
      <div style={{ padding: "32px" }}>
        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/admin/cities")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            color: "#888", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          <ArrowLeft size={13} />
          Back to Cities
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
              {city?.name ?? "Loading..."} — Experiences
            </h1>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
              {cityExperiences.length} experience{cityExperiences.length !== 1 ? "s" : ""} in this city
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: "#F5569B", color: "#fff", border: "none", cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Add Experience
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#888", fontSize: "13px" }}>Loading...</div>
        ) : cityExperiences.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", border: "1px dashed #ddd", color: "#aaa" }}>
            <p style={{ fontSize: "13px" }}>No experiences in this city yet.</p>
            <p style={{ fontSize: "12px", marginTop: "4px", color: "#ccc" }}>Click "Add Experience" to select from existing experiences.</p>
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

            {cityExperiences.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: "flex", alignItems: "center", padding: "14px 20px",
                  background: idx % 2 === 0 ? "#f2f2f2" : "#e8e8e8",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                {/* Reorder */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginRight: "12px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleReorder(item.id, "up")}
                    disabled={idx === 0}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: "2px", opacity: idx === 0 ? 0.2 : 1 }}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleReorder(item.id, "down")}
                    disabled={idx === cityExperiences.length - 1}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: "2px", opacity: idx === cityExperiences.length - 1 ? 0.2 : 1 }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Name — click to edit */}
                <button
                  onClick={() => navigate(`/admin/experiences/edit/${item.experienceId}`)}
                  style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div>
                    <span style={{ fontSize: "14px", color: "#1a1a1a", display: "block" }}>{item.experienceName}</span>
                    {item.experienceDescription && (
                      <span style={{ fontSize: "11px", color: "#aaa" }}>{item.experienceDescription}</span>
                    )}
                  </div>
                  <ArrowRight size={13} style={{ color: "#bbb", marginLeft: "auto", flexShrink: 0 }} />
                </button>

                {/* Status badge */}
                <div style={{ width: "80px", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "#4caf50", letterSpacing: "0.05em" }}>
                    Active
                  </span>
                </div>

                {/* Actions */}
                <div style={{ width: "100px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    onClick={() => navigate(`/admin/experiences/edit/${item.experienceId}`)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "4px" }}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === item.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#F5569B", fontSize: "12px" }}>Confirm?</span>
                      <button
                        onClick={() => handleDelete(item.id)}
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
                      onClick={() => setDeleteConfirm(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e", padding: "4px", opacity: 0.7 }}
                      title="Remove"
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

      {showAddModal && (
        <AddExperienceModal
          cityId={cityId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => refetch()}
        />
      )}
    </AdminLayout>
  );
}
