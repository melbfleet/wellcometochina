import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sendContactEmail } from "./mailer";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { enquiries, cityExperiences, experiences } from "../drizzle/schema";
import { desc, eq, notInArray } from "drizzle-orm";
import { ENV } from "./_core/env";
import { parse as parseCookies } from "cookie";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import {
  createMediaAsset, listMediaAssets, listHomepageAssets, getActiveHomepageAsset, getActiveBanners,
  setAssetActive, updateAssetSortOrder, updateAssetOpacity, replaceMediaAsset, deleteMediaAsset, getMediaAsset,
  findMediaAssetUsages, updateAssetObjectPositionByUrl, listMediaObjectPositions,
} from "./db-media";
import { storagePut, UPLOADS_ROOT, storageDelete } from "./storage";
import { generateStaticPages, generateNavData, clearStaticCache, STATIC_CACHE_DIR } from "./staticGenerator";
import { getContactSettings, updateContactSettings } from "./db-contact-settings";
import { getWayToTravelLinkClickStats } from "./db-link-clicks";
import {
  HOMEPAGE_VISIBILITY_KEYS,
  getHomepageSectionVisibility,
  updateHomepageSectionVisibility,
} from "./db-homepage-visibility";
import {
  listTags, createTag, updateTag, deleteTag,
  listCities, getCityById, createCity, updateCity, deleteCity, reorderCity, listCitiesWithExperiences,
  listCityExperiences, addCityExperience, updateCityExperience, removeCityExperience,
  listCityWhatToSee, addCityWhatToSee, updateCityWhatToSee, removeCityWhatToSee,
  // Experience types (第一层)
  listExperienceTypes, getExperienceTypeById, createExperienceType, updateExperienceType, deleteExperienceType, reorderExperienceType, listExperienceTypesWithNav,
  // Experiences (第二层)
  listExperiences, listExperiencesByType, listExperiencesByCity, getExperienceById, getExperienceTagIds, createExperience, updateExperience, deleteExperience, reorderExperience,
  // Experience details & labels (第三层)
  listExperienceDetails, createExperienceDetail, updateExperienceDetail, deleteExperienceDetail, replaceExperienceDetails,
  getExperienceLabels, replaceExperienceLabels,
  // Way to Travel
  listWayToTravelTypes, getWayToTravelTypeById, createWayToTravelType, updateWayToTravelType, deleteWayToTravelType, reorderWayToTravelType, listWayToTravelTypesWithNav,
  listWaysToTravel, listWaysToTravelByType, getWayToTravelById, getWayToTravelBySlug, createWayToTravel, updateWayToTravel, deleteWayToTravel, reorderWayToTravel,
  listWayToTravelDetails, replaceWayToTravelDetails, getWayToTravelLabels, replaceWayToTravelLabels, getRecommendedWaysToTravel,
  // Team Members
  listTeamMembers, getTeamMemberById, createTeamMember, updateTeamMember, deleteTeamMember,
  // Other CMS
  listItineraries, listItinerariesByCityTag, getItineraryById, getItineraryTagIds, createItinerary, updateItinerary, deleteItinerary, reorderItinerary,
  listStories, getStoryById, getStoryTagIds, createStory, updateStory, deleteStory,
  listVideos, getVideoById, getVideoTagIds, createVideo, updateVideo, deleteVideo,
  listImages, createImageRecord, deleteImageRecord,
  getRecommendedExperiences,
  getHomepageHero, upsertHomepageHero,
  getHomepageIntro, upsertHomepageIntro,
  listHomepageStories, listHomepageStoriesByType, createHomepageStory, updateHomepageStory, deleteHomepageStory,
  listHomepageSponsors, createHomepageSponsor, updateHomepageSponsor, deleteHomepageSponsor,
  getHomepageStorySection, upsertHomepageStorySection,
  listAboutSections, createAboutSection, updateAboutSection, deleteAboutSection,
  listWhyUsSections, createWhyUsSection, updateWhyUsSection, deleteWhyUsSection,
  getWhyUsHomeSettings, updateWhyUsHomeSettings,
} from "./db-cms";

// ── Admin session store (in-memory, no persistence) ──────────────────────────
// Sessions expire after 4 hours. Server restart clears all sessions automatically.
// No JWT, no localStorage — pure server-side session cookie only.
const ADMIN_COOKIE = "admin_sid";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const adminSessions = new Map<string, number>(); // sessionId -> expiresAt

function createAdminSession(): string {
  const sessionId = nanoid(48);
  adminSessions.set(sessionId, Date.now() + SESSION_TTL_MS);
  return sessionId;
}

function isValidAdminSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false;
  const expiresAt = adminSessions.get(sessionId);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    adminSessions.delete(sessionId);
    return false;
  }
  return true;
}

function getAdminSessionId(req: { headers: { cookie?: string } }): string | undefined {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[ADMIN_COOKIE];
}

