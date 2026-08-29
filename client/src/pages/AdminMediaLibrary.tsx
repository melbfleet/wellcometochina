import { useState, useRef, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import { trpc } from "../lib/trpc";
import ImageCropPreview from "../components/ImageCropPreview";
import { useMediaObjectPosition } from "../lib/media-position";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UploadZone({
  onUpload,
  loading,
  label = "Upload image (drag & drop or click)",
}: {
  onUpload: (file: File) => void;
  loading?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? "#F5569B" : "#ccc"}`,
        borderRadius: 8,
        padding: "18px 12px",
        textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: dragging ? "#fff0f6" : "#fafafa",
        color: "#888",
        fontSize: 13,
        transition: "all 0.2s",
        userSelect: "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {loading ? "Uploading..." : label}
    </div>
  );
}

type MediaAsset = {
  id: number;
  url: string;
  filename: string;
  source?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  assetType: "logo" | "icon" | "banner" | "cta" | "page_bg" | "general";
  isActive: boolean;
  opacity?: number | string | null;
  usageCount?: number;
  usageSources?: { label: string; url: string; table: string; column?: string }[];
  sortOrder: number;
  createdAt: Date;
};

function ImageCard({
  asset,
  onDelete,
  onReplace,
}: {
  asset: MediaAsset;
  onDelete?: (id: number) => void;
  onReplace?: (id: number, file: File) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const getObjectPosition = useMediaObjectPosition();
  const usageCount = asset.usageCount ?? (asset.sourceUrl ? 1 : 0);
  const usageSources = asset.usageSources ?? (asset.sourceUrl ? [{ label: asset.sourceLabel ?? "Linked source", url: asset.sourceUrl, table: "media_assets" }] : []);
  const isInUse = usageCount > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReplaceFile = async (file: File) => {
    if (!onReplace) return;
    setReplaceLoading(true);
    await onReplace(asset.id, file);
    setReplaceLoading(false);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ width: "100%", aspectRatio: "4/3", background: "#f2f2f2", overflow: "hidden" }}>
        <img src={asset.url} alt={asset.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", wordBreak: "break-all", lineHeight: 1.4 }}>{asset.filename}</div>
        <div style={{ fontSize: 11, color: "#888", wordBreak: "break-all", lineHeight: 1.4 }}>{asset.url}</div>
        <div>
          {isInUse ? (
            <button onClick={() => setShowUsage(!showUsage)} style={{ fontSize: 11, color: "#F5569B", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {showUsage ? "Hide usage" : `Used in ${usageCount} place${usageCount === 1 ? "" : "s"}`}
            </button>
          ) : (
            <span style={{ fontSize: 11, color: "#bbb" }}>Not in use</span>
          )}
          {showUsage && isInUse && (
            <div style={{ marginTop: 4, fontSize: 11, color: "#555", background: "#f9f9f9", borderRadius: 4, padding: "4px 8px" }}>
              {usageSources.map((usage, index) => (
                <div key={`${usage.table}-${usage.url}-${index}`} style={{ marginBottom: index === usageSources.length - 1 ? 0 : 6 }}>
                  <div style={{ fontWeight: 600 }}>{usage.label}</div>
                  <div style={{ color: "#888" }}>{usage.url}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          <button onClick={handleCopy} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: copied ? "#e8f5e9" : "#f2f2f2", color: copied ? "#388e3c" : "#555", cursor: "pointer" }}>
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: "#f2f2f2", color: "#555", cursor: "pointer" }}>
            Preview
          </button>
          {onReplace && (
            <label style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: "#f2f2f2", color: "#555", cursor: replaceLoading ? "not-allowed" : "pointer" }}>
              {replaceLoading ? "Replacing..." : "Replace"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplaceFile(f); e.target.value = ""; }} />
            </label>
          )}
          {onDelete && (
            <button
              onClick={() => { if (isInUse) { alert("This image is currently in use."); return; } if (confirm("Delete this image?")) onDelete(asset.id); }}
              title={isInUse ? "This image is currently in use." : "Delete"}
              style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid #ddd", background: "#f2f2f2", color: isInUse ? "#ccc" : "#e53935", cursor: isInUse ? "not-allowed" : "pointer" }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {previewOpen && (
        <ImageCropPreview imageUrl={asset.url} initialPosition={getObjectPosition(asset.url)} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}

function HomepageAssetsTab() {
  const utils = trpc.useUtils();
  const { data: logos = [], isLoading: logosLoading } = trpc.media.listByType.useQuery({ assetType: "logo" });
  const { data: icons = [], isLoading: iconsLoading } = trpc.media.listByType.useQuery({ assetType: "icon" });
  const { data: banners = [], isLoading: bannersLoading } = trpc.media.listByType.useQuery({ assetType: "banner" });
  const { data: ctas = [], isLoading: ctasLoading } = trpc.media.listByType.useQuery({ assetType: "cta" });
  const { data: pageBgs = [], isLoading: pageBgsLoading } = trpc.media.listByType.useQuery({ assetType: "page_bg" });

  const invalidate = () => { utils.media.listByType.invalidate(); utils.media.list.invalidate(); };

  const uploadMut = trpc.media.upload.useMutation({ onSuccess: invalidate });
  const setActiveMut = trpc.media.setActive.useMutation({ onSuccess: () => utils.media.listByType.invalidate() });
  const updateSortMut = trpc.media.updateSortOrder.useMutation({ onSuccess: () => utils.media.listByType.invalidate() });
  const updateOpacityMut = trpc.media.updateOpacity.useMutation({ onSuccess: () => utils.media.listByType.invalidate() });
  const replaceMut = trpc.media.replace.useMutation({ onSuccess: invalidate });

  const handleUpload = async (file: File, assetType: "logo" | "icon" | "banner" | "cta" | "page_bg") => {
    const base64 = await fileToBase64(file);
    const result = await uploadMut.mutateAsync({ filename: file.name, base64, mimeType: file.type || "image/jpeg", fileSize: file.size, source: assetType, assetType });
    if (assetType !== "banner" && result.id) {
      await setActiveMut.mutateAsync({ id: result.id, isActive: true, assetType });
    }
  };

  const handleReplace = async (id: number, file: File) => {
    const base64 = await fileToBase64(file);
    await replaceMut.mutateAsync({ id, filename: file.name, base64, mimeType: file.type || "image/jpeg" });
  };

  const handleReorder = (items: MediaAsset[], idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    updateSortMut.mutate({ id: items[idx].id, sortOrder: swapIdx });
    updateSortMut.mutate({ id: items[swapIdx].id, sortOrder: idx });
  };

  const sectionStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "24px 28px", marginBottom: 24 };
  const sectionTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 10 };

  return (
    <div>
      {/* Logo */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Logo</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {logosLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : logos.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No logos uploaded yet.</div> : (logos as MediaAsset[]).map((logo) => (
            <div key={logo.id} onClick={() => setActiveMut.mutate({ id: logo.id, isActive: !logo.isActive, assetType: "logo" })}
              style={{ width: 120, border: `2px solid ${logo.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: logo.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={logo.url} alt={logo.filename} style={{ width: "100%", height: 80, objectFit: "contain", padding: 8 }} />
              {logo.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{logo.filename.length > 16 ? logo.filename.slice(0, 14) + "…" : logo.filename}</div>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(f) => handleUpload(f, "logo")} loading={uploadMut.isPending} label="Upload new logo (drag & drop or click)" />
      </div>

      {/* Site Icon */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Site Icon</div>
        <p style={{ margin: "-6px 0 16px", color: "#888", fontSize: 12, lineHeight: 1.6 }}>
          Used for the browser tab and search engine favicon. A square PNG is recommended.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {iconsLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : icons.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No site icons uploaded yet.</div> : (icons as MediaAsset[]).map((icon) => (
            <div key={icon.id} onClick={() => setActiveMut.mutate({ id: icon.id, isActive: !icon.isActive, assetType: "icon" })}
              style={{ width: 120, border: `2px solid ${icon.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: icon.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={icon.url} alt={icon.filename} style={{ width: "100%", height: 80, objectFit: "contain", padding: 12 }} />
              {icon.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{icon.filename.length > 16 ? icon.filename.slice(0, 14) + "…" : icon.filename}</div>
            </div>
          ))}
        </div>
        <UploadZone onUpload={(file) => handleUpload(file, "icon")} loading={uploadMut.isPending} label="Upload site icon (drag & drop or click)" />
      </div>

      {/* Background Texture */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Background Texture Image</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {ctasLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : ctas.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No CTA backgrounds uploaded yet.</div> : (ctas as MediaAsset[]).map((cta) => (
            <div key={cta.id} onClick={() => setActiveMut.mutate({ id: cta.id, isActive: !cta.isActive, assetType: "cta" })}
              style={{ width: 160, border: `2px solid ${cta.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: cta.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={cta.url} alt={cta.filename} style={{ width: "100%", height: 90, objectFit: "cover" }} />
              {cta.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{cta.filename.length > 18 ? cta.filename.slice(0, 16) + "…" : cta.filename}</div>
            </div>
          ))}
        </div>
        {(ctas as MediaAsset[]).filter((cta) => cta.isActive).map((cta) => {
          const opacity = Number(cta.opacity ?? 28);
          return (
            <div key={`opacity-${cta.id}`} style={{ marginBottom: 16, padding: "14px 16px", border: "1px solid #f0f0f0", borderRadius: 8, background: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444" }}>Texture Opacity</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F5569B", minWidth: 44, textAlign: "right" }}>{opacity}%</div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => updateOpacityMut.mutate({ id: cta.id, opacity: Number(e.target.value) })}
                style={{ width: "100%", accentColor: "#F5569B" }}
              />
            </div>
          );
        })}
        <UploadZone onUpload={(f) => handleUpload(f, "cta")} loading={uploadMut.isPending} label="Upload new CTA background (drag & drop or click)" />
      </div>

      {/* Page Background Texture */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Page Background Texture</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {pageBgsLoading ? <div style={{ color: "#aaa", fontSize: 13 }}>Loading...</div> : pageBgs.length === 0 ? <div style={{ color: "#aaa", fontSize: 13 }}>No page background textures uploaded yet.</div> : (pageBgs as MediaAsset[]).map((pageBg) => (
            <div key={pageBg.id} onClick={() => setActiveMut.mutate({ id: pageBg.id, isActive: !pageBg.isActive, assetType: "page_bg" })}
              style={{ width: 160, border: `2px solid ${pageBg.isActive ? "#F5569B" : "#e8e8e8"}`, borderRadius: 8, overflow: "hidden", cursor: "pointer", background: pageBg.isActive ? "#fff0f6" : "#fafafa", position: "relative", transition: "all 0.2s" }}>
              <img src={pageBg.url} alt={pageBg.filename} style={{ width: "100%", height: 90, objectFit: "cover" }} />
              {pageBg.isActive && <div style={{ position: "absolute", top: 4, right: 4, background: "#F5569B", color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px" }}>Active</div>}
              <div style={{ fontSize: 10, color: "#888", padding: "4px 6px", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>{pageBg.filename.length > 18 ? pageBg.filename.slice(0, 16) + "..." : pageBg.filename}</div>
            </div>
          ))}
        </div>
        {(pageBgs as MediaAsset[]).filter((pageBg) => pageBg.isActive).map((pageBg) => {
          const opacity = Number(pageBg.opacity ?? 28);
          return (
            <div key={`page-bg-opacity-${pageBg.id}`} style={{ marginBottom: 16, padding: "14px 16px", border: "1px solid #f0f0f0", borderRadius: 8, background: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444" }}>Page Texture Opacity</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F5569B", minWidth: 44, textAlign: "right" }}>{opacity}%</div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => updateOpacityMut.mutate({ id: pageBg.id, opacity: Number(e.target.value) })}
                style={{ width: "100%", accentColor: "#F5569B" }}
              />
            </div>
          );
        })}
        <UploadZone onUpload={(f) => handleUpload(f, "page_bg")} loading={uploadMut.isPending} label="Upload new page background texture (drag & drop or click)" />
      </div>
    </div>
  );
}

function AllImagesTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const { data: assets = [], isLoading } = trpc.media.list.useQuery({ search: debouncedSearch });
  const uploadMut = trpc.media.upload.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const replaceMut = trpc.media.replace.useMutation({ onSuccess: () => utils.media.list.invalidate() });
  const deleteMut = trpc.media.delete.useMutation({ onSuccess: () => utils.media.list.invalidate(), onError: (err) => alert(err.message) });
  const batchDeleteMut = trpc.media.batchDelete.useMutation({ onSuccess: () => { utils.media.list.invalidate(); setSelectedIds(new Set()); setShowDeleteConfirm(false); }, onError: (err) => alert(err.message) });

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const handleUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    await uploadMut.mutateAsync({ filename: file.name, base64, mimeType: file.type || "image/jpeg", fileSize: file.size, source: "general", assetType: "general" });
  };

  const handleReplace = async (id: number, file: File) => {
    const base64 = await fileToBase64(file);
    await replaceMut.mutateAsync({ id, filename: file.name, base64, mimeType: file.type || "image/jpeg" });
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === assets.length && assets.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set((assets as MediaAsset[]).map(a => a.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDeleteMut.mutateAsync({ ids: Array.from(selectedIds) });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by filename or URL..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ flex: 1, padding: "8px 14px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, background: "#f2f2f2", color: "#1a1a1a", outline: "none" }}
        />
        <label style={{ padding: "8px 18px", borderRadius: 6, background: "#F5569B", color: "#fff", fontSize: 13, fontWeight: 600, cursor: uploadMut.isPending ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {uploadMut.isPending ? "Uploading..." : "+ Upload Image"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
        </label>
      </div>

      {isLoading ? (
        <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: 40 }}>Loading...</div>
      ) : assets.length === 0 ? (
        <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: 40 }}>{debouncedSearch ? "No images found." : "No images uploaded yet."}</div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
            <button
              onClick={toggleSelectAll}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: selectedIds.size === assets.length && assets.length > 0 ? "#F5569B" : "#fff",
                color: selectedIds.size === assets.length && assets.length > 0 ? "#fff" : "#333",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {selectedIds.size === assets.length && assets.length > 0 ? "Deselect All" : "Select All"}
            </button>
            {selectedIds.size > 0 && (
              <>
                <span style={{ fontSize: 13, color: "#666" }}>已选 {selectedIds.size} 张</span>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "1px solid #ff4444",
                    background: "#fff",
                    color: "#ff4444",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Delete Selected
                </button>
              </>
            )}
          </div>

          {showDeleteConfirm && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 8,
                padding: 24,
                maxWidth: 400,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px 0", color: "#1a1a1a" }}>确认删除</h2>
                <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px 0" }}>确定要删除这 {selectedIds.size} 张图片吗？此操作无法撤销。</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      background: "#fff",
                      color: "#333",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={batchDeleteMut.isPending}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: "#ff4444",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: batchDeleteMut.isPending ? "not-allowed" : "pointer",
                      opacity: batchDeleteMut.isPending ? 0.6 : 1,
                    }}
                  >
                    {batchDeleteMut.isPending ? "删除中..." : "确认删除"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {(assets as MediaAsset[]).map((asset) => (
              <div
                key={asset.id}
                style={{
                  position: "relative",
                  border: "1px solid #e8e8e8",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: selectedIds.has(asset.id) ? "#fff0f6" : "#fff",
                  boxShadow: selectedIds.has(asset.id) ? "0 0 0 2px #F5569B" : "0 0 0 0 rgba(245, 86, 155, 0)",
                  transition: "background-color 0.15s, box-shadow 0.15s",
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    width: 20,
                    height: 20,
                    background: selectedIds.has(asset.id) ? "#F5569B" : "#fff",
                    border: selectedIds.has(asset.id) ? "2px solid #F5569B" : "2px solid #ddd",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(asset.id);
                  }}
                >
                  {selectedIds.has(asset.id) && (
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>✓</span>
                  )}
                </div>

                {/* Image Card Content */}
                <div onClick={() => toggleSelect(asset.id)} style={{ cursor: "pointer" }}>
                  <ImageCard
                    asset={asset as MediaAsset}
                    onDelete={(id) => deleteMut.mutate({ id })}
                    onReplace={handleReplace}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminMediaLibrary() {
  const [activeTab, setActiveTab] = useState<"homepage" | "all">("homepage");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 22px",
    borderRadius: "6px 6px 0 0",
    border: "1px solid #e8e8e8",
    borderBottom: active ? "1px solid #fff" : "1px solid #e8e8e8",
    background: active ? "#fff" : "#f2f2f2",
    color: active ? "#F5569B" : "#888",
    fontWeight: active ? 700 : 400,
    fontSize: 13,
    cursor: "pointer",
    marginRight: 4,
    transition: "all 0.15s",
  });

  return (
    <AdminLayout>
      <div style={{ padding: "32px 36px", background: "#f2f2f2", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Media Library</h1>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: 24 }}>
          <button style={tabStyle(activeTab === "homepage")} onClick={() => setActiveTab("homepage")}>Brand Assets</button>
          <button style={tabStyle(activeTab === "all")} onClick={() => setActiveTab("all")}>All Images</button>
        </div>
        {activeTab === "homepage" ? <HomepageAssetsTab /> : <AllImagesTab />}
      </div>
    </AdminLayout>
  );
}
