import { describe, expect, it } from "vitest";
import { buildDebugContactUnlockExhaustedPreview } from "./profileDebugModals";

describe("buildDebugContactUnlockExhaustedPreview", () => {
  it("uses exhausted free contact unlock for free-tier upgrade preview", () => {
    const preview = buildDebugContactUnlockExhaustedPreview();
    expect(preview.freeMonthly.contactUnlock).toEqual({
      limit: 3,
      used: 3,
      remaining: 0,
    });
    expect(preview.currentPaidTierId).toBeNull();
    expect(preview.freeMonthly.aiMatch.remaining).toBeGreaterThan(0);
  });
});
