import { describe, expect, it } from "vitest";
import {
  buildEventBenefitCardModel,
  buildFreeBenefitCardModel,
  buildMockPaidEntitlement,
  buildMockProPlusEntitlement,
  buildMockProfileBenefits,
  buildProPlusUpsellText,
  getNextTierId,
  listPaidEntitlements,
  pickGlobalFreeMonthly,
  pickProfileEntitlement,
} from "./profileBenefitsMapper";
import { PACKAGE_TIER_ORDER } from "./profilePackageData";
import type { EventPackageEntitlement } from "../../types/backend";

function paidEntitlement(
  tier: "pro" | "pro_plus" | "ultra",
  overrides: Partial<EventPackageEntitlement> = {},
): EventPackageEntitlement {
  const quotasByTier: Record<
    typeof tier,
    EventPackageEntitlement["quotas"]
  > = {
    pro: {
      aiMatch: { limit: 11, used: 2, remaining: 9 },
      contactUnlock: { limit: 8, used: 1, remaining: 7 },
      map: {
        days: 7,
        expiresAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
        active: true,
      },
      postPin: { limit: 0, used: 0, remaining: 0 },
      basicExposure: true,
    },
    pro_plus: {
      aiMatch: { limit: 18, used: 3, remaining: 15 },
      contactUnlock: { limit: 15, used: 0, remaining: 15 },
      map: {
        days: 15,
        expiresAt: new Date(Date.now() + 10 * 86_400_000).toISOString(),
        active: true,
      },
      postPin: { limit: 1, used: 0, remaining: 1 },
      basicExposure: false,
    },
    ultra: {
      aiMatch: { limit: null, used: 5, remaining: null },
      contactUnlock: { limit: null, used: 0, remaining: null },
      map: {
        days: 30,
        expiresAt: new Date(Date.now() + 20 * 86_400_000).toISOString(),
        active: true,
      },
      postPin: { limit: 2, used: 1, remaining: 1 },
      basicExposure: false,
    },
  };

  const tierName =
    tier === "pro" ? "Pro" : tier === "pro_plus" ? "Pro+" : "Ultra";

  return {
    activityLegacyId: 1,
    tierId: tier,
    tierName,
    paidTierId: tier,
    purchasedAt: "2026-05-01T00:00:00.000Z",
    quotas: quotasByTier[tier],
    ...overrides,
  };
}

describe("getNextTierId", () => {
  it("follows pro → pro_plus → ultra ladder", () => {
    expect(PACKAGE_TIER_ORDER).toEqual(["pro", "pro_plus", "ultra"]);
    expect(getNextTierId("pro")).toBe("pro_plus");
    expect(getNextTierId("pro_plus")).toBe("ultra");
    expect(getNextTierId("ultra")).toBeNull();
  });

  it("returns null for missing or unknown tier", () => {
    expect(getNextTierId(null)).toBeNull();
    expect(getNextTierId(undefined)).toBeNull();
    expect(getNextTierId("free" as never)).toBeNull();
  });
});

describe("buildFreeBenefitCardModel", () => {
  const freeMonthly = {
    period: "2026-05",
    aiMatch: { limit: 3, used: 0, remaining: 3 },
    contactUnlock: { limit: 3, used: 1, remaining: 2 },
  };

  it("uses global title and freeMonthly quotas (not activity-scoped)", () => {
    const card = buildFreeBenefitCardModel(freeMonthly);
    expect(card.title).toBe("通场免费额度");
    expect(card.subtitle).toBe("每月重置");
    expect(card.aiMatch).toEqual({ remaining: 3, limit: 3, remainingRatio: 1 });
    expect(card.contactUnlock.remaining).toBe(2);
    expect(card.contactUnlock.limit).toBe(3);
    expect(card.upsellText).toBe(buildProPlusUpsellText());
  });

  it("falls back to default 3/3 without freeMonthly payload", () => {
    const card = buildFreeBenefitCardModel(null);
    expect(card.title).toBe("通场免费额度");
    expect(card.subtitle).toBe("每月重置");
    expect(card.aiMatch.remaining).toBe(3);
    expect(card.contactUnlock.remaining).toBe(3);
  });

  it("falls back when freeMonthly slots are missing (API partial payload)", () => {
    const card = buildFreeBenefitCardModel({ period: "2026-05" } as never);
    expect(card.aiMatch.remaining).toBe(3);
    expect(card.contactUnlock.remaining).toBe(3);
  });
});

describe("pickGlobalFreeMonthly", () => {
  it("prefers summary freeMonthly over list rows", () => {
    const summary = {
      period: "2026-05",
      aiMatch: { limit: 3, used: 2, remaining: 1 },
      contactUnlock: { limit: 3, used: 0, remaining: 3 },
    };
    const fromList = {
      period: "2026-04",
      aiMatch: { limit: 3, used: 0, remaining: 3 },
      contactUnlock: { limit: 3, used: 0, remaining: 3 },
    };
    expect(
      pickGlobalFreeMonthly(
        [{ activityLegacyId: 1, tierId: "free", tierName: "免费版", paidTierId: null, freeMonthly: fromList, quotas: {} as never }],
        summary,
      ),
    ).toBe(summary);
  });
});

