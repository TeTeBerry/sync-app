import { describe, expect, it } from "vitest";
import {
  isBoundActivityLegacyId,
  MOCK_PACKAGE_CATALOG,
  packageActivitySelectCtaLabel,
  packagePayAndBindCtaLabel,
  packageTierAlreadyOwnedCtaLabel,
  packageTierCtaLabel,
  packageTierNextStepCtaLabel,
  resolvePackageActivityPayCta,
  resolvePackageTierCta,
  resolvePackageTierStepCta,
} from "./profilePackageData";

const proTier = MOCK_PACKAGE_CATALOG.tiers.find((t) => t.id === "pro")!;
const proPlusTier = MOCK_PACKAGE_CATALOG.tiers.find((t) => t.id === "pro_plus")!;
const ultraTier = MOCK_PACKAGE_CATALOG.tiers.find((t) => t.id === "ultra")!;

describe("isBoundActivityLegacyId", () => {
  it("accepts finite activity ids", () => {
    expect(isBoundActivityLegacyId(4)).toBe(true);
  });

  it("rejects missing or invalid ids", () => {
    expect(isBoundActivityLegacyId(undefined)).toBe(false);
    expect(isBoundActivityLegacyId(null)).toBe(false);
    expect(isBoundActivityLegacyId(Number.NaN)).toBe(false);
  });
});

describe("packageTierAlreadyOwnedCtaLabel", () => {
  it("includes tier display name", () => {
    expect(packageTierAlreadyOwnedCtaLabel(proPlusTier)).toBe("您已是 Pro+ 套餐");
    expect(packageTierAlreadyOwnedCtaLabel(ultraTier)).toBe("您已是 Ultra 套餐");
  });
});

describe("resolvePackageTierCta", () => {
  it("shows normal purchase label when no current tier", () => {
    expect(resolvePackageTierCta({ selectedTier: proTier })).toEqual({
      label: packageTierCtaLabel(proTier),
      purchaseDisabled: false,
    });
  });

  it("disables purchase when selected tier matches current paid tier", () => {
    expect(
      resolvePackageTierCta({
        selectedTier: proPlusTier,
        currentPaidTierId: "pro_plus",
      }),
    ).toEqual({
      label: "您已是 Pro+ 套餐",
      purchaseDisabled: true,
    });
  });

  it("allows purchase when selecting a different tier", () => {
    expect(
      resolvePackageTierCta({
        selectedTier: ultraTier,
        currentPaidTierId: "pro",
      }),
    ).toEqual({
      label: packageTierCtaLabel(ultraTier),
      purchaseDisabled: false,
    });
  });

  it("allows purchase when downgrading selection vs current tier", () => {
    expect(
      resolvePackageTierCta({
        selectedTier: proTier,
        currentPaidTierId: "ultra",
      }),
    ).toEqual({
      label: packageTierCtaLabel(proTier),
      purchaseDisabled: false,
    });
  });
});

describe("packageTierNextStepCtaLabel", () => {
  it("prompts activity selection", () => {
    expect(packageTierNextStepCtaLabel()).toBe("下一步：选择适用活动");
  });
});

describe("resolvePackageActivityPayCta", () => {
  it("requires activity selection before pay", () => {
    expect(resolvePackageActivityPayCta({ selectedTier: undefined })).toEqual({
      label: packageActivitySelectCtaLabel(),
      purchaseDisabled: true,
      neutralDisabled: true,
    });
  });

  it("shows pay label with tier price", () => {
    expect(
      resolvePackageActivityPayCta({ selectedTier: proPlusTier }),
    ).toEqual({
      label: packagePayAndBindCtaLabel(proPlusTier),
      purchaseDisabled: false,
    });
  });

  it("blocks repeat purchase for same tier on activity", () => {
    expect(
      resolvePackageActivityPayCta({
        selectedTier: proPlusTier,
        paidTierId: "pro_plus",
      }),
    ).toEqual({
      label: "您已是 Pro+ 套餐",
      purchaseDisabled: true,
    });
  });
});

describe("resolvePackageTierStepCta", () => {
  it("shows next-step label for banner purchase", () => {
    expect(
      resolvePackageTierStepCta({
        selectedTier: proTier,
        activityPreKnown: false,
      }),
    ).toEqual({
      label: packageTierNextStepCtaLabel(),
      purchaseDisabled: false,
    });
  });

  it("shows direct pay when activity is pre-known (upgrade)", () => {
    expect(
      resolvePackageTierStepCta({
        selectedTier: ultraTier,
        activityPreKnown: true,
        currentPaidTierId: "pro",
      }),
    ).toEqual({
      label: packagePayAndBindCtaLabel(ultraTier),
      purchaseDisabled: false,
    });
  });
});
