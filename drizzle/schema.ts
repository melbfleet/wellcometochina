import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "editor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).default("").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  destination: text("destination"),
  month: varchar("month", { length: 32 }),
  year: varchar("year", { length: 16 }),
  duration: varchar("duration", { length: 64 }),
  groupSize: varchar("groupSize", { length: 32 }),
  budget: varchar("budget", { length: 64 }),
  hearAboutUs: varchar("hearAboutUs", { length: 128 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = typeof enquiries.$inferInsert;

export type OfficeHour = {
  day: string;
  hours: string;
};

export type SocialLink = {
  platform: string;
  url: string;
  isVisible: boolean;
};

// ─── Site-wide public contact information (single row) ──────────────────────
export const siteContactSettings = mysqlTable("site_contact_settings", {
  id: int("id").primaryKey().default(1),
  addressLabel: varchar("addressLabel", { length: 160 }).notNull().default("Address Chengdu"),
  address: text("address").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  phoneAvailabilityText: varchar("phoneAvailabilityText", { length: 255 }).notNull().default("We're open at 9.00am"),
  officeHours: json("officeHours").$type<OfficeHour[]>().notNull(),
  officeHoursNote: varchar("officeHoursNote", { length: 255 }).notNull().default("(excluding national holidays)"),
  socialLinks: json("socialLinks").$type<SocialLink[]>().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteContactSettings = typeof siteContactSettings.$inferSelect;
export type InsertSiteContactSettings = typeof siteContactSettings.$inferInsert;

// ─── CMS: Tags (global tags for stories/videos/itineraries) ──────────────────
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: mysqlEnum("type", ["city", "experience_type", "other"]).notNull().default("other"),
  color: varchar("color", { length: 7 }).default("#888888"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

// ─── CMS: Cities ─────────────────────────────────────────────────────────────
export const cities = mysqlTable("cities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  coverImage: varchar("coverImage", { length: 512 }),
  // Banner section
  bannerTitle: varchar("bannerTitle", { length: 300 }),
  // Introduction section
  introductionTitle: varchar("introductionTitle", { length: 200 }),
  introductionDescription: text("introductionDescription"),
  // City card image (for display on other city pages)
  cityCardImage: varchar("cityCardImage", { length: 512 }),
  // Culinary Travel section
  culinaryTravelLargeImage: varchar("culinaryTravelLargeImage", { length: 512 }),
  culinaryTravelLargeTitle: varchar("culinaryTravelLargeTitle", { length: 200 }),
  culinaryTravelLargeDescription: text("culinaryTravelLargeDescription"),
  culinaryTravelSmall1Image: varchar("culinaryTravelSmall1Image", { length: 512 }),
  culinaryTravelSmall1Title: varchar("culinaryTravelSmall1Title", { length: 200 }),
  culinaryTravelSmall1Description: text("culinaryTravelSmall1Description"),
  culinaryTravelSmall2Image: varchar("culinaryTravelSmall2Image", { length: 512 }),
  culinaryTravelSmall2Title: varchar("culinaryTravelSmall2Title", { length: 200 }),
  culinaryTravelSmall2Description: text("culinaryTravelSmall2Description"),
  // Call to Action section
  ctaBgColor: varchar("ctaBgColor", { length: 7 }).default("#a84900"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type City = typeof cities.$inferSelect;
export type InsertCity = typeof cities.$inferInsert;

// ─── CMS: City Experiences (城市与体验项目的关联) ──────────────────────────────
export const cityExperiences = mysqlTable("city_experiences", {
  id: int("id").autoincrement().primaryKey(),
  cityId: int("cityId").notNull(),
  experienceId: int("experienceId").notNull(),
  displayImage: varchar("displayImage", { length: 512 }),  // 该体验在该城市的展示图片
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CityExperience = typeof cityExperiences.$inferSelect;
export type InsertCityExperience = typeof cityExperiences.$inferInsert;

// ─── CMS: City What to See and Do (城市页面体验展示) ─────────────────────────────────────
export const cityWhatToSee = mysqlTable("city_what_to_see", {
  id: int("id").autoincrement().primaryKey(),
  cityId: int("cityId").notNull(),
  experienceId: int("experienceId").notNull(),  // FK → experiences.id
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CityWhatToSee = typeof cityWhatToSee.$inferSelect;
export type InsertCityWhatToSee = typeof cityWhatToSee.$inferInsert;

// ─── CMS: Experience Types (第一层) ──────────────────────────────────────────
export const experienceTypes = mysqlTable("experience_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  coverImage: varchar("coverImage", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExperienceType = typeof experienceTypes.$inferSelect;
export type InsertExperienceType = typeof experienceTypes.$inferInsert;

// ─── CMS: Experiences (第二层) ───────────────────────────────────────────────
export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  typeId: int("typeId"),               // FK → experience_types.id
  cityId: int("cityId"),               // FK → cities.id (city dimension)
  name: varchar("name", { length: 200 }).notNull(),
  title: varchar("title", { length: 200 }),  // 体验标题（用于城市页面展示）
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  when: varchar("when", { length: 200 }),          // 时间/季节
  price: varchar("price", { length: 100 }),
  duration: varchar("duration", { length: 100 }),  // How long
  gallery: text("gallery"),            // JSON array of image URLs
  description: text("description"),    // 简单描述
  ctaBgColor: varchar("ctaBgColor", { length: 7 }).default("#1a1a1a"),  // CTA 背景色
  recommendationImage: varchar("recommendationImage", { length: 512 }),  // 推荐卡片预览图
  recommendationTitle: varchar("recommendationTitle", { length: 200 }),  // 推荐卡片标题
  recommendationDescription: text("recommendationDescription"),  // 推荐卡片描述
  cityDisplayImage: varchar("cityDisplayImage", { length: 512 }),  // 城市页面 What to See and Do 展示图
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

// ─── CMS: Experience Details (详情模块，每条：描述 + 图片) ────────────────────
export const experienceDetails = mysqlTable("experience_details", {
  id: int("id").autoincrement().primaryKey(),
  experienceId: int("experienceId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExperienceDetail = typeof experienceDetails.$inferSelect;
export type InsertExperienceDetail = typeof experienceDetails.$inferInsert;

// ─── CMS: Experience Labels (自由字符串标签，用于相似推荐) ─────────────────────
export const experienceLabels = mysqlTable("experience_labels", {
  id: int("id").autoincrement().primaryKey(),
  experienceId: int("experienceId").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
});

export type ExperienceLabel = typeof experienceLabels.$inferSelect;

// ─── CMS: Experience Tags (legacy, kept for compatibility) ───────────────────
export const experienceTags = mysqlTable("experience_tags", {
  id: int("id").autoincrement().primaryKey(),
  experienceId: int("experienceId").notNull(),
  tagId: int("tagId").notNull(),
});

export type ExperienceTag = typeof experienceTags.$inferSelect;

// ─── CMS: Way to Travel Types ───────────────────────────────────────────────
export const wayToTravelTypes = mysqlTable("way_to_travel_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  coverImage: varchar("coverImage", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WayToTravelType = typeof wayToTravelTypes.$inferSelect;
export type InsertWayToTravelType = typeof wayToTravelTypes.$inferInsert;

// ─── CMS: Ways to Travel ────────────────────────────────────────────────────
export const waysToTravel = mysqlTable("ways_to_travel", {
  id: int("id").autoincrement().primaryKey(),
  typeId: int("typeId"),
  name: varchar("name", { length: 200 }).notNull(),
  title: varchar("title", { length: 200 }),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  when: varchar("when", { length: 200 }),
  price: varchar("price", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  gallery: text("gallery"),
  description: text("description"),
  ctaBgColor: varchar("ctaBgColor", { length: 7 }).default("#1a1a1a"),
  recommendationImage: varchar("recommendationImage", { length: 512 }),
  recommendationTitle: varchar("recommendationTitle", { length: 200 }),
  recommendationDescription: text("recommendationDescription"),
  isCompanyDisplay: boolean("isCompanyDisplay").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WayToTravel = typeof waysToTravel.$inferSelect;
export type InsertWayToTravel = typeof waysToTravel.$inferInsert;

export const wayToTravelDetails = mysqlTable("way_to_travel_details", {
  id: int("id").autoincrement().primaryKey(),
  wayToTravelId: int("wayToTravelId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  exploreUrl: varchar("exploreUrl", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WayToTravelDetail = typeof wayToTravelDetails.$inferSelect;
export type InsertWayToTravelDetail = typeof wayToTravelDetails.$inferInsert;

// Aggregate click counts for company-display EXPLORE links. Rows are retained
// even if a detail block is later removed, while the Dashboard lists only
// links that still exist.
export const wayToTravelLinkClicks = mysqlTable("way_to_travel_link_clicks", {
  detailId: int("detailId").primaryKey(),
  wayToTravelId: int("wayToTravelId").notNull(),
  blockTitle: varchar("blockTitle", { length: 255 }),
  targetUrl: varchar("targetUrl", { length: 512 }).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  lastClickedAt: timestamp("lastClickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WayToTravelLinkClick = typeof wayToTravelLinkClicks.$inferSelect;

export const wayToTravelLabels = mysqlTable("way_to_travel_labels", {
  id: int("id").autoincrement().primaryKey(),
  wayToTravelId: int("wayToTravelId").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
});

export type WayToTravelLabel = typeof wayToTravelLabels.$inferSelect;

// ─── CMS: Team Members ───────────────────────────────────────────────────────
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  role: varchar("role", { length: 200 }).notNull(),
  bio1: text("bio1"),
  bio2: text("bio2"),
  quote: text("quote"),
  image: varchar("image", { length: 512 }),
  specialty: varchar("specialty", { length: 255 }),
  storyTitle: varchar("storyTitle", { length: 200 }),
  storySubtitle: varchar("storySubtitle", { length: 200 }),
  storyText: text("storyText"),
  storyImage: varchar("storyImage", { length: 512 }),
  storyImage2: varchar("storyImage2", { length: 512 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ─── CMS: Itineraries ────────────────────────────────────────────────────────
export const itineraries = mysqlTable("itineraries", {
  id: int("id").autoincrement().primaryKey(),
  place: varchar("place", { length: 200 }),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  shortDescription: varchar("shortDescription", { length: 500 }),
  bannerImage: varchar("bannerImage", { length: 512 }),
  coverImage: varchar("coverImage", { length: 512 }),
  overviewTitle: varchar("overviewTitle", { length: 300 }),
  description: text("description"),
  when: varchar("when", { length: 200 }),
  price: varchar("price", { length: 100 }),
  howLong: varchar("howLong", { length: 200 }),
  days: int("days").notNull().default(1),
  sections: json("sections"),
  timelineColor: varchar("timelineColor", { length: 32 }).default("#52b788"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = typeof itineraries.$inferInsert;

export const itineraryTags = mysqlTable("itinerary_tags", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  tagId: int("tagId").notNull(),
});

// ─── CMS: Stories ────────────────────────────────────────────────────────────
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content"),
  coverImage: varchar("coverImage", { length: 512 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

export const storyTags = mysqlTable("story_tags", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  tagId: int("tagId").notNull(),
});

// ─── CMS: Videos ─────────────────────────────────────────────────────────────
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 512 }).notNull(),
  coverImage: varchar("coverImage", { length: 512 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

export const videoTags = mysqlTable("video_tags", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(),
  tagId: int("tagId").notNull(),
});

// ─── CMS: Images ─────────────────────────────────────────────────────────────
export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  storagePath: varchar("storagePath", { length: 512 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  uploadedBy: varchar("uploadedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

// ─── Media Library ────────────────────────────────────────────────────────────
export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 512 }).notNull(),          // /manus-storage/xxx
  storageKey: varchar("storageKey", { length: 512 }),      // S3 key
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  // 来源信息
  source: varchar("source", { length: 50 }),               // experience/story/city/banner/logo/cta/gallery
  sourceId: int("sourceId"),                               // 来源内容 ID
  sourceLabel: varchar("sourceLabel", { length: 200 }),    // 来源内容名称（展示用）
  sourceUrl: varchar("sourceUrl", { length: 512 }),        // 前端页面 URL
  // Homepage Assets 专用
  assetType: mysqlEnum("assetType", ["logo", "icon", "banner", "cta", "page_bg", "general"]).default("general").notNull(),
  isActive: boolean("isActive").default(true).notNull(),   // logo/cta 当前使用中
  sortOrder: int("sortOrder").default(0).notNull(),        // banner 排序
  objectPosition: varchar("objectPosition", { length: 32 }).default("50% 50%"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;

// ─── Homepage Management ──────────────────────────────────────────────────────

// Hero Banner 设置（单行配置）
export const homepageHero = mysqlTable("homepage_hero", {
  id: int("id").autoincrement().primaryKey(),
  isVisible: boolean("isVisible").default(true).notNull(),
  backgroundImage: varchar("backgroundImage", { length: 512 }),
  title: varchar("title", { length: 300 }).notNull().default("The Immersive China Experts"),
  subtitle: varchar("subtitle", { length: 500 }).notNull().default("Tailor-made experiences, crafted with local insight."),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HomepageHero = typeof homepageHero.$inferSelect;
export type InsertHomepageHero = typeof homepageHero.$inferInsert;

// 简介板块设置（单行配置）
export const homepageIntro = mysqlTable("homepage_intro", {
  id: int("id").autoincrement().primaryKey(),
  isVisible: boolean("isVisible").default(true).notNull(),
  title: varchar("title", { length: 300 }).notNull().default("THE LUXURY TRAVEL EXPERTS"),
  content: text("content").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HomepageIntro = typeof homepageIntro.$inferSelect;
export type InsertHomepageIntro = typeof homepageIntro.$inferInsert;

// Stories 卡片（多行，可排序）
export const homepageStories = mysqlTable("homepage_stories", {
  id: int("id").autoincrement().primaryKey(),
  isVisible: boolean("isVisible").default(true).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  // type: 'image' = 图片板块, 'video' = 视频板块
  type: mysqlEnum("type", ["image", "video"]).default("video").notNull(),
  videoId: varchar("videoId", { length: 50 }),
  image: varchar("image", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HomepageStory = typeof homepageStories.$inferSelect;
export type InsertHomepageStory = typeof homepageStories.$inferInsert;

// Stories 板块标题/简述（每个板块独立配置）
export const homepageStorySections = mysqlTable("homepage_story_sections", {
  id: int("id").autoincrement().primaryKey(),
  // sectionType: image/video/way_to_travel homepage sections
  sectionType: mysqlEnum("sectionType", ["image", "video", "way_to_travel"]).notNull().unique(),
  title: varchar("title", { length: 300 }).notNull().default("Stories From the Road"),
  subtitle: varchar("subtitle", { length: 500 }).notNull().default("Real stories. Meaningful journeys."),
  isVisible: boolean("isVisible").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HomepageStorySection = typeof homepageStorySections.$inferSelect;
export type InsertHomepageStorySection = typeof homepageStorySections.$inferInsert;

// Homepage sections whose content is sourced elsewhere but whose visibility
// is controlled from the Homepage admin page.
export const homepageSectionVisibility = mysqlTable("homepage_section_visibility", {
  sectionKey: varchar("sectionKey", { length: 64 }).primaryKey(),
  isVisible: boolean("isVisible").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HomepageSectionVisibility = typeof homepageSectionVisibility.$inferSelect;

// 赞助商 Logo（多行，可排序）+ 背景纹理
export const homepageSponsors = mysqlTable("homepage_sponsors", {
  id: int("id").autoincrement().primaryKey(),
  isVisible: boolean("isVisible").default(true).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  logoUrls: text("logo").notNull(), // Existing database column; API exposes it as logoUrls.
  websiteUrl: varchar("url", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  backgroundTexture: varchar("backgroundTexture", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HomepageSponsor = Omit<typeof homepageSponsors.$inferSelect, "logoUrls"> & { logoUrls: string[] };
export type InsertHomepageSponsor = typeof homepageSponsors.$inferInsert;

// ─── About Page Management ────────────────────────────────────────────────────
// About 子板块目录（可增删，控制显示/隐藏）
export const aboutSections = mysqlTable("about_sections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),         // 板块名称，如 "Our Team"
  slug: varchar("slug", { length: 100 }).notNull().unique(), // 路由标识，如 "our-team"
  isVisible: boolean("isVisible").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AboutSection = typeof aboutSections.$inferSelect;
export type InsertAboutSection = typeof aboutSections.$inferInsert;

// Why Us 板块内容（多行，可增删排序）
export const whyUsSections = mysqlTable("why_us_sections", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  image: varchar("image", { length: 512 }),
  backgroundColor: varchar("backgroundColor", { length: 32 }).default("#12334c"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WhyUsSection = typeof whyUsSections.$inferSelect;
export type InsertWhyUsSection = typeof whyUsSections.$inferInsert;
