import { eq } from "drizzle-orm";
import {
  siteContactSettings,
  type OfficeHour,
  type SocialLink,
} from "../drizzle/schema";
import { getDb, getPool } from "./db";

export type ContactSettingsInput = {
  addressLabel: string;
  address: string;
  email: string;
  phone: string;
  phoneAvailabilityText: string;
  officeHours: OfficeHour[];
  officeHoursNote: string;
  socialLinks: SocialLink[];
};

export const DEFAULT_CONTACT_SETTINGS: ContactSettingsInput = {
  addressLabel: "Address Chengdu",
  address: "26th Floor, No. 1-2 Hangkong Road,\nWuhou District, Chengdu, Sichuan",
  email: "info@wellcometochina.com",
  phone: "+86 130 0812 2836",
  phoneAvailabilityText: "We're open at 9.00am",
  officeHours: [
    { day: "Monday", hours: "2:00pm - 5:30pm" },
    { day: "Tuesday", hours: "9:00am - 11:00pm" },
    { day: "Wednesday", hours: "9:00am - 11:00pm" },
    { day: "Thursday", hours: "9:00am - 11:00pm" },
    { day: "Friday", hours: "9:00am - 11:00pm" },
    { day: "Saturday", hours: "Closed" },
    { day: "Sunday", hours: "Closed" },
  ],
  officeHoursNote: "(excluding national holidays)",
  socialLinks: [
    { platform: "YouTube", url: "", isVisible: true },
    { platform: "TikTok", url: "", isVisible: true },
    { platform: "Instagram", url: "", isVisible: true },
    { platform: "Facebook", url: "", isVisible: true },
  ],
};

let tableReady = false;

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

async function ensureContactSettingsTable() {
  if (tableReady) return;
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS site_contact_settings (
      id int NOT NULL DEFAULT 1,
      addressLabel varchar(160) NOT NULL DEFAULT 'Address Chengdu',
      address text NOT NULL,
      email varchar(320) NOT NULL,
      phone varchar(64) NOT NULL,
      phoneAvailabilityText varchar(255) NOT NULL DEFAULT 'We''re open at 9.00am',
      officeHours json NOT NULL,
      officeHoursNote varchar(255) NOT NULL DEFAULT '(excluding national holidays)',
      socialLinks json NOT NULL,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);
  tableReady = true;
}

export async function getContactSettings() {
  const db = await getDb();
  if (!db) return { id: 1, ...DEFAULT_CONTACT_SETTINGS, updatedAt: null };
  await ensureContactSettingsTable();

  await db
    .insert(siteContactSettings)
    .values({ id: 1, ...DEFAULT_CONTACT_SETTINGS })
    .onDuplicateKeyUpdate({ set: { id: 1 } });

  const [settings] = await db
    .select()
    .from(siteContactSettings)
    .where(eq(siteContactSettings.id, 1));

  if (!settings) return { id: 1, ...DEFAULT_CONTACT_SETTINGS, updatedAt: null };
  return {
    ...settings,
    officeHours: parseJsonArray<OfficeHour>(settings.officeHours),
    socialLinks: parseJsonArray<SocialLink>(settings.socialLinks),
  };
}

export async function updateContactSettings(input: ContactSettingsInput) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await ensureContactSettingsTable();

  await db
    .insert(siteContactSettings)
    .values({ id: 1, ...input })
    .onDuplicateKeyUpdate({ set: input });

  return getContactSettings();
}
