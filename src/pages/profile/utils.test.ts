import { describe, expect, it } from "vitest";
import { deriveInterestTag } from "./utils";

describe("deriveInterestTag", () => {
  it("returns null for missing or empty bio", () => {
    expect(deriveInterestTag(undefined)).toBeNull();
    expect(deriveInterestTag(null)).toBeNull();
    expect(deriveInterestTag("   ")).toBeNull();
  });

  it("detects 电音 tag", () => {
    expect(deriveInterestTag("电音爱好者")).toBe("电音");
  });
});
