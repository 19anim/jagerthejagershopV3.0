import { afterEach, describe, expect, it, vi } from "vitest";
import { BOTTLE_DIMS, buildShelfInstances, groupInstances, sizeClass } from "./product-blocks";

const run = (over = {}) => ({
  id: "r1", start: [0, 0], dir: [1, 0], facing: [0, 1], length: 2, levels: [1.0],
  clearances: [0.39], depth: 0.38, accepts: ["std"], skipLevels: [], ...over,
});
const p = (id, model, stock = 10) => ({ _id: id, name: id, shop3dModel: model, stock });

afterEach(() => vi.restoreAllMocks());

describe("buildShelfInstances", () => {
  it("packs products into blocks without overlaps or running past the end", () => {
    const products = [p("a", "bottle-700ml.glb"), p("b", "orange-1000ml.glb")];
    const out = buildShelfInstances({ products, runs: [run()], maxDepth: 1 });
    expect(out.length).toBeGreaterThan(10);
    const xs = out.map((i) => i.position[0]).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(0.09);
    for (const i of out) {
      const half = BOTTLE_DIMS[i.model].w / 2;
      expect(i.position[0] - half).toBeGreaterThanOrEqual(0);
      expect(i.position[0] + half).toBeLessThanOrEqual(2);
      expect(i.position[1]).toBe(1.0);
    }
    expect(new Set(out.map((i) => i.product._id))).toEqual(new Set(["a", "b"]));
  });

  it("sets bottles back from the front edge and faces them along `facing`", () => {
    const [first] = buildShelfInstances({ products: [p("a", "bottle-700ml.glb")], runs: [run()], maxDepth: 1 });
    expect(first.position[2]).toBeLessThan(0); // facing +z, so set back toward −z
    expect(first.rotationY).toBeCloseTo(0);
    const [west] = buildShelfInstances({ products: [p("a", "bottle-700ml.glb")], runs: [run({ dir: [0, 1], facing: [-1, 0] })], maxDepth: 1 });
    expect(west.position[0]).toBeGreaterThan(0);
    expect(west.rotationY).toBeCloseTo(-Math.PI / 2);
  });

  it("stacks rows by stock, capped by maxDepth and the shelf depth, at least one", () => {
    const deep = buildShelfInstances({ products: [p("a", "bottle-700ml.glb", 50)], runs: [run()], maxDepth: 2 });
    expect(Math.max(...deep.map((i) => i.depthIndex))).toBe(1);
    const sold = buildShelfInstances({ products: [p("a", "bottle-700ml.glb", 0)], runs: [run()], maxDepth: 2 });
    expect(Math.max(...sold.map((i) => i.depthIndex))).toBe(0);
    const shallow = buildShelfInstances({ products: [p("a", "bottle-1000ml.glb", 50)], runs: [run({ depth: 0.1 })], maxDepth: 4 });
    expect(Math.max(...shallow.map((i) => i.depthIndex))).toBe(0);
  });

  it("puts minis only on mini runs and skips bottles taller than the clearance", () => {
    const products = [p("mini", "bottle-20ml.glb"), p("big", "bottle-1000ml.glb")];
    const out = buildShelfInstances({
      products,
      runs: [run({ id: "std" }), run({ id: "mini", accepts: ["mini"] }), run({ id: "low", clearances: [0.2] })],
      maxDepth: 1,
    });
    expect(out.filter((i) => i.runId === "std").every((i) => i.product._id === "big")).toBe(true);
    expect(out.filter((i) => i.runId === "mini").every((i) => i.product._id === "mini")).toBe(true);
    expect(out.filter((i) => i.runId === "low")).toHaveLength(0);
    expect(sizeClass(BOTTLE_DIMS["bottle-20ml.glb"])).toBe("mini");
  });

  it("fills eye-level shelves first when the budget is small, and skips skipLevels", () => {
    const r = run({ levels: [0.2, 0.62, 1.04, 1.46], clearances: [0.39, 0.39, 0.39, 0.39], skipLevels: [0] });
    const out = buildShelfInstances({ products: [p("a", "bottle-700ml.glb")], runs: [r], maxDepth: 1, maxInstances: 5 });
    expect(out).toHaveLength(5);
    expect(out.every((i) => i.levelIndex === 3)).toBe(true); // 1.46 is nearest 1.3
    const all = buildShelfInstances({ products: [p("a", "bottle-700ml.glb")], runs: [r], maxDepth: 1 });
    expect(all.some((i) => i.levelIndex === 0)).toBe(false);
  });

  it("shows every product that shares a model file", () => {
    const products = [p("x", "bottle-700ml.glb"), p("y", "bottle-700ml.glb")];
    const out = buildShelfInstances({ products, runs: [run({ length: 4 })], maxDepth: 1 });
    expect(new Set(out.map((i) => i.product._id))).toEqual(new Set(["x", "y"]));
  });

  it("warns once and skips products with an unknown or empty model", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const out = buildShelfInstances({ products: [p("u", "nope.glb"), p("e", "")], runs: [run()] });
    expect(out).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("gives each instance a unique key and its bottle height", () => {
    const out = buildShelfInstances({ products: [p("a", "bottle-700ml.glb")], runs: [run()], maxDepth: 2 });
    expect(new Set(out.map((i) => i.key)).size).toBe(out.length);
    expect(out[0].height).toBe(BOTTLE_DIMS["bottle-700ml.glb"].h);
  });
});

describe("groupInstances", () => {
  it("groups by product and model", () => {
    const products = [p("x", "bottle-700ml.glb"), p("y", "bottle-700ml.glb")];
    const groups = groupInstances(buildShelfInstances({ products, runs: [run({ length: 4 })], maxDepth: 1 }));
    expect(groups.map((g) => g.product._id).sort()).toEqual(["x", "y"]);
    groups.forEach((g) => g.instances.forEach((i) => expect(i.product).toBe(g.product)));
  });
});