describe("buildMockProfileBenefits", () => {
  it("shows Pro tier with free monthly merge (11 / 8 / 7)", () => {
    const benefits = buildMockProfileBenefits();
    expect(benefits.planLabel).toBe("Pro");
    expect(benefits.promo.highlight).toBe("Pro");
    expect(benefits.metrics.map((metric) => metric.value)).toEqual([11, 8, 7]);
  });
});

describe("pickProfileEntitlement", () => {
  const proSeed: EventPackageEntitlement = {
    activityLegacyId: 4,
    tierId: "pro",
    tierName: "Pro",
    paidTierId: "pro",
    quotas: {
      aiMatch: { limit: 11, used: 0, remaining: 11 },
      contactUnlock: { limit: 8, used: 0, remaining: 8 },
      map: { days: 7, expiresAt: "2099-01-01T00:00:00.000Z", active: true },
      postPin: { limit: 0, used: 0, remaining: 0 },
      basicExposure: true,
    },
  };

  const freeScoped: EventPackageEntitlement = {
    activityLegacyId: 1,
    tierId: "free",
    tierName: "免费版",
    paidTierId: null,
    quotas: {
      aiMatch: { limit: 3, used: 0, remaining: 3 },
      contactUnlock: { limit: 3, used: 0, remaining: 3 },
      map: { days: 0, expiresAt: "1970-01-01T00:00:00.000Z", active: false },
      postPin: { limit: 0, used: 0, remaining: 0 },
      basicExposure: true,
    },
  };

  it("prefers scoped paid entitlement over list head", () => {
    const picked = pickProfileEntitlement(4, [freeScoped, proSeed], null);
    expect(picked?.tierName).toBe("Pro");
  });

  it("returns free-only for activity 1 when Pro is only on activity 4", () => {
    const picked = pickProfileEntitlement(1, [proSeed, freeScoped], freeScoped);
    expect(picked?.tierName).toBe("免费版");
    expect(picked?.paidTierId).toBeNull();
  });

  it("returns null when scoped activity is missing from list and summary", () => {
    const picked = pickProfileEntitlement(2, [proSeed, freeScoped], null);
    expect(picked).toBeNull();
  });

  it("returns scoped free when entitlements list is activity-scoped only", () => {
    const freeStorm: EventPackageEntitlement = {
      ...freeScoped,
      activityLegacyId: 4,
    };
    const picked = pickProfileEntitlement(4, [freeStorm], null);
    expect(picked?.tierName).toBe("免费版");
  });
});

describe("listPaidEntitlements", () => {
  const proSeed: EventPackageEntitlement = {
    activityLegacyId: 4,
    tierId: "pro",
    tierName: "Pro",
    paidTierId: "pro",
    quotas: {
      aiMatch: { limit: 11, used: 0, remaining: 11 },
      contactUnlock: { limit: 8, used: 0, remaining: 8 },
      map: { days: 7, expiresAt: "2099-01-01T00:00:00.000Z", active: true },
      postPin: { limit: 0, used: 0, remaining: 0 },
      basicExposure: true,
    },
  };

  const ultraOther: EventPackageEntitlement = {
    activityLegacyId: 1,
    tierId: "ultra",
    tierName: "Ultra",
    paidTierId: "ultra",
    quotas: {
      aiMatch: { limit: null, used: 0, remaining: null },
      contactUnlock: { limit: null, used: 0, remaining: null },
      map: { days: 30, expiresAt: "2099-06-01T00:00:00.000Z", active: true },
      postPin: { limit: 2, used: 0, remaining: 2 },
      basicExposure: false,
    },
  };

  const freeScoped: EventPackageEntitlement = {
    activityLegacyId: 6,
    tierId: "free",
    tierName: "免费版",
    paidTierId: null,
    quotas: {
      aiMatch: { limit: 3, used: 0, remaining: 3 },
      contactUnlock: { limit: 3, used: 0, remaining: 3 },
      map: { days: 0, expiresAt: "1970-01-01T00:00:00.000Z", active: false },
      postPin: { limit: 0, used: 0, remaining: 0 },
      basicExposure: true,
    },
  };

  it("returns only paid activities and dedupes by activityLegacyId", () => {
    const paid = listPaidEntitlements(
      [freeScoped, proSeed, ultraOther],
      [proSeed],
    );
    expect(paid).toHaveLength(2);
    expect(paid.map((item) => item.activityLegacyId)).toEqual([1, 4]);
  });

  it("builds three benefit rows for Pro (no pin)", () => {
    const card = buildEventBenefitCardModel(proSeed);
    expect(card.rows).toHaveLength(3);
    expect(card.rows.map((row) => row.id)).toEqual(["contact", "ai-match", "map"]);
  });

  it("builds four benefit rows when pin quota exists", () => {
    const card = buildEventBenefitCardModel(
      paidEntitlement("pro_plus"),
    );
    expect(card.rows).toHaveLength(4);
    expect(card.rows.map((row) => row.id)).toContain("post-pin");
  });
});