function requireAdmin(ctx: { req: { headers: Record<string, string | string[] | undefined> } }) {
  const sessionId = getAdminSessionId(ctx.req as any);
  if (!isValidAdminSession(sessionId)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────
const tagInput = z.object({
  name: z.string().min(1),
  type: z.enum(["city", "experience_type", "other"]).default("other"),
  color: z.string().default("#888888"),
});

const officeHourInput = z.object({
  day: z.string().trim().min(1).max(80),
  hours: z.string().trim().min(1).max(160),
});

const socialLinkInput = z.object({
  platform: z.enum(["YouTube", "TikTok", "Instagram", "Facebook", "Xiaohongshu"]),
  url: z.string().trim().max(512).refine(
    value => value === "" || /^https?:\/\//i.test(value),
    "Social links must start with http:// or https://",
  ),
  isVisible: z.literal(true),
});

const contactSettingsInput = z.object({
  addressLabel: z.string().trim().max(160),
  address: z.string().trim().max(2000),
  email: z.union([z.literal(""), z.string().trim().email().max(320)]),
  phone: z.string().trim().max(64),
  phoneAvailabilityText: z.string().trim().max(255),
  officeHours: z.array(officeHourInput).max(31),
  officeHoursNote: z.string().trim().max(255),
  socialLinks: z.array(socialLinkInput).max(30),
});

const cityInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  // Banner section
  bannerTitle: z.string().optional(),
  // City card image for Other Popular Destinations
  cityCardImage: z.string().optional(),
  // Introduction section
  introductionTitle: z.string().optional(),
  introductionDescription: z.string().optional(),
  // Culinary Travel section
  culinaryTravelLargeImage: z.string().optional(),
  culinaryTravelLargeTitle: z.string().optional(),
  culinaryTravelLargeDescription: z.string().optional(),
  culinaryTravelSmall1Image: z.string().optional(),
  culinaryTravelSmall1Title: z.string().optional(),
  culinaryTravelSmall1Description: z.string().optional(),
  culinaryTravelSmall2Image: z.string().optional(),
  culinaryTravelSmall2Title: z.string().optional(),
  culinaryTravelSmall2Description: z.string().optional(),
  // Call to Action
  ctaBgColor: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

const experienceTypeInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  coverImage: z.string().optional(),
  sortOrder: z.number().default(0),
});

const experienceInput = z.object({
  typeId: z.number().optional().nullable(),
  name: z.string().min(1),
  title: z.string().optional(),
  slug: z.string().optional(),
  when: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
  gallery: z.string().optional(),   // JSON array string
  description: z.string().optional(),
  ctaBgColor: z.string().default("#1a1a1a"),
  recommendationImage: z.string().optional(),  // 推荐卡片预览图
  recommendationTitle: z.string().optional(),  // 推荐卡片标题
  recommendationDescription: z.string().optional(),  // 推荐卡片描述
  cityDisplayImage: z.string().optional(),  // 城市页面 What to See and Do 展示图
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const wayToTravelInput = experienceInput.extend({
  isCompanyDisplay: z.boolean().default(false),
});

const experienceDetailInput = z.object({
  experienceId: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
});

const detailBlockSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  exploreUrl: z.string().trim().max(512).refine(
    value => value === "" || /^\/(?![\\/])/.test(value) || /^https?:\/\//i.test(value),
    "Explore links must start with /, http:// or https://",
  ).optional(),
  sortOrder: z.number(),
});

const teamMemberInput = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio1: z.string().optional(),
  bio2: z.string().optional(),
  quote: z.string().optional(),
  image: z.string().optional(),
  specialty: z.string().optional(),
  storyTitle: z.string().optional(),
  storySubtitle: z.string().optional(),
  storyText: z.string().optional(),
  storyImage: z.string().optional(),
  storyImage2: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const itineraryInput = z.object({
  place: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  bannerImage: z.string().optional(),
  coverImage: z.string().optional(),
  overviewTitle: z.string().optional(),
  description: z.string().optional(),
  when: z.string().optional(),
  price: z.string().optional(),
  howLong: z.string().optional(),
  days: z.number().min(1).default(1),
  sections: z.array(z.any()).default([]),
  timelineColor: z.string().optional().default("#52b788"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.number()).default([]),
});

const storyInput = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.number()).default([]),
});

const videoInput = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().min(1),
  coverImage: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.number()).default([]),
});

