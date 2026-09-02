import { getPool } from "./db";
import { ensureWayToTravelCompanyDisplayColumns } from "./db-cms";

let linkClickTablePromise: Promise<void> | null = null;

async function ensureLinkClickTable() {
  if (linkClickTablePromise) return linkClickTablePromise;

  linkClickTablePromise = (async () => {
    const pool = await getPool();
    if (!pool) throw new Error("DB unavailable");
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS way_to_travel_link_clicks (
        detailId int NOT NULL,
        wayToTravelId int NOT NULL,
        blockTitle varchar(255) NULL,
        targetUrl varchar(512) NOT NULL,
        clickCount int NOT NULL DEFAULT 0,
        lastClickedAt timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (detailId),
        INDEX way_to_travel_link_clicks_wayToTravelId_idx (wayToTravelId),
        INDEX way_to_travel_link_clicks_clickCount_idx (clickCount)
      )
    `);
  })().catch(error => {
    linkClickTablePromise = null;
    throw error;
  });

  return linkClickTablePromise;
}

function isAllowedTargetUrl(url: string) {
  return /^\/(?![\\/])/.test(url) || /^https?:\/\//i.test(url);
}

export async function recordWayToTravelLinkClick(detailId: number) {
  await ensureWayToTravelCompanyDisplayColumns();
  await ensureLinkClickTable();
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");

  const [rows] = await pool.query(
    `SELECT
      d.id AS detailId,
      d.wayToTravelId,
      d.title AS blockTitle,
      TRIM(d.exploreUrl) AS targetUrl
    FROM way_to_travel_details d
    INNER JOIN ways_to_travel w ON w.id = d.wayToTravelId
    WHERE d.id = ?
      AND w.isCompanyDisplay = true
      AND d.exploreUrl IS NOT NULL
      AND TRIM(d.exploreUrl) <> ''
    LIMIT 1`,
    [detailId],
  );
  const link = (rows as any[])[0];
  if (!link || !isAllowedTargetUrl(link.targetUrl)) return null;

  await pool.execute(
    `INSERT INTO way_to_travel_link_clicks
      (detailId, wayToTravelId, blockTitle, targetUrl, clickCount, lastClickedAt)
    VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      wayToTravelId = VALUES(wayToTravelId),
      blockTitle = VALUES(blockTitle),
      targetUrl = VALUES(targetUrl),
      clickCount = clickCount + 1,
      lastClickedAt = CURRENT_TIMESTAMP`,
    [link.detailId, link.wayToTravelId, link.blockTitle, link.targetUrl],
  );

  return { targetUrl: link.targetUrl as string };
}

export async function getWayToTravelLinkClickStats() {
  await ensureWayToTravelCompanyDisplayColumns();
  await ensureLinkClickTable();
  const pool = await getPool();
  if (!pool) return { totalClicks: 0, links: [] };

  const [totalRows] = await pool.query(
    "SELECT COALESCE(SUM(clickCount), 0) AS totalClicks FROM way_to_travel_link_clicks",
  );
  const [linkRows] = await pool.query(`
    SELECT
      d.id AS detailId,
      w.id AS wayToTravelId,
      w.name AS wayToTravelName,
      d.title AS blockTitle,
      d.exploreUrl AS targetUrl,
      COALESCE(c.clickCount, 0) AS clickCount,
      c.lastClickedAt
    FROM way_to_travel_details d
    INNER JOIN ways_to_travel w ON w.id = d.wayToTravelId
    LEFT JOIN way_to_travel_link_clicks c ON c.detailId = d.id
    WHERE w.isCompanyDisplay = true
      AND d.exploreUrl IS NOT NULL
      AND TRIM(d.exploreUrl) <> ''
    ORDER BY clickCount DESC, w.name ASC, d.sortOrder ASC
  `);

  return {
    totalClicks: Number((totalRows as any[])[0]?.totalClicks ?? 0),
    links: (linkRows as any[]).map(row => ({
      detailId: Number(row.detailId),
      wayToTravelId: Number(row.wayToTravelId),
      wayToTravelName: String(row.wayToTravelName || ""),
      blockTitle: String(row.blockTitle || "Untitled block"),
      targetUrl: String(row.targetUrl || ""),
      clickCount: Number(row.clickCount || 0),
      lastClickedAt: row.lastClickedAt ? new Date(row.lastClickedAt) : null,
    })),
  };
}
