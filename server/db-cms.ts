import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { getDb, getPool } from "./db";
import {
  cities, tags, experiences, experienceTags, experienceTypes, experienceDetails, experienceLabels,
  wayToTravelTypes, waysToTravel, wayToTravelDetails, wayToTravelLabels,
  teamMembers, itineraries, itineraryTags, stories, storyTags,
  videos, videoTags, images, cityExperiences, cityWhatToSee,
  homepageHero, homepageIntro, homepageStories, homepageSponsors, homepageStorySections,
  aboutSections, whyUsSections,
  type InsertCity, type InsertTag, type InsertExperience, type InsertExperienceType,
  type InsertWayToTravelType, type InsertWayToTravel, type InsertWayToTravelDetail,
  type InsertExperienceDetail, type InsertTeamMember,
  type InsertItinerary, type InsertStory, type InsertVideo, type InsertImage,
  type InsertCityExperience, type InsertCityWhatToSee,
  type HomepageHero, type HomepageIntro, type HomepageStory, type HomepageSponsor,
  type HomepageStorySection,
  type InsertHomepageStory, type InsertHomepageSponsor, type InsertHomepageStorySection,
  type AboutSection, type InsertAboutSection,
  type WhyUsSection, type InsertWhyUsSection,
} from "../drizzle/schema";

// ─── Slug helper ─────────────────────────────────────────────────────────────
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export async function listTags() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(tags).orderBy(tags.type, tags.name);
}

export async function createTag(data: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(tags).values(data);
  return { id: (result as any).insertId };
}

export async function updateTag(id: number, data: Partial<InsertTag>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tags).set(data).where(eq(tags.id, id));
}

export async function deleteTag(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tags).where(eq(tags.id, id));
}

type AutoTagType = "city" | "experience_type" | "other";

function normalizedTagKey(name: string): string {
  const trimmed = name.trim();
  return toSlug(trimmed) || trimmed.toLowerCase();
}

async function ensureEntityTags(entries: Array<{ name: string; type: AutoTagType }>) {
  const db = await getDb();
  if (!db) return { created: 0 };

  const existingTags = await db.select({ name: tags.name }).from(tags);
  const existingKeys = new Set(existingTags.map(tag => normalizedTagKey(tag.name)));
  let created = 0;

  for (const entry of entries) {
    const name = entry.name.trim();
    const key = normalizedTagKey(name);
    if (!name || !key || existingKeys.has(key)) continue;

    await db.insert(tags).values({ name, type: entry.type, color: "#888888" });
    existingKeys.add(key);
    created += 1;
  }

  return { created };
}

export async function backfillEntityTags() {
  const db = await getDb();
  if (!db) return { created: 0 };

  const [cityRows, experienceTypeRows, wayToTravelTypeRows] = await Promise.all([
    db.select({ name: cities.name }).from(cities),
    db.select({ name: experienceTypes.name }).from(experienceTypes),
    db.select({ name: wayToTravelTypes.name }).from(wayToTravelTypes),
  ]);

  return ensureEntityTags([
    ...cityRows.map(row => ({ name: row.name, type: "city" as const })),
    ...experienceTypeRows.map(row => ({ name: row.name, type: "experience_type" as const })),
    ...wayToTravelTypeRows.map(row => ({ name: row.name, type: "other" as const })),
  ]);
}

// ─── Cities ───────────────────────────────────────────────────────────────────
let editableCtaColumnsPromise: Promise<void> | null = null;

export async function ensureEditableCtaColumns() {
  if (editableCtaColumnsPromise) return editableCtaColumnsPromise;
  editableCtaColumnsPromise = (async () => {
    const pool = await getPool();
    if (!pool) throw new Error("DB unavailable");
    for (const tableName of ["cities", "experiences", "ways_to_travel"]) {
      const columns = await getTableColumns(pool, tableName);
      const additions = [
        ["ctaTitle", "varchar(255) NULL DEFAULT 'So, ready to start?'"],
        ["ctaButtonText", "varchar(100) NULL DEFAULT 'Get in Touch'"],
      ] as const;
      for (const [column, definition] of additions) {
        if (!columns.has(column)) {
          await pool.execute(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${column}\` ${definition}`);
        }
      }
    }
  })().catch(error => {
    editableCtaColumnsPromise = null;
    throw error;
  });
  return editableCtaColumnsPromise;
}

export async function listCities(includeInactive = false) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return [];
  const cityRows = includeInactive
    ? await db.select().from(cities).orderBy(cities.sortOrder, cities.name)
    : await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(cities.sortOrder, cities.name);
  const counts = await db
    .select({
      cityId: cityExperiences.cityId,
      experienceCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(cityExperiences)
    .groupBy(cityExperiences.cityId);
  const countByCity = new Map(counts.map(row => [row.cityId, row.experienceCount]));
  return cityRows.map(city => ({
    ...city,
    experienceCount: countByCity.get(city.id) ?? 0,
  }));
}

export async function listCitiesWithExperiences() {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return [];

  // Get all cities in one query
  const cityList = await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(cities.sortOrder, cities.name);
  if (cityList.length === 0) return [];

  // Get all city-experience links in one JOIN query
  const allLinks = await db
    .select({
      cityId: cityExperiences.cityId,
      sortOrder: cityExperiences.sortOrder,
      id: experiences.id,
      name: experiences.name,
      title: experiences.title,
      slug: experiences.slug,
      typeId: experiences.typeId,
      typeName: experienceTypes.name,
    })
    .from(cityExperiences)
    .leftJoin(experiences, eq(cityExperiences.experienceId, experiences.id))
    .leftJoin(experienceTypes, eq(experiences.typeId, experienceTypes.id))
    .orderBy(cityExperiences.cityId, cityExperiences.sortOrder);

  // Group experiences by cityId
  const expsByCityId = new Map<number, typeof allLinks>();
  for (const link of allLinks) {
    if (!link.cityId) continue;
    if (!expsByCityId.has(link.cityId)) expsByCityId.set(link.cityId, []);
    expsByCityId.get(link.cityId)!.push(link);
  }

  return cityList.map(city => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    coverImage: city.coverImage,
    cityCardImage: city.cityCardImage,
    experiences: expsByCityId.get(city.id) || [],
  }));
}

