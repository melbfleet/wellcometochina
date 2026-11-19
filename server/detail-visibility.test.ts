import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";
import { getCityById, getCityBySlug, getItineraryById, getItineraryTagIds } from "./db-cms";
import { getDb } from "./db";
import { appRouter } from "./routers";

vi.mock("./db-cms", () => ({
  getCityById: vi.fn(),
  getCityBySlug: vi.fn(),
  getItineraryById: vi.fn(),
  getItineraryTagIds: vi.fn(),
}));

vi.mock("./db", () => ({ getDb: vi.fn() }));

function caller(cookie?: string, setCookie = vi.fn()) {
  return appRouter.createCaller({
    req: { headers: { cookie }, protocol: "https" } as TrpcContext["req"],
    res: { cookie: setCookie } as unknown as TrpcContext["res"],
    user: null,
  });
}

function mockDetails(isActive: boolean) {
  const city = { id: 1, slug: "test-city", isActive };
  const itinerary = { id: 2, slug: "test-itinerary", isActive };
  vi.mocked(getCityById).mockResolvedValue(city as Awaited<ReturnType<typeof getCityById>>);
  vi.mocked(getCityBySlug).mockResolvedValue(city as Awaited<ReturnType<typeof getCityBySlug>>);
  vi.mocked(getItineraryById).mockResolvedValue(itinerary as Awaited<ReturnType<typeof getItineraryById>>);
  vi.mocked(getItineraryTagIds).mockResolvedValue([]);
  vi.mocked(getDb).mockResolvedValue({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [itinerary] }) }) }),
  } as unknown as Awaited<ReturnType<typeof getDb>>);
  return { city, itinerary: { ...itinerary, tagIds: [] } };
}

const originalAdminPassword = ENV.adminPassword;
afterEach(() => { ENV.adminPassword = originalAdminPassword; });

describe("city and itinerary detail visibility", () => {
  it("serves active records by URL and ID", async () => {
    const { city, itinerary } = mockDetails(true);
    const { cms } = caller();

    await expect(cms.getCityBySlug({ slug: city.slug })).resolves.toEqual(city);
    await expect(cms.getCity({ id: city.id })).resolves.toEqual(city);
    await expect(cms.getItineraryBySlug({ slug: itinerary.slug })).resolves.toEqual(itinerary);
    await expect(cms.getItinerary({ id: itinerary.id })).resolves.toEqual(itinerary);
  });

  it("hides inactive records from public routes, even when preview is requested", async () => {
    const { city, itinerary } = mockDetails(false);
    const { cms } = caller();

    await expect(cms.getCityBySlug({ slug: city.slug })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(cms.getCityBySlug({ slug: city.slug, preview: true })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(cms.getCity({ id: city.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(cms.getItineraryBySlug({ slug: itinerary.slug })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(cms.getItineraryBySlug({ slug: itinerary.slug, preview: true })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(cms.getItinerary({ id: itinerary.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("allows a signed-in administrator to explicitly preview hidden details", async () => {
    const { city, itinerary } = mockDetails(false);
    const setCookie = vi.fn();
    ENV.adminPassword = "test-admin-password";
    await caller(undefined, setCookie).admin.login({ password: ENV.adminPassword });
    const [name, sessionId] = setCookie.mock.calls[0];
    const { cms } = caller(`${name}=${sessionId}`);

    await expect(cms.getCityBySlug({ slug: city.slug, preview: true })).resolves.toEqual(city);
    await expect(cms.getItineraryBySlug({ slug: itinerary.slug, preview: true })).resolves.toEqual(itinerary);
    await expect(cms.getCityBySlug({ slug: city.slug })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(cms.getItineraryBySlug({ slug: itinerary.slug })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
