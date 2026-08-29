import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Maximize2, Upload, X } from "lucide-react";
import ImageCropPreview from "./ImageCropPreview";
import { useMediaObjectPosition } from "@/lib/media-position";
import { prepareImageForUpload } from "@/lib/image-upload";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  category?: string;
  label?: string;
  placeholder?: string;
  compact?: boolean;
  // Media Library 引用信息（可选）
  source?: string;
  sourceId?: number;
  sourceLabel?: string;
  sourceUrl?: string;
}

export default function ImageUploader({
  value,
  onChange,
  category = "other",
  label = "Image",
  placeholder = "Paste URL or upload file",
  compact = false,
  source,
  sourceId,
  sourceLabel,
  sourceUrl,
}: ImageUploaderProps) {
  const isDark = compact;
  const [urlInput, setUrlInput] = useState(value?.startsWith("/uploads/") ? "" : (value || ""));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const getObjectPosition = useMediaObjectPosition();
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = trpc.media.upload.useMutation();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const uploadFile = await prepareImageForUpload(file);
      const result = await upload.mutateAsync({
        filename: uploadFile.filename,
        base64: uploadFile.base64,
        mimeType: uploadFile.mimeType,
        fileSize: uploadFile.fileSize,
        source: source ?? category ?? "general",
        sourceId,
        sourceLabel,
        sourceUrl,
        assetType: "general",
      });
      onChange(result.url);
      setUrlInput("");
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
  };

  const clearImage = () => {
    onChange("");
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayUrl = value || urlInput;

  const inputBg = isDark ? "#0d0d0d" : "#f2f2f2";
  const inputBorder = isDark ? "#2a2a2a" : "#ddd";
  const inputColor = isDark ? "#fff" : "#2d2d2d";
  const uploadBg = isDark ? "#0d0d0d" : "#fafafa";
  const uploadBorderColor = isDark ? "#2a2a2a" : "#ccc";
  const uploadTextColor = isDark ? "#555" : "#888";

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: isDark ? "#666" : "#888", marginBottom: "8px" }}>
          {label}
        </label>
      )}

      {/* Preview */}
      {displayUrl && (
        <div style={{ position: "relative", marginBottom: "10px", display: "inline-block" }}>
          <img
            src={displayUrl}
            alt="Preview"
            style={{ height: "100px", width: "auto", maxWidth: "200px", objectFit: "cover", background: isDark ? "#1a1a1a" : "#e8e8e8", display: "block" }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
          />
          <button
            onClick={clearImage}
            style={{
              position: "absolute", top: "4px", right: "4px",
              background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer",
              color: "#fff", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "2px",
            }}
          >
            <X size={12} />
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            title="Preview crop"
            style={{
              position: "absolute", bottom: "4px", right: "4px",
              background: "rgba(0,0,0,0.62)", border: "none", cursor: "pointer",
              color: "#fff", height: "22px", display: "flex", alignItems: "center", gap: 5,
              borderRadius: "2px", padding: "0 7px", fontSize: 11,
            }}
          >
            <Maximize2 size={12} />
            Preview
          </button>
        </div>
      )}

      {/* URL input */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="text"
          value={urlInput}
          onChange={e => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, padding: "8px 12px", fontSize: "13px",
            background: inputBg, border: `1px solid ${inputBorder}`, outline: "none",
            color: inputColor,
          }}
          onFocus={e => { e.target.style.borderColor = "#F5569B"; }}
          onBlur={e => { e.target.style.borderColor = inputBorder; }}
        />
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${uploadBorderColor}`,
          padding: "12px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: uploadTextColor,
          fontSize: "12px",
          letterSpacing: "0.05em",
          transition: "border-color 0.18s, color 0.18s",
          background: uploadBg,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5569B"; e.currentTarget.style.color = "#F5569B"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = uploadBorderColor; e.currentTarget.style.color = uploadTextColor; }}
      >
        {uploading ? (
          <span>Uploading...</span>
        ) : (
          <>
            <Upload size={14} />
            <span>Upload image (drag & drop or click)</span>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && (
        <p style={{ fontSize: "12px", color: "#e53e3e", marginTop: "6px" }}>{error}</p>
      )}

      {previewOpen && displayUrl && (
        <ImageCropPreview imageUrl={displayUrl} initialPosition={getObjectPosition(displayUrl)} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
