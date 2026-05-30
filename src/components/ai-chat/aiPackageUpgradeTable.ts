import type {
  PackageFeatureIcon,
  PackageTierDefinition,
  PackageTierId,
} from "../../types/backend";

export type AiPackageCompareRowId =
  | "aiMatch"
  | "contactUnlock"
  | "mapDays"
  | "postPin";

export type AiPackageCompareRow = {
  id: AiPackageCompareRowId;
  label: string;
  icon: PackageFeatureIcon;
  values: Record<PackageTierId, string>;
};

function formatCount(value: number | null): string {
  if (value == null) return "不限次";
  return `${value} 次`;
}

function formatMapDays(days: number): string {
  return `${days} 天`;
}

function formatPostPin(count: number): string {
  if (count <= 0) return "—";
  return `×${count} 次`;
}

/** Comparison rows for the AI upgrade sheet (no voucher / verify / exposure). */
export function buildAiPackageCompareRows(
  tiers: PackageTierDefinition[],
): AiPackageCompareRow[] {
  const byId = Object.fromEntries(tiers.map((tier) => [tier.id, tier])) as Record<
    PackageTierId,
    PackageTierDefinition | undefined
  >;

  const pro = byId.pro;
  const proPlus = byId.pro_plus;
  const ultra = byId.ultra;

  if (!pro || !proPlus || !ultra) {
    return [];
  }

  return [
    {
      id: "aiMatch",
      label: "AI 匹配",
      icon: "match",
      values: {
        pro: formatCount(pro.limits.aiMatchCount),
        pro_plus: formatCount(proPlus.limits.aiMatchCount),
        ultra: formatCount(ultra.limits.aiMatchCount),
      },
    },
    {
      id: "contactUnlock",
      label: "联系解锁",
      icon: "contact",
      values: {
        pro: formatCount(pro.limits.contactUnlockCount),
        pro_plus: formatCount(proPlus.limits.contactUnlockCount),
        ultra: formatCount(ultra.limits.contactUnlockCount),
      },
    },
    {
      id: "mapDays",
      label: "点位地图",
      icon: "map",
      values: {
        pro: formatMapDays(pro.limits.mapDays),
        pro_plus: formatMapDays(proPlus.limits.mapDays),
        ultra: formatMapDays(ultra.limits.mapDays),
      },
    },
    {
      id: "postPin",
      label: "帖子置顶",
      icon: "pin",
      values: {
        pro: formatPostPin(pro.limits.postPinCount),
        pro_plus: formatPostPin(proPlus.limits.postPinCount),
        ultra: formatPostPin(ultra.limits.postPinCount),
      },
    },
  ];
}
