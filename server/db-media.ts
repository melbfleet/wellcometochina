import { getDb, getPool } from "./db";
import { mediaAssets } from "../drizzle/schema";
import { eq, like, or, desc, and } from "drizzle-orm";

type MediaAssetType = "logo" | "icon" | "banner" | "cta" | "page_bg" | "general";
type BrandAssetType = Exclude<MediaAssetType, "general">;

type MediaUsage = {
  label: string;
  url: string;
  table: string;
  column?: string;
};

const usageTables = [
  { table: "cities", label: "City", title: "name", route: (row: any) => `/destinations/${row.slug ?? row.id}`, columns: ["coverImage", "cityCardImage", "culinaryTravelLargeImage", "culinaryTravelSmall1Image", "culinaryTravelSmall2Image"] },
  { table: "experience_types", label: "Experience Type", title: "name", route: (row: any) => `/experiences/${row.slug ?? row.id}`, columns: ["coverImage"] },
  { table: "experiences", label: "Experience", title: "name", route: (row: any) => `/experiences/${row.slug ?? row.id}`, columns: ["gallery", "recommendationImage", "cityDisplayImage"] },
  { table: "experience_details", label: "Experience Detail", title: "id", route: (row: any) => `/admin/experiences/edit/${row.experienceId}`, columns: ["imageUrl"] },
  { table: "team_members", label: "Team Member", title: "name", route: (row: any) => `/about/our-team`, columns: ["image", "storyImage", "storyImage2"] },
  { table: "itineraries", label: "Itinerary", title: "name", route: (row: any) => `/itineraries/${row.slug ?? row.id}`, columns: ["bannerImage", "coverImage", "sections"] },
  { table: "stories", label: "Story", title: "title", route: (row: any) => `/stories/${row.slug ?? row.id}`, columns: ["coverImage"] },
  { table: "videos", label: "Video", title: "title", route: (row: any) => `/videos/${row.slug ?? row.id}`, columns: ["coverImage"] },
  { table: "homepage_hero", label: "Homepage Hero", title: "title", route: () => "/", columns: ["backgroundImage"] },
  { table: "homepage_stories", label: "Homepage Story", title: "name", route: () => "/", columns: ["image"] },
  { table: "homepage_sponsors", label: "Homepage Sponsor", title: "name", route: () => "/", columns: ["logo", "logoUrls", "backgroundTexture"] },
  { table: "why_us_sections", label: "Why Us", title: "title", route: () => "/about/why-us", columns: ["image"] },
];

