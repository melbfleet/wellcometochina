import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";

interface AddExperienceModalProps {
  cityId: number;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddExperienceModal({
  cityId,
  onClose,
  onAdded,
}: AddExperienceModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: availableExperiences = [], isLoading } = trpc.admin.listAvailableExperiencesForCity.useQuery(
    { cityId },
    { enabled: !!cityId }
  );

  const addMut = trpc.admin.addCityExperience.useMutation();

  const filteredExperiences = availableExperiences.filter(exp =>
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  async function handleAdd() {
    if (!selectedId) {
      toast.error("Please select an experience");
      return;
    }
    setAdding(true);
    try {
      await addMut.mutateAsync({
        cityId,
        experienceId: selectedId,
        sortOrder: 0,
      });
      toast.success("Experience added");
      onAdded();
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Error adding experience");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", border: "1px solid #eee" }}
        className="w-full max-w-2xl mx-4 p-6 rounded-sm max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: "#1a1a1a", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "24px" }}>
          Add Experience
        </h3>

        {/* Search */}
        <div style={{ marginBottom: "16px", position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "11px", color: "#888", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search experiences..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              fontSize: "13px",
              background: "#f2f2f2",
              border: "1px solid #ddd",
              outline: "none",
              color: "#2d2d2d",
              boxSizing: "border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
            onBlur={e => { e.target.style.borderColor = "#ddd"; }}
          />
        </div>

        {/* Experience List */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", border: "1px solid #eee" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#888", fontSize: "13px" }}>
              Loading experiences...
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#aaa", fontSize: "13px" }}>
              {availableExperiences.length === 0
                ? "All experiences are already added to this city"
                : "No experiences match your search"}
            </div>
          ) : (
            filteredExperiences.map(exp => (
              <div
                key={exp.id}
                onClick={() => setSelectedId(exp.id)}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  background: selectedId === exp.id ? "#f9f0f5" : "#fff",
                  transition: "background 150ms",
                }}
                onMouseEnter={e => {
                  if (selectedId !== exp.id) {
                    (e.currentTarget as HTMLElement).style.background = "#fafafa";
                  }
                }}
                onMouseLeave={e => {
                  if (selectedId !== exp.id) {
                    (e.currentTarget as HTMLElement).style.background = "#fff";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid #ddd",
                      borderRadius: "3px",
                      background: selectedId === exp.id ? "#F5569B" : "#fff",
                      borderColor: selectedId === exp.id ? "#F5569B" : "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {selectedId === exp.id && (
                      <span style={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: 500 }}>
                      {exp.name}
                    </div>
                    {exp.description && (
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {exp.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleAdd}
            disabled={!selectedId || adding}
            style={{
              flex: 1,
              padding: "10px 24px",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: selectedId && !adding ? "#F5569B" : "#ddd",
              color: "#fff",
              border: "none",
              cursor: selectedId && !adding ? "pointer" : "not-allowed",
              opacity: selectedId && !adding ? 1 : 0.5,
            }}
          >
            {adding ? "Adding..." : "Add Experience"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 24px",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "transparent",
              color: "#888",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