describe("buildEventBenefitCardModel tier display", () => {
  it("contact row uses muted quota tone", () => {
    const card = buildEventBenefitCardModel(buildMockPaidEntitlement());
    expect(card.rows.find((row) => row.id === "contact")?.quotaTone).toBe("muted");
  });

  it("shows Pro badge and API quotas for Zara-style pro entitlement", () => {
    const card = buildEventBenefitCardModel(buildMockPaidEntitlement(), {
      title: "风暴电音节 深圳站",
      date: "06/13-14",
      location: "深圳国际会展中心",
    });
    expect(card.activityLegacyId).toBe(4);
    expect(card.eventTitle).toBe("风暴电音节 深圳站");
    expect(card.eventMeta).toContain("深圳国际会展中心");
    expect(card.tierId).toBe("pro");
    expect(card.tierName).toBe("Pro");
    expect(card.rows.find((row) => row.id === "post-pin")).toBeUndefined();
    expect(card.rows.find((row) => row.id === "ai-match")?.quotaLabel).toBe(
      "剩 11/11",
    );
    expect(card.rows.find((row) => row.id === "contact")?.quotaLabel).toBe(
      "剩 8/8",
    );
    expect(card.rows.find((row) => row.id === "map")?.quotaLabel).toMatch(
      /^剩 \d+ 天$/,
    );
  });

  it("uses paidTierId for badge when tierName from API is stale", () => {
    const card = buildEventBenefitCardModel(
      paidEntitlement("pro", { tierName: "Pro+" }),
    );
    expect(card.tierId).toBe("pro");
    expect(card.tierName).toBe("Pro");
  });

  it("shows Pro+ badge, quotas, and pin row", () => {
    const card = buildEventBenefitCardModel(paidEntitlement("pro_plus"));
    expect(card.tierId).toBe("pro_plus");
    expect(card.tierName).toBe("Pro+");
    expect(card.rows.find((row) => row.id === "ai-match")?.quotaLabel).toBe(
      "剩 15/18",
    );
    expect(card.rows.find((row) => row.id === "contact")?.quotaLabel).toBe(
      "剩 15/15",
    );
    expect(card.rows.find((row) => row.id === "post-pin")?.quotaLabel).toBe(
      "剩 1/1",
    );
  });

  it("shows Ultra badge with unlimited labels", () => {
    const card = buildEventBenefitCardModel(paidEntitlement("ultra"));
    expect(card.tierId).toBe("ultra");
    expect(card.tierName).toBe("Ultra");
    expect(card.rows.find((row) => row.id === "ai-match")?.quotaLabel).toBe(
      "不限",
    );
    expect(card.rows.find((row) => row.id === "contact")?.quotaLabel).toBe(
      "不限",
    );
    expect(card.rows.find((row) => row.id === "post-pin")?.quotaLabel).toBe(
      "剩 1/2",
    );
  });

  it("buildMockProPlusEntitlement is Pro+ on activity 6 with pin", () => {
    const ent = buildMockProPlusEntitlement();
    expect(ent.activityLegacyId).toBe(6);
    expect(ent.paidTierId).toBe("pro_plus");
    const card = buildEventBenefitCardModel(ent, { title: "2026横琴VAC电音节" });
    expect(card.tierId).toBe("pro_plus");
    expect(card.rows.find((row) => row.id === "post-pin")?.label).toBe("主页置顶");
  });

  it("shows 当日有效 for map on last day", () => {
    const expiresTonight = new Date();
    expiresTonight.setHours(expiresTonight.getHours() + 6);
    const mapRow = buildEventBenefitCardModel(
      paidEntitlement("pro", {
        quotas: {
          ...paidEntitlement("pro").quotas,
          map: {
            days: 7,
            expiresAt: expiresTonight.toISOString(),
            active: true,
          },
        },
      }),
    ).rows.find((row) => row.id === "map");
    expect(mapRow?.quotaLabel).toBe("当日有效");
    expect(mapRow?.hint).toBe("权益今日到期");
    expect(mapRow?.showBar).toBe(false);
  });

  it("formats valid-until from entitlement.validUntil as YYYY-MM-DD", () => {
    const card = buildEventBenefitCardModel(
      paidEntitlement("pro_plus", {
        purchasedAt: "2026-08-15T00:00:00.000Z",
        validUntil: "2026-09-14T00:00:00.000Z",
        quotas: {
          ...paidEntitlement("pro_plus").quotas,
          map: {
            days: 15,
            expiresAt: "2026-08-30T00:00:00.000Z",
            active: true,
          },
        },
      }),
    );
    expect(card.validUntilLabel).toBe("权益有效期至 2026-09-14");
  });

  it("derives valid-until from purchasedAt + 30d when validUntil omitted", () => {
    const card = buildEventBenefitCardModel(
      paidEntitlement("pro", {
        purchasedAt: "2026-05-01T00:00:00.000Z",
        validUntil: undefined,
      }),
    );
    expect(card.validUntilLabel).toBe("权益有效期至 2026-05-31");
  });
});