// ─── 新增媒体资产 ──────────────────────────────────────────────────────────────
export async function createMediaAsset(data: {
  url: string;
  storageKey?: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  source?: string;
  sourceId?: number;
  sourceLabel?: string;
  sourceUrl?: string;
  assetType?: MediaAssetType;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const pool = await getPool();
  if (!pool) return null;
  // Use raw mysql2 pool to execute parameterized SQL directly
  const [result] = await pool.execute(
    `INSERT INTO media_assets (url, storageKey, filename, mimeType, fileSize, source, sourceId, sourceLabel, sourceUrl, assetType, isActive, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.url,
      data.storageKey ?? null,
      data.filename,
      data.mimeType ?? null,
      data.fileSize ?? null,
      data.source ?? "general",
      data.sourceId ?? null,
      data.sourceLabel ?? null,
      data.sourceUrl ?? null,
      data.assetType ?? "general",
      data.isActive !== false ? 1 : 0,
      data.sortOrder ?? 0,
    ]
  ) as any;
  return { insertId: result?.insertId ?? null };
}

async function ensureMediaObjectPositionColumn(pool: any) {
  if (await mediaHasColumn(pool, "objectPosition")) return;
  try {
    await pool.execute("ALTER TABLE media_assets ADD COLUMN objectPosition varchar(32) DEFAULT '50% 50%'");
  } catch (error: any) {
    if (!String(error?.message ?? "").includes("Duplicate column")) throw error;
  }
}

// ─── 查询所有媒体资产（支持搜索）──────────────────────────────────────────────
export async function listMediaAssets(search?: string, assetType?: MediaAssetType) {
  const pool = await getPool();
  if (pool) await ensureMediaObjectPositionColumn(pool);
  const db = await getDb();
  if (!db) return [];
  const filters = [];
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    filters.push(or(like(mediaAssets.filename, q), like(mediaAssets.url, q)));
  }
  if (assetType) {
    filters.push(eq(mediaAssets.assetType, assetType));
  }

  const assets = await db
    .select()
    .from(mediaAssets)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(mediaAssets.createdAt));
  return Promise.all(assets.map(async (asset) => {
    const usageSources = await findMediaAssetUsages(asset);
    const primaryUsage = usageSources[0];
    return {
      ...asset,
      usageCount: usageSources.length,
      usageSources,
      sourceLabel: asset.sourceLabel ?? primaryUsage?.label ?? null,
      sourceUrl: asset.sourceUrl ?? primaryUsage?.url ?? null,
    };
  }));
}

async function getExistingColumns(pool: any, table: string) {
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
    return new Set((columns as any[]).map(column => column.Field));
  } catch {
    return new Set<string>();
  }
}

function getUrlNeedles(asset: { url: string; storageKey?: string | null }) {
  const values = new Set<string>();
  if (asset.url) {
    values.add(asset.url);
    try {
      const parsed = new URL(asset.url);
      values.add(parsed.pathname);
    } catch {
      // Relative URLs are expected for local uploads.
    }
  }
  if (asset.storageKey) {
    values.add(asset.storageKey);
    values.add(`/uploads/${asset.storageKey.replace(/^\/+/, "")}`);
  }
  const filename = asset.url?.split("/").pop();
  if (filename) values.add(filename);
  return Array.from(values).filter(Boolean);
}

export async function findMediaAssetUsages(asset: { url: string; storageKey?: string | null; assetType?: string; isActive?: boolean | number | null; sourceLabel?: string | null; sourceUrl?: string | null }) {
  const pool = await getPool();
  if (!pool) return [];
  const usages: MediaUsage[] = [];
  const urlNeedles = getUrlNeedles(asset);

  if (asset.sourceUrl) {
    usages.push({ label: asset.sourceLabel ?? "Linked source", url: asset.sourceUrl, table: "media_assets" });
  }

  if (asset.assetType && asset.assetType !== "general" && !!asset.isActive) {
    usages.push({ label: `Active ${asset.assetType} asset`, url: "/admin/media-library", table: "media_assets", column: "isActive" });
  }

  for (const spec of usageTables) {
    const existingColumns = await getExistingColumns(pool, spec.table);
    const searchableColumns = spec.columns.filter(column => existingColumns.has(column));
    if (searchableColumns.length === 0) continue;

    const titleColumn = existingColumns.has(spec.title) ? spec.title : "id";
    const slugSelect = existingColumns.has("slug") ? "slug" : "NULL AS slug";
    const experienceIdSelect = existingColumns.has("experienceId") ? "experienceId" : "NULL AS experienceId";
    for (const column of searchableColumns) {
      const where = urlNeedles.map(() => `\`${column}\` LIKE ?`).join(" OR ");
      const params = urlNeedles.map(needle => `%${needle}%`);
      if (params.length === 0) continue;
      const [rows] = await pool.execute(
        `SELECT id, \`${titleColumn}\` AS usageTitle, ${slugSelect}, ${experienceIdSelect} FROM \`${spec.table}\` WHERE ${where} LIMIT 20`,
        params
      );

      for (const row of rows as any[]) {
        const title = row.usageTitle ? String(row.usageTitle) : `#${row.id}`;
        usages.push({
          label: `${spec.label}: ${title}`,
          url: spec.route(row),
          table: spec.table,
          column,
        });
      }
    }
  }

  const seen = new Set<string>();
  return usages.filter(usage => {
    const key = `${usage.table}:${usage.column ?? ""}:${usage.label}:${usage.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── 查询 Homepage Assets（按类型）──────────────────────────────────────────
export async function listHomepageAssets(assetType: BrandAssetType) {
  const pool = await getPool();
  if (!pool) return [];
  const opacitySelect = await mediaOpacitySelect(pool);
  const [rows] = await pool.query(
    `SELECT *, ${opacitySelect} FROM media_assets WHERE assetType = ? ORDER BY sortOrder`,
    [assetType]
  );
  return rows as any[];
}

// ─── 获取当前激活的 Homepage Asset ──────────────────────────────────────────
export async function getActiveHomepageAsset(assetType: "logo" | "icon" | "cta" | "page_bg") {
  const pool = await getPool();
  if (!pool) return null;
  const opacitySelect = await mediaOpacitySelect(pool);
  const [rows] = await pool.query(
    `SELECT *, ${opacitySelect} FROM media_assets WHERE assetType = ? AND isActive = true ORDER BY createdAt DESC LIMIT 1`,
    [assetType]
  );
  return (rows as any[])[0] ?? null;
}

// ─── 获取激活的 Banner 列表 ──────────────────────────────────────────────────
export async function getActiveBanners() {
  const pool = await getPool();
  if (!pool) return [];
  const opacitySelect = await mediaOpacitySelect(pool);
  const [rows] = await pool.query(
    `SELECT *, ${opacitySelect} FROM media_assets WHERE assetType = 'banner' AND isActive = true ORDER BY sortOrder`
  );
  return rows as any[];
}

async function mediaHasColumn(pool: any, columnName: string) {
  const [columns] = await pool.query("SHOW COLUMNS FROM media_assets");
  return (columns as any[]).some((column) => column.Field === columnName);
}

async function mediaOpacitySelect(pool: any) {
  return (await mediaHasColumn(pool, "opacity")) ? "opacity" : "28 as opacity";
}

// ─── 设置激活状态（Logo/CTA：单选；Banner：多选）────────────────────────────
export async function setAssetActive(id: number, isActive: boolean, assetType: BrandAssetType) {
  const db = await getDb();
  if (!db) return;
  if (assetType !== "banner" && isActive) {
    await db
      .update(mediaAssets)
      .set({ isActive: false })
      .where(eq(mediaAssets.assetType, assetType));
  }
  await db.update(mediaAssets).set({ isActive }).where(eq(mediaAssets.id, id));
}

// ─── 更新排序 ────────────────────────────────────────────────────────────────
export async function updateAssetSortOrder(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(mediaAssets).set({ sortOrder }).where(eq(mediaAssets.id, id));
}

export async function updateAssetOpacity(id: number, opacity: number) {
  const pool = await getPool();
  if (!pool) return { saved: false };
  if (!(await mediaHasColumn(pool, "opacity"))) return { saved: false };
  const clamped = Math.max(0, Math.min(100, Math.round(opacity)));
  await pool.execute("UPDATE media_assets SET opacity = ? WHERE id = ?", [clamped, id]);
  return { saved: true, opacity: clamped };
}

// ─── 替换图片（保持 URL 不变，更新 storageKey）──────────────────────────────
function isValidObjectPosition(position: string) {
  return /^([0-9]|[1-9][0-9]|100)%\s+([0-9]|[1-9][0-9]|100)%$/.test(position.trim());
}

function filenameFromUrl(url: string) {
  const clean = url.split("?")[0].split("#")[0];
  return clean.split("/").filter(Boolean).pop() || "external-image";
}

export async function updateAssetObjectPositionByUrl(url: string, objectPosition: string) {
  const pool = await getPool();
  if (!pool) return { saved: false };
  await ensureMediaObjectPositionColumn(pool);
  const position = objectPosition.trim();
  if (!isValidObjectPosition(position)) return { saved: false };
  const needles = getUrlNeedles({ url });
  if (needles.length === 0) return { saved: false };
  const where = needles.map(() => "`url` LIKE ? OR `storageKey` LIKE ?").join(" OR ");
  const params = needles.flatMap(needle => [`%${needle}%`, `%${needle}%`]);
  const [result] = await pool.execute(
    `UPDATE media_assets SET objectPosition = ? WHERE ${where}`,
    [position, ...params]
  ) as any;
  if (Number(result?.affectedRows ?? 0) > 0) {
    return { saved: true, objectPosition: position };
  }

  await pool.execute(
    `INSERT INTO media_assets (url, storageKey, filename, mimeType, fileSize, source, sourceId, sourceLabel, sourceUrl, assetType, isActive, sortOrder, objectPosition)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      url,
      url.startsWith("/uploads/") ? url.replace(/^\/uploads\/+/, "") : null,
      filenameFromUrl(url),
      null,
      null,
      "general",
      null,
      "Crop settings",
      null,
      "general",
      0,
      0,
      position,
    ]
  );
  return { saved: true, objectPosition: position };
}

export async function listMediaObjectPositions() {
  const pool = await getPool();
  if (!pool) return [];
  await ensureMediaObjectPositionColumn(pool);
  const [rows] = await pool.query(
    "SELECT url, storageKey, objectPosition FROM media_assets WHERE objectPosition IS NOT NULL AND objectPosition <> '50% 50%'"
  );
  return rows as Array<{ url: string; storageKey?: string | null; objectPosition: string | null }>;
}

export async function replaceMediaAsset(id: number, newUrl: string, newStorageKey: string, newFilename: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(mediaAssets).set({
    url: newUrl,
    storageKey: newStorageKey,
    filename: newFilename,
  }).where(eq(mediaAssets.id, id));
}

// ─── 删除媒体资产（检查引用）────────────────────────────────────────────────
export async function deleteMediaAsset(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
}

// ─── 获取单个资产 ────────────────────────────────────────────────────────────
export async function getMediaAsset(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return rows[0] ?? null;
}

// ─── 更新引用信息 ────────────────────────────────────────────────────────────
export async function updateMediaAssetRef(id: number, data: {
  sourceId?: number;
  sourceLabel?: string;
  sourceUrl?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(mediaAssets).set(data).where(eq(mediaAssets.id, id));
}
