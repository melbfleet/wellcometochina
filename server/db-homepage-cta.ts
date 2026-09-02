import { eq } from "drizzle-orm";
import { homepageCtaSettings } from "../drizzle/schema";
import { getDb, getPool } from "./db";

export const DEFAULT_HOMEPAGE_CTA = {
  id: 1,
  title: "So, ready to start?",
  buttonText: "Get in Touch",
};

let tableReady = false;

async function ensureHomepageCtaTable() {
  if (tableReady) return;
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS homepage_cta_settings (
      id int NOT NULL DEFAULT 1,
      title varchar(255) NOT NULL DEFAULT 'So, ready to start?',
      buttonText varchar(100) NOT NULL DEFAULT 'Get in Touch',
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);
  tableReady = true;
}

export async function getHomepageCtaSettings() {
  const db = await getDb();
  if (!db) return { ...DEFAULT_HOMEPAGE_CTA, updatedAt: null };
  await ensureHomepageCtaTable();

  await db
    .insert(homepageCtaSettings)
    .values(DEFAULT_HOMEPAGE_CTA)
    .onDuplicateKeyUpdate({ set: { id: 1 } });

  const [row] = await db
    .select()
    .from(homepageCtaSettings)
    .where(eq(homepageCtaSettings.id, 1));
  return row ?? { ...DEFAULT_HOMEPAGE_CTA, updatedAt: null };
}

export async function updateHomepageCtaSettings(data: {
  title: string;
  buttonText: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await ensureHomepageCtaTable();

  await db
    .insert(homepageCtaSettings)
    .values({ id: 1, ...data })
    .onDuplicateKeyUpdate({ set: data });

  return getHomepageCtaSettings();
}