export async function getCityBySlug(slug: string) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getCityById(id: number) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cities).where(eq(cities.id, id)).limit(1);
  
  if (rows.length === 0) return null;
  
  const city = rows[0];
  
  // Ensure required fields have default values if missing
  const hasChanges = !city.bannerTitle || !city.introductionTitle || !city.introductionDescription;
  
  if (hasChanges) {
    const updates: Partial<InsertCity> = {};
    if (!city.bannerTitle) {
      updates.bannerTitle = `Luxury Holidays & Honeymoons in ${city.name}`;
    }
    if (!city.introductionTitle) {
      updates.introductionTitle = `Why Should You Travel to ${city.name} With Us?`;
    }
    if (!city.introductionDescription) {
      updates.introductionDescription = "";
    }
    
    // Update with defaults
    await db.update(cities).set({ ...updates, updatedAt: new Date() }).where(eq(cities.id, id));
    
    // Return updated record
    const updatedRows = await db.select().from(cities).where(eq(cities.id, id)).limit(1);
    return updatedRows[0] ?? null;
  }
  
  return city;
}

export async function createCity(data: Omit<InsertCity, "slug"> & { slug?: string }) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(cities).values({ ...data, slug });
  await ensureEntityTags([{ name: data.name, type: "city" }]);
  return { id: (result as any).insertId, slug };
}

export async function updateCity(id: number, data: Partial<InsertCity>) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cities).set({ ...data, updatedAt: new Date() }).where(eq(cities.id, id));
}

export async function deleteCity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cityExperiences).where(eq(cityExperiences.cityId, id));
  await db.delete(cities).where(eq(cities.id, id));
}

export async function reorderCity(id: number, newSortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cities).set({ sortOrder: newSortOrder }).where(eq(cities.id, id));
}

// ─── City Experiences (城市与体验项目的关联) ────────────────────────────────────────────────────────────────
export async function listCityExperiences(cityId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: cityExperiences.id,
      cityId: cityExperiences.cityId,
      experienceId: cityExperiences.experienceId,
      displayImage: cityExperiences.displayImage,
      sortOrder: cityExperiences.sortOrder,
      experienceName: experiences.name,
      experienceTitle: experiences.title,
      experienceSlug: experiences.slug,
      experienceDescription: experiences.description,
    })
    .from(cityExperiences)
    .leftJoin(experiences, eq(cityExperiences.experienceId, experiences.id))
    .where(eq(cityExperiences.cityId, cityId))
    .orderBy(cityExperiences.sortOrder);
  return rows;
}

export async function addCityExperience(data: InsertCityExperience) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(cityExperiences).values(data);
  return { id: (result as any).insertId };
}

export async function updateCityExperience(id: number, data: Partial<InsertCityExperience>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cityExperiences).set(data).where(eq(cityExperiences.id, id));
}

export async function removeCityExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cityExperiences).where(eq(cityExperiences.id, id));
}

// ─── City What to See and Do ──────────────────────────────────────────────────────
export async function listCityWhatToSee(cityId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: cityWhatToSee.id,
      cityId: cityWhatToSee.cityId,
      experienceId: cityWhatToSee.experienceId,
      sortOrder: cityWhatToSee.sortOrder,
      experienceName: experiences.name,
      experienceTitle: experiences.title,
      experienceSlug: experiences.slug,
      experienceDescription: experiences.description,
      cityDisplayImage: experiences.cityDisplayImage,
      experienceTypeName: experienceTypes.name,
    })
    .from(cityWhatToSee)
    .leftJoin(experiences, eq(cityWhatToSee.experienceId, experiences.id))
    .leftJoin(experienceTypes, eq(experiences.typeId, experienceTypes.id))
    .where(eq(cityWhatToSee.cityId, cityId))
    .orderBy(cityWhatToSee.sortOrder);
  return rows;
}

export async function addCityWhatToSee(data: InsertCityWhatToSee) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(cityWhatToSee).values(data);
  return { id: (result as any).insertId };
}

export async function updateCityWhatToSee(id: number, data: Partial<InsertCityWhatToSee>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cityWhatToSee).set(data).where(eq(cityWhatToSee.id, id));
}

export async function removeCityWhatToSee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cityWhatToSee).where(eq(cityWhatToSee.id, id));
}

// ─── Experience Types (第一层) ────────────────────────────────────────────────
export async function listExperienceTypes() {
  const db = await getDb();
  if (!db) return [];
  const types = await db.select().from(experienceTypes).orderBy(experienceTypes.sortOrder, experienceTypes.name);
  const counts = await db
    .select({
      typeId: experiences.typeId,
      experienceCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(experiences)
    .groupBy(experiences.typeId);
  const countByType = new Map(counts.map(row => [row.typeId, row.experienceCount]));
  return types.map(type => ({
    ...type,
    experienceCount: countByType.get(type.id) ?? 0,
  }));
}

export async function getExperienceTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(experienceTypes).where(eq(experienceTypes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createExperienceType(data: Omit<InsertExperienceType, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(experienceTypes).values(data);
  await ensureEntityTags([{ name: data.name, type: "experience_type" }]);
  return { id: (result as any).insertId };
}

export async function updateExperienceType(id: number, data: Partial<InsertExperienceType>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experienceTypes).set({ ...data, updatedAt: new Date() }).where(eq(experienceTypes.id, id));
}

export async function deleteExperienceType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Delete all experiences under this type first
  const exps = await db.select({ id: experiences.id }).from(experiences).where(eq(experiences.typeId, id));
  for (const exp of exps) {
    await deleteExperience(exp.id);
  }
  await db.delete(experienceTypes).where(eq(experienceTypes.id, id));
}

export async function reorderExperienceType(id: number, newSortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experienceTypes).set({ sortOrder: newSortOrder }).where(eq(experienceTypes.id, id));
}

// 导航用：返回所有类型（按 sortOrder 排序）及其激活的子体验
export async function listExperienceTypesWithNav() {
  const db = await getDb();
  if (!db) return [];
  const types = await db.select().from(experienceTypes).orderBy(experienceTypes.sortOrder, experienceTypes.name);
  const result = await Promise.all(
    types.map(async (type) => {
      const items = await db!
        .select({
          id: experiences.id,
          name: experiences.name,
          title: experiences.title,
          slug: experiences.slug,
          gallery: experiences.gallery,
          recommendationImage: experiences.recommendationImage,
          recommendationTitle: experiences.recommendationTitle,
          cityDisplayImage: experiences.cityDisplayImage,
        })
        .from(experiences)
        .where(and(eq(experiences.typeId, type.id), eq(experiences.isActive, true)))
        .orderBy(experiences.sortOrder, experiences.name);
      return {
        id: type.id,
        name: type.name,
        coverImage: type.coverImage,
        items,
      };
    })
  );
  return result;
}

// ─── Experiences (第二层) ─────────────────────────────────────────────────────
export async function listExperiences(includeInactive = false) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return await db.select().from(experiences).where(eq(experiences.isActive, true)).orderBy(experiences.sortOrder, experiences.name);
  }
  return await db.select().from(experiences).orderBy(experiences.sortOrder, experiences.name);
}

