// Fixture-relative placement model, driven by the authoritative scene-placement
// contract (src/assets/jager-3d-glb/scene-placement.json). Products no longer
// carry absolute world coordinates (which made them float at a magic y); instead
// each product sits at a slot offset from a named fixture, and `surfaceY` is the
// measured shelf-top height of that fixture in its own local space.
//   world position = fixture.position + [dx, surfaceY + dy, dz]
// The floor_interior is 0.06 m thick, so every fixture standing on the floor has
// position.y = 0.06 (the walking surface); wall-mounted shelves carry their own y.

// Interior fixtures the shop is built from. Positions/rotations/shelf heights are
// taken verbatim from the placement contract's `fixtures` block.
export const FIXTURES = [
  // Liquor shelf against the enlarged back wall (inner face z = −5.5); contract
  // shelf_tops [0.175, 0.655, 1.135, 1.615, 2.055]. Eye-level shelf (1.135) is the
  // default surface; lower shelves reached via a negative dy in the slot.
  { id: "shelfMain", glb: "liquor-shelf-bay.glb", position: [0, 0.06, -5.3], rotationY: 0, surfaceY: 1.135 },
  // Glass wine cabinet, back-left (README assembly: [-3.4, 0.06, -5.27]);
  // shelf_tops [0.2, 0.64, 1.08, 1.52]. Bottles slot inside its 1.02 × 0.38 clear.
  { id: "wineCabinet", glb: "wine-cabinet.glb", position: [-3.4, 0.06, -5.27], rotationY: 0, surfaceY: 1.08 },
  // Specials podium centred on the floor rug (rug at [0, 0.07, 0.5]) as the hero
  // display; a special/hero bottle model will stand on its top cap later
  // (top_surface_local 1.025 → world y = 0.06 + 1.025 = 1.085). Faced square to the
  // entrance so it reads head-on.
  { id: "podium", glb: "specials-podium.glb", position: [0, 0.06, 0.5], rotationY: 0, surfaceY: 1.025, blocking: true },
  // Wall-mounted accessory shelf, back-right against the enlarged wall; base floats
  // at y = 1.11, deck tops local [0.09, 0.44, 0.79] → world 1.20 / 1.55 / 1.90.
  { id: "accessoryShelf", glb: "accessory-shelf.glb", position: [2.4, 1.11, -5.35], rotationY: 0, surfaceY: 0.09 },
  // Free-standing accessory display stand; tier tops local [0.435, 0.875, 1.275].
  { id: "accessoryStand", glb: "accessory-stand.glb", position: [-2.4, 0.06, 1.6], rotationY: 0, surfaceY: 0.435, blocking: true },
];

// Products slotted onto fixtures. `model` is the product's unique shop3dModel
// GLB file name (see backfill MODEL_BY_NAME); the resolver renders that GLB.
// `slot` is [dx, dy, dz] relative to the fixture's surface.
export const PRODUCT_SLOTS = [
  // 700ml family across the eye-level shelf (surfaceY 1.135).
  { model: "jager-original-700.glb", fixtureId: "shelfMain", slot: [-0.4, 0, 0.12] },
  { model: "jager-original-1000.glb", fixtureId: "shelfMain", slot: [0.0, 0, 0.12] },
  { model: "jager-orange-1000.glb", fixtureId: "shelfMain", slot: [0.4, 0, 0.12] },
  // Lower shelf (0.655 → dy = 0.655 - 1.135 = -0.48).
  { model: "jager-original-200.glb", fixtureId: "shelfMain", slot: [-0.4, -0.48, 0.12] },
  { model: "jager-original-de-700.glb", fixtureId: "shelfMain", slot: [0.4, -0.48, 0.12] },
  // Minis inside the wine cabinet.
  { model: "jager-original-20.glb", fixtureId: "wineCabinet", slot: [-0.25, 0, 0.08] },
  { model: "jager-original-de-100.glb", fixtureId: "wineCabinet", slot: [0.25, 0, 0.08] },
];

// Decorative accessory props on the accessory fixtures (not tied to catalog
// products — set dressing so the shop reads as a real store).
export const ACCESSORY_PLACEMENTS = [
  // On the wall-mounted accessory shelf deck (world y ≈ 1.20).
  { glb: "drinking-glass.glb", fixtureId: "accessoryShelf", slot: [-0.5, 0, 0.1] },
  { glb: "jigger.glb", fixtureId: "accessoryShelf", slot: [0.0, 0, 0.1] },
  { glb: "pourer.glb", fixtureId: "accessoryShelf", slot: [0.5, 0, 0.1] },
  // On the free-standing accessory stand: shaker on the low tier (0.435), flask
  // on the middle tier (0.875 → dy 0.44).
  { glb: "shaker.glb", fixtureId: "accessoryStand", slot: [0, 0, 0] },
  { glb: "flask.glb", fixtureId: "accessoryStand", slot: [0, 0.44, 0] },
  // Gift box now sits on the cashier counter (see fixtures.component.jsx); the
  // podium is reserved for the upcoming special/hero bottle model.
];

// Shop logo applied to these exterior slots (verified nodes/materials).
export const LOGO_SLOTS = [
  { glb: "signboard.glb", node: "logo_slot" },
  { glb: "street-lamp.glb", node: "banner_slot" },
];

// The mesh material name that receives an image texture across GLB slots.
export const SLOT_MATERIAL_NAME = "slot_face";
