import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { UPLOADS_ROOT } from "../storage.js";
import { backfillEntityTags } from "../db-cms";
import { getActiveHomepageAsset } from "../db-media";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve the CMS-selected site icon from stable URLs that browsers and
  // search engines request before the React application has loaded.
  app.get(["/favicon.ico", "/apple-touch-icon.png", "/apple-touch-icon-precomposed.png"], async (_req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    try {
      const icon = await getActiveHomepageAsset("icon");
      if (!icon?.url) return res.status(204).end();
      const rawVersion = new Date(icon.updatedAt || icon.createdAt || Date.now()).getTime();
      const version = Number.isFinite(rawVersion) ? rawVersion : icon.id;
      const separator = icon.url.includes("?") ? "&" : "?";
      return res.redirect(302, `${icon.url}${separator}v=${version}`);
    } catch (error) {
      console.error("[Site Icon] Failed to load active icon:", error);
      return res.status(204).end();
    }
  });

  try {
    const { created } = await backfillEntityTags();
    if (created > 0) console.log(`[Startup] Created ${created} missing entity tag(s)`);
  } catch (err) {
    console.error(`[Startup] Warning: Could not backfill entity tags: ${err}`);
  }

  // ── Ensure uploads directory exists on startup ────────────────────────────
  // Hostinger does not create this directory automatically.
  // uploads/ is in .gitignore so it must be created at runtime.
  // Use UPLOADS_ROOT from storage.ts to ensure consistency
  const uploadsRoot = UPLOADS_ROOT;
  const uploadSubDirs = ["images", "media", "banners"];
  try {
    if (!fs.existsSync(uploadsRoot)) {
      fs.mkdirSync(uploadsRoot, { recursive: true });
      console.log(`[Startup] Created uploads directory: ${uploadsRoot}`);
    }
    for (const sub of uploadSubDirs) {
      const subDir = path.join(uploadsRoot, sub);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
    }
  } catch (err) {
    console.error(`[Startup] Warning: Could not create uploads directory: ${err}`);
    console.error(`[Startup] Image uploads may fail. Check server write permissions.`);
  }

  // ── Auto-create symlink: public_html/uploads → uploads/ ─────────────────
  // On Hostinger, Apache serves /uploads/ from public_html/uploads.
  // We create a symlink at startup so it always points to UPLOADS_ROOT.
  try {
    const publicHtmlDir = path.resolve(process.cwd(), "..", "public_html");
    const symlinkPath = path.join(publicHtmlDir, "uploads");
    if (fs.existsSync(publicHtmlDir)) {
      const existingPath = (() => { try { return fs.lstatSync(symlinkPath); } catch { return null; } })();
      if (existingPath?.isSymbolicLink()) {
        fs.unlinkSync(symlinkPath);
      }
      if (!existingPath || existingPath.isSymbolicLink()) {
        fs.symlinkSync(uploadsRoot, symlinkPath);
        console.log(`[Startup] Symlink created: ${symlinkPath} -> ${uploadsRoot}`);
      } else {
        console.log(`[Startup] Existing public_html/uploads directory preserved: ${symlinkPath}`);
      }
    }
  } catch (err) {
    console.log(`[Startup] Symlink note: ${err}`);
  }

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // OAuth routes removed - using admin password login only

  // Serve pre-generated static pages from static-cache/ with priority over SPA
  // Admin and API routes always bypass this and use dynamic handling
  const staticCacheDir = path.resolve(process.cwd(), "static-cache");
  app.use((req, res, next) => {
    if (req.path.startsWith("/admin") || req.path.startsWith("/api") || req.path.startsWith("/manus-storage") || req.path.startsWith("/uploads")) {
      return next();
    }
    const routePath = req.path === "/" ? "/index.html" : `${req.path.replace(/\/$/, "")}/index.html`;
    const filePath = path.join(staticCacheDir, routePath);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    next();
  });

  // Serve uploaded files from the uploads/ directory
  console.log(`[Startup] cwd: ${process.cwd()}`);
  console.log(`[Startup] uploadsRoot: ${uploadsRoot}`);
  console.log(`[Startup] uploads exists: ${fs.existsSync(uploadsRoot)}`);
  
  // Debug middleware for /uploads requests
  app.use("/uploads", (req, res, next) => {
    const requestedFile = path.join(uploadsRoot, req.path);
    console.log(`[/uploads] Request: ${req.path}, Full path: ${requestedFile}, Exists: ${fs.existsSync(requestedFile)}`);
    next();
  });
  
  app.use("/uploads", express.static(uploadsRoot, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
    index: false,  // 禁用 index.html 自动查找
    redirect: false,  // 禁用目录重定向
  }));

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