export async function listExperiencesByType(typeId: number) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experiences).where(eq(experiences.typeId, typeId)).orderBy(experiences.sortOrder, experiences.name);
}

export async function listExperiencesByCity(cityId: number) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experiences).where(eq(experiences.cityId, cityId)).orderBy(experiences.sortOrder, experiences.name);
}

export async function getExperienceById(id: number) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getExperienceBySlug(slug: string) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(experiences).where(eq(experiences.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getExperienceTagIds(experienceId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(experienceTags).where(eq(experienceTags.experienceId, experienceId));
  return rows.map(r => r.tagId);
}

export async function createExperience(data: Omit<InsertExperience, "slug"> & { slug?: string }, tagIds: number[] = []) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(experiences).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(experienceTags).values(tagIds.map(tagId => ({ experienceId: id, tagId })));
  }
  return { id, slug };
}

export async function updateExperience(id: number, data: Partial<InsertExperience>, tagIds?: number[]) {
  await ensureEditableCtaColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experiences).set({ ...data, updatedAt: new Date() }).where(eq(experiences.id, id));
  if (tagIds !== undefined) {
    await db.delete(experienceTags).where(eq(experienceTags.experienceId, id));
    if (tagIds.length > 0) {
      await db.insert(experienceTags).values(tagIds.map(tagId => ({ experienceId: id, tagId })));
    }
  }
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceTags).where(eq(experienceTags.experienceId, id));
  await db.delete(experienceLabels).where(eq(experienceLabels.experienceId, id));
  await db.delete(experienceDetails).where(eq(experienceDetails.experienceId, id));
  await db.delete(experiences).where(eq(experiences.id, id));
}

export async function reorderExperience(id: number, newSortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experiences).set({ sortOrder: newSortOrder }).where(eq(experiences.id, id));
}

// ─── Experience Details (详情模块) ────────────────────────────────────────────
export async function listExperienceDetails(experienceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experienceDetails)
    .where(eq(experienceDetails.experienceId, experienceId))
    .orderBy(experienceDetails.sortOrder);
}

export async function createExperienceDetail(data: InsertExperienceDetail) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(experienceDetails).values(data);
  return { id: (result as any).insertId };
}

export async function updateExperienceDetail(id: number, data: Partial<InsertExperienceDetail>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experienceDetails).set(data).where(eq(experienceDetails.id, id));
}

export async function deleteExperienceDetail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceDetails).where(eq(experienceDetails.id, id));
}

export async function replaceExperienceDetails(experienceId: number, details: Array<{ title?: string; description?: string; imageUrl?: string; sortOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceDetails).where(eq(experienceDetails.experienceId, experienceId));
  if (details.length > 0) {
    await db.insert(experienceDetails).values(details.map(d => ({
      experienceId,
      title: d.title ?? null,
      description: d.description ?? null,
      imageUrl: d.imageUrl ?? null,
      sortOrder: d.sortOrder,
    })));
  }
}

// ─── Experience Labels (自由字符串标签，用于相似推荐) ─────────────────────────
export async function getExperienceLabels(experienceId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(experienceLabels).where(eq(experienceLabels.experienceId, experienceId));
  return rows.map(r => r.label);
}

export async function replaceExperienceLabels(experienceId: number, labels: string[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceLabels).where(eq(experienceLabels.experienceId, experienceId));
  if (labels.length > 0) {
    const uniqueSet = new Set(labels.map(l => l.trim()).filter(Boolean));
    const unique = Array.from(uniqueSet);
    await db.insert(experienceLabels).values(unique.map(label => ({ experienceId, label })));
  }
}

// ─── Recommendations (基于自由标签匹配) ──────────────────────────────────────
export async function getRecommendedExperiences(experienceId: number, limit = 8) {
  const db = await getDb();
  if (!db) return [];
  // Get current experience's labels
  const currentLabels = await getExperienceLabels(experienceId);
  if (currentLabels.length === 0) {
    // No labels: return latest active experiences (excluding current)
    const results = await db.select().from(experiences)
      .where(and(eq(experiences.isActive, true), sql`${experiences.id} != ${experienceId}`))
      .orderBy(desc(experiences.createdAt))
      .limit(limit);
    // Add typeName for each experience
    return Promise.all(results.map(async (exp) => {
      if (!exp.typeId) return exp;
      const type = await getExperienceTypeById(exp.typeId);
      return { ...exp, typeName: type?.name || '' };
    }));
  }
  // Find all experiences sharing at least one label
  const allActive = await db.select().from(experiences)
    .where(and(eq(experiences.isActive, true), sql`${experiences.id} != ${experienceId}`));
  const scored: Array<{ exp: typeof allActive[0]; score: number }> = [];
  for (const exp of allActive) {
    const expLabels = await getExperienceLabels(exp.id);
    const shared = expLabels.filter(l => currentLabels.includes(l)).length;
    if (shared > 0) scored.push({ exp, score: shared });
  }
  scored.sort((a, b) => b.score - a.score);
  // Add typeName for each experience
  return Promise.all(scored.slice(0, limit).map(async (s) => {
    if (!s.exp.typeId) return s.exp;
    const type = await getExperienceTypeById(s.exp.typeId);
    return { ...s.exp, typeName: type?.name || '' };
  }));
}

// ─── Way to Travel ──────────────────────────────────────────────────────────
let wayToTravelCompanyColumnsPromise: Promise<void> | null = null;

