import { getOptimizedImageUrl } from "./image.utils";

const normalizeModel = (model) => (model || "").trim().toLowerCase();

// Resolve a fixture-relative slot into an absolute world position that rests on
// the fixture's measured top surface.
const slotToWorld = (fixture, slot) => {
  const [fx, fy, fz] = fixture.position;
  const [dx, dy, dz] = slot;
  return [fx + dx, fy + fixture.surfaceY + dy, fz + dz];
};

// Map catalog products onto fixture slots by their unique shop3dModel file name.
// The GLB rendered is the product's own shop3dModel. Products without a model
// are never matched; unmatched slots are warned and dropped.
export const resolveProductInstances = (products, fixtures, slots) => {
  const byModel = new Map(
    products
      .filter((product) => normalizeModel(product.shop3dModel))
      .map((product) => [normalizeModel(product.shop3dModel), product])
  );
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  return slots
    .map((slot) => {
      const product = byModel.get(normalizeModel(slot.model));
      const fixture = byId.get(slot.fixtureId);
      if (!product) {
        console.warn(`[shop3d] No product matched model "${slot.model}"`);
        return null;
      }
      if (!fixture) {
        console.warn(`[shop3d] No fixture matched id "${slot.fixtureId}"`);
        return null;
      }
      return {
        product,
        glb: product.shop3dModel,
        position: slotToWorld(fixture, slot.slot),
        rotationY: slot.rotationY || 0,
      };
    })
    .filter(Boolean);
};

// Resolve decorative accessory props onto fixture surfaces (no catalog product).
export const resolveAccessoryPlacements = (fixtures, placements) => {
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  return placements
    .map((placement) => {
      const fixture = byId.get(placement.fixtureId);
      if (!fixture) {
        console.warn(`[shop3d] No fixture matched id "${placement.fixtureId}"`);
        return null;
      }
      return {
        glb: placement.glb,
        position: slotToWorld(fixture, placement.slot),
        rotationY: placement.rotationY || 0,
      };
    })
    .filter(Boolean);
};

export const getLabelTextureUrl = (product) => getOptimizedImageUrl(product?.image, "card");
