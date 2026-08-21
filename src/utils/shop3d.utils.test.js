import { describe, expect, it, vi } from "vitest";
import {
  resolveProductInstances,
  resolveAccessoryPlacements,
  getLabelTextureUrl,
} from "./shop3d.utils";

const products = [
  { _id: "p1", name: "Jagermeister Original 700ml", shop3dModel: "jager-original-700.glb", image: "https://res.cloudinary.com/x/upload/v1/a.jpg", priceInInteger: 500, stock: 3, slug: "jager-700" },
  { _id: "p2", name: "Jagermeister Original 20ml", shop3dModel: "jager-original-20.glb", image: "", priceInInteger: 100, stock: 5, slug: "jager-20" },
  { _id: "p3", name: "No Model Product", shop3dModel: "", image: "", priceInInteger: 1, stock: 1, slug: "no-model" },
];

const fixtures = [
  { id: "shelf", glb: "liquor-shelf-bay.glb", position: [0, 0, -1.6], surfaceY: 0.9 },
  { id: "podium", glb: "specials-podium.glb", position: [-2, 0, 0.4], surfaceY: 0.5 },
];

describe("resolveProductInstances", () => {
  it("matches by shop3dModel and returns glb === product.shop3dModel", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = [
      { model: "jager-original-700.glb", fixtureId: "shelf", slot: [0.5, 0, 0] },
    ];
    const result = resolveProductInstances(products, fixtures, slots);
    expect(result).toHaveLength(1);
    expect(result[0].product._id).toBe("p1");
    expect(result[0].glb).toBe("jager-original-700.glb");
    // x: 0 + 0.5, y: 0 + 0.9 + 0, z: -1.6 + 0
    expect(result[0].position).toEqual([0.5, 0.9, -1.6]);
    warn.mockRestore();
  });

  it("does not match products with an empty shop3dModel", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = [{ model: "", fixtureId: "shelf", slot: [0, 0, 0] }];
    expect(resolveProductInstances(products, fixtures, slots)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("warns and drops slots with an unknown model or fixture", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const slots = [
      { model: "ghost.glb", fixtureId: "shelf", slot: [0, 0, 0] },
      { model: "jager-original-20.glb", fixtureId: "nope", slot: [0, 0, 0] },
    ];
    expect(resolveProductInstances(products, fixtures, slots)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("is unaffected by product name changes (regression guard)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const renamed = [{ ...products[0], name: "Totally Different Name" }];
    const slots = [{ model: "jager-original-700.glb", fixtureId: "shelf", slot: [0, 0, 0] }];
    const result = resolveProductInstances(renamed, fixtures, slots);
    expect(result).toHaveLength(1);
    expect(result[0].product._id).toBe("p1");
    warn.mockRestore();
  });
});

describe("resolveAccessoryPlacements", () => {
  it("resolves accessory props onto fixture surfaces without a product", () => {
    const result = resolveAccessoryPlacements(fixtures, [
      { glb: "jigger.glb", fixtureId: "podium", slot: [0, 0, 0.2] },
    ]);
    expect(result[0].glb).toBe("jigger.glb");
    expect(result[0].position[0]).toBeCloseTo(-2);
    expect(result[0].position[1]).toBeCloseTo(0.5);
    expect(result[0].position[2]).toBeCloseTo(0.6);
  });
});

describe("getLabelTextureUrl", () => {
  it("returns an optimized cloudinary url when image present", () => {
    expect(getLabelTextureUrl(products[0])).toContain("/upload/");
    expect(getLabelTextureUrl(products[0])).toContain("res.cloudinary.com");
  });

  it("returns the fallback logo when image missing", () => {
    expect(getLabelTextureUrl(products[1])).toBeTruthy();
  });
});