export async function ensureWayToTravelCompanyDisplayColumns() {
  await ensureEditableCtaColumns();
  if (wayToTravelCompanyColumnsPromise) return wayToTravelCompanyColumnsPromise;

  wayToTravelCompanyColumnsPromise = (async () => {
    const pool = await getPool();
    if (!pool) throw new Error("DB unavailable");

    const [itemColumns] = await pool.query("SHOW COLUMNS FROM `ways_to_travel`");
    const itemColumnNames = new Set((itemColumns as any[]).map(column => column.Field));
    if (!itemColumnNames.has("isCompanyDisplay")) {
      await pool.execute("ALTER TABLE `ways_to_travel` ADD COLUMN `isCompanyDisplay` boolean NOT NULL DEFAULT false AFTER `recommendationDescription`");
    }

    const [detailColumns] = await pool.query("SHOW COLUMNS FROM `way_to_travel_details`");
    const detailColumnNames = new Set((detailColumns as any[]).map(column => column.Field));
    if (!detailColumnNames.has("exploreUrl")) {
      await pool.execute("ALTER TABLE `way_to_travel_details` ADD COLUMN `exploreUrl` varchar(512) NULL AFTER `imageUrl`");
    }
  })().catch(error => {
    wayToTravelCompanyColumnsPromise = null;
    throw error;
  });

  return wayToTravelCompanyColumnsPromise;
}

export async function listWayToTravelTypes() {
  const db = await getDb();
  if (!db) return [];
  const types = await db.select().from(wayToTravelTypes).orderBy(wayToTravelTypes.sortOrder, wayToTravelTypes.name);
  const counts = await db
    .select({
      typeId: waysToTravel.typeId,
      itemCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(waysToTravel)
    .groupBy(waysToTravel.typeId);
  const countByType = new Map(counts.map(row => [row.typeId, row.itemCount]));
  return types.map(type => ({ ...type, itemCount: countByType.get(type.id) ?? 0 }));
}

export async function getWayToTravelTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(wayToTravelTypes).where(eq(wayToTravelTypes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createWayToTravelType(data: Omit<InsertWayToTravelType, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(wayToTravelTypes).values(data);
  await ensureEntityTags([{ name: data.name, type: "other" }]);
  return { id: (result as any).insertId };
}

export async function updateWayToTravelType(id: number, data: Partial<InsertWayToTravelType>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(wayToTravelTypes).set({ ...data, updatedAt: new Date() }).where(eq(wayToTravelTypes.id, id));
}

export async function deleteWayToTravelType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const items = await db.select({ id: waysToTravel.id }).from(waysToTravel).where(eq(waysToTravel.typeId, id));
  for (const item of items) await deleteWayToTravel(item.id);
  await db.delete(wayToTravelTypes).where(eq(wayToTravelTypes.id, id));
}

export async function reorderWayToTravelType(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(wayToTravelTypes).set({ sortOrder }).where(eq(wayToTravelTypes.id, id));
}

export async function listWayToTravelTypesWithNav() {
  const db = await getDb();
  if (!db) return [];
  const types = await db.select().from(wayToTravelTypes).orderBy(wayToTravelTypes.sortOrder, wayToTravelTypes.name);
  return Promise.all(types.map(async type => {
    const items = await db!
      .select({
        id: waysToTravel.id,
        name: waysToTravel.name,
        title: waysToTravel.title,
        slug: waysToTravel.slug,
        gallery: waysToTravel.gallery,
        recommendationImage: waysToTravel.recommendationImage,
        recommendationTitle: waysToTravel.recommendationTitle,
      })
      .from(waysToTravel)
      .where(and(eq(waysToTravel.typeId, type.id), eq(waysToTravel.isActive, true)))
      .orderBy(waysToTravel.sortOrder, waysToTravel.name);
    return { id: type.id, name: type.name, slug: type.slug, coverImage: type.coverImage, items };
  }));
}

export async function listWaysToTravel(includeInactive = false) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) return [];
  return includeInactive
    ? db.select().from(waysToTravel).orderBy(waysToTravel.sortOrder, waysToTravel.name)
    : db.select().from(waysToTravel).where(eq(waysToTravel.isActive, true)).orderBy(waysToTravel.sortOrder, waysToTravel.name);
}

export async function listWaysToTravelByType(typeId: number) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waysToTravel).where(eq(waysToTravel.typeId, typeId)).orderBy(waysToTravel.sortOrder, waysToTravel.name);
}

export async function getWayToTravelById(id: number) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(waysToTravel).where(eq(waysToTravel.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getWayToTravelBySlug(slug: string) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(waysToTravel).where(eq(waysToTravel.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createWayToTravel(data: Omit<InsertWayToTravel, "slug"> & { slug?: string }) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(waysToTravel).values({ ...data, slug });
  return { id: (result as any).insertId, slug };
}

export async function updateWayToTravel(id: number, data: Partial<InsertWayToTravel>) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(waysToTravel).set({ ...data, updatedAt: new Date() }).where(eq(waysToTravel.id, id));
}

export async function deleteWayToTravel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(wayToTravelLabels).where(eq(wayToTravelLabels.wayToTravelId, id));
  await db.delete(wayToTravelDetails).where(eq(wayToTravelDetails.wayToTravelId, id));
  await db.delete(waysToTravel).where(eq(waysToTravel.id, id));
}

export async function reorderWayToTravel(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(waysToTravel).set({ sortOrder }).where(eq(waysToTravel.id, id));
}

export async function listWayToTravelDetails(wayToTravelId: number) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wayToTravelDetails)
    .where(eq(wayToTravelDetails.wayToTravelId, wayToTravelId))
    .orderBy(wayToTravelDetails.sortOrder);
}

export async function replaceWayToTravelDetails(
  wayToTravelId: number,
  details: Array<{ id?: number; title?: string; description?: string; imageUrl?: string; exploreUrl?: string; sortOrder: number }>,
) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select({ id: wayToTravelDetails.id })
    .from(wayToTravelDetails)
    .where(eq(wayToTravelDetails.wayToTravelId, wayToTravelId));
  const existingIds = new Set(existing.map(detail => detail.id));
  const retainedIds = new Set<number>();

  for (const detail of details) {
    const values = {
      title: detail.title ?? null,
      description: detail.description ?? null,
      imageUrl: detail.imageUrl ?? null,
      exploreUrl: detail.exploreUrl ?? null,
      sortOrder: detail.sortOrder,
    };

    if (detail.id && existingIds.has(detail.id)) {
      retainedIds.add(detail.id);
      await db
        .update(wayToTravelDetails)
        .set(values)
        .where(and(
          eq(wayToTravelDetails.id, detail.id),
          eq(wayToTravelDetails.wayToTravelId, wayToTravelId),
        ));
    } else {
      await db.insert(wayToTravelDetails).values({
        wayToTravelId,
        ...values,
      } satisfies InsertWayToTravelDetail);
    }
  }

  const removedIds = existing.filter(detail => !retainedIds.has(detail.id)).map(detail => detail.id);
  if (removedIds.length > 0) {
    await db
      .delete(wayToTravelDetails)
      .where(and(
        eq(wayToTravelDetails.wayToTravelId, wayToTravelId),
        inArray(wayToTravelDetails.id, removedIds),
      ));
  }
}

