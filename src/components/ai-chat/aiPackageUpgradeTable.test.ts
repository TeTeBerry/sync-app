import { describe, expect, it } from "vitest";
import { MOCK_PACKAGE_CATALOG } from "../../pages/profile/profilePackageData";
import { buildAiPackageCompareRows } from "./aiPackageUpgradeTable";

describe("buildAiPackageCompareRows", () => {
  it("builds four comparison rows without voucher/exposure", () => {
    const rows = buildAiPackageCompareRows(MOCK_PACKAGE_CATALOG.tiers);
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.id)).toEqual([
      "aiMatch",
      "contactUnlock",
      "mapDays",
      "postPin",
    ]);
    expect(rows[0].values.pro).toBe("8 次");
    expect(rows[0].values.ultra).toBe("不限次");
    expect(rows[3].values.pro).toBe("—");
    expect(rows[3].values.pro_plus).toBe("×1 次");
  });
});
