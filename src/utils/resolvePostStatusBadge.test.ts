import { describe, expect, it } from "vitest";
import {
  POST_STATUS_BADGE_COLORS,
  resolvePostStatusBadge,
  shouldShowPostStatusBadge,
} from "./postStatusBadge";

describe("resolvePostStatusBadge", () => {
  it("maps recruiting", () => {
    expect(resolvePostStatusBadge({ status: "招募中" })).toEqual({
      label: "招募中",
      color: POST_STATUS_BADGE_COLORS.recruiting,
      variant: "recruiting",
    });
  });

  it("maps completed team status", () => {
    expect(resolvePostStatusBadge({ status: "已组队" })).toEqual({
      label: "已组队",
      color: POST_STATUS_BADGE_COLORS.completed,
      variant: "full",
    });
  });

  it("maps hidden status", () => {
    expect(resolvePostStatusBadge({ status: "已隐藏" })).toEqual({
      label: "已隐藏",
      color: POST_STATUS_BADGE_COLORS.hidden,
      variant: "hidden",
    });
  });
});

describe("shouldShowPostStatusBadge", () => {
  it("shows completed status to all viewers", () => {
    const badge = resolvePostStatusBadge({ status: "已组队" });
    expect(shouldShowPostStatusBadge(badge, false)).toBe(true);
  });

  it("hides recruiting from non-authors", () => {
    const badge = resolvePostStatusBadge({ status: "招募中" });
    expect(shouldShowPostStatusBadge(badge, false)).toBe(false);
    expect(shouldShowPostStatusBadge(badge, true)).toBe(true);
  });
});
