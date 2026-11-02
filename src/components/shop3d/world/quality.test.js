import { describe, expect, it } from "vitest";
import { detectTier, QUALITY } from "./quality";

const env = ({ coarse = false, memory, search = "" } = {}) => ({
  matchMedia: () => ({ matches: coarse }),
  navigator: { deviceMemory: memory },
  location: { search },
});

describe("detectTier", () => {
  it("picks high on a desktop", () => expect(detectTier(env({ memory: 8 }))).toBe("high"));
  it("picks low on touch devices", () => expect(detectTier(env({ coarse: true }))).toBe("low"));
  it("picks low on small-memory devices", () => expect(detectTier(env({ memory: 4 }))).toBe("low"));
  it("honours ?quality=", () => {
    expect(detectTier(env({ coarse: true, search: "?quality=high" }))).toBe("high");
    expect(detectTier(env({ search: "?quality=low" }))).toBe("low");
  });
  it("defaults to high without a window", () => expect(detectTier(undefined)).toBe("high"));
  it("keeps the low tier within budget", () => {
    expect(QUALITY.low.maxInstances).toBeLessThanOrEqual(450);
    expect(QUALITY.low.bloom).toBe(false);
    expect(QUALITY.high.maxInstances).toBeLessThanOrEqual(1800);
  });
});
