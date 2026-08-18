import { describe, expect, it, vi } from "vitest";
import { resolveBottleInstances, getLabelTextureUrl } from "./shop3d.utils";

const products = [
  { _id: "p1", name: "Jagermeister Original 700ml", image: "https://res.cloudinary.com/x/upload/v1/a.jpg", priceInInteger: 500, stock: 3, slug: "jager-700" },
  { _id: "p2", name: "Jagermeister Original 20ml", image: "", priceInInteger: 100, stock: 5, slug: "jager-20" },
];

const placements = [
  { productName: "jagermeister original 700ml", glb: "bottle-herbal.glb", position: [0, 0, 0] },
  { productName: "Jagermeister Original 20ml", glb: "bottle-herbal-mini.glb", position: [1, 0, 0] },
  { productName: "Does Not Exist", glb: "bottle-herbal.glb", position: [2, 0, 0] },
];

describe("resolveBottleInstances", () => {
  it("matches placements to products case-insensitively and attaches metadata", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolveBottleInstances(products, placements);
    expect(result).toHaveLength(2);
    expect(result[0].product._id).toBe("p1");
    expect(result[0].glb).toBe("bottle-herbal.glb");
    expect(result[0].position).toEqual([0, 0, 0]);
    expect(result[1].product._id).toBe("p2");
    warn.mockRestore();
  });

  it("warns and skips placements with no matching product", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = resolveBottleInstances(products, placements);
    expect(result.some((instance) => instance.product.name === "Does Not Exist")).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
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