export async function getWayToTravelLabels(wayToTravelId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(wayToTravelLabels).where(eq(wayToTravelLabels.wayToTravelId, wayToTravelId));
  return rows.map(row => row.label);
}

export async function replaceWayToTravelLabels(wayToTravelId: number, labels: string[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(wayToTravelLabels).where(eq(wayToTravelLabels.wayToTravelId, wayToTravelId));
  const unique = Array.from(new Set(labels.map(label => label.trim()).filter(Boolean)));
  if (unique.length > 0) {
    await db.insert(wayToTravelLabels).values(unique.map(label => ({ wayToTravelId, label })));
  }
}

export async function getRecommendedWaysToTravel(wayToTravelId: number, limit = 8) {
  await ensureWayToTravelCompanyDisplayColumns();
  const db = await getDb();
  if (!db) return [];
  const currentLabels = await getWayToTravelLabels(wayToTravelId);
  const allActive = await db.select().from(waysToTravel)
    .where(and(eq(waysToTravel.isActive, true), sql`${waysToTravel.id} != ${wayToTravelId}`));

  const scored = await Promise.all(allActive.map(async item => ({
    item,
    score: (await getWayToTravelLabels(item.id)).filter(label => currentLabels.includes(label)).length,
  })));
  const candidates = currentLabels.length > 0
    ? scored.filter(candidate => candidate.score > 0).sort((a, b) => b.score - a.score)
    : scored.sort((a, b) => b.item.createdAt.getTime() - a.item.createdAt.getTime());

  return Promise.all(candidates.slice(0, limit).map(async ({ item }) => {
    if (!item.typeId) return item;
    const type = await getWayToTravelTypeById(item.typeId);
    return { ...item, typeName: type?.name || "", typeSlug: type?.slug || "" };
  }));
}

// ─── Team Members ─────────────────────────────────────────────────────────────
export async function listTeamMembers(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return await db.select().from(teamMembers).where(eq(teamMembers.isActive, true)).orderBy(teamMembers.sortOrder, teamMembers.name);
  }
  return await db.select().from(teamMembers).orderBy(teamMembers.sortOrder, teamMembers.name);
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(teamMembers).values(data);
  return { id: (result as any).insertId };
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(teamMembers).set({ ...data, updatedAt: new Date() }).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ─── Itineraries ──────────────────────────────────────────────────────────────
export async function listItineraries(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return await db.select().from(itineraries).where(eq(itineraries.isActive, true)).orderBy(itineraries.sortOrder, itineraries.name);
  }
  return await db.select().from(itineraries).orderBy(itineraries.sortOrder, itineraries.name);
}

export async function listItinerariesByCityTag(cityName: string, citySlug: string) {
  const db = await getDb();
  if (!db) return [];
  const normalizedName = cityName.trim().toLowerCase();
  const normalizedSlug = citySlug.trim().toLowerCase();
  if (!normalizedName && !normalizedSlug) return [];

  const rows = await db
    .select({ itinerary: itineraries })
    .from(itineraries)
    .innerJoin(itineraryTags, eq(itineraries.id, itineraryTags.itineraryId))
    .innerJoin(tags, eq(itineraryTags.tagId, tags.id))
    .where(and(
      eq(itineraries.isActive, true),
      sql`LOWER(${tags.name}) IN (${normalizedName}, ${normalizedSlug})`
    ))
    .orderBy(itineraries.sortOrder, itineraries.name);

  const seen = new Set<number>();
  return rows
    .map(row => row.itinerary)
    .filter(itinerary => {
      if (seen.has(itinerary.id)) return false;
      seen.add(itinerary.id);
      return true;
    });
}

export async function getItineraryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(itineraries).where(eq(itineraries.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getItineraryTagIds(itineraryId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(itineraryTags).where(eq(itineraryTags.itineraryId, itineraryId));
  return rows.map(r => r.tagId);
}

export async function createItinerary(data: Omit<InsertItinerary, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(itineraries).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(itineraryTags).values(tagIds.map(tagId => ({ itineraryId: id, tagId })));
  }
  return { id, slug };
}

export async function updateItinerary(id: number, data: Partial<InsertItinerary>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const updateData = { ...data, updatedAt: new Date() };
  // Ensure sections is properly serialized as JSON
  if (updateData.sections !== undefined) {
    console.log('[updateItinerary] sections before stringify:', updateData.sections);
    updateData.sections = JSON.stringify(updateData.sections);
    console.log('[updateItinerary] sections after stringify:', updateData.sections);
  }
  console.log('[updateItinerary] updateData keys:', Object.keys(updateData));
  await db.update(itineraries).set(updateData).where(eq(itineraries.id, id));
  console.log('[updateItinerary] update completed for id:', id);
  if (tagIds !== undefined) {
    await db.delete(itineraryTags).where(eq(itineraryTags.itineraryId, id));
    if (tagIds.length > 0) {
      await db.insert(itineraryTags).values(tagIds.map(tagId => ({ itineraryId: id, tagId })));
    }
  }
}

export async function deleteItinerary(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(itineraryTags).where(eq(itineraryTags.itineraryId, id));
  await db.delete(itineraries).where(eq(itineraries.id, id));
}

export async function reorderItinerary(id: number, sortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(itineraries).set({ sortOrder }).where(eq(itineraries.id, id));
}

// ─── Stories ──────────────────────────────────────────────────────────────────
export async function listStories(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return await db.select().from(stories).where(eq(stories.isActive, true)).orderBy(stories.sortOrder, desc(stories.createdAt));
  }
  return await db.select().from(stories).orderBy(stories.sortOrder, desc(stories.createdAt));
}

