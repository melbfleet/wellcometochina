import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { ArrowLeft, Plus, Trash2, GripVertical, Check, X } from "lucide-react";
import { normalizeSlug, SLUG_HELP_TEXT } from "@/lib/slug";

const ACCENT = "#F5569B";

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

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  padding: "28px",
  marginBottom: "24px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#1a1a1a",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: "1px solid #eee",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={sectionTitleStyle}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = ACCENT; }}
      onBlur={e => { e.target.style.borderColor = "#ddd"; }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: "vertical" }}
      onFocus={e => { e.target.style.borderColor = ACCENT; }}
      onBlur={e => { e.target.style.borderColor = "#ddd"; }}
    />
  );
}

export default function AdminCityEdit() {
  const params = useParams<{ id: string }>();
  const cityId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: city, isLoading } = trpc.admin.getCity.useQuery({ id: cityId }, { enabled: !!cityId });
  // 城市体验库（AdminExperiencesByCity 管理）
  const { data: cityExperiences = [] } = trpc.admin.listCityExperiences.useQuery(
    { cityId },
    { enabled: !!cityId }
  );
  // What to See and Do 展示列表（从城市体验库中选择）
  const { data: whatToSeeItems = [], refetch: refetchWhatToSee } = trpc.admin.listCityWhatToSee.useQuery(
    { cityId },
    { enabled: !!cityId }
  );

  const updateCity = trpc.admin.updateCity.useMutation({
    onSuccess: () => {
      utils.admin.listCities.invalidate();
      utils.admin.getCity.invalidate({ id: cityId });
      setSaving(false);
      setSaved(true);
      setInitialized(false); // allow form to re-sync after save
      setTimeout(() => setSaved(false), 2000);
    },
    onError: () => setSaving(false),
  });

  const addWhatToSee = trpc.admin.addCityWhatToSee.useMutation({
    onSuccess: () => refetchWhatToSee(),
  });
  const removeWhatToSee = trpc.admin.removeCityWhatToSee.useMutation({
    onSuccess: () => refetchWhatToSee(),
  });
  const updateWhatToSee = trpc.admin.updateCityWhatToSee.useMutation({
    onSuccess: () => refetchWhatToSee(),
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [deleteConfirmExp, setDeleteConfirmExp] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    coverImage: "",
    bannerTitle: "",
    cityCardImage: "",
    introductionTitle: "",
    introductionDescription: "",
    culinaryTravelLargeImage: "",
    culinaryTravelLargeTitle: "",
    culinaryTravelLargeDescription: "",
    culinaryTravelSmall1Image: "",
    culinaryTravelSmall1Title: "",
    culinaryTravelSmall1Description: "",
    culinaryTravelSmall2Image: "",
    culinaryTravelSmall2Title: "",
    culinaryTravelSmall2Description: "",
    ctaBgColor: "#a84900",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (city && !initialized) {
      setInitialized(true);
      setForm({
        name: city.name || "",
        slug: city.slug || "",
        coverImage: city.coverImage || "",
        bannerTitle: (city as any).bannerTitle || "",
        cityCardImage: (city as any).cityCardImage || "",
        introductionTitle: (city as any).introductionTitle || "",
        introductionDescription: (city as any).introductionDescription || "",
        culinaryTravelLargeImage: (city as any).culinaryTravelLargeImage || "",
        culinaryTravelLargeTitle: (city as any).culinaryTravelLargeTitle || "",
        culinaryTravelLargeDescription: (city as any).culinaryTravelLargeDescription || "",
        culinaryTravelSmall1Image: (city as any).culinaryTravelSmall1Image || "",
        culinaryTravelSmall1Title: (city as any).culinaryTravelSmall1Title || "",
        culinaryTravelSmall1Description: (city as any).culinaryTravelSmall1Description || "",
        culinaryTravelSmall2Image: (city as any).culinaryTravelSmall2Image || "",
        culinaryTravelSmall2Title: (city as any).culinaryTravelSmall2Title || "",
        culinaryTravelSmall2Description: (city as any).culinaryTravelSmall2Description || "",
        ctaBgColor: (city as any).ctaBgColor || "#a84900",
        sortOrder: city.sortOrder ?? 0,
        isActive: city.isActive,
      });
    }
  }, [city]);

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    setSaving(true);
    updateCity.mutate({ id: cityId, ...form, slug: normalizeSlug(form.slug || form.name) });
  };

  const [addExpId, setAddExpId] = useState<number | null>(null);

  const handleAddExperience = () => {
    if (!addExpId) return;
    addWhatToSee.mutate({
      cityId,
      experienceId: addExpId,
      sortOrder: whatToSeeItems.length,
    });
    setAddExpId(null);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit City">
        <div style={{ padding: "48px", textAlign: "center", color: "#888", fontSize: "13px" }}>Loading...</div>
      </AdminLayout>
    );
  }

  if (!city) {
    return (
      <AdminLayout title="Edit City">
        <div style={{ padding: "48px", textAlign: "center", color: "#888", fontSize: "13px" }}>City not found.</div>
      </AdminLayout>
    );
  }

  // What to See and Do 中已添加的体验 ID
  const addedWhatToSeeIds = new Set(whatToSeeItems.map(item => item.experienceId));
  // 可选体验：城市体验库中未添加到 What to See and Do 的体验
  const availableExps = cityExperiences.filter(ce => !addedWhatToSeeIds.has(ce.experienceId));

  return (
    <AdminLayout title={`Edit City: ${city.name}`}>
      <div style={{ padding: "32px", maxWidth: "900px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/admin/cities")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}
              onMouseEnter={e => { e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#888"; }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 style={{ fontSize: "20px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
              {city.name}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {saved && (
              <span style={{ fontSize: "12px", color: "#4caf50", letterSpacing: "0.08em" }}>✓ Saved</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 28px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                opacity: saving ? 0.6 : 1, transition: "opacity 0.18s",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── Section 1: Basic Info ── */}
        <div style={sectionStyle}>
          <SectionTitle>Basic Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <Field label="City Name *">
              <TextInput value={form.name} onChange={v => set("name", v)} placeholder="e.g. Chengdu" />
            </Field>
            <Field label="URL Slug *">
              <TextInput value={form.slug} onChange={v => set("slug", normalizeSlug(v))} placeholder="e.g. chengdu" />
              <p style={{ margin: "6px 0 0", fontSize: "11px", lineHeight: 1.5, color: "#999" }}>
                {SLUG_HELP_TEXT}
              </p>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <ImageUploader
                value={form.coverImage}
                onChange={url => set("coverImage", url)}
                category="city"
                label="Banner Background Image"
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Banner Title">
                <TextInput
                  value={form.bannerTitle}
                  onChange={v => set("bannerTitle", v)}
                  placeholder="e.g. Luxury Holidays & Honeymoons in Chengdu"
                />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <ImageUploader
                value={form.cityCardImage}
                onChange={url => set("cityCardImage", url)}
                category="city"
                label="City Card Image (shown on other city pages)"
              />
            </div>
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
        </div>

        {/* ── Section 2: Introduction ── */}
        <div style={sectionStyle}>
          <SectionTitle>Introduction</SectionTitle>
          <div style={{ display: "grid", gap: "20px" }}>
            <Field label="Section Title">
              <TextInput
                value={form.introductionTitle}
                onChange={v => set("introductionTitle", v)}
                placeholder="e.g. Why Should You Travel to Sichuan With Us?"
              />
            </Field>
            <Field label="Description">
              <TextArea
                value={form.introductionDescription}
                onChange={v => set("introductionDescription", v)}
                placeholder="Brief introduction about the city..."
                rows={5}
              />
            </Field>
          </div>
        </div>

        {/* ── Section 3: What to See and Do ── */}
        <div style={sectionStyle}>
          <SectionTitle>What to See and Do — Experience Items</SectionTitle>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "20px", lineHeight: "1.6" }}>
            Select experience items to display in the "What to See and Do" section. Minimum 3 items required. The first 3 are shown by default; additional items are revealed via "View More".
          </p>

          {/* Added experiences list */}
          {whatToSeeItems.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              {whatToSeeItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", background: idx % 2 === 0 ? "#f8f8f8" : "#f2f2f2",
                    borderBottom: "1px solid #eee", position: "relative",
                  }}
                >
                  <GripVertical size={14} color="#ccc" style={{ flexShrink: 0 }} />
                  {/* City Display Image */}
                  <div style={{ width: "56px", height: "40px", background: "#ddd", flexShrink: 0, overflow: "hidden" }}>
                    {item.cityDisplayImage ? (
                      <img src={item.cityDisplayImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "9px", color: "#aaa" }}>No img</span>
                      </div>
                    )}
                  </div>
                  {/* Title and Description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" }}>{item.experienceTitle || item.experienceName}</div>
                    <div style={{ fontSize: "11px", color: "#666", lineHeight: "1.4", marginBottom: "4px", maxHeight: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.experienceDescription}
                    </div>
                    <div style={{ fontSize: "10px", color: "#aaa" }}>
                      {idx < 3 ? "Visible" : "Hidden (View More)"}
                    </div>
                  </div>
                  {/* Delete */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {deleteConfirmExp === item.id ? (
                      <>
                        <button
                          onClick={() => { removeWhatToSee.mutate({ id: item.id }); setDeleteConfirmExp(null); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e", padding: "4px" }}
                        ><Check size={14} /></button>
                        <button
                          onClick={() => setDeleteConfirmExp(null)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: "4px" }}
                        ><X size={14} /></button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmExp(item.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e", padding: "4px", opacity: 0.6 }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; }}
                      ><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add experience */}
          {availableExps.length > 0 && (
            <div style={{ background: "#f8f8f8", padding: "16px", border: "1px dashed #ddd" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: "12px" }}>
                Add Experience Item
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={labelStyle}>Select Experience</label>
                  <select
                    value={addExpId ?? ""}
                    onChange={e => setAddExpId(parseInt(e.target.value) || null)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">-- Select --</option>
                    {availableExps.map(ce => (
                      <option key={ce.experienceId} value={ce.experienceId}>{ce.experienceTitle || ce.experienceName}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddExperience}
                  disabled={!addExpId}
                  style={{
                    padding: "9px 20px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                    background: addExpId ? ACCENT : "#ccc", color: "#fff", border: "none", cursor: addExpId ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          )}

          {whatToSeeItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "#aaa", fontSize: "13px" }}>
              No experience items added yet. Add at least 3 items.
            </div>
          )}
        </div>

        {/* ── Section 4: Culinary Travel ── */}
        <div style={sectionStyle}>
          <SectionTitle>Culinary Travel</SectionTitle>

          {/* Large card */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "12px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
              Large Card (Image Left 60% + Text Right 40%)
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <ImageUploader
                value={form.culinaryTravelLargeImage}
                onChange={url => set("culinaryTravelLargeImage", url)}
                category="city"
                label="Large Card Image"
              />
              <Field label="Title">
                <TextInput
                  value={form.culinaryTravelLargeTitle}
                  onChange={v => set("culinaryTravelLargeTitle", v)}
                  placeholder="e.g. Mapo Tofu & Chongqing Chicken"
                />
              </Field>
              <Field label="Description">
                <TextArea
                  value={form.culinaryTravelLargeDescription}
                  onChange={v => set("culinaryTravelLargeDescription", v)}
                  placeholder="Description of this culinary highlight..."
                  rows={4}
                />
              </Field>
            </div>
          </div>

          {/* Small card 1 */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "12px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
              Small Card 1 (Image Top 65% + Text Bottom 35%)
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <ImageUploader
                value={form.culinaryTravelSmall1Image}
                onChange={url => set("culinaryTravelSmall1Image", url)}
                category="city"
                label="Small Card 1 Image"
              />
              <Field label="Title">
                <TextInput
                  value={form.culinaryTravelSmall1Title}
                  onChange={v => set("culinaryTravelSmall1Title", v)}
                  placeholder="e.g. Sichuan Hot Pot"
                />
              </Field>
              <Field label="Description">
                <TextArea
                  value={form.culinaryTravelSmall1Description}
                  onChange={v => set("culinaryTravelSmall1Description", v)}
                  placeholder="Description..."
                  rows={3}
                />
              </Field>
            </div>
          </div>

          {/* Small card 2 */}
          <div>
            <div style={{ fontSize: "12px", color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
              Small Card 2 (Image Top 65% + Text Bottom 35%)
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <ImageUploader
                value={form.culinaryTravelSmall2Image}
                onChange={url => set("culinaryTravelSmall2Image", url)}
                category="city"
                label="Small Card 2 Image"
              />
              <Field label="Title">
                <TextInput
                  value={form.culinaryTravelSmall2Title}
                  onChange={v => set("culinaryTravelSmall2Title", v)}
                  placeholder="e.g. Wontons & Dumplings"
                />
              </Field>
              <Field label="Description">
                <TextArea
                  value={form.culinaryTravelSmall2Description}
                  onChange={v => set("culinaryTravelSmall2Description", v)}
                  placeholder="Description..."
                  rows={3}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Section 5: Call to Action ── */}
        <div style={sectionStyle}>
          <SectionTitle>Call to Action</SectionTitle>
          <Field label="Background Color">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="color"
                value={form.ctaBgColor}
                onChange={e => set("ctaBgColor", e.target.value)}
                style={{ width: "48px", height: "36px", border: "1px solid #ddd", cursor: "pointer", padding: "2px", background: "#f2f2f2" }}
              />
              <input
                value={form.ctaBgColor}
                onChange={e => set("ctaBgColor", e.target.value)}
                placeholder="#a84900"
                style={{ ...inputStyle, width: "140px" }}
                onFocus={e => { e.target.style.borderColor = ACCENT; }}
                onBlur={e => { e.target.style.borderColor = "#ddd"; }}
              />
              <div style={{ width: "48px", height: "36px", background: form.ctaBgColor, border: "1px solid #ddd" }} />
            </div>
          </Field>
        </div>

        {/* Save button at bottom */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", paddingTop: "8px" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 28px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
              background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
              opacity: saving ? 0.6 : 1, transition: "opacity 0.18s",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {city?.slug && (
            <button
              onClick={() => window.open(`/destinations/${city.slug}`, '_blank')}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 28px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer",
              }}
            >
              Preview City Page
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