// ─── Router ───────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Admin auth ──────────────────────────────────────────────────────────
  admin: router({
    check: publicProcedure.query(({ ctx }) => {
      const sessionId = getAdminSessionId(ctx.req as any);
      return { authenticated: isValidAdminSession(sessionId) };
    }),

    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(({ ctx, input }) => {
        const correctPassword = ENV.adminPassword;
        if (!correctPassword || input.password !== correctPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
        }
        // Create in-memory session (no JWT, no localStorage)
        const sessionId = createAdminSession();
        // Build cookie options: always httpOnly, secure on HTTPS, SameSite=Lax for same-site Hostinger
        const isHttps = ctx.req.protocol === "https" ||
          (ctx.req.headers["x-forwarded-proto"] as string || "").includes("https");
        ctx.res.cookie(ADMIN_COOKIE, sessionId, {
          httpOnly: true,
          path: "/",
          maxAge: SESSION_TTL_MS,
          sameSite: isHttps ? "none" : "lax",
          secure: isHttps,
        });
        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const sessionId = getAdminSessionId(ctx.req as any);
      if (sessionId) adminSessions.delete(sessionId);
      const isHttps = ctx.req.protocol === "https" ||
        (ctx.req.headers["x-forwarded-proto"] as string || "").includes("https");
      ctx.res.clearCookie(ADMIN_COOKIE, {
        httpOnly: true,
        path: "/",
        sameSite: isHttps ? "none" : "lax",
        secure: isHttps,
      });
      return { success: true };
    }),

    listEnquiries: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      const db = await getDb();
      if (!db) return [];
      return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
    }),

    getEnquiry: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db.select().from(enquiries).where(eq(enquiries.id, input.id));
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        return rows[0];
      }),

    // ── Tags ────────────────────────────────────────────────────────────────
    listTags: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listTags();
    }),

    createTag: publicProcedure
      .input(tagInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createTag(input);
      }),

    updateTag: publicProcedure
      .input(z.object({ id: z.number() }).merge(tagInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateTag(id, data);
        return { success: true };
      }),

    deleteTag: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteTag(input.id);
        return { success: true };
      }),

    // ── Cities ──────────────────────────────────────────────────────────────
    listCities: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listCities(true);
    }),

    getCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const city = await getCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),

    getCityById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const city = await getCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),

    createCity: publicProcedure
      .input(cityInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createCity(input);
      }),

    updateCity: publicProcedure
      .input(z.object({ id: z.number() }).merge(cityInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateCity(id, data);
        return { success: true };
      }),

    deleteCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteCity(input.id);
        return { success: true };
      }),

    reorderCity: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderCity(input.id, input.sortOrder);
        return { success: true };
      }),


    // ── City Experiences ──────────────────────────────────────────────────────
    listCityExperiences: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listCityExperiences(input.cityId);
      }),

    addCityExperience: publicProcedure
      .input(z.object({
        cityId: z.number(),
        experienceId: z.number(),
        displayImage: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return addCityExperience(input);
      }),

    updateCityExperience: publicProcedure
      .input(z.object({
        id: z.number(),
        displayImage: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateCityExperience(id, data);
        return { success: true };
      }),

    removeCityExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await removeCityExperience(input.id);
        return { success: true };
      }),


    // ── City What to See and Do ──────────────────────────────────────────────
    listCityWhatToSee: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listCityWhatToSee(input.cityId);
      }),

    addCityWhatToSee: publicProcedure
      .input(z.object({
        cityId: z.number(),
        experienceId: z.number(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return addCityWhatToSee({
          cityId: input.cityId,
          experienceId: input.experienceId,
          sortOrder: input.sortOrder ?? 0,
        });
      }),

    updateCityWhatToSee: publicProcedure
      .input(z.object({
        id: z.number(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateCityWhatToSee(id, data);
        return { success: true };
      }),

    removeCityWhatToSee: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await removeCityWhatToSee(input.id);
        return { success: true };
      }),

    // ── Experience Types (第一层) ────────────────────────────────────────────
    listExperienceTypes: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listExperienceTypes();
    }),

    getExperienceType: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const type = await getExperienceTypeById(input.id);
        if (!type) throw new TRPCError({ code: "NOT_FOUND" });
        return type;
      }),

    createExperienceType: publicProcedure
      .input(experienceTypeInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createExperienceType(input);
      }),

    updateExperienceType: publicProcedure
      .input(z.object({ id: z.number() }).merge(experienceTypeInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateExperienceType(id, data);
        return { success: true };
      }),

    deleteExperienceType: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteExperienceType(input.id);
        return { success: true };
      }),

    reorderExperienceType: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderExperienceType(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Experiences (第二层) ─────────────────────────────────────────────────
    listExperiences: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listExperiences(true);
    }),

    listExperiencesByType: publicProcedure
      .input(z.object({ typeId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listExperiencesByType(input.typeId);
      }),

    getExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const exp = await getExperienceById(input.id);
        if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
        const details = await listExperienceDetails(input.id);
        const labels = await getExperienceLabels(input.id);
        return { ...exp, details, labels };
      }),

    createExperience: publicProcedure
      .input(experienceInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createExperience(input, []);
      }),

    updateExperience: publicProcedure
      .input(z.object({ id: z.number() }).merge(experienceInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateExperience(id, data);
        return { success: true };
      }),

    deleteExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteExperience(input.id);
        return { success: true };
      }),

    reorderExperience: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderExperience(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Experiences by City ────────────────────────────────────────────────────────
    listExperiencesByCity: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listExperiencesByCity(input.cityId);
      }),

    // Get all available experiences for selection (not yet associated with a city)
    listAvailableExperiencesForCity: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const db = await getDb();
        if (!db) return [];
        // Get all experiences that are not yet associated with this city
        const associated = await db
          .select({ experienceId: cityExperiences.experienceId })
          .from(cityExperiences)
          .where(eq(cityExperiences.cityId, input.cityId));
        const associatedIds = associated.map(a => a.experienceId);
        // Return all experiences except those already associated
        const allExps = await listExperiences(true);
        return allExps.filter(exp => !associatedIds.includes(exp.id));
      }),

    createExperienceForCity: publicProcedure
      .input(z.object({ cityId: z.number() }).merge(experienceInput))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { cityId, ...data } = input;
        return createExperience({ ...data, cityId, typeId: null }, []);
      }),

    deleteExperienceFromCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteExperience(input.id);
        return { success: true };
      }),

    reorderExperienceInCity: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderExperience(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Copy Experience to another type ──────────────────────────────────────
    copyExperience: publicProcedure
      .input(z.object({
        id: z.number(),
        targetSlugPrefix: z.string(),
        targetTypeId: z.number().optional().nullable(),
        targetCityId: z.number().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const src = await getExperienceById(input.id);
        if (!src) throw new TRPCError({ code: 'NOT_FOUND', message: 'Source experience not found' });
        const srcDetails = await listExperienceDetails(input.id);
        const srcLabels = await getExperienceLabels(input.id);

        const newSlug = `${input.targetSlugPrefix}-${src.slug}`;

        const newExp = await createExperience({
          typeId: input.targetTypeId ?? null,
          cityId: input.targetCityId ?? null,
          name: src.name,
          title: src.title ?? undefined,
          slug: newSlug,
          when: src.when ?? undefined,
          price: src.price ?? undefined,
          duration: src.duration ?? undefined,
          gallery: src.gallery ?? undefined,
          description: src.description ?? undefined,
          ctaBgColor: (src as any).ctaBgColor ?? '#1a1a1a',
          isActive: false,
          sortOrder: 0,
        }, []);

        // Copy details
        if (srcDetails.length > 0) {
          await replaceExperienceDetails(newExp.id, srcDetails.map((d: any, i: number) => ({
            title: d.title ?? undefined,
            description: d.description ?? undefined,
            imageUrl: d.imageUrl ?? undefined,
            sortOrder: i,
          })));
        }

        // Copy labels
        if (srcLabels.length > 0) {
          await replaceExperienceLabels(newExp.id, srcLabels);
        }

        return { success: true, newId: newExp.id, newSlug };
      }),

    // ── Experience Details (第三层详情模块) ──────────────────────────────────
    listExperienceDetails: publicProcedure
      .input(z.object({ experienceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listExperienceDetails(input.experienceId);
      }),

    saveExperienceDetails: publicProcedure
      .input(z.object({
        experienceId: z.number(),
        details: z.array(detailBlockSchema),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await replaceExperienceDetails(input.experienceId, input.details);
        return { success: true };
      }),

    // ── Experience Labels (相似推荐标签) ─────────────────────────────────────
    getExperienceLabels: publicProcedure
      .input(z.object({ experienceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return getExperienceLabels(input.experienceId);
      }),

    saveExperienceLabels: publicProcedure
      .input(z.object({
        experienceId: z.number(),
        labels: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await replaceExperienceLabels(input.experienceId, input.labels);
        return { success: true };
      }),

    // ── Way to Travel ──────────────────────────────────────────────────────
    listWayToTravelTypes: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listWayToTravelTypes();
    }),

    getWayToTravelType: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const type = await getWayToTravelTypeById(input.id);
        if (!type) throw new TRPCError({ code: "NOT_FOUND" });
        return type;
      }),

    createWayToTravelType: publicProcedure
      .input(experienceTypeInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createWayToTravelType(input);
      }),

    updateWayToTravelType: publicProcedure
      .input(z.object({ id: z.number() }).merge(experienceTypeInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateWayToTravelType(id, data);
        return { success: true };
      }),

    deleteWayToTravelType: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteWayToTravelType(input.id);
        return { success: true };
      }),

    reorderWayToTravelType: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderWayToTravelType(input.id, input.sortOrder);
        return { success: true };
      }),

    listWaysToTravel: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listWaysToTravel(true);
    }),

    listWaysToTravelByType: publicProcedure
      .input(z.object({ typeId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listWaysToTravelByType(input.typeId);
      }),

    getWayToTravel: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const item = await getWayToTravelById(input.id);
        if (!item) throw new TRPCError({ code: "NOT_FOUND" });
        const details = await listWayToTravelDetails(input.id);
        const labels = await getWayToTravelLabels(input.id);
        return { ...item, details, labels };
      }),

    createWayToTravel: publicProcedure
      .input(wayToTravelInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createWayToTravel(input);
      }),

    updateWayToTravel: publicProcedure
      .input(z.object({ id: z.number() }).merge(wayToTravelInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateWayToTravel(id, data);
        return { success: true };
      }),

    deleteWayToTravel: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteWayToTravel(input.id);
        return { success: true };
      }),

    reorderWayToTravel: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderWayToTravel(input.id, input.sortOrder);
        return { success: true };
      }),

    copyWayToTravel: publicProcedure
      .input(z.object({ id: z.number(), targetSlugPrefix: z.string(), targetTypeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const source = await getWayToTravelById(input.id);
        if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Source Way to Travel item not found" });
        const details = await listWayToTravelDetails(input.id);
        const labels = await getWayToTravelLabels(input.id);
        const newSlug = `${input.targetSlugPrefix}-${source.slug}`;
        const created = await createWayToTravel({
          typeId: input.targetTypeId,
          name: source.name,
          title: source.title ?? undefined,
          slug: newSlug,
          when: source.when ?? undefined,
          price: source.price ?? undefined,
          duration: source.duration ?? undefined,
          gallery: source.gallery ?? undefined,
          description: source.description ?? undefined,
          ctaBgColor: source.ctaBgColor ?? "#1a1a1a",
          recommendationImage: source.recommendationImage ?? undefined,
          recommendationTitle: source.recommendationTitle ?? undefined,
          recommendationDescription: source.recommendationDescription ?? undefined,
          isCompanyDisplay: source.isCompanyDisplay ?? false,
          isActive: false,
          sortOrder: 0,
        });
        await replaceWayToTravelDetails(created.id, details.map((detail, index) => ({
          title: detail.title ?? undefined,
          description: detail.description ?? undefined,
          imageUrl: detail.imageUrl ?? undefined,
          exploreUrl: detail.exploreUrl ?? undefined,
          sortOrder: index,
        })));
        await replaceWayToTravelLabels(created.id, labels);
        return { success: true, newId: created.id, newSlug };
      }),

    saveWayToTravelDetails: publicProcedure
      .input(z.object({ wayToTravelId: z.number(), details: z.array(detailBlockSchema) }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await replaceWayToTravelDetails(input.wayToTravelId, input.details);
        return { success: true };
      }),

    saveWayToTravelLabels: publicProcedure
      .input(z.object({ wayToTravelId: z.number(), labels: z.array(z.string()) }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await replaceWayToTravelLabels(input.wayToTravelId, input.labels);
        return { success: true };
      }),

    getWayToTravelLinkClickStats: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return getWayToTravelLinkClickStats();
    }),

    // ── Team Members ───────────────────────────────────────────────────────
    listTeamMembers: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listTeamMembers(true);
    }),

    getTeamMember: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const member = await getTeamMemberById(input.id);
        if (!member) throw new TRPCError({ code: "NOT_FOUND" });
        return member;
      }),

    createTeamMember: publicProcedure
      .input(teamMemberInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createTeamMember(input);
      }),

    updateTeamMember: publicProcedure
      .input(z.object({ id: z.number() }).merge(teamMemberInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateTeamMember(id, data);
        return { success: true };
      }),

    deleteTeamMember: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteTeamMember(input.id);
        return { success: true };
      }),

    // ── Itineraries ─────────────────────────────────────────────────────────
    listItineraries: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listItineraries(true);
    }),

    getItinerary: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const itin = await getItineraryById(input.id);
        if (!itin) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getItineraryTagIds(input.id);
        return { ...itin, tagIds };
      }),

    createItinerary: publicProcedure
      .input(itineraryInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { tagIds, ...data } = input;
        return createItinerary(data, tagIds);
      }),

    updateItinerary: publicProcedure
      .input(z.object({ id: z.number() }).merge(itineraryInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, tagIds, ...data } = input;
        await updateItinerary(id, data, tagIds);
        return { success: true };
      }),

    deleteItinerary: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteItinerary(input.id);
        return { success: true };
      }),

    reorderItinerary: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderItinerary(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Stories ─────────────────────────────────────────────────────────────
    listStories: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listStories(true);
    }),

    getStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const story = await getStoryById(input.id);
        if (!story) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getStoryTagIds(input.id);
        return { ...story, tagIds };
      }),

    createStory: publicProcedure
      .input(storyInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { tagIds, ...data } = input;
        return createStory(data, tagIds);
      }),

    updateStory: publicProcedure
      .input(z.object({ id: z.number() }).merge(storyInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, tagIds, ...data } = input;
        await updateStory(id, data, tagIds);
        return { success: true };
      }),

    deleteStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteStory(input.id);
        return { success: true };
      }),

    // ── Videos ──────────────────────────────────────────────────────────────
    listVideos: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listVideos(true);
    }),

    getVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const video = await getVideoById(input.id);
        if (!video) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getVideoTagIds(input.id);
        return { ...video, tagIds };
      }),

    createVideo: publicProcedure
      .input(videoInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { tagIds, ...data } = input;
        return createVideo(data, tagIds);
      }),

    updateVideo: publicProcedure
      .input(z.object({ id: z.number() }).merge(videoInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, tagIds, ...data } = input;
        await updateVideo(id, data, tagIds);
        return { success: true };
      }),

    deleteVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteVideo(input.id);
        return { success: true };
      }),

    // ── Images ──────────────────────────────────────────────────────────────
    listImages: publicProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listImages(input.category);
      }),

    deleteImage: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const record = await deleteImageRecord(input.id);
        if (record?.storagePath) {
          const fullPath = path.join(process.cwd(), "public", record.storagePath);
          try { fs.unlinkSync(fullPath); } catch { /* ignore */ }
        }
        return { success: true };
      }),
  }),

  // ─── Public CMS queries (for frontend) ──────────────────────────────────
  // ─── Static page generation ─────────────────────────────────────────────
  staticGen: router({
    generate: publicProcedure
      .mutation(async ({ ctx }) => {
        requireAdmin(ctx);
        const protocol = (ctx.req.headers["x-forwarded-proto"] as string) || "http";
        const host = (ctx.req.headers["x-forwarded-host"] as string) || (ctx.req.headers["host"] as string) || "localhost:3000";
        const baseUrl = `${protocol}://${host}`;
        console.log(`[StaticGen] Starting generation for ${baseUrl}`);
        const result = await generateStaticPages(baseUrl);
        console.log(`[StaticGen] Done: ${result.pagesGenerated} pages in ${result.durationMs}ms`);
        return result;
      }),

    generateNavOnly: publicProcedure
      .mutation(async ({ ctx }) => {
        requireAdmin(ctx);
        const success = await generateNavData();
        return { success };
      }),

    clearCache: publicProcedure
      .mutation(async ({ ctx }) => {
        requireAdmin(ctx);
        clearStaticCache();
        return { success: true };
      }),

    status: publicProcedure
      .query(async ({ ctx }) => {
        requireAdmin(ctx);
        const navDataPath = path.join(STATIC_CACHE_DIR, "nav-data.json");
        let lastGenerated: string | null = null;
        let pageCount = 0;
        try {
          if (fs.existsSync(navDataPath)) {
            const data = JSON.parse(fs.readFileSync(navDataPath, "utf-8"));
            lastGenerated = data.generatedAt || null;
          }
          const countHtml = (dir: string): number => {
            if (!fs.existsSync(dir)) return 0;
            let count = 0;
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
              if (entry.isDirectory()) count += countHtml(path.join(dir, entry.name));
              else if (entry.name.endsWith(".html")) count++;
            }
            return count;
          };
          pageCount = countHtml(STATIC_CACHE_DIR);
        } catch { /* ignore */ }
        return { lastGenerated, pageCount };
      }),
  }),

  cms: router({
    listTags: publicProcedure.query(() => listTags()),

    listCities: publicProcedure.query(() => listCities(false)),

    listCitiesWithExperiences: publicProcedure.query(() => listCitiesWithExperiences()),

    listCityExperiences: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(({ input }) => listCityExperiences(input.cityId)),

    getCityBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getCityBySlug } = await import("./db-cms");
        const city = await getCityBySlug(input.slug);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),

    listExperienceTypes: publicProcedure.query(() => listExperienceTypes()),

    listExperienceTypesWithNav: publicProcedure.query(() => listExperienceTypesWithNav()),

    listExperiencesByType: publicProcedure
      .input(z.object({ typeId: z.number() }))
      .query(({ input }) => listExperiencesByType(input.typeId)),

    listExperiences: publicProcedure
      .input(z.object({ typeId: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.typeId) return listExperiencesByType(input.typeId);
        return listExperiences(false);
      }),

    getExperienceBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getExperienceBySlug } = await import("./db-cms");
        const exp = await getExperienceBySlug(input.slug);
        if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
        const details = await listExperienceDetails(exp.id);
        const labels = await getExperienceLabels(exp.id);
        const recommended = await getRecommendedExperiences(exp.id, 8);
        return { ...exp, details, labels, recommended };
      }),

    listWayToTravelTypes: publicProcedure.query(() => listWayToTravelTypes()),

    listWayToTravelTypesWithNav: publicProcedure.query(() => listWayToTravelTypesWithNav()),

    listWaysToTravelByType: publicProcedure
      .input(z.object({ typeId: z.number() }))
      .query(({ input }) => listWaysToTravelByType(input.typeId)),

    listWaysToTravel: publicProcedure.query(() => listWaysToTravel(false)),

    getWayToTravelBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const item = await getWayToTravelBySlug(input.slug);
        if (!item) throw new TRPCError({ code: "NOT_FOUND" });
        const details = await listWayToTravelDetails(item.id);
        const labels = await getWayToTravelLabels(item.id);
        const recommended = await getRecommendedWaysToTravel(item.id, 8);
        return { ...item, details, labels, recommended };
      }),

    listTeamMembers: publicProcedure.query(() => listTeamMembers(false)),

    listItineraries: publicProcedure.query(() => listItineraries(false)),

    listItinerariesByCityTag: publicProcedure
      .input(z.object({ cityName: z.string(), citySlug: z.string() }))
      .query(({ input }) => listItinerariesByCityTag(input.cityName, input.citySlug)),

    getItineraryBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { itineraries } = await import("../drizzle/schema");
        const rows = await db.select().from(itineraries).where(eq(itineraries.slug, input.slug)).limit(1);
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getItineraryTagIds(rows[0].id);
        return { ...rows[0], tagIds };
      }),

    listStories: publicProcedure.query(() => listStories(false)),

    getStoryBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { stories } = await import("../drizzle/schema");
        const rows = await db.select().from(stories).where(eq(stories.slug, input.slug)).limit(1);
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getStoryTagIds(rows[0].id);
        return { ...rows[0], tagIds };
      }),

    listVideos: publicProcedure.query(() => listVideos(false)),

    listCityWhatToSee: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(({ input }) => listCityWhatToSee(input.cityId)),
    // Team Members (by ID)
    getTeamMember: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const member = await getTeamMemberById(input.id);
        if (!member) throw new TRPCError({ code: "NOT_FOUND" });
        return member;
      }),
    // City by ID
    getCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const city = await getCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),
    // Experience by ID
    getExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const exp = await getExperienceById(input.id);
        if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
        return exp;
      }),
    // Itinerary by ID
    getItinerary: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const itin = await getItineraryById(input.id);
        if (!itin) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getItineraryTagIds(input.id);
        return { ...itin, tagIds };
      }),
    // Story by ID
    getStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const story = await getStoryById(input.id);
        if (!story) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getStoryTagIds(input.id);
        return { ...story, tagIds };
      }),
    // Video by ID
    getVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const video = await getVideoById(input.id);
        if (!video) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getVideoTagIds(input.id);
        return { ...video, tagIds };
      }),
  }),

  // ─── Image upload (multipart handled in Express) ─────────────────────────
  images: router({
    upload: publicProcedure
      .input(z.object({
        filename: z.string(),
        base64: z.string(),
        mimeType: z.string(),
        category: z.string().default("other"),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const imagesDir = path.join(UPLOADS_ROOT, "images");
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        const ext = path.extname(input.filename) || ".jpg";
        const uniqueName = `${nanoid()}-${Date.now()}${ext}`;
        const filePath = path.join(imagesDir, uniqueName);
        const buffer = Buffer.from(input.base64, "base64");
        fs.writeFileSync(filePath, buffer);

        const storagePath = `/uploads/images/${uniqueName}`;
        const record = await createImageRecord({
          filename: input.filename,
          storagePath,
          fileSize: buffer.byteLength,
          mimeType: input.mimeType,
          category: input.category,
          description: input.description,
          uploadedBy: "admin",
        });

        return { id: record.id, url: storagePath, filename: uniqueName };
      }),
  }),

  // ─── Media Library ─────────────────────────────────────────────────────
  media: router({
    // 统一上传接口（base64）
    upload: publicProcedure
      .input(z.object({
        filename: z.string(),
        base64: z.string(),
        mimeType: z.string().default("image/jpeg"),
        fileSize: z.number().optional(),
        source: z.string().default("general"),
        sourceId: z.number().optional(),
        sourceLabel: z.string().optional(),
        sourceUrl: z.string().optional(),
        assetType: z.enum(["logo", "icon", "banner", "cta", "page_bg", "general"]).default("general"),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const buffer = Buffer.from(input.base64, "base64");
        const ext = path.extname(input.filename) || ".jpg";
        console.log(`[media.upload] filename: "${input.filename}", path.extname result: "${path.extname(input.filename)}", final ext: "${ext}"`);
        const storageKey = `media/${nanoid()}${ext}`;
        const { key, url } = await storagePut(storageKey, buffer, input.mimeType);
        const asset = await createMediaAsset({
          url,
          storageKey: key,
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize ?? buffer.byteLength,
          source: input.source,
          sourceId: input.sourceId,
          sourceLabel: input.sourceLabel,
          sourceUrl: input.sourceUrl,
          assetType: input.assetType,
          isActive: true,
          sortOrder: 0,
        });
        return { id: asset?.insertId, url, key };
      }),

    // 列出所有媒体资产（支持搜索）
    list: publicProcedure
      .input(z.object({ search: z.string().optional(), assetType: z.enum(["logo", "icon", "banner", "cta", "page_bg", "general"]).optional() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listMediaAssets(input.search, input.assetType);
      }),

    getUsagePreview: publicProcedure
      .input(z.object({ url: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return findMediaAssetUsages({ url: input.url });
      }),

    getObjectPositions: publicProcedure.query(async () => {
      return listMediaObjectPositions();
    }),

    // 列出 Homepage Assets（按类型）
    listByType: publicProcedure
      .input(z.object({ assetType: z.enum(["logo", "icon", "banner", "cta", "page_bg"]) }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listHomepageAssets(input.assetType);
      }),

    // 公开接口：获取首页动态资产
    getHomepageAssets: publicProcedure.query(async () => {
      const [logo, icon, cta, pageBg, banners] = await Promise.all([
        getActiveHomepageAsset("logo"),
        getActiveHomepageAsset("icon"),
        getActiveHomepageAsset("cta"),
        getActiveHomepageAsset("page_bg"),
        getActiveBanners(),
      ]);
      return { logo, icon, cta, pageBg, banners };
    }),

    // 设置激活状态
    setActive: publicProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean(),
        assetType: z.enum(["logo", "icon", "banner", "cta", "page_bg"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await setAssetActive(input.id, input.isActive, input.assetType);
        return { success: true };
      }),

    // 更新排序
    updateSortOrder: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await updateAssetSortOrder(input.id, input.sortOrder);
        return { success: true };
      }),

    // 替换图片（保持原记录，更新 URL）
    updateOpacity: publicProcedure
      .input(z.object({ id: z.number(), opacity: z.number().min(0).max(100) }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return updateAssetOpacity(input.id, input.opacity);
      }),

    updateObjectPosition: publicProcedure
      .input(z.object({
        url: z.string().min(1),
        objectPosition: z.string().regex(/^([0-9]|[1-9][0-9]|100)%\s+([0-9]|[1-9][0-9]|100)%$/),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return updateAssetObjectPositionByUrl(input.url, input.objectPosition);
      }),

    replace: publicProcedure
      .input(z.object({
        id: z.number(),
        filename: z.string(),
        base64: z.string(),
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const buffer = Buffer.from(input.base64, "base64");
        const ext = path.extname(input.filename) || ".jpg";
        const storageKey = `media/${nanoid()}${ext}`;
        const { key, url } = await storagePut(storageKey, buffer, input.mimeType);
        await replaceMediaAsset(input.id, url, key, input.filename);
        return { url };
      }),

    // 删除媒体资产
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const asset = await getMediaAsset(input.id);
        if (!asset) throw new TRPCError({ code: "NOT_FOUND" });
        // 检查引用：sourceUrl 不为空说明被引用
        const usages = await findMediaAssetUsages(asset);
        if (usages.length > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `This image is currently in use in ${usages.length} place${usages.length === 1 ? "" : "s"}.`,
          });
        }
                // 删除本地文件
        if (asset.storageKey) {
          const { storageDelete } = await import("./storage");
          storageDelete(asset.storageKey);
        }
        await deleteMediaAsset(input.id);
        return { success: true };
      }),

    // 批量删除媒体资产
    batchDelete: publicProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        for (const id of input.ids) {
          const asset = await getMediaAsset(id);
          if (!asset) continue;
          // 检查引用：sourceUrl 不为空说明被引用
          const usages = await findMediaAssetUsages(asset);
          if (usages.length > 0) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: `Image "${asset.filename}" is currently in use in ${usages.length} place${usages.length === 1 ? "" : "s"}.`,
            });
          }
          // 删除本地文件
          if (asset.storageKey) {
            const { storageDelete } = await import("./storage");
            storageDelete(asset.storageKey);
          }
          await deleteMediaAsset(id);
        }
        return { success: true, deletedCount: input.ids.length };
      }),
  }),
    // ─── Contact form ────────────────────────────────────────────────────────
  contact: router({
    submit: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().default(""),
        email: z.string().email(),
        phone: z.string().min(1),
        destination: z.string().default(""),
        month: z.string().default(""),
        year: z.string().default(""),
        duration: z.string().default(""),
        groupSize: z.string().default(""),
        budget: z.string().default(""),
        hearAboutUs: z.string().default(""),
        message: z.string().default(""),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (db) await db.insert(enquiries).values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            destination: input.destination || null,
            month: input.month || null,
            year: input.year || null,
            duration: input.duration || null,
            groupSize: input.groupSize || null,
            budget: input.budget || null,
            hearAboutUs: input.hearAboutUs || null,
            message: input.message || null,
          });
        } catch (dbError) {
          console.error("[Contact] Failed to save enquiry to DB:", dbError);
        }
        try {
          await sendContactEmail(input);
        } catch (error) {
          console.error("[Contact] Failed to send email:", error);
        }
        return { success: true };
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "user")) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];
      return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
    }),
  }),

  // ─── Public contact details / footer social links ────────────────────────
  siteContact: router({
    get: publicProcedure.query(async () => getContactSettings()),
    update: publicProcedure
      .input(contactSettingsInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return updateContactSettings(input);
      }),
  }),

  // ─── Homepage Management ──────────────────────────────────────────────────
  homepage: router({
    // Public: get all homepage data for frontend rendering
    getAll: publicProcedure.query(async () => {
      const [hero, intro, stories, sponsors, imageSection, videoSection, wayToTravelSection, sectionVisibility] = await Promise.all([
        getHomepageHero(),
        getHomepageIntro(),
        listHomepageStories(),
        listHomepageSponsors(),
        getHomepageStorySection("image"),
        getHomepageStorySection("video"),
        getHomepageStorySection("way_to_travel"),
        getHomepageSectionVisibility(),
      ]);
      return { hero, intro, stories, sponsors, imageSection, videoSection, wayToTravelSection, sectionVisibility };
    }),

    // Public: Homepage data for frontend
    getPublicData: publicProcedure.query(async () => {
      try {
        console.log('[homepage.getPublicData] Starting query...');
        
        const [hero, intro, allStories, sponsors, imageSection, videoSection, wayToTravelSection, sectionVisibility] = await Promise.all([
          getHomepageHero().catch(e => {
            console.error('[homepage.getPublicData] getHomepageHero failed:', e.message);
            return null;
          }),
          getHomepageIntro().catch(e => {
            console.error('[homepage.getPublicData] getHomepageIntro failed:', e.message);
            return null;
          }),
          listHomepageStories().catch(e => {
            console.error('[homepage.getPublicData] listHomepageStories failed:', e.message);
            return [];
          }),
          listHomepageSponsors().catch(e => {
            console.error('[homepage.getPublicData] listHomepageSponsors failed:', e.message);
            return [];
          }),
          getHomepageStorySection("image").catch(e => {
            console.error('[homepage.getPublicData] getHomepageStorySection(image) failed:', e.message);
            return null;
          }),
          getHomepageStorySection("video").catch(e => {
            console.error('[homepage.getPublicData] getHomepageStorySection(video) failed:', e.message);
            return null;
          }),
          getHomepageStorySection("way_to_travel").catch(e => {
            console.error('[homepage.getPublicData] getHomepageStorySection(way_to_travel) failed:', e.message);
            return null;
          }),
          getHomepageSectionVisibility().catch(e => {
            console.error('[homepage.getPublicData] getHomepageSectionVisibility failed:', e.message);
            return {
              plan_your_trip: true,
              explore_trips: true,
              why_us: true,
              ready_to_start: true,
            };
          }),
        ]);
        
        console.log('[homepage.getPublicData] All queries completed');
        
        const visibleStories = (allStories || []).filter(s => s.isVisible);
        return {
          hero,
          intro,
          imageStories: visibleStories.filter(s => s.type === "image"),
          videoStories: visibleStories.filter(s => s.type === "video"),
          // legacy: keep stories for backward compat
          stories: visibleStories,
          sponsors: (sponsors || []).filter(s => s.isVisible),
          imageSection,
          videoSection,
          wayToTravelSection,
          sectionVisibility,
        };
      } catch (error) {
        console.error('[homepage.getPublicData] Unexpected error:', error);
        throw error;
      }
    }),

    // Admin: Hero
    getHero: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return getHomepageHero();
    }),
    updateHero: publicProcedure
      .input(z.object({
        isVisible: z.boolean().optional(),
        backgroundImage: z.string().optional().nullable(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return upsertHomepageHero(input);
      }),

    // Admin: Intro
    getIntro: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return getHomepageIntro();
    }),
    updateIntro: publicProcedure
      .input(z.object({
        isVisible: z.boolean().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return upsertHomepageIntro(input);
      }),

    // Public visibility for Homepage sections whose content comes from other modules.
    getSectionVisibility: publicProcedure.query(async () => {
      return getHomepageSectionVisibility();
    }),
    updateSectionVisibility: publicProcedure
      .input(z.object({
        sectionKey: z.enum(HOMEPAGE_VISIBILITY_KEYS),
        isVisible: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return updateHomepageSectionVisibility(input.sectionKey, input.isVisible);
      }),

    // Admin: Stories
    listStories: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listHomepageStories();
    }),
    listStoriesByType: publicProcedure
      .input(z.object({ type: z.enum(["image", "video"]) }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listHomepageStoriesByType(input.type);
      }),
    createStory: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        type: z.enum(["image", "video"]).default("video"),
        youtubeId: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isVisible: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createHomepageStory({ name: input.title, type: input.type, videoId: input.youtubeId, image: input.thumbnailUrl, isVisible: input.isVisible, sortOrder: input.sortOrder });
      }),
    updateStory: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        type: z.enum(["image", "video"]).optional(),
        youtubeId: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, title, youtubeId, thumbnailUrl, ...rest } = input;
        const data: Record<string, any> = { ...rest };
        if (title !== undefined) data.name = title;
        if (youtubeId !== undefined) data.videoId = youtubeId;
        if (thumbnailUrl !== undefined) data.image = thumbnailUrl;
        return updateHomepageStory(id, data);
      }),
    deleteStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteHomepageStory(input.id);
        return { success: true };
      }),

    // Admin: Story Sections (板块标题/简述)
    getStorySection: publicProcedure
      .input(z.object({ sectionType: z.enum(["image", "video", "way_to_travel"]) }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return getHomepageStorySection(input.sectionType);
      }),
    updateStorySection: publicProcedure
      .input(z.object({
        sectionType: z.enum(["image", "video", "way_to_travel"]),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { sectionType, ...data } = input;
        return upsertHomepageStorySection(sectionType, data);
      }),

    // Admin: Sponsors
    listSponsors: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listHomepageSponsors();
    }),
    createSponsor: publicProcedure
      .input(z.object({
        name: z.string().min(1).optional().default(() => `Sponsor ${Date.now()}`),
        logoUrls: z.array(z.string()).min(1),
        websiteUrl: z.string().optional(),
        isVisible: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const created = [];
        for (let index = 0; index < input.logoUrls.length; index++) {
          const logoUrl = input.logoUrls[index];
          created.push(await createHomepageSponsor({
            name: input.logoUrls.length > 1 ? `${input.name} ${index + 1}` : input.name,
            logoUrls: logoUrl,
            websiteUrl: input.websiteUrl,
            isVisible: input.isVisible,
            sortOrder: input.sortOrder + index,
          }));
        }
        return created.length === 1 ? created[0] : created;
      }),
    updateSponsor: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        logoUrls: z.array(z.string()).optional(),
        websiteUrl: z.string().optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, logoUrls, websiteUrl, ...rest } = input;
        const data: Record<string, any> = { ...rest };
        if (logoUrls !== undefined) data.logoUrls = logoUrls[0] ?? "";
        if (websiteUrl !== undefined) data.websiteUrl = websiteUrl;
        return updateHomepageSponsor(id, data);
      }),
    deleteSponsor: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteHomepageSponsor(input.id);
        return { success: true };
      }),
  }),

  // ─── About Page Management ───────────────────────────────────────────────────
  about: router({
    // Public: list visible sections for frontend
    listPublicSections: publicProcedure.query(async () => {
      const sections = await listAboutSections();
      return sections.filter(s => s.isVisible);
    }),

    // Admin: list all sections
    listSections: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listAboutSections();
    }),

    createSection: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().optional(),
        isVisible: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { slug, ...rest } = input;
        return createAboutSection({ ...rest, slug: slug ?? '' });
      }),

    updateSection: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        return updateAboutSection(id, data);
      }),

    deleteSection: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteAboutSection(input.id);
        return { success: true };
      }),

    // Why Us sections
    listWhyUsSections: publicProcedure.query(async () => {
      return listWhyUsSections();
    }),

    getWhyUsHomeSettings: publicProcedure.query(async () => {
      return getWhyUsHomeSettings();
    }),

    updateWhyUsHomeSettings: publicProcedure
      .input(z.object({
        backgroundColor: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return updateWhyUsHomeSettings(input);
      }),

    createWhyUsSection: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        image: z.string().optional(),
        backgroundColor: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createWhyUsSection(input);
      }),

    updateWhyUsSection: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        image: z.string().optional(),
        backgroundColor: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        return updateWhyUsSection(id, data);
      }),

    deleteWhyUsSection: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteWhyUsSection(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
