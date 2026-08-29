import { trpc } from "@/lib/trpc";

interface TagSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  filterType?: "city" | "experience_type" | "other";
  label?: string;
}

export default function TagSelector({ selectedIds, onChange, filterType, label = "Tags" }: TagSelectorProps) {
  const { data: allTags = [] } = trpc.admin.listTags.useQuery();
  const tags = filterType ? allTags.filter(t => t.type === filterType) : allTags;

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (tags.length === 0) return null;

  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>
        {label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {tags.map(tag => {
          const selected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              style={{
                padding: "5px 12px",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: `1px solid ${selected ? (tag.color || "#F5569B") : "#ddd"}`,
                background: selected ? (tag.color || "#F5569B") + "20" : "transparent",
                color: selected ? (tag.color || "#F5569B") : "#888",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = tag.color || "#F5569B"; e.currentTarget.style.color = tag.color || "#F5569B"; } }}
              onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#888"; } }}
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
