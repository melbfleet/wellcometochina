import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  getHomepageHero,
  getHomepageIntro,
  getHomepageStorySection,
  listAboutSections,
  listWhyUsSections,
} from "./db-cms";
import { homepageHero, homepageIntro, homepageStorySections, aboutSections, whyUsSections } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("CMS Auto-Create Functionality", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Clean up test data
    if (db) {
      // Delete all records to reset for next test run
      await db.delete(homepageHero);
      await db.delete(homepageIntro);
      await db.delete(homepageStorySections);
      await db.delete(aboutSections);
      await db.delete(whyUsSections);
    }
  });

  it("should auto-create homepage hero record if missing", async () => {
    // Clear existing records
    await db.delete(homepageHero);

    // Call getHomepageHero - should auto-create
    const hero = await getHomepageHero();

    expect(hero).toBeDefined();
    expect(hero?.title).toBe("THE LUXURY TRAVEL EXPERTS");
    expect(hero?.subtitle).toBe("TAILOR-MADE TRIPS, AWARD WINNING SERVICE. EST. 2005.");
    expect(hero?.isVisible).toBe(true);
  });

  it("should auto-create homepage intro record if missing", async () => {
    // Clear existing records
    await db.delete(homepageIntro);

    // Call getHomepageIntro - should auto-create
    const intro = await getHomepageIntro();

    expect(intro).toBeDefined();
    expect(intro?.title).toBe("THE LUXURY TRAVEL EXPERTS");
    expect(intro?.isVisible).toBe(true);
  });

  it("should auto-create homepage story section for image type", async () => {
    // Clear existing records
    await db.delete(homepageStorySections);

    // Call getHomepageStorySection - should auto-create
    const section = await getHomepageStorySection("image");

    expect(section).toBeDefined();
    expect(section?.sectionType).toBe("image");
    expect(section?.title).toBe("Stories From the Road");
    expect(section?.subtitle).toBe("Real stories. Meaningful journeys.");
    expect(section?.isVisible).toBe(true);
  });

  it("should auto-create homepage story section for video type", async () => {
    // Clear existing records for video type
    await db.delete(homepageStorySections).where(eq(homepageStorySections.sectionType, "video"));

    // Call getHomepageStorySection - should auto-create
    const section = await getHomepageStorySection("video");

    expect(section).toBeDefined();
    expect(section?.sectionType).toBe("video");
    expect(section?.title).toBe("Stories From the Road");
    expect(section?.subtitle).toBe("Real stories. Meaningful journeys.");
    expect(section?.isVisible).toBe(true);
  });

  it("should auto-create about section if table is empty", async () => {
    // Clear existing records
    await db.delete(aboutSections);

    // Call listAboutSections - should auto-create
    const sections = await listAboutSections();

    expect(sections.length).toBe(2);
    expect(sections[0].name).toBe("WHY US");
    expect(sections[0].slug).toBe("why-us");
    expect(sections[0].isVisible).toBe(true);
    expect(sections[1].name).toBe("Our Team");
    expect(sections[1].slug).toBe("our-team");
    expect(sections[1].isVisible).toBe(true);
  });

  it("should return no why us sections if table is empty", async () => {
    // Clear existing records
    await db.delete(whyUsSections);

    // Call listWhyUsSections - should not create placeholder content
    const sections = await listWhyUsSections();

    expect(sections).toEqual([]);
  });

  it("should not create duplicate records on multiple calls", async () => {
    // Clear existing records
    await db.delete(homepageHero);

    // First call - should create
    const hero1 = await getHomepageHero();
    expect(hero1).toBeDefined();

    // Second call - should return existing record, not create another
    const hero2 = await getHomepageHero();
    expect(hero2).toBeDefined();
    expect(hero1?.id).toBe(hero2?.id);

    // Verify only one record exists
    const allHeroes = await db.select().from(homepageHero);
    expect(allHeroes.length).toBe(1);
  });
});
