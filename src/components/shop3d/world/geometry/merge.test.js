import { describe, expect, it } from "vitest";
import { BoxGeometry, IcosahedronGeometry } from "three";
import { mergeParts, UNIT_BOX, worldUV } from "./merge";

describe("mergeParts", () => {
  it("merges parts into one geometry per material", () => {
    const merged = mergeParts([
      { geo: UNIT_BOX, mat: "a", position: [0, 0, 0] },
      { geo: UNIT_BOX, mat: "a", position: [2, 0, 0] },
      { geo: new IcosahedronGeometry(0.5, 0), mat: "b", position: [0, 3, 0] },
    ]);
    expect([...merged.keys()].sort()).toEqual(["a", "b"]);
    expect(merged.get("a").attributes.position.count).toBe(72); // 2 boxes × 36 non-indexed vertices
    merged.get("a").computeBoundingBox();
    expect(merged.get("a").boundingBox.max.x).toBeCloseTo(2.5);
  });

  it("applies rotation and scale", () => {
    const merged = mergeParts([{ geo: UNIT_BOX, mat: "a", scale: [4, 1, 1], rotation: [0, Math.PI / 2, 0] }]);
    merged.get("a").computeBoundingBox();
    expect(merged.get("a").boundingBox.max.z).toBeCloseTo(2);
  });

  it("maps UVs in world metres so textures never stretch", () => {
    const g = worldUV(new BoxGeometry(2, 1, 1).toNonIndexed(), 1);
    const u = g.attributes.uv.array;
    expect(Math.max(...u) - Math.min(...u)).toBeCloseTo(2);
    const merged = mergeParts([{ geo: UNIT_BOX, mat: "t", scale: [3, 1, 1] }], { t: 1.5 });
    const uv = merged.get("t").attributes.uv.array;
    expect(Math.max(...uv) - Math.min(...uv)).toBeCloseTo(2);
  });

  it("keeps authored UVs when asked", () => {
    const merged = mergeParts([{ geo: UNIT_BOX, mat: "t", scale: [3, 1, 1], keepUV: true }], { t: 1 });
    const uv = merged.get("t").attributes.uv.array;
    expect(Math.max(...uv)).toBeLessThanOrEqual(1);
  });
});
