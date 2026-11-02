import { describe, expect, it } from "vitest";
import { createWalker, pathLength, pointAt, shouldYield, stepWalker } from "./people-paths";

const line = [[0, 0], [10, 0]];

describe("people paths", () => {
  it("measures and samples a polyline", () => {
    expect(pathLength([[0, 0], [3, 4], [3, 10]])).toBeCloseTo(11);
    const mid = pointAt(line, 5);
    expect(mid.position).toEqual([5, 0]);
    expect(mid.heading).toBeCloseTo(Math.PI / 2); // walking +x
    expect(pointAt(line, 99).position).toEqual([10, 0]);
  });

  it("walks forward at its speed", () => {
    const { walker, moving, position } = stepWalker(createWalker({ points: line, speed: 2 }), 1, null);
    expect(moving).toBe(true);
    expect(walker.s).toBeCloseTo(2);
    expect(position[0]).toBeCloseTo(2);
  });

  it("turns around at the end after pausing", () => {
    const w = { ...createWalker({ points: line, speed: 2, endPause: 1 }), s: 9.5 };
    let r = stepWalker(w, 1, null);
    expect(r.arrived).toBe(true);
    expect(r.walker.dir).toBe(-1);
    r = stepWalker(r.walker, 0.5, null);
    expect(r.moving).toBe(false); // still pausing
    r = stepWalker(r.walker, 0.6, null);
    r = stepWalker(r.walker, 1, null);
    expect(r.moving).toBe(true);
    expect(r.walker.s).toBeLessThan(10);
    expect(r.heading).toBeCloseTo(-Math.PI / 2); // walking back toward −x
  });

  it("yields to a player standing in its way but not behind or beside it", () => {
    const w = { ...createWalker({ points: line, speed: 1 }), s: 4 };
    expect(shouldYield(w, [4.8, 0.2])).toBe(true);
    expect(shouldYield(w, [3.0, 0])).toBe(false);
    expect(shouldYield(w, [4.8, 2])).toBe(false);
    const r = stepWalker(w, 1, [4.8, 0.2]);
    expect(r.moving).toBe(false);
    expect(r.walker.s).toBe(4);
  });
});