export async function getStoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(stories).where(eq(stories.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getStoryTagIds(storyId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(storyTags).where(eq(storyTags.storyId, storyId));
  return rows.map(r => r.tagId);
}

export async function createStory(data: Omit<InsertStory, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.title);
  const [result] = await db.insert(stories).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(storyTags).values(tagIds.map(tagId => ({ storyId: id, tagId })));
  }
  return { id, slug };
}

export async function updateStory(id: number, data: Partial<InsertStory>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(stories).set({ ...data, updatedAt: new Date() }).where(eq(stories.id, id));
  if (tagIds !== undefined) {
    await db.delete(storyTags).where(eq(storyTags.storyId, id));
    if (tagIds.length > 0) {
      await db.insert(storyTags).values(tagIds.map(tagId => ({ storyId: id, tagId })));
    }
  }
}

export async function deleteStory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(storyTags).where(eq(storyTags.storyId, id));
  await db.delete(stories).where(eq(stories.id, id));
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export async function listVideos(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return await db.select().from(videos).where(eq(videos.isActive, true)).orderBy(videos.sortOrder, desc(videos.createdAt));
  }
  return await db.select().from(videos).orderBy(videos.sortOrder, desc(videos.createdAt));
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getVideoTagIds(videoId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(videoTags).where(eq(videoTags.videoId, videoId));
  return rows.map(r => r.tagId);
}

export async function createVideo(data: Omit<InsertVideo, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.title);
  const [result] = await db.insert(videos).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(videoTags).values(tagIds.map(tagId => ({ videoId: id, tagId })));
  }
  return { id, slug };
}

export async function updateVideo(id: number, data: Partial<InsertVideo>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(videos).set({ ...data, updatedAt: new Date() }).where(eq(videos.id, id));
  if (tagIds !== undefined) {
    await db.delete(videoTags).where(eq(videoTags.videoId, id));
    if (tagIds.length > 0) {
      await db.insert(videoTags).values(tagIds.map(tagId => ({ videoId: id, tagId })));
    }
  }
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(videoTags).where(eq(videoTags.videoId, id));
  await db.delete(videos).where(eq(videos.id, id));
}

// ─── Images ───────────────────────────────────────────────────────────────────
export async function listImages(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return await db.select().from(images).where(eq(images.category, category)).orderBy(desc(images.createdAt));
  }
  return await db.select().from(images).orderBy(desc(images.createdAt));
}

export async function createImageRecord(data: InsertImage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(images).values(data);
  return { id: (result as any).insertId };
}

export async function deleteImageRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const rows = await db.select().from(images).where(eq(images.id, id)).limit(1);
  await db.delete(images).where(eq(images.id, id));
  return rows[0] ?? null;
}

// ─── Homepage Management ──────────────────────────────────────────────────────

// Hero
export async function getHomepageHero() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(homepageHero).limit(1);
  if (rows.length > 0) return rows[0];
  
  // Auto-create default record if missing
  const defaultData = {
    isVisible: true,
    backgroundImage: null,
    title: "The Immersive China Experts",
    subtitle: "Tailor-made experiences, crafted with local insight.",
  };
  await db.insert(homepageHero).values(defaultData);
  const newRows = await db.select().from(homepageHero).limit(1);
  return newRows[0] ?? null;
}
export async function upsertHomepageHero(data: Partial<HomepageHero>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(homepageHero).limit(1);
  if (existing.length === 0) {
    await db.insert(homepageHero).values({
      isVisible: data.isVisible ?? true,
      backgroundImage: data.backgroundImage ?? null,
      title: data.title ?? "The Immersive China Experts",
      subtitle: data.subtitle ?? "Tailor-made experiences, crafted with local insight.",
    });
  } else {
    await db.update(homepageHero).set(data).where(eq(homepageHero.id, existing[0].id));
  }
  const rows = await db.select().from(homepageHero).limit(1);
  return rows[0];
}

// Intro
export async function getHomepageIntro() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(homepageIntro).limit(1);
  if (rows.length > 0) return rows[0];
  
  // Auto-create default record if missing
  const defaultData = {
    isVisible: true,
    title: "THE LUXURY TRAVEL EXPERTS",
    content: "",
  };
  await db.insert(homepageIntro).values(defaultData);
  const newRows = await db.select().from(homepageIntro).limit(1);
  return newRows[0] ?? null;
}
export async function upsertHomepageIntro(data: Partial<HomepageIntro>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(homepageIntro).limit(1);
  if (existing.length === 0) {
    await db.insert(homepageIntro).values({
      isVisible: data.isVisible ?? true,
      title: data.title ?? "THE LUXURY TRAVEL EXPERTS",
      content: data.content ?? "",
    });
  } else {
    await db.update(homepageIntro).set(data).where(eq(homepageIntro.id, existing[0].id));
  }
  const rows = await db.select().from(homepageIntro).limit(1);
  return rows[0];
}

// Stories
export async function listHomepageStories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(homepageStories).orderBy(homepageStories.sortOrder);
}
export async function createHomepageStory(data: InsertHomepageStory) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(homepageStories).values(data);
  return { id: (result as any).insertId };
}
export async function updateHomepageStory(id: number, data: Partial<HomepageStory>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(homepageStories).set(data).where(eq(homepageStories.id, id));
  const rows = await db.select().from(homepageStories).where(eq(homepageStories.id, id)).limit(1);
  return rows[0] ?? null;
}
export async function deleteHomepageStory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(homepageStories).where(eq(homepageStories.id, id));
}

// Sponsors
function parseSponsorLogoUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((url): url is string => typeof url === "string" && url.length > 0);
  if (typeof value !== "string" || value.length === 0) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((url): url is string => typeof url === "string" && url.length > 0);
    }
  } catch {
    // Existing databases may contain a single URL instead of a JSON array.
    if (value.trim().startsWith("[")) return [];
  }

  return [value];
}

function normalizeHomepageSponsor(row: any): HomepageSponsor {
  return {
    ...row,
    logoUrls: parseSponsorLogoUrls(row.logoUrls),
  };
}

async function getHomepageSponsorColumns(pool: any) {
  const [columns] = await pool.query("SHOW COLUMNS FROM `homepage_sponsors`");
  const names = new Set((columns as any[]).map((column) => column.Field));
  const logoColumn = names.has("logoUrls") ? "logoUrls" : names.has("logo") ? "logo" : null;
  const websiteColumn = names.has("websiteUrl") ? "websiteUrl" : names.has("url") ? "url" : null;

  if (!logoColumn) {
    throw new Error("homepage_sponsors table is missing logo/logoUrls column");
  }

  return {
    names,
    logoColumn,
    websiteColumn,
  };
}

