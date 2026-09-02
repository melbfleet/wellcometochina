import { eq } from "drizzle-orm";
import { homepageSectionVisibility } from "../drizzle/schema";
import { getDb, getPool } from "./db";

export const HOMEPAGE_VISIBILITY_KEYS = [
  "plan_your_trip",
  "explore_trips",
  "why_us",
  "ready_to_start",
] as const;

export type HomepageVisibilityKey = (typeof HOMEPAGE_VISIBILITY_KEYS)[number];
export type HomepageVisibilityMap = Record<HomepageVisibilityKey, boolean>;

const DEFAULT_VISIBILITY: HomepageVisibilityMap = {
  plan_your_trip: true,
  explore_trips: true,
  why_us: true,
  ready_to_start: true,
};

let tableReady = false;

async function ensureHomepageVisibilityTable() {
  if (tableReady) return;
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS homepage_section_visibility (
      sectionKey varchar(64) NOT NULL,
      isVisible boolean NOT NULL DEFAULT true,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (sectionKey)
    )
  `);
  tableReady = true;
}

export async function getHomepageSectionVisibility(): Promise<HomepageVisibilityMap> {
  const db = await getDb();
  if (!db) return { ...DEFAULT_VISIBILITY };
  await ensureHomepageVisibilityTable();

  for (const sectionKey of HOMEPAGE_VISIBILITY_KEYS) {
    await db
      .insert(homepageSectionVisibility)
      .values({ sectionKey, isVisible: true })
      .onDuplicateKeyUpdate({ set: { sectionKey } });
  }

  const rows = await db.select().from(homepageSectionVisibility);
  const result = { ...DEFAULT_VISIBILITY };
  for (const row of rows) {
    if (HOMEPAGE_VISIBILITY_KEYS.includes(row.sectionKey as HomepageVisibilityKey)) {
      result[row.sectionKey as HomepageVisibilityKey] = Boolean(row.isVisible);
    }
  }
  return result;
}

export async function updateHomepageSectionVisibility(sectionKey: HomepageVisibilityKey, isVisible: boolean) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await ensureHomepageVisibilityTable();

  await db
    .insert(homepageSectionVisibility)
    .values({ sectionKey, isVisible })
    .onDuplicateKeyUpdate({ set: { isVisible } });

  const [updated] = await db
    .select()
    .from(homepageSectionVisibility)
    .where(eq(homepageSectionVisibility.sectionKey, sectionKey));
  return updated ?? { sectionKey, isVisible, updatedAt: null };
}
