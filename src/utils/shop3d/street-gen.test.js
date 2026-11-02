import { describe, expect, it } from "vitest";
import { generateRow, mulberry32, SIGN_TEXTS } from "./street-gen";

describe("street generator", () => {
  it("is deterministic per seed", () => {
    expect(generateRow({ from: -40, to: -5.15, seed: 3 })).toEqual(generateRow({ from: -40, to: -5.15, seed: 3 }));
    expect(mulberry32(1)()).toBe(mulberry32(1)());
  });

  it("covers the span exactly with houses 3.6–7.2 m wide", () => {
    for (const seed of [1, 2, 3, 9, 42]) {
      const row = generateRow({ from: 5.15, to: 40, seed });
      expect(row[0].x0).toBeCloseTo(5.15);
      for (let i = 1; i < row.length; i++) expect(row[i].x0).toBeCloseTo(row[i - 1].x0 + row[i - 1].w);
      const last = row.at(-1);
      expect(last.x0 + last.w).toBeCloseTo(40);
      row.forEach((h) => {
        expect(h.w).toBeGreaterThanOrEqual(3.6);
        expect(h.w).toBeLessThanOrEqual(7.2);
        expect(h.storeys).toHaveLength(h.floors);
        expect(h.sign).toBeLessThan(SIGN_TEXTS.length);
      });
    }
  });
});