function quoteColumn(column: string) {
  return `\`${column}\``;
}

function serializeSponsorLogoValue(logoUrl: string, logoColumn: string) {
  return logoColumn === "logoUrls" ? JSON.stringify([logoUrl]) : logoUrl;
}

export async function listHomepageSponsors() {
  const pool = await getPool();
  if (!pool) {
    console.warn('[listHomepageSponsors] Database not available');
    return [];
  }
  try {
    const columns = await getHomepageSponsorColumns(pool);
    const websiteSelect = columns.websiteColumn
      ? `${quoteColumn(columns.websiteColumn)} as \`websiteUrl\``
      : "NULL as `websiteUrl`";
    const [rows] = await pool.query(
      `SELECT \`id\`, \`isVisible\`, \`name\`, ${quoteColumn(columns.logoColumn)} as \`logoUrls\`, ${websiteSelect}, \`sortOrder\`, \`createdAt\`, \`updatedAt\` FROM \`homepage_sponsors\` ORDER BY \`sortOrder\``
    );
    console.log('[listHomepageSponsors] Success, returned', (rows as any[]).length, 'sponsors');
    return (rows as any[]).map(normalizeHomepageSponsor);
  } catch (error) {
    console.error('[listHomepageSponsors] Query error:', error);
    return [];
  }
}
export async function createHomepageSponsor(data: InsertHomepageSponsor) {
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  const columns = await getHomepageSponsorColumns(pool);
  const insertColumns = ["isVisible", "name", columns.logoColumn, "sortOrder"];
  const values: any[] = [
    data.isVisible !== false ? 1 : 0,
    data.name,
    serializeSponsorLogoValue(data.logoUrls, columns.logoColumn),
    data.sortOrder ?? 0,
  ];

  if (columns.websiteColumn) {
    insertColumns.splice(3, 0, columns.websiteColumn);
    values.splice(3, 0, data.websiteUrl ?? null);
  }

  const [result] = await pool.execute(
    `INSERT INTO \`homepage_sponsors\` (${insertColumns.map(quoteColumn).join(", ")}) VALUES (${insertColumns.map(() => "?").join(", ")})`,
    values
  ) as any;
  return { id: (result as any).insertId };
}
export async function updateHomepageSponsor(id: number, data: Partial<InsertHomepageSponsor>) {
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  const columns = await getHomepageSponsorColumns(pool);

  const updates: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) {
    updates.push('`name` = ?');
    values.push(data.name);
  }
  if (data.logoUrls !== undefined) {
    updates.push(`${quoteColumn(columns.logoColumn)} = ?`);
    values.push(serializeSponsorLogoValue(data.logoUrls, columns.logoColumn));
  }
  if (data.websiteUrl !== undefined && columns.websiteColumn) {
    updates.push(`${quoteColumn(columns.websiteColumn)} = ?`);
    values.push(data.websiteUrl ?? null);
  }
  if (data.isVisible !== undefined) {
    updates.push('`isVisible` = ?');
    values.push(data.isVisible ? 1 : 0);
  }
  if (data.sortOrder !== undefined) {
    updates.push('`sortOrder` = ?');
    values.push(data.sortOrder);
  }

  if (updates.length > 0) {
    values.push(id);
    await pool.execute(`UPDATE \`homepage_sponsors\` SET ${updates.join(", ")} WHERE \`id\` = ?`, values);
  }

  const [rows] = await pool.query(
    `SELECT \`id\`, \`isVisible\`, \`name\`, ${quoteColumn(columns.logoColumn)} as \`logoUrls\`, ${columns.websiteColumn ? `${quoteColumn(columns.websiteColumn)} as \`websiteUrl\`` : "NULL as `websiteUrl`"}, \`sortOrder\`, \`createdAt\`, \`updatedAt\` FROM \`homepage_sponsors\` WHERE \`id\` = ? LIMIT 1`,
    [id]
  );
  return (rows as any[])[0] ? normalizeHomepageSponsor((rows as any[])[0]) : null;
}
export async function deleteHomepageSponsor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(homepageSponsors).where(eq(homepageSponsors.id, id));
}

// Story Sections (板块标题/简述)
type HomepageSectionType = "image" | "video" | "way_to_travel";

function getHomepageSectionDefaults(sectionType: HomepageSectionType) {
  if (sectionType === "way_to_travel") {
    return {
      title: "Way to Travel",
      subtitle: "Discover China through the way you want to travel.",
    };
  }
  return {
    title: "Stories From the Road",
    subtitle: "Real stories. Meaningful journeys.",
  };
}

export async function getHomepageStorySection(sectionType: HomepageSectionType): Promise<HomepageStorySection | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
  if (rows.length > 0) return rows[0];
  
  // Auto-create default record if missing
  const defaults = getHomepageSectionDefaults(sectionType);
  const defaultData = {
    sectionType,
    ...defaults,
    isVisible: true,
  };
  await db.insert(homepageStorySections).values(defaultData);
  const newRows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
  return newRows[0] ?? null;
}
export async function upsertHomepageStorySection(sectionType: HomepageSectionType, data: Partial<InsertHomepageStorySection>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getHomepageStorySection(sectionType);
  if (existing) {
    await db.update(homepageStorySections).set(data).where(eq(homepageStorySections.sectionType, sectionType));
    const rows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
    return rows[0] ?? null;
  } else {
    await db.insert(homepageStorySections).values({ sectionType, ...getHomepageSectionDefaults(sectionType), ...data });
    const rows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
    return rows[0] ?? null;
  }
}
export async function listHomepageStoriesByType(type: "image" | "video") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(homepageStories).where(eq(homepageStories.type, type)).orderBy(homepageStories.sortOrder);
}

