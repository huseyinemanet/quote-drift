import { addDays, getDayKey, getNextLocalMidnight } from "@/core/date";

describe("date helpers", () => {
  it("builds a local calendar day key without UTC shifting", () => {
    const localDate = new Date(2026, 2, 6, 23, 45, 0, 0);

    expect(getDayKey(localDate)).toBe("2026-03-06");
  });

  it("returns the next local midnight", () => {
    const now = new Date(2026, 2, 6, 23, 45, 12, 500);
    const nextMidnight = getNextLocalMidnight(now);

    expect(getDayKey(nextMidnight)).toBe("2026-03-07");
    expect(nextMidnight.getHours()).toBe(0);
    expect(nextMidnight.getMinutes()).toBe(0);
    expect(nextMidnight.getSeconds()).toBe(0);
    expect(nextMidnight.getMilliseconds()).toBe(0);
  });

  it("keeps consecutive local day keys stable across addDays", () => {
    const start = new Date(2026, 2, 6, 9, 30, 0, 0);

    expect(getDayKey(start)).toBe("2026-03-06");
    expect(getDayKey(addDays(start, 1))).toBe("2026-03-07");
  });
});
