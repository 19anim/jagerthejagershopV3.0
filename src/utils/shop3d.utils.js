import { getOptimizedImageUrl } from "./image.utils";

const normalizeName = (name) => (name || "").trim().toLowerCase();

export const resolveBottleInstances = (products, placements) => {
  const byName = new Map(products.map((product) => [normalizeName(product.name), product]));
  return placements
    .map((placement) => {
      const product = byName.get(normalizeName(placement.productName));
      if (!product) {
        console.warn(`[shop3d] No product matched placement "${placement.productName}"`);
        return null;
      }
      return {
        product,
        glb: placement.glb,
        position: placement.position,
        rotationY: placement.rotationY || 0,
      };
    })
    .filter(Boolean);
};

export const getLabelTextureUrl = (product) => getOptimizedImageUrl(product?.image, "card");