// ─── About Page Management ────────────────────────────────────────────────────
export async function listAboutSections() {
  const db = await getDb();
  if (!db) return [];
  let rows = await db.select().from(aboutSections).orderBy(aboutSections.sortOrder);

  const legacyAboutUs = rows.find(row => row.slug === "about-us" && row.name === "About Us");
  const hasWhyUs = rows.some(row => row.slug === "why-us");
  if (legacyAboutUs && hasWhyUs) {
    await db.delete(aboutSections).where(eq(aboutSections.id, legacyAboutUs.id));
    rows = await db.select().from(aboutSections).orderBy(aboutSections.sortOrder);
  } else if (legacyAboutUs) {
    await db.update(aboutSections).set({
      name: "WHY US",
      slug: "why-us",
      isVisible: true,
      sortOrder: 0,
      updatedAt: new Date(),
    }).where(eq(aboutSections.id, legacyAboutUs.id));
    rows = await db.select().from(aboutSections).orderBy(aboutSections.sortOrder);
  }

  const requiredSections = [
    { name: "WHY US", slug: "why-us", isVisible: true, sortOrder: 0 },
    { name: "Our Team", slug: "our-team", isVisible: true, sortOrder: 1 },
  ];
  const existingSlugs = new Set(rows.map(row => row.slug));

  for (const section of requiredSections) {
    if (!existingSlugs.has(section.slug)) {
      await db.insert(aboutSections).values(section);
    }
  }

  rows = await db.select().from(aboutSections).orderBy(aboutSections.sortOrder);
  return rows;
}

export async function createAboutSection(data: Omit<InsertAboutSection, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(aboutSections).values({ ...data, slug });
  return { id: (result as any).insertId, slug };
}

export async function updateAboutSection(id: number, data: Partial<InsertAboutSection>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(aboutSections).set({ ...data, updatedAt: new Date() }).where(eq(aboutSections.id, id));
  const rows = await db.select().from(aboutSections).where(eq(aboutSections.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteAboutSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(aboutSections).where(eq(aboutSections.id, id));
}

// ─── Why Us Sections ─────────────────────────────────────────────────────────
export async function listWhyUsSections() {
  const pool = await getPool();
  if (!pool) return [];
  const columns = await getTableColumns(pool, "why_us_sections");
  const backgroundSelect = columns.has("backgroundColor") ? "`backgroundColor`" : "'#12334c' as `backgroundColor`";
  const [initialRows] = await pool.query(
    `SELECT \`id\`, \`title\`, \`content\`, \`image\`, \`sortOrder\`, ${backgroundSelect}, \`createdAt\`, \`updatedAt\` FROM \`why_us_sections\` ORDER BY \`sortOrder\``
  );
  let rows = initialRows as any[];

  const legacyDefault = rows.find(row =>
    row.title === "Why Choose Us" &&
    !row.content &&
    !row.image
  );
  if (legacyDefault) {
    await pool.execute("DELETE FROM `why_us_sections` WHERE `id` = ?", [legacyDefault.id]);
    const [freshRows] = await pool.query(
      `SELECT \`id\`, \`title\`, \`content\`, \`image\`, \`sortOrder\`, ${backgroundSelect}, \`createdAt\`, \`updatedAt\` FROM \`why_us_sections\` ORDER BY \`sortOrder\``
    );
    rows = freshRows as any[];
  }

  return rows;
}

export async function createWhyUsSection(data: Omit<InsertWhyUsSection, "id" | "createdAt" | "updatedAt">) {
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  const columns = await getTableColumns(pool, "why_us_sections");
  const insertColumns = ["title", "content", "image", "sortOrder"];
  const values: any[] = [data.title, data.content, data.image ?? null, data.sortOrder ?? 0];
  if (columns.has("backgroundColor")) {
    insertColumns.push("backgroundColor");
    values.push((data as any).backgroundColor ?? "#12334c");
  }
  const [result] = await pool.execute(
    `INSERT INTO \`why_us_sections\` (${insertColumns.map(quoteColumn).join(", ")}) VALUES (${insertColumns.map(() => "?").join(", ")})`,
    values
  ) as any;
  return { id: (result as any).insertId };
}

export async function updateWhyUsSection(id: number, data: Partial<InsertWhyUsSection>) {
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  const columns = await getTableColumns(pool, "why_us_sections");
  const updates: string[] = [];
  const values: any[] = [];
  const allowed = ["title", "content", "image", "sortOrder", "backgroundColor"] as const;
  for (const key of allowed) {
    if ((data as any)[key] !== undefined && (key !== "backgroundColor" || columns.has("backgroundColor"))) {
      updates.push(`${quoteColumn(key)} = ?`);
      values.push((data as any)[key]);
    }
  }
  if (columns.has("updatedAt")) updates.push("`updatedAt` = CURRENT_TIMESTAMP");
  if (updates.length > 0) {
    values.push(id);
    await pool.execute(`UPDATE \`why_us_sections\` SET ${updates.join(", ")} WHERE \`id\` = ?`, values);
  }
  const backgroundSelect = columns.has("backgroundColor") ? "`backgroundColor`" : "'#12334c' as `backgroundColor`";
  const [rows] = await pool.query(
    `SELECT \`id\`, \`title\`, \`content\`, \`image\`, \`sortOrder\`, ${backgroundSelect}, \`createdAt\`, \`updatedAt\` FROM \`why_us_sections\` WHERE \`id\` = ? LIMIT 1`,
    [id]
  );
  return (rows as any[])[0] ?? null;
}

export async function deleteWhyUsSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(whyUsSections).where(eq(whyUsSections.id, id));
}

async function getTableColumns(pool: any, tableName: string) {
  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set((columns as any[]).map((column) => column.Field));
}

export async function getWhyUsHomeSettings() {
  const pool = await getPool();
  if (!pool) return { backgroundColor: "#12334c" };
  const columns = await getTableColumns(pool, "about_sections");
  const backgroundSelect = columns.has("backgroundColor") ? "`backgroundColor`" : "'#12334c' as `backgroundColor`";
  const [rows] = await pool.query(
    `SELECT ${backgroundSelect} FROM \`about_sections\` WHERE \`slug\` = 'why-us' LIMIT 1`
  );
  return { backgroundColor: (rows as any[])[0]?.backgroundColor ?? "#12334c" };
}

export async function updateWhyUsHomeSettings(data: { backgroundColor?: string }) {
  const pool = await getPool();
  if (!pool) throw new Error("DB unavailable");
  const columns = await getTableColumns(pool, "about_sections");
  if (data.backgroundColor !== undefined && columns.has("backgroundColor")) {
    await pool.execute(
      "UPDATE `about_sections` SET `backgroundColor` = ? WHERE `slug` = 'why-us'",
      [data.backgroundColor]
    );
  }
  return getWhyUsHomeSettings();
}
