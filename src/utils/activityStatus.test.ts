import { describe, expect, it } from "vitest";
import { compareActivitiesNearestFirst } from "./activityStatus";

const NOW = new Date(2026, 4, 30, 12, 0, 0, 0);

function sortNearest(
  items: Array<{ date?: string; title?: string }>,
): Array<{ date?: string; title?: string }> {
  return [...items].sort((a, b) => compareActivitiesNearestFirst(a, b, NOW));
}

describe("compareActivitiesNearestFirst", () => {
  it("orders non-ended events by start date ascending", () => {
    const sorted = sortNearest([
      { date: "07/12", title: "Later" },
      { date: "06/01", title: "Sooner" },
    ]);
    expect(sorted.map((e) => e.date)).toEqual(["06/01", "07/12"]);
  });

  it("places ended events after upcoming ones", () => {
    const sorted = sortNearest([
      { date: "2024-07-12", title: "Past fest" },
      { date: "07/12", title: "Upcoming fest" },
    ]);
    expect(sorted.map((e) => e.date)).toEqual(["07/12", "2024-07-12"]);
  });

  it("orders ended events by start date descending", () => {
    const sorted = sortNearest([
      { date: "2023-12-11", title: "Older ended" },
      { date: "2024-07-12", title: "Newer ended" },
    ]);
    expect(sorted.map((e) => e.date)).toEqual(["2024-07-12", "2023-12-11"]);
  });

  it("pushes items without parseable dates to the end", () => {
    const sorted = sortNearest([
      { date: "", title: "No date" },
      { date: "06/01", title: "Dated" },
    ]);
    expect(sorted.map((e) => e.title)).toEqual(["Dated", "No date"]);
  });
});
