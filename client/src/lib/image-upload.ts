export type UploadableImage = {
  filename: string;
  mimeType: string;
  fileSize: number;
  base64: string;
  compressed: boolean;
  originalSize: number;
};

const MAX_DIMENSION = 3000;
const WEBP_QUALITY = 0.88;
const COMPRESS_AFTER_BYTES = 1.5 * 1024 * 1024;

function replaceExtension(filename: string, extension: string) {
  const clean = filename.replace(/\.[^.]+$/, "");
  return `${clean || "image"}.${extension}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

export async function prepareImageForUpload(file: File): Promise<UploadableImage> {
  const originalSize = file.size;
  const shouldSkip = file.type === "image/gif" || file.type === "image/svg+xml" || !file.type.startsWith("image/");

  if (shouldSkip) {
    return {
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      base64: await blobToBase64(file),
      compressed: false,
      originalSize,
    };
  }

  try {
    const img = await loadImage(file);
    const sourceWidth = img.naturalWidth || img.width;
    const sourceHeight = img.naturalHeight || img.height;
    const longestSide = Math.max(sourceWidth, sourceHeight);
    const shouldResize = longestSide > MAX_DIMENSION;
    const shouldCompress = shouldResize || file.size > COMPRESS_AFTER_BYTES;

    if (!shouldCompress) {
      return {
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        base64: await blobToBase64(file),
        compressed: false,
        originalSize,
      };
    }

    const scale = shouldResize ? MAX_DIMENSION / longestSide : 1;
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Could not prepare image canvas");
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const webpBlob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
    if (!webpBlob || webpBlob.size >= file.size) {
      return {
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        base64: await blobToBase64(file),
        compressed: false,
        originalSize,
      };
    }

    return {
      filename: replaceExtension(file.name, "webp"),
      mimeType: "image/webp",
      fileSize: webpBlob.size,
      base64: await blobToBase64(webpBlob),
      compressed: true,
      originalSize,
    };
  } catch {
    return {
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      base64: await blobToBase64(file),
      compressed: false,
      originalSize,
    };
  }
}
