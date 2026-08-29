/**
 * Local Disk Storage
 *
 * 所有上传文件保存在项目根目录的 `uploads/` 文件夹下。
 * 文件通过 Express 静态服务以 `/uploads/xxx` URL 对外提供访问。
 *
 * 迁移时只需带走：
 *   1. 项目代码
 *   2. 数据库
 *   3. uploads/ 文件夹
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads 目录位于 nodejs 文件夹外（与 nodejs 同级）
// Hostinger 结构：
//   /home/u932753542/domains/morachinatravel.com/
//     ├── nodejs/          ← 项目代码
//     │   └── server/      ← __dirname 在这里
//     └── uploads/         ← 目标位置
//
// __dirname = .../nodejs/server
// 向上一级 = nodejs
// 向上两级 = morachinatravel.com
// 加上 uploads = morachinatravel.com/uploads ✅
const projectRoot = path.resolve(__dirname, "..");       // nodejs/
const domainRoot = path.resolve(projectRoot, "..");      // domain root
const configuredUploadsRoot = process.env.UPLOADS_ROOT?.trim();
export const UPLOADS_ROOT = configuredUploadsRoot
  ? path.resolve(configuredUploadsRoot)
  : path.join(domainRoot, "uploads");
console.log(`[Storage] __dirname: ${__dirname}`);
console.log(`[Storage] projectRoot: ${projectRoot}`);
console.log(`[Storage] domainRoot: ${domainRoot}`);
console.log(`[Storage] UPLOADS_ROOT: ${UPLOADS_ROOT}`);
console.log(`[Storage] UPLOADS_ROOT exists: ${fs.existsSync(UPLOADS_ROOT)}`);

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * 将文件写入本地 uploads 目录
 * @param relKey  相对路径，例如 "media/photo.jpg" 或 "banner/home.jpg"
 * @returns { key, url }  key = 相对路径, url = "/uploads/media/photo_a1b2c3d4.jpg"
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const normalized = normalizeKey(relKey);
  console.log(`[Storage.storagePut] relKey: "${relKey}", normalized: "${normalized}"`);
  const key = appendHashSuffix(normalized);
  console.log(`[Storage.storagePut] after appendHashSuffix: "${key}"`);
  const filePath = path.join(UPLOADS_ROOT, key);
  console.log(`[Storage.storagePut] filePath: "${filePath}"`);


  ensureDir(path.dirname(filePath));

  const buffer =
    typeof data === "string"
      ? Buffer.from(data, "utf-8")
      : Buffer.from(data as Uint8Array);
  
  console.log(`[Storage] Writing file: ${filePath}`);
  fs.writeFileSync(filePath, buffer);
  console.log(`[Storage] File written successfully: ${filePath} (${buffer.byteLength} bytes)`);
  console.log(`[Storage] File exists: ${fs.existsSync(filePath)}`);

  return { key, url: `/uploads/${key}` };
}

/**
 * 根据 key 获取文件的本地访问 URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/uploads/${key}` };
}

/**
 * 兼容旧接口：本地存储无需签名，直接返回 URL
 */
export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  return `/uploads/${key}`;
}

/**
 * 删除本地文件
 */
export function storageDelete(relKey: string): void {
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOADS_ROOT, key);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
