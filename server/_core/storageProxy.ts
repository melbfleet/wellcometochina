import type { Express } from "express";
import path from "path";
import fs from "fs";
import { ENV } from "./env";
import { UPLOADS_ROOT } from "../storage";

export function registerStorageProxy(app: Express) {
  // 本地文件存储路由
  app.get("/uploads/*", (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing file key");
      return;
    }

    // 构建本地文件路径
    const uploadsDir = path.resolve(UPLOADS_ROOT);
    const filePath = path.resolve(uploadsDir, key);

    // 安全检查：防止路径遍历攻击
    if (filePath !== uploadsDir && !filePath.startsWith(`${uploadsDir}${path.sep}`)) {
      res.status(403).send("Access denied");
      return;
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      res.status(404).send("File not found");
      return;
    }

    // 发送文件
    res.set("Cache-Control", "public, max-age=31536000");
    res.sendFile(filePath);
  });

  // 保留 manus-storage 代理以支持云存储（如果需要）
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
