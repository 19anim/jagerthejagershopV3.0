import { describe, expect, it } from "vitest";
import {
  ROOM, DOOR, FLOOR_Y, SIDEWALK_Y, groundHeight, isInsideShop,
  SHELF_RUNS, INTERIOR_COLLIDERS, OUTSIDE_COLLIDERS, INSIDE_BOUNDS, OUTSIDE_BOUNDS,
  START_POSE, INTERIOR_POSE, ENTER_PATH, EXIT_PATH, clearances, PEOPLE, ANCHORS,
} from "./layout";

const overlaps = (a, b) =>
  a.min[0] < b.max[0] && a.max[0] > b.min[0] && a.min[1] < b.max[1] && a.max[1] > b.min[1];
const inflate = (c, r) => ({ min: [c.min[0] - r, c.min[1] - r], max: [c.max[0] + r, c.max[1] + r] });
const contains = (c, x, z) => x > c.min[0] && x < c.max[0] && z > c.min[1] && z < c.max[1];

describe("layout", () => {
  it("keeps every shelf run inside the room", () => {
    for (const run of SHELF_RUNS) {
      const end = [run.start[0] + run.dir[0] * run.length, run.start[1] + run.dir[1] * run.length];
      for (const [x, z] of [run.start, end]) {
        expect(x).toBeGreaterThanOrEqual(ROOM.minX);
        expect(x).toBeLessThanOrEqual(ROOM.maxX);
        expect(z).toBeGreaterThanOrEqual(ROOM.minZ);
        expect(z).toBeLessThanOrEqual(ROOM.maxZ);
      }
      expect(run.levels).toHaveLength(run.clearances.length);
      run.clearances.forEach((c) => expect(c).toBeGreaterThan(0.2));
    }
  });

  it("has unit direction and facing vectors at right angles", () => {
    for (const run of SHELF_RUNS) {
      expect(Math.hypot(...run.dir)).toBeCloseTo(1);
      expect(Math.hypot(...run.facing)).toBeCloseTo(1);
      expect(run.dir[0] * run.facing[0] + run.dir[1] * run.facing[1]).toBeCloseTo(0);
    }
  });

  it("never lets two interior fixtures overlap", () => {
    for (let i = 0; i < INTERIOR_COLLIDERS.length; i++)
      for (let k = i + 1; k < INTERIOR_COLLIDERS.length; k++)
        expect(overlaps(INTERIOR_COLLIDERS[i], INTERIOR_COLLIDERS[k])).toBe(false);
  });

  it("keeps the doorway corridor and the arrival pose free", () => {
    const corridor = { min: [DOOR.x0, 3.6], max: [DOOR.x1, ROOM.maxZ] };
    for (const c of INTERIOR_COLLIDERS) expect(overlaps(c, corridor)).toBe(false);
    for (const c of INTERIOR_COLLIDERS)
      expect(contains(inflate(c, 0.3), INTERIOR_POSE.position[0], INTERIOR_POSE.position[2])).toBe(false);
  });

  it("keeps the start pose walkable", () => {
    const [x, , z] = START_POSE.position;
    expect(x).toBeGreaterThan(OUTSIDE_BOUNDS.minX);
    expect(x).toBeLessThan(OUTSIDE_BOUNDS.maxX);
    expect(z).toBeGreaterThan(OUTSIDE_BOUNDS.minZ);
    expect(z).toBeLessThan(OUTSIDE_BOUNDS.maxZ);
    for (const c of OUTSIDE_COLLIDERS) expect(contains(inflate(c, 0.3), x, z)).toBe(false);
  });

  it("reports the ground height under any point", () => {
    expect(isInsideShop(0, 0)).toBe(true);
    expect(groundHeight(0, 0)).toBe(FLOOR_Y);
    expect(groundHeight(0, 7)).toBe(SIDEWALK_Y);
    expect(groundHeight(0, 13)).toBe(0);
    expect(groundHeight(0, 19)).toBe(SIDEWALK_Y);
  });

  it("ends the entry dolly at the interior pose and the exit dolly outside", () => {
    expect(ENTER_PATH.at(-1)).toBe(INTERIOR_POSE);
    expect(EXIT_PATH.at(-1).position[2]).toBeGreaterThan(OUTSIDE_BOUNDS.minZ);
    expect(INSIDE_BOUNDS.maxZ).toBeLessThan(ROOM.maxZ);
  });

  it("computes the clear height above each shelf", () => {
    const [a, b] = clearances([0.2, 0.6], 1.0);
    expect(a).toBeCloseTo(0.37);
    expect(b).toBeCloseTo(0.37);
  });

  it("gives every person a spot or a path", () => {
    for (const p of PEOPLE) expect(Boolean(p.spot) !== Boolean(p.path)).toBe(true);
  });
  it("keeps outdoor theme anchors off street furniture", () => {
    for (const [x, , z] of [...ANCHORS.doorSides, ANCHORS.sidewalkByDoor])
      for (const c of OUTSIDE_COLLIDERS) expect(contains(inflate(c, 0.25), x, z)).toBe(false);
  });

  it("keeps walker lanes clear of parked props and the start pose", () => {
    for (const p of PEOPLE.filter((q) => q.path)) {
      const colliders = p.inside ? INTERIOR_COLLIDERS : OUTSIDE_COLLIDERS;
      for (let i = 1; i < p.path.length; i++) {
        const [a, b] = [p.path[i - 1], p.path[i]];
        const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.25);
        for (let k = 0; k <= steps; k++) {
          const x = a[0] + ((b[0] - a[0]) * k) / steps;
          const z = a[1] + ((b[1] - a[1]) * k) / steps;
          for (const c of colliders) expect(contains(inflate(c, 0.2), x, z)).toBe(false);
          if (!p.inside) expect(Math.hypot(x - START_POSE.position[0], z - START_POSE.position[2])).toBeGreaterThan(0.35);
        }
      }
    }
  });
});

