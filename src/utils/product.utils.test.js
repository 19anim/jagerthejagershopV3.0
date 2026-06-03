import { describe, expect, it } from "vitest";
import { clampQuantityToStock, filterAndSortProducts, getProductDetailPath } from "./product.utils";

const products = [
  {
    _id: "1",
    name: "Alpha",
    vol: "700ml",
    slug: "alpha",
    priceInInteger: 300,
    stock: 2,
    soldAmount: 4,
    isBestSeller: true,
    createdAt: "2026-01-01",
    category: { _id: "cat-1", name: "Bottle", slug: "bottle" },
  },
  {
    _id: "2",
    name: "Bravo",
    vol: "500ml",
    slug: "bravo",
    priceInInteger: 100,
    stock: 0,
    soldAmount: 10,
    isBestSeller: false,
    createdAt: "2026-02-01",
    category: { _id: "cat-2", name: "Gift", slug: "gift" },
  },
];

describe("product utils", () => {
  it("builds localized-ready product detail paths from category and product slugs", () => {
    expect(getProductDetailPath(products[0])).toBe("/products/bottle/alpha");
  });

  it("clamps quantities to available stock", () => {
    expect(clampQuantityToStock(5, 2)).toBe(2);
    expect(clampQuantityToStock(-1, 2)).toBe(1);
    expect(clampQuantityToStock(3, 0)).toBe(0);
  });

  it("filters and sorts without mutating the original product list", () => {
    const result = filterAndSortProducts(products, {
      searchTerm: "",
      category: "ALL",
      inStockOnly: false,
      bestSellerOnly: false,
      sortBy: "price-asc",
    });
    expect(result.map((product) => product.name)).toEqual(["Bravo", "Alpha"]);
    expect(products.map((product) => product.name)).toEqual(["Alpha", "Bravo"]);
  });

  it("applies search, category, stock, and best-seller filters", () => {
    const result = filterAndSortProducts(products, {
      searchTerm: "700",
      category: "cat-1",
      inStockOnly: true,
      bestSellerOnly: true,
      sortBy: "newest",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alpha");
  });
});
