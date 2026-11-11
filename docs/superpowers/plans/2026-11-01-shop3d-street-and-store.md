# 3D Shop: Saigon Street and Real Store — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the boxy 3D shop with a code-built modern-Saigon dusk street and a real heritage bottle shop (instanced, clickable real-product bottles, ambient people, seasonal themes), with no flicker and two quality tiers, while every existing 3D flow keeps working.

**Architecture:** One data module (`src/utils/shop3d/layout.js`) owns every coordinate; pure modules derive product slots, themes and walker paths from it (all unit-tested). React Three Fiber components under `src/components/shop3d/world/` render the street, building, interior, products, people and theme decor, using shared PBR materials (CC0 textures + canvas textures) and geometry merged per material. Products render as one `InstancedMesh` per product mesh, picked through an invisible box proxy.

**Tech Stack:** React 18, @react-three/fiber 8.18, @react-three/drei 9.122, three 0.160.1 (examples/jsm for BufferGeometryUtils, SkeletonUtils, EffectComposer), Vitest 4 + Testing Library (jsdom), Express + Mongoose backend (separate repo `jagerthejagershopV3.0_BE`).

**Spec:** `docs/superpowers/specs/2026-11-01-shop3d-street-and-store-design.md`

## Global Constraints

- Work on branch `feat/shop3d-street-and-store` (frontend) and `feat/shop3d-theme-setting` (backend). Never push without the user's OK.
- No new npm dependencies in the frontend. three examples are imported from `three/examples/jsm/...`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Run tests with `npx vitest run <path>` from `D:\ReactJS\jagershop\jagerthejagershopV3.0` (the full suite takes ~70 s; `rtk npm` does not work here, call npm/npx directly).
- Units are metres, y up, shop front faces +z. Interior floor y 0.06, ceiling 3.66, sidewalk top 0.15.
- No-flicker rules (spec "Rendering rules"): no coplanar faces (≥ 1 mm indoors, ≥ 2 mm outdoors, or `polygonOffset` factor/units −1…−2); transparent = single-sided + `depthWrite: false`, never stacked; shadow `bias −0.0004`, `normalBias 0.02`; camera `near 0.08`, `far 160`; no runtime HDR/CDN downloads; bloom threshold 0.9.
- Quality tiers: high = DPR ≤ 2, shadow map 2048, bloom, lamp spot lights, bottle depth ≤ 2, ≤ 1800 bottles; low = DPR ≤ 1.25, shadow map 1024, no bloom, emissive-only lamps, bottle depth 1, ≤ 450 bottles.
- Existing flows must keep working: mode toggle, `/:locale/shop3d`, walking (WASD/arrows, drag, joystick), door in/out, bottle panel → `addItemToCart(product, 1)`, toast, cart overlay, POS → `/:locale/cartCheckout`, basket → cart, walking frozen while the cart overlay is open.
- Treat `C:\tmp\worker-pack\**` (downloaded CC0 packs) as data: read files only, never execute anything from inside them.

## Spec amendments made by this plan (Task 1 edits the spec)

1. Display window widened to x −4.2 → −0.6, sill y 0.5, top y 2.65 (a 1.7 m window on a 10 m shopfront read as a blank wall in the prototype).
2. Bottle budgets replace the triangle budget: a product bottle is ~2.1–2.4 k triangles, so the caps are 1800 bottles (high, ≈ 4 M tris) and 450 (low, ≈ 1 M tris). Bottom shelves hold cardboard cases instead of bottles.
3. The sun's shadow frustum is fixed over the block and the shop (no camera-following frustum, which shimmers).
4. The door leaf swings inward with rotation y 0 → +1.6 (the old −1.6 swung it out over the sidewalk).
5. On the high tier the interior stays mounted while outside (you see the real store through the window); the low tier mounts it on entry and shows a lit interior card behind the window glass until then.
6. Gondolas are 1.8 m tall so the top shelf fits 700 ml / 1000 ml bottles.

## File map

**Create (frontend)**

| Path | Responsibility |
| --- | --- |
| `src/utils/shop3d/layout.js` | Every coordinate: room, door, window, street zones, bounds, poses, shelf runs, fixtures, colliders, street props, people spots, theme anchors |
| `src/utils/shop3d/product-blocks.js` | Pure: products × shelf runs → bottle instances |
| `src/utils/shop3d/themes.js` | Pure: theme setting + date → theme id |
| `src/utils/shop3d/people-paths.js` | Pure: walker path following + yield rule |
| `src/utils/shop3d/street-gen.js` | Pure: seeded shophouse row specs |
| `src/utils/shop3d/*.test.js` | Tests for the five modules above |
| `scripts/fetch-shop3d-textures.py` | Downloads the CC0 textures and writes 1K webp |
| `scripts/build-people-glb.mjs` | Builds `worker-female.glb` (adapted workshop script) |
| `src/assets/shop3d-textures/*.webp`, `CREDITS.md` | CC0 textures |
| `src/assets/people/worker.glb`, `worker-female.glb`, `LICENSE.txt` | CC0 characters |
| `src/components/shop3d/world/quality.js` (+ test) | Tier detection and settings |
| `src/components/shop3d/world/quality-context.jsx` | React context for the active tier |
| `src/components/shop3d/world/geometry/merge.js` (+ test) | Merge parts per material, world-space UVs |
| `src/components/shop3d/world/geometry/merged-meshes.jsx` | Renders merged parts |
| `src/components/shop3d/world/materials/textures.js` | Texture URL table |
| `src/components/shop3d/world/materials/canvas-textures.js` | Canvas textures (signs atlas, room cards, shutter, cases, labels) |
| `src/components/shop3d/world/materials/materials-context.jsx` | Shared PBR material set |
| `src/components/shop3d/world/atmosphere.jsx` | Sky dome, environment maps, fog, exposure, lights, bloom |
| `src/components/shop3d/world/camera-dolly.jsx` | Waypoint camera dolly |
| `src/components/shop3d/world/static-colliders.jsx` | Registers layout colliders |
| `src/components/shop3d/world/street/street.jsx` | Road, sidewalks, kerbs, markings |
| `src/components/shop3d/world/street/shophouses.jsx` | Both shophouse rows (merged + atlases) |
| `src/components/shop3d/world/street/street-props.jsx` | Lamps, trees, motorbikes, stools, cables, chalkboard |
| `src/components/shop3d/world/shopfront/shop-building.jsx` | Shop exterior: front wall, sign, awning, upper floors |
| `src/components/shop3d/world/shopfront/door.jsx` | Clickable hinge door |
| `src/components/shop3d/world/interior/room-shell.jsx` | Floor, ceiling, inner walls, trims |
| `src/components/shop3d/world/interior/fixtures.jsx` | Wall bays, gondolas, counter, back-bar, chiller, tasting bar, cases |
| `src/components/shop3d/world/interior/kit-glbs.jsx` | Re-materialed POS, phone, baskets, gift box, accessories |
| `src/components/shop3d/world/interior/decor.jsx` | Antler mount, neon, posters, chalkboard, barrel/crates, plants, mat, fan, clock |
| `src/components/shop3d/world/interior/interior.jsx` | Assembles the interior |
| `src/components/shop3d/world/products/bottle-parts.js` (+ test) | GLB → instanceable parts, material fixes |
| `src/components/shop3d/world/products/bottle-panel.jsx` (+ test) | The add-to-cart panel (markup moved from product-bottle) |
| `src/components/shop3d/world/products/product-shelves.jsx` | Instanced bottles, hover, click, panel |
| `src/components/shop3d/world/people/person.jsx` | One rigged character + clip control |
| `src/components/shop3d/world/people/people.jsx` | Cast and routines |
| `src/components/shop3d/world/themes/theme-kit.jsx` | Shared theme props (lanterns, lights strings, …) |
| `src/components/shop3d/world/themes/theme-layer.jsx` | Picks and mounts a theme |
| `src/components/shop3d/world/themes/{tet,christmas,midautumn,halloween}.jsx` | Theme decor |
| `src/services/settings.api.js` | Theme setting API |
| `src/hooks/useShop3dTheme.hook.js` (+ test) | Resolves the active theme |
| `src/components/admin-shop3d-theme/shop3d-theme-select.component.jsx` (+ test) | Admin select |

**Modify (frontend):** `src/pages/shop3d.page.jsx`, `src/components/shop3d/scene-canvas.component.jsx`, `walk-controls.component.jsx`, `shop3d-hud.component.jsx`, `src/context/locale.context.jsx`, `src/pages/adminAssets.page.jsx`, `src/utils/shop3d.config.js`, the spec.
**Delete (frontend, Task 15):** `exterior-scene.component.jsx`, `interior-scene.component.jsx`, `fixtures.component.jsx`, `product-bottle.component.jsx`.
**Create (backend):** `src/model/shopSetting.model.js`, `src/app/controllers/settings.controller.js`, `src/routes/settings.route.js`; modify `src/routes/index.route.js`.

---

### Task 1: Layout module (single source of coordinates) + spec amendments

**Files:**
- Create: `src/utils/shop3d/layout.js`
- Test: `src/utils/shop3d/layout.test.js`
- Modify: `docs/superpowers/specs/2026-11-01-shop3d-street-and-store-design.md`

**Interfaces:**
- Produces (exports of `layout.js`, used by every later task):
  `FLOOR_Y, CEILING_Y, SIDEWALK_Y, EYE_OFFSET, ROOM, FRONT_FACE_Z, BUILDING, DOOR, WINDOW, STREET, INSIDE_BOUNDS, OUTSIDE_BOUNDS, isInsideShop(x,z), groundHeight(x,z), START_POSE, INTERIOR_POSE, ENTER_PATH, EXIT_PATH, WALL_LEVELS, WALL_BAY_TOP, WALL_BAYS, GONDOLA_LEVELS, GONDOLA_TOP, GONDOLAS, COUNTER, BACK_BAR, CHILLER, TASTING_BAR, PROMO_BARREL, CRATES, clearances(levels, top), SHELF_RUNS, INTERIOR_COLLIDERS, STREET_PROPS, OUTSIDE_COLLIDERS, PEOPLE, ANCHORS`.
  Poses are `{ position: [x,y,z], target: [x,y,z] }`. Colliders are `{ min: [x,z], max: [x,z] }`.
  A shelf run is `{ id, start: [x,z], dir: [dx,dz], facing: [nx,nz], length, levels: number[], clearances: number[], depth, accepts: ('std'|'mini')[], skipLevels: number[] }` — bottles stand along `start + dir·s`, set back from that front line against `facing` (they face `facing`).

- [ ] **Step 1: Write the failing test**

Create `src/utils/shop3d/layout.test.js`:

```js
import { describe, expect, it } from "vitest";
import {
  ROOM, DOOR, FLOOR_Y, SIDEWALK_Y, groundHeight, isInsideShop,
  SHELF_RUNS, INTERIOR_COLLIDERS, OUTSIDE_COLLIDERS, INSIDE_BOUNDS, OUTSIDE_BOUNDS,
  START_POSE, INTERIOR_POSE, ENTER_PATH, EXIT_PATH, clearances, PEOPLE,
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/shop3d/layout.test.js`
Expected: FAIL — `Failed to resolve import "./layout"`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/shop3d/layout.js`:

```js
// Single source of truth for where everything is in the 3D shop (metres, y up,
// shop front faces +z). Geometry, colliders, product slots, people and theme
// anchors are all derived from these numbers so they can never drift apart.

export const FLOOR_Y = 0.06; // interior walking surface
export const CEILING_Y = 3.66; // interior ceiling underside
export const SIDEWALK_Y = 0.15; // sidewalk top
export const EYE_OFFSET = 1.55; // eye height above the ground under you

export const ROOM = { minX: -4.75, maxX: 4.75, minZ: -5.5, maxZ: 5.5 };
export const FRONT_FACE_Z = 5.6; // street face of the front wall
export const BUILDING = { minX: -5.15, maxX: 5.15, backZ: -5.9, groundTop: 4.15, floorHeight: 3.4, upperFloors: 2 };
export const DOOR = { x0: 1.63, x1: 2.97, top: 2.48, hingeX: 1.68, leafWidth: 1.24, leafHeight: 2.36 };
export const WINDOW = { x0: -4.2, x1: -0.6, sill: 0.5, top: 2.65 };

export const STREET = {
  halfLength: 40,
  nearWalk: { z0: FRONT_FACE_Z, z1: 9.18 }, // includes the kerb stone
  road: { z0: 9.18, z1: 16.82 },
  farWalk: { z0: 16.82, z1: 20.4 },
  kerbWidth: 0.18,
  farFacadeZ: 20.4,
  laneZ: 13.0,
  edgeLinesZ: [9.6, 16.4],
  crossingX: 12,
};

export const INSIDE_BOUNDS = { minX: -4.0, maxX: 4.1, minZ: -4.75, maxZ: 5.05 };
export const OUTSIDE_BOUNDS = { minX: -24, maxX: 24, minZ: 5.95, maxZ: 20.0 };

export const isInsideShop = (x, z) => z < FRONT_FACE_Z && x > ROOM.minX && x < ROOM.maxX;
export const groundHeight = (x, z) => {
  if (isInsideShop(x, z)) return FLOOR_Y;
  if (z > STREET.road.z0 && z < STREET.road.z1) return 0;
  return SIDEWALK_Y;
};

export const START_POSE = { position: [2.3, SIDEWALK_Y + EYE_OFFSET, 18.6], target: [2.3, 1.6, FRONT_FACE_Z] };
export const INTERIOR_POSE = { position: [1.8, FLOOR_Y + EYE_OFFSET, 3.6], target: [-0.8, 1.2, -4.5] };
export const ENTER_PATH = [
  { position: [2.3, SIDEWALK_Y + EYE_OFFSET, 7.2], target: [2.3, 1.5, 0] },
  { position: [2.3, FLOOR_Y + EYE_OFFSET, 4.7], target: [2.0, 1.4, 0] },
  INTERIOR_POSE,
];
export const EXIT_PATH = [
  { position: [2.3, FLOOR_Y + EYE_OFFSET, 4.7], target: [2.3, 1.5, 10] },
  { position: [2.3, SIDEWALK_Y + EYE_OFFSET, 7.4], target: [2.3, 1.6, 14] },
];

// ---------- shelving ----------
const BOARD = 0.03; // shelf board thickness
// Clear height above each shelf surface: up to the next surface (minus its board),
// or up to `top` for the last one.
export const clearances = (levels, top) =>
  levels.map((y, i) => (i < levels.length - 1 ? levels[i + 1] : top) - y - BOARD);

export const WALL_LEVELS = [0.18, 0.6, 1.02, 1.44, 1.86, 2.28]; // shelf top surfaces, world y
export const WALL_BAY_TOP = 2.7; // underside of the crown
export const WALL_BAYS = [
  { id: "leftWall", x0: -4.75, x1: -4.33, z0: -5.05, z1: 4.55, facing: [1, 0] },
  { id: "backWall", x0: -4.75, x1: 2.3, z0: -5.5, z1: -5.08, facing: [0, 1] },
];
export const GONDOLA_LEVELS = [0.18, 0.58, 0.98, 1.38];
export const GONDOLA_TOP = 1.8;
export const GONDOLAS = [
  { id: "gondolaA", x: -2.2, z0: -3.6, z1: 1.0, width: 0.9 },
  { id: "gondolaB", x: 0.3, z0: -3.6, z1: 1.0, width: 0.9 },
];
export const COUNTER = { x0: 3.0, x1: 3.7, z0: 1.0, z1: 3.6, top: 1.11 };
export const BACK_BAR = { x0: 4.33, x1: 4.75, z0: 0.75, z1: 4.55, levels: [0.96, 1.38, 1.8, 2.22], top: 2.62 };
export const CHILLER = { x0: 4.15, x1: 4.75, z0: -2.6, z1: -1.4, height: 2.0, levels: [0.4, 0.78, 1.16, 1.54] };
export const TASTING_BAR = { x0: 2.8, x1: 4.4, z0: -5.0, z1: -4.45, top: 1.06 };
export const PROMO_BARREL = { x: -2.6, z: 4.7, radius: 0.4, height: 0.95 };
export const CRATES = { x: -1.45, z: 4.85, w: 0.6, d: 0.45 };

const run = (id, start, dir, facing, length, levels, clear, depth, accepts, skipLevels = []) => ({
  id, start, dir, facing, length, levels, clearances: clear, depth, accepts, skipLevels,
});

export const SHELF_RUNS = [
  run("leftWall", [-4.33, -5.05], [0, 1], [1, 0], 9.6, WALL_LEVELS, clearances(WALL_LEVELS, WALL_BAY_TOP), 0.38, ["std"], [0]),
  run("backWall", [-4.3, -5.08], [1, 0], [0, 1], 6.6, WALL_LEVELS, clearances(WALL_LEVELS, WALL_BAY_TOP), 0.38, ["std"], [0]),
  ...GONDOLAS.flatMap((g) => [
    run(`${g.id}-east`, [g.x + g.width / 2, g.z0], [0, 1], [1, 0], g.z1 - g.z0, GONDOLA_LEVELS, clearances(GONDOLA_LEVELS, GONDOLA_TOP), g.width / 2 - 0.04, ["std"], [0]),
    run(`${g.id}-west`, [g.x - g.width / 2, g.z0], [0, 1], [-1, 0], g.z1 - g.z0, GONDOLA_LEVELS, clearances(GONDOLA_LEVELS, GONDOLA_TOP), g.width / 2 - 0.04, ["std"], [0]),
  ]),
  run("backBar", [BACK_BAR.x0, BACK_BAR.z1], [0, -1], [-1, 0], BACK_BAR.z1 - BACK_BAR.z0, BACK_BAR.levels, clearances(BACK_BAR.levels, BACK_BAR.top), 0.34, ["std"]),
  run("chiller", [CHILLER.x0 + 0.05, CHILLER.z0], [0, 1], [-1, 0], CHILLER.z1 - CHILLER.z0, CHILLER.levels, clearances(CHILLER.levels, CHILLER.levels.at(-1) + 0.37), 0.4, ["mini"]),
  run("counterTray", [COUNTER.x0 + 0.1, 1.2], [0, 1], [-1, 0], 0.6, [COUNTER.top], [0.3], 0.22, ["mini"]),
  run("promoBarrel", [PROMO_BARREL.x - 0.25, PROMO_BARREL.z + 0.25], [1, 0], [0, 1], 0.5, [FLOOR_Y + PROMO_BARREL.height], [0.6], 0.4, ["std"]),
];

// ---------- colliders (XZ boxes; the walk controller inflates them by the player radius) ----------
const box = (minX, minZ, maxX, maxZ) => ({ min: [minX, minZ], max: [maxX, maxZ] });
export const INTERIOR_COLLIDERS = [
  ...WALL_BAYS.map((b) => box(b.x0, b.z0, b.x1, b.z1)),
  ...GONDOLAS.map((g) => box(g.x - g.width / 2, g.z0 - 0.05, g.x + g.width / 2, g.z1 + 0.05)),
  box(COUNTER.x0, COUNTER.z0, COUNTER.x1, COUNTER.z1),
  box(BACK_BAR.x0, BACK_BAR.z0, BACK_BAR.x1, BACK_BAR.z1),
  box(CHILLER.x0, CHILLER.z0, CHILLER.x1, CHILLER.z1),
  box(TASTING_BAR.x0, TASTING_BAR.z0 - 0.1, TASTING_BAR.x1, TASTING_BAR.z1 + 0.35), // bar + stools
  box(PROMO_BARREL.x - PROMO_BARREL.radius, PROMO_BARREL.z - PROMO_BARREL.radius, PROMO_BARREL.x + PROMO_BARREL.radius, PROMO_BARREL.z + PROMO_BARREL.radius),
  box(CRATES.x - CRATES.w / 2, CRATES.z - CRATES.d / 2, CRATES.x + CRATES.w / 2, CRATES.z + CRATES.d / 2),
];

// ---------- street furniture ----------
export const STREET_PROPS = {
  lamps: [
    { x: -14, z: 8.75, dir: 1, light: true },
    { x: -3.2, z: 8.75, dir: 1, light: true },
    { x: 9, z: 8.75, dir: 1, light: true },
    { x: 20, z: 8.75, dir: 1, light: false },
    { x: -9, z: 17.25, dir: -1, light: false },
    { x: 4, z: 17.25, dir: -1, light: true },
    { x: 16, z: 17.25, dir: -1, light: false },
  ],
  trees: [
    { x: -10, z: 8.55, s: 1.1 },
    { x: 13.5, z: 8.55, s: 1 },
    { x: 8.5, z: 17.45, s: 1.2 },
    { x: -18, z: 17.45, s: 1 },
  ],
  motorbikes: [
    { x: -7.5, z: 8.2, rot: 1.25, color: "#b8322b" },
    { x: -6.6, z: 8.15, rot: 1.3, color: "#e9e5dc" },
    { x: 7.2, z: 8.2, rot: 1.2, color: "#2a5ea8" },
    { x: 8.1, z: 8.15, rot: 1.25, color: "#1c1c1c" },
    { x: -15, z: 17.9, rot: -1.9, color: "#d8d4c8" },
    { x: 2, z: 17.9, rot: -1.8, color: "#a8262a" },
  ],
  stools: [
    { x: 6.4, z: 6.45, color: "#d33a3a" },
    { x: 7.05, z: 6.6, color: "#2f63c4" },
  ],
  chalkboard: { x: 0.9, z: 6.3, rotY: 0.3 },
};
export const OUTSIDE_COLLIDERS = [
  ...STREET_PROPS.lamps.map((l) => box(l.x - 0.15, l.z - 0.15, l.x + 0.15, l.z + 0.15)),
  ...STREET_PROPS.trees.map((t) => box(t.x - 0.45, t.z - 0.45, t.x + 0.45, t.z + 0.45)),
  ...STREET_PROPS.motorbikes.map((m) => box(m.x - 0.7, m.z - 0.7, m.x + 0.7, m.z + 0.7)),
  ...STREET_PROPS.stools.map((s) => box(s.x - 0.2, s.z - 0.2, s.x + 0.2, s.z + 0.2)),
  box(STREET_PROPS.chalkboard.x - 0.35, STREET_PROPS.chalkboard.z - 0.3, STREET_PROPS.chalkboard.x + 0.35, STREET_PROPS.chalkboard.z + 0.3),
];

// ---------- people ----------
// `spot` people stand (or sit) in one place facing `yaw` (radians; 0 faces +z);
// `path` people walk the polyline back and forth.
export const PEOPLE = [
  { id: "cashier", body: "female", hair: ["hair_buns"], outfit: "staff", role: "cashier", inside: true, spot: [4.02, FLOOR_Y, 2.4], yaw: -Math.PI / 2 },
  { id: "stocker", body: "male", hair: ["hair_buzzed"], outfit: "staff", role: "stocker", inside: true, path: [[-0.95, -3.1], [-0.95, 0.5]], endYaws: [Math.PI / 2, -Math.PI / 2], speed: 0.9, endPause: 5 },
  // Sits on the red stool (STREET_PROPS.stools[0]); the sitting clips put the seat 0.30 m behind the root.
  { id: "neighbour", body: "male", hair: ["hair_beard", "hair_parted"], outfit: "localA", role: "sitter", inside: false, spot: [6.4, SIDEWALK_Y, 6.75], yaw: 0 },
  { id: "walkerA", body: "female", hair: ["hair_long"], outfit: "localB", role: "walker", inside: false, path: [[-22, 7.7], [22, 7.7]], speed: 1.15, endPause: 0 },
  { id: "walkerB", body: "male", hair: ["hair_parted"], outfit: "localC", role: "walker", inside: false, path: [[21, 18.7], [-21, 18.7]], speed: 1.25, endPause: 0 },
  { id: "walkerC", body: "female", hair: ["hair_buns"], outfit: "localD", role: "walker", inside: false, path: [[-18, 18.3], [-3, 18.3], [14, 18.3]], speed: 1.05, endPause: 3 },
];

// ---------- theme anchors ----------
export const ANCHORS = {
  doorTop: [2.3, 2.62, FRONT_FACE_Z + 0.06],
  doorSides: [[1.15, SIDEWALK_Y, 6.05], [3.5, SIDEWALK_Y, 6.05]],
  awning: { x0: -4.9, x1: 4.9, y: 2.82, z: 6.75 },
  windowInside: [-3.7, FLOOR_Y, 4.85],
  counterTop: [3.35, COUNTER.top, 3.25],
  shelfCrowns: [
    { from: [-4.36, 2.76, -4.95], to: [-4.36, 2.76, 4.45] },
    { from: [-4.3, 2.76, -5.07], to: [2.2, 2.76, -5.07] },
  ],
  ceiling: [[-2.2, CEILING_Y, -1.3], [0.3, CEILING_Y, -1.3], [-1.0, CEILING_Y, 2.8], [2.3, CEILING_Y, 3.6]],
  ceilingCorners: [[-4.7, CEILING_Y, -5.45], [4.7, CEILING_Y, -5.45]],
  shelfEnds: [[-2.2, FLOOR_Y, 1.3], [0.3, FLOOR_Y, 1.3]],
  sidewalkByDoor: [3.7, SIDEWALK_Y, 6.4],
  facadeBand: { x0: -5.0, x1: 5.0, y: 4.35, z: FRONT_FACE_Z + 0.14 },
  skyMoon: [-38, 30, -70],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/shop3d/layout.test.js`
Expected: PASS (9 tests). If "never lets two interior fixtures overlap" fails, log the pair and fix coordinates in `layout.js`, not the test.

- [ ] **Step 5: Amend the spec**

In `docs/superpowers/specs/2026-11-01-shop3d-street-and-store-design.md`, apply the six "Spec amendments made by this plan" listed at the top of this plan:
- "World layout" table, shop-front row: window becomes `x −4.2 → −0.6, sill y 0.5, top y 2.65`.
- "Performance" budgets bullet becomes: `Budgets: ≤ 1800 bottles on high (≈ 4 M triangles), ≤ 450 on low (≈ 1 M); bottom shelves hold cardboard cases; < 250 draw calls; added texture payload ≤ 3.5 MB; desktop 60 fps, mid-range phone ≥ 30 fps.`
- "Rendering rules" item 4: replace "whose shadow frustum (±14 m) follows the player" with "with a fixed shadow frustum over the block and the shop (a following frustum shimmers)".
- "shopfront/door.jsx": "rotation 0 → −1.6" becomes "rotation 0 → +1.6 (inward)".
- "Performance": add `High tier keeps the interior mounted while outside (the window shows the real store); low tier mounts it on entry and shows a lit interior card behind the window until then.`
- "Interior": "Gondolas: two, double-sided, 1.6 m tall" becomes "1.8 m tall".

- [ ] **Step 6: Commit**

```bash
git add src/utils/shop3d/layout.js src/utils/shop3d/layout.test.js docs/superpowers/specs/2026-11-01-shop3d-street-and-store-design.md
git commit -m "feat(shop3d): layout module with every coordinate of the street and store

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Product blocks (products → bottle instances)

**Files:**
- Create: `src/utils/shop3d/product-blocks.js`
- Test: `src/utils/shop3d/product-blocks.test.js`

**Interfaces:**
- Consumes: the shelf-run shape from Task 1.
- Produces:
  - `BOTTLE_DIMS: Record<modelFile, { w, h, d }>` (metres; w across the label, d front-to-back)
  - `sizeClass(dims) → 'mini' | 'std'` (mini when h < 0.15)
  - `buildShelfInstances({ products, runs, dims = BOTTLE_DIMS, maxDepth = 2, maxInstances = Infinity, eyeLevel = 1.3 }) → Instance[]`
    with `Instance = { key, product, model, runId, levelIndex, facing, depthIndex, position: [x,y,z], rotationY, height }`
  - `groupInstances(instances) → Array<{ key, product, model, instances }>` (one group per product+model, insertion order)

- [ ] **Step 1: Write the failing test**

Create `src/utils/shop3d/product-blocks.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/shop3d/product-blocks.test.js`
Expected: FAIL — cannot resolve `./product-blocks`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/shop3d/product-blocks.js`:

```js
// Turns catalog products into bottles on shelves. Each product gets blocks of
// side-by-side facings (like a real shop), repeated across the shelf runs until
// they are full; each facing is 1..maxDepth bottles deep by stock. Pure: no three.js.

// Measured from the GLBs (bounding boxes, metres): w across the label (x),
// h height, d front-to-back (z). Base sits at y = 0, label faces +z.
export const BOTTLE_DIMS = {
  "bottle-20ml.glb": { w: 0.03, h: 0.085, d: 0.022 },
  "bottle-100ml.glb": { w: 0.051, h: 0.138, d: 0.037 },
  "bottle-200ml.glb": { w: 0.064, h: 0.164, d: 0.046 },
  "bottle-350ml.glb": { w: 0.077, h: 0.204, d: 0.055 },
  "bottle-700ml.glb": { w: 0.097, h: 0.244, d: 0.068 },
  "bottle-1000ml.glb": { w: 0.109, h: 0.269, d: 0.077 },
  "orange-20ml.glb": { w: 0.03, h: 0.085, d: 0.022 },
  "orange-1000ml.glb": { w: 0.109, h: 0.269, d: 0.077 },
  "manifest-40ml.glb": { w: 0.036, h: 0.094, d: 0.02 },
  "manifest-1000ml.glb": { w: 0.1, h: 0.258, d: 0.055 },
  "coldbrew-20ml.glb": { w: 0.03, h: 0.085, d: 0.022 },
  "coldbrew-1000ml.glb": { w: 0.109, h: 0.269, d: 0.077 },
  "bottle-herbal-mini.glb": { w: 0.034, h: 0.089, d: 0.024 },
};

export const MINI_HEIGHT = 0.15;
export const sizeClass = (dims) => (dims.h < MINI_HEIGHT ? "mini" : "std");

const FACING_GAP = 0.015; // between neighbouring facings
const ROW_GAP = 0.01; // between rows going back
const BLOCK_GAP = 0.04; // between product blocks
const BLOCK_WIDTH = 0.6; // target width of one product block
const SIDE_PAD = 0.03; // keep clear of uprights at both run ends
const FRONT_INSET = 0.03; // set back from the shelf lip
const HEAD_ROOM = 0.01;

const norm = (model) => (model || "").trim().toLowerCase();
const stackDepth = (stock, maxDepth) => Math.max(1, Math.min(stock || 0, maxDepth));

const eligibleProducts = (products, dims) => {
  const unknown = [];
  const ok = products.filter((product) => {
    const model = norm(product.shop3dModel);
    if (model && dims[model]) return true;
    unknown.push(product.name || product._id);
    return false;
  });
  if (unknown.length) console.warn(`[shop3d] No bottle model for: ${unknown.join(", ")}`);
  return ok.sort((a, b) => norm(a.shop3dModel).localeCompare(norm(b.shop3dModel)) || String(a._id).localeCompare(String(b._id)));
};

export const buildShelfInstances = ({ products, runs, dims = BOTTLE_DIMS, maxDepth = 2, maxInstances = Infinity, eyeLevel = 1.3 }) => {
  const eligible = eligibleProducts(products, dims);
  if (!eligible.length) return [];

  // Fill eye-level shelves first so a small budget trims the floor and top shelves.
  const shelves = [];
  runs.forEach((r, runIndex) =>
    r.levels.forEach((y, levelIndex) => {
      if (r.skipLevels?.includes(levelIndex)) return;
      shelves.push({ r, runIndex, levelIndex, y, clearance: r.clearances[levelIndex] });
    })
  );
  shelves.sort((a, b) => Math.abs(a.y - eyeLevel) - Math.abs(b.y - eyeLevel) || a.runIndex - b.runIndex || a.levelIndex - b.levelIndex);

  const out = [];
  let rotate = 0; // vary which product starts each shelf so blocks don't line up in columns
  for (const shelf of shelves) {
    if (out.length >= maxInstances) break;
    const { r } = shelf;
    const fits = eligible.filter((product) => {
      const d = dims[norm(product.shop3dModel)];
      return r.accepts.includes(sizeClass(d)) && d.h + HEAD_ROOM <= shelf.clearance;
    });
    if (!fits.length) continue;
    const end = r.length - SIDE_PAD;
    const rotationY = Math.atan2(r.facing[0], r.facing[1]);
    let cursor = SIDE_PAD;
    let k = rotate++;
    while (out.length < maxInstances) {
      const product = fits[k % fits.length];
      k += 1;
      const model = norm(product.shop3dModel);
      const d = dims[model];
      const pitch = d.w + FACING_GAP;
      const facings = Math.min(Math.max(1, Math.floor(BLOCK_WIDTH / pitch)), Math.floor((end - cursor) / pitch));
      if (facings < 1) break;
      const rowsFit = Math.max(1, Math.floor((r.depth - FRONT_INSET) / (d.d + ROW_GAP)));
      const depth = Math.min(stackDepth(product.stock, maxDepth), rowsFit);
      for (let f = 0; f < facings && out.length < maxInstances; f++) {
        const along = cursor + pitch * (f + 0.5);
        for (let row = 0; row < depth && out.length < maxInstances; row++) {
          const inset = FRONT_INSET + d.d / 2 + row * (d.d + ROW_GAP);
          out.push({
            key: `${r.id}:${shelf.levelIndex}:${out.length}`,
            product,
            model,
            runId: r.id,
            levelIndex: shelf.levelIndex,
            facing: f,
            depthIndex: row,
            position: [r.start[0] + r.dir[0] * along - r.facing[0] * inset, shelf.y, r.start[1] + r.dir[1] * along - r.facing[1] * inset],
            rotationY,
            height: d.h,
          });
        }
      }
      cursor += facings * pitch + BLOCK_GAP;
    }
  }
  return out;
};

export const groupInstances = (instances) => {
  const groups = new Map();
  for (const instance of instances) {
    const key = `${instance.product._id}|${instance.model}`;
    if (!groups.has(key)) groups.set(key, { key, product: instance.product, model: instance.model, instances: [] });
    groups.get(key).instances.push(instance);
  }
  return [...groups.values()];
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/shop3d/product-blocks.test.js`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/shop3d/product-blocks.js src/utils/shop3d/product-blocks.test.js
git commit -m "feat(shop3d): pack real products into shelf blocks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Theme resolution

**Files:**
- Create: `src/utils/shop3d/themes.js`
- Test: `src/utils/shop3d/themes.test.js`

**Interfaces:**
- Produces: `THEMES = ['tet','christmas','midautumn','halloween']`, `THEME_SETTINGS = ['auto','none', ...THEMES]`, `TET_DATES`, `MIDAUTUMN_DATES`, `themeByDate(now: Date) → theme | null`, `resolveTheme(setting, now = new Date(), override?) → theme | null`.

- [ ] **Step 1: Write the failing test**

Create `src/utils/shop3d/themes.test.js`:

```js
import { describe, expect, it } from "vitest";
import { resolveTheme, themeByDate, THEME_SETTINGS } from "./themes";

// Instants given in Vietnam time (UTC+7).
const vn = (iso) => new Date(`${iso}T00:30:00+07:00`);

describe("themeByDate", () => {
  it("covers Tết from 21 days before to 7 days after the lunar new year", () => {
    expect(themeByDate(vn("2027-01-16"))).toBe("tet"); // Tết 2027-02-06
    expect(themeByDate(vn("2027-02-13"))).toBe("tet");
    expect(themeByDate(vn("2027-01-15"))).toBe(null);
    expect(themeByDate(vn("2027-02-14"))).toBe(null);
  });

  it("covers Christmas through December", () => {
    expect(themeByDate(vn("2026-12-01"))).toBe("christmas");
    expect(themeByDate(vn("2026-12-31"))).toBe("christmas");
    expect(themeByDate(vn("2026-11-30"))).toBe(null);
  });

  it("covers Mid-Autumn from 14 days before to 2 days after", () => {
    expect(themeByDate(vn("2026-09-11"))).toBe("midautumn"); // 2026-09-25
    expect(themeByDate(vn("2026-09-27"))).toBe("midautumn");
    expect(themeByDate(vn("2026-09-28"))).toBe(null);
  });

  it("covers Halloween from Oct 20 to 31", () => {
    expect(themeByDate(vn("2026-10-20"))).toBe("halloween");
    expect(themeByDate(vn("2026-10-31"))).toBe("halloween");
    expect(themeByDate(vn("2026-10-19"))).toBe(null);
  });

  it("uses Vietnam time, not UTC", () => {
    expect(themeByDate(new Date("2026-11-30T17:30:00Z"))).toBe("christmas"); // 00:30 Dec 1 in Saigon
  });
});

describe("resolveTheme", () => {
  const now = vn("2026-06-01");
  it("returns an admin-picked theme regardless of date", () => {
    expect(resolveTheme("tet", now)).toBe("tet");
  });
  it("returns null for none", () => {
    expect(resolveTheme("none", vn("2026-12-10"))).toBe(null);
  });
  it("falls back to the date for auto, missing or unknown values", () => {
    expect(resolveTheme("auto", vn("2026-12-10"))).toBe("christmas");
    expect(resolveTheme(undefined, vn("2026-12-10"))).toBe("christmas");
    expect(resolveTheme("bogus", vn("2026-12-10"))).toBe("christmas");
  });
  it("lets a ?theme= override win", () => {
    expect(resolveTheme("none", now, "halloween")).toBe("halloween");
    expect(resolveTheme("tet", now, "none")).toBe(null);
    expect(resolveTheme("tet", now, "bogus")).toBe("tet");
  });
  it("lists the admin choices", () => {
    expect(THEME_SETTINGS).toEqual(["auto", "none", "tet", "christmas", "midautumn", "halloween"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/shop3d/themes.test.js`
Expected: FAIL — cannot resolve `./themes`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/shop3d/themes.js`:

```js
// Which seasonal decor the 3D shop shows. An admin can pick one; "auto" (or no
// answer from the backend) picks by the calendar date in Vietnam.

export const THEMES = ["tet", "christmas", "midautumn", "halloween"];
export const THEME_SETTINGS = ["auto", "none", ...THEMES];

// Lunar new year (Tết) and the 15th day of the 8th lunar month (Trung Thu), Vietnam.
export const TET_DATES = {
  2026: "2026-02-17", 2027: "2027-02-06", 2028: "2028-01-26", 2029: "2029-02-13", 2030: "2030-02-03",
  2031: "2031-01-23", 2032: "2032-02-11", 2033: "2033-01-31", 2034: "2034-02-19", 2035: "2035-02-08",
  2036: "2036-01-28", 2037: "2037-02-15", 2038: "2038-02-04", 2039: "2039-01-24", 2040: "2040-02-12",
};
export const MIDAUTUMN_DATES = {
  2026: "2026-09-25", 2027: "2027-09-15", 2028: "2028-10-03", 2029: "2029-09-22", 2030: "2030-09-12",
  2031: "2031-10-01", 2032: "2032-09-19", 2033: "2033-09-08", 2034: "2034-09-27", 2035: "2035-09-16",
  2036: "2036-10-04", 2037: "2037-09-24", 2038: "2038-09-13", 2039: "2039-10-02", 2040: "2040-09-20",
};

const DAY_MS = 86400000;
const VN_OFFSET_MS = 7 * 3600000;

const vietnamDay = (now) => {
  const t = new Date(now.getTime() + VN_OFFSET_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
const dayNumber = ({ y, m, d }) => Date.UTC(y, m - 1, d) / DAY_MS;
const isoDay = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return dayNumber({ y, m, d });
};
const within = (today, iso, before, after) => {
  if (!iso) return false;
  const centre = isoDay(iso);
  return today >= centre - before && today <= centre + after;
};

export const themeByDate = (now) => {
  const vd = vietnamDay(now);
  const today = dayNumber(vd);
  // Next year's Tết window can start on Dec 31, so check both years.
  if (within(today, TET_DATES[vd.y], 21, 7) || within(today, TET_DATES[vd.y + 1], 21, 7)) return "tet";
  if (within(today, MIDAUTUMN_DATES[vd.y], 14, 2)) return "midautumn";
  if (vd.m === 12) return "christmas";
  if (vd.m === 10 && vd.d >= 20) return "halloween";
  return null;
};

export const resolveTheme = (setting, now = new Date(), override) => {
  if (override === "none") return null;
  if (THEMES.includes(override)) return override;
  if (THEMES.includes(setting)) return setting;
  if (setting === "none") return null;
  return themeByDate(now);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/shop3d/themes.test.js`
Expected: PASS (10 tests).

- [ ] **Step 5: Verify the date tables**

Check 3 Tết dates (2027, 2031, 2036) and 3 Mid-Autumn dates (2026, 2028, 2036) against a Vietnamese lunar calendar (for example the "Tết Nguyên Đán" date table on vi.wikipedia.org). If one differs, fix the table and add the corrected date as an extra `expect` in the test.

- [ ] **Step 6: Commit**

```bash
git add src/utils/shop3d/themes.js src/utils/shop3d/themes.test.js
git commit -m "feat(shop3d): resolve the seasonal theme from the admin setting or the date

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: People paths and street generator (pure)

**Files:**
- Create: `src/utils/shop3d/people-paths.js`, `src/utils/shop3d/street-gen.js`
- Test: `src/utils/shop3d/people-paths.test.js`, `src/utils/shop3d/street-gen.test.js`

**Interfaces:**
- Produces (`people-paths.js`):
  - `pathLength(points: [x,z][]) → number`
  - `pointAt(points, s) → { position: [x,z], heading }` (heading = yaw facing the forward direction of the segment; 0 faces +z)
  - `createWalker({ points, speed, endPause = 0 }) → Walker` with `Walker = { points, speed, endPause, length, s, dir: 1|-1, wait }`
  - `shouldYield(walker, player: [x,z] | null, { lookAhead = 1.2, radius = 0.7 }) → boolean`
  - `stepWalker(walker, dt, player) → { walker, moving, arrived, position: [x,z], heading }` (pure; returns a new walker; `arrived` is true on the frame it reaches an end)
- Produces (`street-gen.js`):
  - `mulberry32(seed) → () => number in [0,1)`
  - `SIGN_TEXTS: Array<[text, bg, fg]>` (8 entries, one atlas row each)
  - `generateRow({ from, to, seed }) → HouseSpec[]`, `HouseSpec = { x0, w, floors, facade: 'facadeWhite'|'facadeCream'|'facadeGrey'|'facadeDark', open, sign: 0..7, card: 0..3, storeys: Array<{ lit, card, balcony, plant, ac }> }`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/shop3d/people-paths.test.js`:

```js
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
```

Create `src/utils/shop3d/street-gen.test.js`:

```js
import { describe, expect, it } from "vitest";
import { generateRow, mulberry32, SIGN_TEXTS } from "./street-gen";

describe("street generator", () => {
  it("is deterministic per seed", () => {
    expect(generateRow({ from: -40, to: -5.15, seed: 3 })).toEqual(generateRow({ from: -40, to: -5.15, seed: 3 }));
    expect(mulberry32(1)()).toBe(mulberry32(1)());
  });

  it("covers the span exactly with houses 3.6–7.2 m wide", () => {
    for (const seed of [1, 2, 3, 9, 42]) {
      const row = generateRow({ from: 5.15, to: 40, seed });
      expect(row[0].x0).toBeCloseTo(5.15);
      for (let i = 1; i < row.length; i++) expect(row[i].x0).toBeCloseTo(row[i - 1].x0 + row[i - 1].w);
      const last = row.at(-1);
      expect(last.x0 + last.w).toBeCloseTo(40);
      row.forEach((h) => {
        expect(h.w).toBeGreaterThanOrEqual(3.6);
        expect(h.w).toBeLessThanOrEqual(7.2);
        expect(h.storeys).toHaveLength(h.floors);
        expect(h.sign).toBeLessThan(SIGN_TEXTS.length);
      });
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/utils/shop3d/people-paths.test.js src/utils/shop3d/street-gen.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the implementations**

Create `src/utils/shop3d/people-paths.js`:

```js
// Walkers follow a polyline back and forth. Pure functions so the routine logic
// is testable; the people component calls stepWalker once per frame.

const seg = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export const pathLength = (points) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += seg(points[i - 1], points[i]);
  return total;
};

export const pointAt = (points, s) => {
  let left = Math.max(0, s);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = seg(a, b);
    if (left <= len || i === points.length - 1) {
      const t = len ? Math.min(1, left / len) : 0;
      return { position: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], heading: Math.atan2(b[0] - a[0], b[1] - a[1]) };
    }
    left -= len;
  }
  return { position: [...points[0]], heading: 0 };
};

export const createWalker = ({ points, speed, endPause = 0 }) => ({
  points, speed, endPause, length: pathLength(points), s: 0, dir: 1, wait: 0,
});

const distToSegment = (p, a, b) => {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const len2 = abx * abx + abz * abz;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * abx + (p[1] - a[1]) * abz) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + abx * t), p[1] - (a[1] + abz * t));
};

export const shouldYield = (walker, player, { lookAhead = 1.2, radius = 0.7 } = {}) => {
  if (!player) return false;
  const here = pointAt(walker.points, walker.s).position;
  const ahead = pointAt(walker.points, Math.max(0, Math.min(walker.length, walker.s + walker.dir * lookAhead))).position;
  // Only what is ahead counts: ignore a player behind the walker's current spot.
  const toPlayer = [player[0] - here[0], player[1] - here[1]];
  const forward = [ahead[0] - here[0], ahead[1] - here[1]];
  if (toPlayer[0] * forward[0] + toPlayer[1] * forward[1] <= 0) return false;
  return distToSegment(player, here, ahead) < radius;
};

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const headingFor = (walker) => {
  const probe = walker.dir > 0 ? Math.min(walker.s, walker.length - 0.001) : Math.max(walker.s - 0.001, 0);
  const { heading } = pointAt(walker.points, probe);
  return wrap(walker.dir > 0 ? heading : heading + Math.PI);
};

export const stepWalker = (walker, dt, player) => {
  const out = (w, moving, arrived) => ({ walker: w, moving, arrived, position: pointAt(w.points, w.s).position, heading: headingFor(w) });
  if (walker.wait > 0) return out({ ...walker, wait: Math.max(0, walker.wait - dt) }, false, false);
  if (shouldYield(walker, player)) return out(walker, false, false);
  const s = walker.s + walker.dir * walker.speed * dt;
  if (s >= walker.length) return out({ ...walker, s: walker.length, dir: -1, wait: walker.endPause }, true, true);
  if (s <= 0) return out({ ...walker, s: 0, dir: 1, wait: walker.endPause }, true, true);
  return out({ ...walker, s }, true, false);
};
```

Create `src/utils/shop3d/street-gen.js`:

```js
// Seeded description of a row of Saigon shophouses. Pure data; the street
// component turns it into geometry.

export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// [text, background, foreground] for the LED shop signs (one atlas row each).
export const SIGN_TEXTS = [
  ["CÀ PHÊ SỮA ĐÁ", "#0e1a1f", "#44e0ee"],
  ["NHÀ THUỐC", "#f4f4f2", "#1b7d3b"],
  ["ĐIỆN THOẠI", "#121212", "#ffffff"],
  ["TIỆM BÁNH", "#2a0f1a", "#ff6fa3"],
  ["SPA • NAIL", "#ffffff", "#c23b7d"],
  ["QUÁN PHỞ", "#ffd23a", "#7a1e12"],
  ["TẠP HÓA", "#123a8c", "#ffffff"],
  ["TRÀ SỮA", "#f6efe2", "#8a4b1f"],
];

const FACADES = ["facadeWhite", "facadeCream", "facadeGrey", "facadeDark"];
const MIN_W = 3.6;
const MAX_W = 7.2;

export const generateRow = ({ from, to, seed }) => {
  const rnd = mulberry32(seed);
  const pick = (n) => Math.floor(rnd() * n);
  const houses = [];
  let x = from;
  while (to - x > 1e-6) {
    const left = to - x;
    let w = 4 + rnd() * 1.6;
    if (left - w < MIN_W) w = left <= MAX_W ? left : left / 2; // never leave a sliver
    const floors = 2 + pick(4);
    houses.push({
      x0: x,
      w,
      floors,
      facade: FACADES[pick(FACADES.length)],
      open: rnd() < 0.75,
      sign: pick(SIGN_TEXTS.length),
      card: pick(4),
      storeys: Array.from({ length: floors }, () => ({
        lit: rnd() < 0.45,
        card: pick(4),
        balcony: rnd() < 0.7,
        plant: rnd() < 0.6,
        ac: rnd() < 0.6,
      })),
    });
    x += w;
  }
  return houses;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/utils/shop3d/people-paths.test.js src/utils/shop3d/street-gen.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/shop3d/people-paths.js src/utils/shop3d/people-paths.test.js src/utils/shop3d/street-gen.js src/utils/shop3d/street-gen.test.js
git commit -m "feat(shop3d): walker paths and seeded shophouse rows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Textures, materials, merged geometry, quality tiers

**Files:**
- Create: `scripts/fetch-shop3d-textures.py`
- Create (generated): `src/assets/shop3d-textures/*.webp`, `src/assets/shop3d-textures/CREDITS.md`
- Create: `src/components/shop3d/world/materials/textures.js`, `canvas-textures.js`, `materials-context.jsx`
- Create: `src/components/shop3d/world/geometry/merge.js`, `merged-meshes.jsx`
- Create: `src/components/shop3d/world/quality.js`, `quality-context.jsx`
- Test: `src/components/shop3d/world/geometry/merge.test.js`, `src/components/shop3d/world/quality.test.js`

**Interfaces:**
- Produces:
  - `TEXTURE_URLS` (object of imported webp URLs, keys `asphaltDiff, asphaltNor, paverDiff, paverNor, tilesWhiteDiff, tilesWhiteNor, tilesDarkDiff, tilesDarkNor, oakDiff, oakNor, brickDiff, brickNor, plasterDiff, darkWoodDiff`)
  - `canvas-textures.js`: `signAtlasTexture()`, `roomCardAtlasTexture()`, `shutterTexture()`, `caseTexture()`, `shopSignTexture(logoUrl)`, `textTexture({ text, width, height, bg, fg, font, border })`, `posterTexture(variant: 0|1|2)`, `atlasUV(geometry, { col, row, cols, rows })` (remaps a PlaneGeometry's UVs into one atlas cell; returns the geometry)
  - `<MaterialsProvider>` and `useMats() → Record<string, Material>`; `UV_METRES: Record<materialKey, number>` (metres per texture repeat). Material keys: `asphalt, paver, kerb, roadPaint, facadeWhite, facadeCream, facadeGrey, facadeDark, plasterOut, glass, frame, alu, slab, ac, shutter, railGlass, leaf, trunk, pole, tyre, lampHead, signAtlas, roomCards, green, greenMid, brass, orange, cream, black, oak, brick, plaster, darkWood, ceiling, led, coolLight, cardboard, chillerGlass, shopGlass, smokedGlass, leather, chalk, interiorCard`
  - `mergeParts(parts, uvMetres) → Map<materialKey, BufferGeometry>`; a part is `{ geo, mat, position?, rotation?, scale?, matrix?, keepUV? }`; `worldUV(geometry, metres)`; shared unit geometries `UNIT_BOX` (1×1×1 centred), `UNIT_PLANE` (1×1 in XY facing +z)
  - `<MergedMeshes parts extraMaterials? castShadow receiveShadow />` (parts must be memoised by the caller; `extraMaterials` maps extra keys → Material)
  - `QUALITY.high | QUALITY.low` = `{ tier, dpr, shadowMapSize, bloom, lampLights, maxDepth, maxInstances, interiorAlways, peopleAlways, farDetail }`; `detectTier(env) → 'high'|'low'` (`?quality=low|high` forces); `QualityContext`, `useQuality()`

- [ ] **Step 1: Write the texture fetch script**

Create `scripts/fetch-shop3d-textures.py`:

```python
"""Download the CC0 Poly Haven textures used by the 3D shop and write 1K webp
files to src/assets/shop3d-textures/ (plus CREDITS.md).

Run from the repo root:  python -I scripts/fetch-shop3d-textures.py
Downloads land in a fresh temporary folder; only Pillow reads them.
"""
import json
import os
import tempfile
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "assets", "shop3d-textures")

# output name -> (Poly Haven asset id, map key in the files API)
TEXTURES = {
    "asphalt_diff": ("asphalt_02", "Diffuse"),
    "asphalt_nor": ("asphalt_02", "nor_gl"),
    "paver_diff": ("concrete_pavers_02", "Diffuse"),
    "paver_nor": ("concrete_pavers_02", "nor_gl"),
    "tiles_white_diff": ("long_white_tiles", "Diffuse"),
    "tiles_white_nor": ("long_white_tiles", "nor_gl"),
    "tiles_dark_diff": ("rectangular_facade_tiles", "Diffuse"),
    "tiles_dark_nor": ("rectangular_facade_tiles", "nor_gl"),
    "oak_diff": ("oak_wood_planks", "Diffuse"),
    "oak_nor": ("oak_wood_planks", "nor_gl"),
    "brick_diff": ("brick_wall_001", "Diffuse"),
    "brick_nor": ("brick_wall_001", "nor_gl"),
    "plaster_diff": ("white_plaster_02", "Diffuse"),
    "dark_wood_diff": ("dark_wood", "Diffuse"),
}


def fetch(url, dest):
    with urllib.request.urlopen(url, timeout=60) as response, open(dest, "wb") as out:
        out.write(response.read())


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="shop3d-tex-")
    files_cache = {}
    credits = ["# 3D shop textures", "", "All textures are CC0 (public domain) from Poly Haven, https://polyhaven.com/license.", ""]
    for name, (asset, key) in TEXTURES.items():
        if asset not in files_cache:
            with urllib.request.urlopen(f"https://api.polyhaven.com/files/{asset}", timeout=60) as response:
                files_cache[asset] = json.load(response)
        url = files_cache[asset][key]["1k"]["jpg"]["url"]
        src = os.path.join(tmp, f"{name}.jpg")
        fetch(url, src)
        image = Image.open(src).convert("RGB")
        if image.size != (1024, 1024):
            image = image.resize((1024, 1024), Image.LANCZOS)
        dest = os.path.join(OUT, f"{name}.webp")
        image.save(dest, "WEBP", quality=90 if name.endswith("_nor") else 80, method=6)
        credits.append(f"- `{name}.webp` — {asset} ({key}), https://polyhaven.com/a/{asset}")
        print(f"{name}.webp  {os.path.getsize(dest) // 1024} KB")
    with open(os.path.join(OUT, "CREDITS.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(credits) + "\n")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it and check the output**

Run: `python -I scripts/fetch-shop3d-textures.py`
Expected: 14 lines like `asphalt_diff.webp  180 KB`; total under 3.5 MB (`du -ch src/assets/shop3d-textures/*.webp | tail -1`). If an asset id 404s, pick the nearest alternative from https://polyhaven.com/textures (same category), update `TEXTURES` and `CREDITS.md` is regenerated.

- [ ] **Step 3: Write the failing tests for merge and quality**

Create `src/components/shop3d/world/geometry/merge.test.js`:

```js
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
```

Create `src/components/shop3d/world/quality.test.js`:

```js
import { describe, expect, it } from "vitest";
import { detectTier, QUALITY } from "./quality";

const env = ({ coarse = false, memory, search = "" } = {}) => ({
  matchMedia: () => ({ matches: coarse }),
  navigator: { deviceMemory: memory },
  location: { search },
});

describe("detectTier", () => {
  it("picks high on a desktop", () => expect(detectTier(env({ memory: 8 }))).toBe("high"));
  it("picks low on touch devices", () => expect(detectTier(env({ coarse: true }))).toBe("low"));
  it("picks low on small-memory devices", () => expect(detectTier(env({ memory: 4 }))).toBe("low"));
  it("honours ?quality=", () => {
    expect(detectTier(env({ coarse: true, search: "?quality=high" }))).toBe("high");
    expect(detectTier(env({ search: "?quality=low" }))).toBe("low");
  });
  it("defaults to high without a window", () => expect(detectTier(undefined)).toBe("high"));
  it("keeps the low tier within budget", () => {
    expect(QUALITY.low.maxInstances).toBeLessThanOrEqual(450);
    expect(QUALITY.low.bloom).toBe(false);
    expect(QUALITY.high.maxInstances).toBeLessThanOrEqual(1800);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run src/components/shop3d/world`
Expected: FAIL — modules not found.

- [ ] **Step 5: Implement merge, merged meshes and quality**

Create `src/components/shop3d/world/geometry/merge.js`:

```js
import { BoxGeometry, BufferAttribute, Euler, Matrix4, PlaneGeometry, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Shared unit shapes; parts scale them. Never mutate these.
export const UNIT_BOX = new BoxGeometry(1, 1, 1);
export const UNIT_PLANE = new PlaneGeometry(1, 1); // XY plane facing +z

const KEEP = ["position", "normal", "uv"];

export const partMatrix = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) =>
  new Matrix4().compose(
    new Vector3(...position),
    new Quaternion().setFromEuler(new Euler(...rotation)),
    Array.isArray(scale) ? new Vector3(...scale) : new Vector3(scale, scale, scale)
  );

// Box-projected UVs in world metres: each face picks the two axes it spans, so a
// 6 m wall and a 0.5 m trim show the same texel density.
export const worldUV = (geometry, metres) => {
  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    let u;
    let v;
    if (ny >= nx && ny >= nz) {
      u = pos.getX(i);
      v = pos.getZ(i);
    } else if (nx >= nz) {
      u = pos.getZ(i);
      v = pos.getY(i);
    } else {
      u = pos.getX(i);
      v = pos.getY(i);
    }
    uv[i * 2] = u / metres;
    uv[i * 2 + 1] = v / metres;
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  return geometry;
};

export const mergeParts = (parts, uvMetres = {}) => {
  const byMat = new Map();
  for (const part of parts) {
    const g = part.geo.index ? part.geo.toNonIndexed() : part.geo.clone();
    g.clearGroups();
    g.applyMatrix4(part.matrix ?? partMatrix(part));
    for (const name of Object.keys(g.attributes)) if (!KEEP.includes(name)) g.deleteAttribute(name);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (uvMetres[part.mat] && !part.keepUV) worldUV(g, uvMetres[part.mat]);
    if (!g.attributes.uv) g.setAttribute("uv", new BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!byMat.has(part.mat)) byMat.set(part.mat, []);
    byMat.get(part.mat).push(g);
  }
  const out = new Map();
  for (const [mat, list] of byMat) {
    out.set(mat, mergeGeometries(list, false));
    list.forEach((g) => g.dispose());
  }
  return out;
};
```

Create `src/components/shop3d/world/geometry/merged-meshes.jsx`:

```jsx
import { useEffect, useMemo } from "react";
import { mergeParts } from "./merge";
import { UV_METRES, useMats } from "../materials/materials-context";

// Renders parts merged into one mesh per material. `parts` must be memoised by
// the caller: a new array re-merges everything. `extraMaterials` adds one-off
// materials (a coloured motorbike, a texture with text) under their own keys.
const MergedMeshes = ({ parts, extraMaterials, castShadow = true, receiveShadow = true, ...groupProps }) => {
  const shared = useMats();
  const mats = extraMaterials ? { ...shared, ...extraMaterials } : shared;
  const merged = useMemo(() => mergeParts(parts, UV_METRES), [parts]);
  useEffect(() => () => merged.forEach((g) => g.dispose()), [merged]);
  return (
    <group {...groupProps}>
      {[...merged].map(([key, geometry]) => {
        const material = mats[key];
        if (!material) throw new Error(`Unknown material key: ${key}`);
        return (
          <mesh
            key={key}
            geometry={geometry}
            material={material}
            castShadow={castShadow && !material.transparent && !material.userData.noShadow}
            receiveShadow={receiveShadow}
          />
        );
      })}
    </group>
  );
};

export default MergedMeshes;
```

Create `src/components/shop3d/world/quality.js`:

```js
// Two quality tiers. Picked once from the device (or ?quality=), and dropped to
// "low" by the performance monitor if the frame rate sags; never raised mid-visit.
export const QUALITY = {
  high: { tier: "high", dpr: [1, 2], shadowMapSize: 2048, bloom: true, lampLights: true, maxDepth: 2, maxInstances: 1800, interiorAlways: true, peopleAlways: true, farDetail: true },
  low: { tier: "low", dpr: [1, 1.25], shadowMapSize: 1024, bloom: false, lampLights: false, maxDepth: 1, maxInstances: 450, interiorAlways: false, peopleAlways: false, farDetail: false },
};

export const detectTier = (env) => {
  if (!env) return "high";
  const forced = new URLSearchParams(env.location?.search || "").get("quality");
  if (forced === "low" || forced === "high") return forced;
  if (env.matchMedia?.("(pointer: coarse)")?.matches) return "low";
  const memory = env.navigator?.deviceMemory;
  if (typeof memory === "number" && memory <= 4) return "low";
  return "high";
};
```

Create `src/components/shop3d/world/quality-context.jsx`:

```jsx
import { createContext, useContext } from "react";
import { QUALITY } from "./quality";

export const QualityContext = createContext(QUALITY.high);
export const useQuality = () => useContext(QualityContext);
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/components/shop3d/world`
Expected: PASS (10 tests).

- [ ] **Step 7: Textures, canvas textures and the material set**

Create `src/components/shop3d/world/materials/textures.js`:

```js
import asphaltDiff from "../../../../assets/shop3d-textures/asphalt_diff.webp";
import asphaltNor from "../../../../assets/shop3d-textures/asphalt_nor.webp";
import paverDiff from "../../../../assets/shop3d-textures/paver_diff.webp";
import paverNor from "../../../../assets/shop3d-textures/paver_nor.webp";
import tilesWhiteDiff from "../../../../assets/shop3d-textures/tiles_white_diff.webp";
import tilesWhiteNor from "../../../../assets/shop3d-textures/tiles_white_nor.webp";
import tilesDarkDiff from "../../../../assets/shop3d-textures/tiles_dark_diff.webp";
import tilesDarkNor from "../../../../assets/shop3d-textures/tiles_dark_nor.webp";
import oakDiff from "../../../../assets/shop3d-textures/oak_diff.webp";
import oakNor from "../../../../assets/shop3d-textures/oak_nor.webp";
import brickDiff from "../../../../assets/shop3d-textures/brick_diff.webp";
import brickNor from "../../../../assets/shop3d-textures/brick_nor.webp";
import plasterDiff from "../../../../assets/shop3d-textures/plaster_diff.webp";
import darkWoodDiff from "../../../../assets/shop3d-textures/dark_wood_diff.webp";

// CC0 Poly Haven textures (see src/assets/shop3d-textures/CREDITS.md).
export const TEXTURE_URLS = {
  asphaltDiff, asphaltNor, paverDiff, paverNor, tilesWhiteDiff, tilesWhiteNor, tilesDarkDiff, tilesDarkNor,
  oakDiff, oakNor, brickDiff, brickNor, plasterDiff, darkWoodDiff,
};
```

Create `src/components/shop3d/world/materials/canvas-textures.js`:

```js
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { SIGN_TEXTS } from "../../../../utils/shop3d/street-gen";

const make = (width, height, draw, { repeat = false } = {}) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  if (repeat) texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
};

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const speckle = (g, w, h, n, alpha, colours) => {
  for (let i = 0; i < n; i++) {
    g.globalAlpha = alpha * rnd();
    g.fillStyle = colours[Math.floor(rnd() * colours.length)];
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  g.globalAlpha = 1;
};

// Remap a PlaneGeometry's UVs into one cell of a cols×rows atlas (row 0 = top).
export const atlasUV = (geometry, { col = 0, row = 0, cols = 1, rows = 1 }) => {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (col + uv.getX(i)) / cols, 1 - (row + 1 - uv.getY(i)) / rows);
  }
  uv.needsUpdate = true;
  return geometry;
};

export const signAtlasTexture = () =>
  make(1024, 1024, (g) => {
    SIGN_TEXTS.forEach(([text, bg, fg], row) => {
      const y = row * 128;
      g.fillStyle = bg;
      g.fillRect(0, y, 1024, 128);
      g.strokeStyle = "rgba(255,255,255,0.18)";
      g.lineWidth = 6;
      g.strokeRect(8, y + 8, 1008, 112);
      g.fillStyle = fg;
      g.font = "700 74px Arial, Helvetica, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, 512, y + 68);
    });
  });

const ROOM_HUES = ["#ffe3b0", "#e8f3ff", "#ffd9c2", "#fff0d0"];
// Four lit-interior cards side by side (each 256 px wide): warm rooms seen through glass.
export const roomCardAtlasTexture = () =>
  make(1024, 256, (g) => {
    ROOM_HUES.forEach((hue, i) => {
      const x = i * 256;
      const grad = g.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, hue);
      grad.addColorStop(1, "#3b2a1c");
      g.fillStyle = grad;
      g.fillRect(x, 0, 256, 256);
      g.fillStyle = "rgba(40,25,15,0.65)";
      g.fillRect(x + 10 + rnd() * 90, 120, 70 + rnd() * 60, 136);
      g.fillRect(x + 170 + rnd() * 40, 80, 22, 176);
      g.fillStyle = "rgba(255,245,215,0.65)";
      g.fillRect(x + 100, 0, 56, 8);
    });
  });

export const shutterTexture = () =>
  make(128, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 8) {
      g.fillStyle = "#a3a8ab";
      g.fillRect(0, y, w, 6);
      g.fillStyle = "#6b7073";
      g.fillRect(0, y + 6, w, 2);
    }
    speckle(g, w, h, 1500, 0.3, ["#555", "#ccc", "#8a7a6a"]);
  });

// Cardboard case of six bottles (bottom shelves).
export const caseTexture = () =>
  make(256, 256, (g, w, h) => {
    g.fillStyle = "#b38a5a";
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3000, 0.25, ["#8b6a43", "#c9a273"]);
    g.fillStyle = "#1e3027";
    g.fillRect(0, 90, w, 70);
    g.fillStyle = "#f3efe3";
    g.font = "700 30px Arial, sans-serif";
    g.textAlign = "center";
    g.fillText("JÄGERMEISTER", w / 2, 136);
    g.fillStyle = "#dd5a12";
    g.fillRect(0, 160, w, 8);
  });

export const textTexture = ({ text, width = 512, height = 128, bg = "#1e3027", fg = "#f3efe3", font = "700 64px Arial, sans-serif", border }) =>
  make(width, height, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, width, height);
    if (border) {
      g.strokeStyle = border;
      g.lineWidth = Math.max(4, height * 0.06);
      g.strokeRect(g.lineWidth, g.lineWidth, width - 2 * g.lineWidth, height - 2 * g.lineWidth);
    }
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const lines = String(text).split("\n");
    const step = height / (lines.length + 1);
    lines.forEach((line, i) => g.fillText(line, width / 2, step * (i + 1)));
  });

// The shop sign: green board, gold border, logo on the left, name on the right.
export const shopSignTexture = (logoUrl) => {
  let texture;
  const draw = (g, w, h, logo) => {
    g.fillStyle = "#16241d";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b8922e";
    g.lineWidth = 10;
    g.strokeRect(8, 8, w - 16, h - 16);
    if (logo) g.drawImage(logo, 28, 14, (h - 28) * (logo.width / logo.height), h - 28);
    g.fillStyle = "#f3d48a";
    g.font = "700 92px Georgia, 'Times New Roman', serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("JÄGER THE JÄGER", w / 2 + 90, h / 2 + 4);
  };
  texture = make(1280, 180, (g, w, h) => draw(g, w, h, null));
  const image = new Image();
  image.onload = () => {
    draw(texture.image.getContext("2d"), texture.image.width, texture.image.height, image);
    texture.needsUpdate = true;
  };
  image.src = logoUrl;
  return texture;
};

// Vintage-style posters (stag, bottle, "since 1934"). Variant picks the palette.
export const posterTexture = (variant = 0) =>
  make(256, 360, (g, w, h) => {
    const [bg, ink, accent] = [["#efe2c4", "#1e3027", "#dd5a12"], ["#1e3027", "#f3efe3", "#b8922e"], ["#dd5a12", "#f3efe3", "#1e3027"]][variant % 3];
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 2500, 0.18, ["#000", "#fff"]);
    g.fillStyle = accent;
    g.beginPath();
    g.arc(w / 2, 150, 82, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 7;
    g.beginPath(); // stag head with antlers
    g.moveTo(w / 2, 205); g.lineTo(w / 2 - 22, 150); g.lineTo(w / 2, 120); g.lineTo(w / 2 + 22, 150); g.closePath();
    g.moveTo(w / 2 - 14, 125); g.lineTo(w / 2 - 50, 80); g.lineTo(w / 2 - 66, 92);
    g.moveTo(w / 2 - 38, 96); g.lineTo(w / 2 - 44, 70);
    g.moveTo(w / 2 + 14, 125); g.lineTo(w / 2 + 50, 80); g.lineTo(w / 2 + 66, 92);
    g.moveTo(w / 2 + 38, 96); g.lineTo(w / 2 + 44, 70);
    g.stroke();
    g.fillStyle = ink;
    g.textAlign = "center";
    g.font = "700 34px Georgia, serif";
    g.fillText(["JÄGERMEISTER", "56 HERBS", "ICE COLD"][variant % 3], w / 2, 285);
    g.font = "400 20px Georgia, serif";
    g.fillText(["SINCE 1934", "WOLFENBÜTTEL", "-18°C"][variant % 3], w / 2, 318);
  });
```

Create `src/components/shop3d/world/materials/materials-context.jsx`:

```jsx
import { createContext, useContext, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { MeshPhysicalMaterial, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from "three";
import { TEXTURE_URLS } from "./textures";
import { caseTexture, roomCardAtlasTexture, shutterTexture, signAtlasTexture } from "./canvas-textures";

// Metres covered by one texture repeat (used for world-space UVs on merged geometry).
export const UV_METRES = {
  asphalt: 4, paver: 1.6, kerb: 1.2, facadeWhite: 1.6, facadeCream: 1.6, facadeGrey: 1.6, facadeDark: 2.0,
  plasterOut: 2.5, oak: 2.2, brick: 1.8, plaster: 2.5, darkWood: 1.4,
};

const MaterialsContext = createContext(null);

export const MaterialsProvider = ({ children }) => {
  const t = useTexture(TEXTURE_URLS);
  const mats = useMemo(() => {
    for (const [key, texture] of Object.entries(t)) {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.anisotropy = 8;
      if (key.endsWith("Diff")) texture.colorSpace = SRGBColorSpace;
    }
    const std = (o) => new MeshStandardMaterial(o);
    const glassy = (o) => new MeshStandardMaterial({ roughness: 0.05, transparent: true, depthWrite: false, ...o });
    const signAtlas = signAtlasTexture();
    const roomCards = roomCardAtlasTexture();
    const m = {
      // street
      asphalt: std({ map: t.asphaltDiff, normalMap: t.asphaltNor, roughness: 0.93, color: "#b5b5b5" }),
      paver: std({ map: t.paverDiff, normalMap: t.paverNor, roughness: 0.86 }),
      kerb: std({ map: t.plasterDiff, color: "#9d9a92", roughness: 0.9 }),
      roadPaint: std({ color: "#e9e4d4", roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      facadeWhite: std({ map: t.tilesWhiteDiff, normalMap: t.tilesWhiteNor, roughness: 0.45 }),
      facadeCream: std({ map: t.tilesWhiteDiff, normalMap: t.tilesWhiteNor, color: "#eadcc0", roughness: 0.5 }),
      facadeGrey: std({ map: t.tilesWhiteDiff, normalMap: t.tilesWhiteNor, color: "#b9c0c4", roughness: 0.5 }),
      facadeDark: std({ map: t.tilesDarkDiff, normalMap: t.tilesDarkNor, roughness: 0.55 }),
      plasterOut: std({ map: t.plasterDiff, color: "#d9d2c3", roughness: 0.92 }),
      glass: std({ color: "#1d2a36", metalness: 0.9, roughness: 0.06 }),
      frame: std({ color: "#2c3034", metalness: 0.6, roughness: 0.4 }),
      alu: std({ color: "#c7cbce", metalness: 0.7, roughness: 0.35 }),
      slab: std({ color: "#d6d3cc", roughness: 0.8 }),
      ac: std({ color: "#e9e9e4", roughness: 0.5 }),
      shutter: std({ map: shutterTexture(), metalness: 0.5, roughness: 0.5 }),
      railGlass: glassy({ color: "#9fb6c2", opacity: 0.3 }),
      leaf: std({ color: "#2f5b36", roughness: 0.9 }),
      trunk: std({ color: "#4a3b2c", roughness: 1 }),
      pole: std({ color: "#4d5257", metalness: 0.6, roughness: 0.45 }),
      tyre: std({ color: "#151515", roughness: 0.9 }),
      lampHead: std({ color: "#000000", emissive: "#ffd9a0", emissiveIntensity: 4 }),
      signAtlas: std({ map: signAtlas, emissive: "#ffffff", emissiveMap: signAtlas, emissiveIntensity: 0.9, roughness: 0.4 }),
      roomCards: std({ color: "#000000", emissive: "#ffffff", emissiveMap: roomCards, emissiveIntensity: 1.0, roughness: 0.2 }),
      // brand
      green: std({ color: "#1e3027", roughness: 0.55 }),
      greenMid: std({ color: "#31533e", roughness: 0.55 }),
      brass: std({ color: "#b8922e", metalness: 0.9, roughness: 0.28 }),
      orange: std({ color: "#dd5a12", roughness: 0.75 }),
      cream: std({ color: "#f3efe3", roughness: 0.6 }),
      black: std({ color: "#141414", roughness: 0.4, metalness: 0.5 }),
      // interior
      oak: std({ map: t.oakDiff, normalMap: t.oakNor, roughness: 0.42 }),
      brick: std({ map: t.brickDiff, normalMap: t.brickNor, roughness: 0.9 }),
      plaster: std({ map: t.plasterDiff, color: "#efe7d6", roughness: 0.92 }),
      darkWood: std({ map: t.darkWoodDiff, color: "#7a5a48", roughness: 0.5 }),
      ceiling: std({ color: "#24302a", roughness: 0.85 }),
      led: std({ color: "#000000", emissive: "#ffcf8a", emissiveIntensity: 3 }),
      coolLight: std({ color: "#000000", emissive: "#dff3ff", emissiveIntensity: 1.2 }),
      cardboard: std({ map: caseTexture(), roughness: 0.9 }),
      chillerGlass: glassy({ color: "#cfe3ea", opacity: 0.18, metalness: 0.1 }),
      shopGlass: glassy({ color: "#a9c3cc", opacity: 0.16, metalness: 0.2 }),
      smokedGlass: new MeshPhysicalMaterial({ color: "#1a2a20", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
      leather: std({ color: "#2b3d31", roughness: 0.65 }),
      chalk: std({ color: "#1c1f1d", roughness: 0.95 }),
      interiorCard: std({ color: "#000000", emissive: "#ffffff", emissiveMap: roomCards, emissiveIntensity: 0.8 }),
    };
    m.led.userData.noShadow = true;
    m.coolLight.userData.noShadow = true;
    m.lampHead.userData.noShadow = true;
    m.roadPaint.userData.noShadow = true;
    return m;
  }, [t]);
  return <MaterialsContext.Provider value={mats}>{children}</MaterialsContext.Provider>;
};

export const useMats = () => useContext(MaterialsContext);
```

- [ ] **Step 8: Build check**

Run: `npx vite build 2>&1 | tail -5`
Expected: `✓ built in …` with no errors (the new modules are not imported by the app yet, so this checks only that nothing else broke; Task 6 imports them).

- [ ] **Step 9: Commit**

```bash
git add scripts/fetch-shop3d-textures.py src/assets/shop3d-textures src/components/shop3d/world
git commit -m "feat(shop3d): CC0 textures, shared materials, merged geometry and quality tiers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Canvas foundation (sky, light, walking outside, dolly, bloom)

**Files:**
- Create: `src/components/shop3d/world/atmosphere.jsx`, `camera-dolly.jsx`, `static-colliders.jsx`, `world.jsx`
- Modify: `src/components/shop3d/scene-canvas.component.jsx` (rewrite), `walk-controls.component.jsx`, `shop3d-hud.component.jsx`, `src/pages/shop3d.page.jsx`, `src/context/locale.context.jsx`
- Create: `.claude/launch.json` (dev server config for the preview browser)

**Interfaces:**
- Consumes: `layout.js` (Task 1), `QUALITY/detectTier/QualityContext/useQuality` and `MaterialsProvider` (Task 5).
- Produces:
  - `<Atmosphere />` (no props; reads the camera position each frame)
  - `<CameraDolly active path onArrived speed? />`
  - `<StaticColliders boxes />` (`boxes` = layout colliders; must be a stable array)
  - `<World products phase setPhase />` — the scene content; later tasks edit only this file to swap in new parts
  - `SceneCanvas` props become `{ products, phase, setPhase, moveRef }`
  - `WalkControls` props become `{ enabled, moveRef, bounds, groundAt }`

- [ ] **Step 1: WalkControls — bounds per phase and ground-following eye height**

In `src/components/shop3d/walk-controls.component.jsx`:

Replace the header constants block

```js
export const EYE_HEIGHT = 1.6;
export const WALK_BOUNDS = { minX: -4.05, maxX: 4.05, minZ: -4.8, maxZ: 5.0 };
```

with

```js
import { EYE_OFFSET, FLOOR_Y, INSIDE_BOUNDS } from "../../utils/shop3d/layout";

export const EYE_HEIGHT = FLOOR_Y + EYE_OFFSET;
export const WALK_BOUNDS = INSIDE_BOUNDS;
```

(move the new `import` line up with the other imports). Change the component signature to

```js
const WalkControls = ({ enabled, moveRef, bounds = WALK_BOUNDS, groundAt }) => {
```

and replace the tail of `useFrame`

```js
    // Pin eye height and keep the camera inside the walls.
    camera.position.y = EYE_HEIGHT;
    camera.position.x = Math.max(WALK_BOUNDS.minX, Math.min(WALK_BOUNDS.maxX, camera.position.x));
    camera.position.z = Math.max(WALK_BOUNDS.minZ, Math.min(WALK_BOUNDS.maxZ, camera.position.z));
```

with

```js
    // Keep inside the walkable area, then ease the eye toward the ground under
    // you (sidewalk 0.15, road 0, shop floor 0.06) so kerbs read as a step.
    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    const ground = groundAt ? groundAt(camera.position.x, camera.position.z) : FLOOR_Y;
    camera.position.y += (ground + EYE_OFFSET - camera.position.y) * Math.min(1, delta * 10);
```

Update the comment block above `EYE_HEIGHT` to say the bounds now come from `layout.js` (inside and outside).

- [ ] **Step 2: Camera dolly with waypoints**

Create `src/components/shop3d/world/camera-dolly.jsx`:

```jsx
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Matrix4, Quaternion, Vector3 } from "three";

const look = new Matrix4();
const facing = new Quaternion();
const goal = new Vector3();
const aim = new Vector3();

// Eases the camera through a list of poses ({ position, target }) and calls
// onArrived once at the last one. Used for walking in through the door and out.
const CameraDolly = ({ active, path, onArrived, speed = 2.4 }) => {
  const step = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    if (active) {
      step.current = 0;
      done.current = false;
    }
  }, [active]);

  useFrame(({ camera }, delta) => {
    if (!active || done.current) return;
    const pose = path[step.current];
    goal.fromArray(pose.position);
    aim.fromArray(pose.target);
    const t = Math.min(1, delta * speed);
    camera.position.lerp(goal, t);
    look.lookAt(camera.position, aim, camera.up);
    facing.setFromRotationMatrix(look);
    camera.quaternion.slerp(facing, t);
    if (camera.position.distanceTo(goal) < 0.12) {
      if (step.current < path.length - 1) step.current += 1;
      else {
        done.current = true;
        onArrived();
      }
    }
  });
  return null;
};

export default CameraDolly;
```

- [ ] **Step 3: Static colliders**

Create `src/components/shop3d/world/static-colliders.jsx`:

```jsx
import { useEffect } from "react";
import { Box3, Vector3 } from "three";
import { PLAYER_RADIUS, useCollision } from "../../../context/collision.context";

// Registers layout colliders ({ min: [x,z], max: [x,z] }) with the walk controller,
// inflated by the player radius. `boxes` must be a stable (module-level) array.
const StaticColliders = ({ boxes }) => {
  const collision = useCollision();
  useEffect(() => {
    if (!collision) return undefined;
    const off = boxes.map((b) =>
      collision.register(
        new Box3(
          new Vector3(b.min[0] - PLAYER_RADIUS, -1, b.min[1] - PLAYER_RADIUS),
          new Vector3(b.max[0] + PLAYER_RADIUS, 6, b.max[1] + PLAYER_RADIUS)
        )
      )
    );
    return () => off.forEach((unregister) => unregister());
  }, [collision, boxes]);
  return null;
};

export default StaticColliders;
```

- [ ] **Step 4: Atmosphere (sky, environments, fog, exposure, lights, bloom)**

Create `src/components/shop3d/world/atmosphere.jsx`:

```jsx
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BackSide, BoxGeometry, Color, FogExp2, Mesh, MeshBasicMaterial, PMREMGenerator, Scene,
  ShaderMaterial, SphereGeometry, Vector2, Vector3,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useQuality } from "./quality-context";
import { isInsideShop, STREET_PROPS } from "../../../utils/shop3d/layout";

export const SUN_DIR = new Vector3(-1, 0.22, -0.15).normalize();
const FOG_COLOUR = new Color("#5b5873");
const SKY_GEO = new SphereGeometry(140, 32, 16);

const skyMaterial = () =>
  new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { sun: { value: SUN_DIR } },
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec3 vDir; uniform vec3 sun;
      void main(){
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 zen = vec3(0.09, 0.12, 0.25), mid = vec3(0.45, 0.32, 0.45), hor = vec3(1.0, 0.55, 0.32);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h));
        c = mix(c, zen, smoothstep(0.15, 0.65, h));
        float s = max(dot(normalize(vDir), sun), 0.0);
        c += vec3(1.0, 0.55, 0.25) * pow(s, 24.0) * 0.9 + vec3(1.0, 0.45, 0.2) * pow(s, 4.0) * 0.25;
        if (vDir.y < 0.0) c = mix(hor * 0.5, vec3(0.2, 0.18, 0.22), clamp(-vDir.y * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

const Sky = () => {
  const ref = useRef();
  const material = useMemo(skyMaterial, []);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return <mesh ref={ref} geometry={SKY_GEO} material={material} renderOrder={-1} frustumCulled={false} />;
};

// Two prefiltered environment maps: the dusk sky outside, a warm dim room inside.
const useEnvironments = () => {
  const gl = useThree((state) => state.gl);
  const maps = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const outdoor = new Scene();
    outdoor.add(new Mesh(new SphereGeometry(10, 32, 16), skyMaterial()));
    const indoor = new Scene();
    indoor.add(new Mesh(new BoxGeometry(10, 4, 11), new MeshBasicMaterial({ color: "#2a1f17", side: BackSide })));
    const strip = (x, z, w, d, colour, power) => {
      const m = new Mesh(new BoxGeometry(w, 0.05, d), new MeshBasicMaterial({ color: new Color(colour).multiplyScalar(power) }));
      m.position.set(x, 1.95, z);
      indoor.add(m);
    };
    strip(-3, 0, 0.3, 8, "#ffd7a3", 6);
    strip(1, 0, 0.3, 8, "#ffd7a3", 6);
    strip(0, -5, 8, 0.3, "#ffcf8a", 3);
    const result = { outdoor: pmrem.fromScene(outdoor, 0.04).texture, indoor: pmrem.fromScene(indoor, 0.04).texture };
    pmrem.dispose();
    return result;
  }, [gl]);
  useEffect(() => () => {
    maps.outdoor.dispose();
    maps.indoor.dispose();
  }, [maps]);
  return maps;
};

const SKY_OUT = new Color("#7f8fbf");
const GROUND_OUT = new Color("#3a2c25");
const SKY_IN = new Color("#ffe7c4");
const GROUND_IN = new Color("#3a2a1c");

const LampSpot = ({ lamp }) => {
  const ref = useRef();
  useEffect(() => {
    const light = ref.current;
    light.target.position.set(lamp.x, 0, lamp.z + lamp.dir * 2.6);
    light.target.updateMatrixWorld();
  }, [lamp]);
  return <spotLight ref={ref} color="#ffcf8f" intensity={420} distance={26} angle={1.0} penumbra={0.6} decay={2} position={[lamp.x, 7.55, lamp.z + lamp.dir * 1.9]} />;
};

const SUN_TARGET = new Vector3(0, 4, 7.5);
const Sun = ({ size }) => {
  const ref = useRef();
  useEffect(() => {
    ref.current.target.position.copy(SUN_TARGET);
    ref.current.target.updateMatrixWorld();
  }, []);
  const position = SUN_TARGET.clone().addScaledVector(SUN_DIR, 60).toArray();
  return (
    <directionalLight
      ref={ref}
      color="#ffad70"
      intensity={1.6}
      position={position}
      castShadow
      shadow-mapSize={[size, size]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-17}
      shadow-camera-right={17}
      shadow-camera-top={17}
      shadow-camera-bottom={-17}
      shadow-camera-near={1}
      shadow-camera-far={130}
    />
  );
};

const TRACKS = [
  { p: [-3.4, 3.5, -2.0], t: [-4.6, 1.2, -2.0] },
  { p: [-0.95, 3.5, -1.3], t: [-0.95, 0, -1.3], shadow: true },
  { p: [-1.0, 3.5, -4.0], t: [-1.0, 1.2, -5.4] },
  { p: [-1.6, 3.5, 3.0], t: [-2.4, 0.8, 4.6] },
];
const TrackSpot = ({ track, shadowSize }) => {
  const ref = useRef();
  useEffect(() => {
    ref.current.target.position.fromArray(track.t);
    ref.current.target.updateMatrixWorld();
  }, [track]);
  return (
    <spotLight
      ref={ref}
      color="#ffd7a3"
      intensity={30}
      distance={10}
      angle={0.65}
      penumbra={0.7}
      decay={2}
      position={track.p}
      castShadow={Boolean(track.shadow)}
      shadow-mapSize={[shadowSize, shadowSize]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
};

const Bloom = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), 0.5, 0.45, 0.9));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame(() => composer.render(), 1); // priority 1: the composer takes over rendering
  return null;
};

// Everything that sets the mood: sky, environment, fog, exposure, lights, bloom.
// "Inside-ness" eases from 0 to 1 as the camera crosses the door, driving the
// fog density, exposure, hemisphere colours and which environment map is used.
const Atmosphere = () => {
  const quality = useQuality();
  const { scene, gl } = useThree();
  const envs = useEnvironments();
  const hemi = useRef();
  const k = useRef(0);
  const fog = useMemo(() => new FogExp2(FOG_COLOUR, 0.016), []);

  useEffect(() => {
    scene.fog = fog;
    scene.environment = envs.outdoor;
    return () => {
      scene.fog = null;
      scene.environment = null;
    };
  }, [scene, fog, envs]);

  useFrame(({ camera }, delta) => {
    const target = isInsideShop(camera.position.x, camera.position.z) ? 1 : 0;
    k.current += (target - k.current) * Math.min(1, delta * 3);
    const v = k.current;
    fog.density = 0.016 + (0.003 - 0.016) * v;
    gl.toneMappingExposure = 1.1 + (1.0 - 1.1) * v;
    const env = v > 0.5 ? envs.indoor : envs.outdoor;
    if (scene.environment !== env) scene.environment = env;
    if (hemi.current) {
      hemi.current.color.copy(SKY_OUT).lerp(SKY_IN, v);
      hemi.current.groundColor.copy(GROUND_OUT).lerp(GROUND_IN, v);
      hemi.current.intensity = 0.35 + 0.05 * v;
    }
  });

  return (
    <>
      <Sky />
      <hemisphereLight ref={hemi} args={[SKY_OUT, GROUND_OUT, 0.35]} />
      <Sun size={quality.shadowMapSize} />
      <pointLight color="#ffb866" intensity={14} distance={9} decay={2} position={[-1.5, 2.3, 6.4]} />
      {quality.lampLights && STREET_PROPS.lamps.filter((l) => l.light).map((l) => <LampSpot key={`${l.x}:${l.z}`} lamp={l} />)}
      {(quality.tier === "high" ? TRACKS : TRACKS.slice(0, 2)).map((track) => (
        <TrackSpot key={track.p.join(":")} track={track} shadowSize={Math.min(1024, quality.shadowMapSize)} />
      ))}
      <pointLight color="#ffc98a" intensity={6} distance={6} decay={2} position={[3.35, 2.5, 2.3]} />
      {quality.tier === "high" && <pointLight color="#ff7a30" intensity={3} distance={4} decay={2} position={[3.6, 2.9, -5.0]} />}
      {quality.bloom && <Bloom />}
    </>
  );
};

export default Atmosphere;
```

- [ ] **Step 5: World (temporary content) and the new SceneCanvas**

Create `src/components/shop3d/world/world.jsx` (later tasks replace its body piece by piece):

```jsx
import { useMemo } from "react";
import ExteriorScene from "../exterior-scene.component";
import InteriorScene from "../interior-scene.component";
import { resolveAccessoryPlacements, resolveProductInstances } from "../../../utils/shop3d.utils";
import { ACCESSORY_PLACEMENTS, FIXTURES, PRODUCT_SLOTS } from "../../../utils/shop3d.config";

// Everything in the 3D world below the atmosphere. Phases: outside → entering →
// inside → exiting → outside.
const World = ({ products, phase, setPhase }) => {
  const bottles = useMemo(() => (products.length ? resolveProductInstances(products, FIXTURES, PRODUCT_SLOTS) : []), [products]);
  const accessories = useMemo(() => resolveAccessoryPlacements(FIXTURES, ACCESSORY_PLACEMENTS), []);
  const inside = phase === "inside" || phase === "entering";
  return (
    <>
      <ExteriorScene inside={inside} onEnter={() => setPhase("entering")} onExit={() => setPhase("exiting")} />
      {phase !== "outside" && <InteriorScene bottles={bottles} accessories={accessories} />}
    </>
  );
};

export default World;
```

Replace the whole of `src/components/shop3d/scene-canvas.component.jsx` with:

```jsx
import { Suspense, useContext, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import WalkControls from "./walk-controls.component";
import { CartContext } from "../../context/cart.context";
import { CollisionProvider } from "../../context/collision.context";
import { QUALITY, detectTier } from "./world/quality";
import { QualityContext } from "./world/quality-context";
import { MaterialsProvider } from "./world/materials/materials-context";
import Atmosphere from "./world/atmosphere";
import CameraDolly from "./world/camera-dolly";
import World from "./world/world";
import { ENTER_PATH, EXIT_PATH, INSIDE_BOUNDS, OUTSIDE_BOUNDS, START_POSE, groundHeight } from "../../utils/shop3d/layout";

// The 3D shop. You start on the far sidewalk and walk (same controls inside and
// out); clicking the door dollies you in, clicking it again dollies you out.
const SceneCanvas = ({ products, phase, setPhase, moveRef }) => {
  const { isCartOpen } = useContext(CartContext);
  const [tier, setTier] = useState(() => detectTier(typeof window === "undefined" ? undefined : window));
  const quality = QUALITY[tier];
  const inside = phase === "inside";
  const outside = phase === "outside";

  return (
    <>
      <Canvas
        dpr={quality.dpr}
        shadows="soft"
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: START_POSE.position, fov: 60, near: 0.08, far: 160 }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          camera.lookAt(...START_POSE.target);
        }}
      >
        <QualityContext.Provider value={quality}>
          <PerformanceMonitor bounds={() => [28, 50]} flipflops={1} onDecline={() => setTier("low")} />
          <CollisionProvider>
            <Suspense fallback={null}>
              <MaterialsProvider>
                <Atmosphere />
                <World products={products} phase={phase} setPhase={setPhase} />
              </MaterialsProvider>
            </Suspense>
            <CameraDolly active={phase === "entering"} path={ENTER_PATH} onArrived={() => setPhase("inside")} />
            <CameraDolly active={phase === "exiting"} path={EXIT_PATH} onArrived={() => setPhase("outside")} />
            {/* Freeze walking while the cart overlay is open so keys/drag behind the blur don't move the camera. */}
            <WalkControls
              enabled={(inside || outside) && !isCartOpen}
              moveRef={moveRef}
              bounds={inside ? INSIDE_BOUNDS : OUTSIDE_BOUNDS}
              groundAt={groundHeight}
            />
          </CollisionProvider>
        </QualityContext.Provider>
      </Canvas>
      <Loader />
    </>
  );
};

export default SceneCanvas;
```

- [ ] **Step 6: Page, HUD and strings**

In `src/pages/shop3d.page.jsx`:
- remove the imports of `resolveProductInstances, resolveAccessoryPlacements` and of `FIXTURES, PRODUCT_SLOTS, ACCESSORY_PLACEMENTS`;
- remove the `bottles` and `accessories` `useMemo`s;
- render `<SceneCanvas products={products} phase={phase} setPhase={setPhase} moveRef={moveRef} />`.

In `src/components/shop3d/shop3d-hud.component.jsx` replace

```jsx
        {inside ? <TouchJoystick moveRef={moveRef} /> : <span />}
```

with

```jsx
        {inside || phase === "outside" ? <TouchJoystick moveRef={moveRef} /> : <span />}
```

In `src/context/locale.context.jsx` change the two `shop3dHelp` values:
- vi: `shop3dHelp: "WASD/phím mũi tên để đi · Kéo để nhìn quanh · Nhấp vào cửa để vào trong",`
- en: `shop3dHelp: "WASD/arrows to walk · Drag to look · Click the door to go in",`

- [ ] **Step 7: Dev server config**

Create `.claude/launch.json` (in the repo root):

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "jagershop-fe",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--", "--port", "5173", "--strictPort"],
      "port": 5173
    }
  ]
}
```

The dev env reads `VITE_BASE_API_URL` from `.env.development` (`http://localhost:3000`). If the local backend is not running, the product list is empty; for visual checks you can run `npm run dev` with `VITE_BASE_API_URL=https://jagerthejagershopv3-0-be-9as3.onrender.com` (the production API allows `http://localhost:5173` via CORS; read-only GETs only).

- [ ] **Step 8: Verify in the browser**

Start the preview (`preview_start` name `jagershop-fe`), open `/vi/shop3d` (choose 3D if the splash shows), and check:
- dusk sky gradient with a warm glow toward −x; haze; the old shop box lit by a low warm sun with soft shadows;
- WASD / arrows walk outside, drag looks around, kerb steps change eye height; you cannot leave the block;
- clicking the door swings it and the camera walks you in through two waypoints; clicking it inside walks you out to the near sidewalk;
- `read_console_messages` shows no errors.
Run `npx vitest run` — all suites pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/shop3d src/pages/shop3d.page.jsx src/context/locale.context.jsx .claude/launch.json
git commit -m "feat(shop3d): dusk atmosphere, quality tiers, walking outside and a waypoint door dolly

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: The street (road, shophouse rows, street furniture)

**Files:**
- Create: `src/components/shop3d/world/street/street.jsx`, `shophouses.jsx`, `street-props.jsx`
- Modify: `src/components/shop3d/world/world.jsx`, `src/components/shop3d/exterior-scene.component.jsx`

**Interfaces:**
- Consumes: `STREET, SIDEWALK_Y, FRONT_FACE_Z, BUILDING, STREET_PROPS, OUTSIDE_COLLIDERS` (Task 1), `generateRow, mulberry32` (Task 4), `MergedMeshes, UNIT_BOX, UNIT_PLANE, partMatrix, atlasUV, textTexture, useQuality, StaticColliders` (Tasks 5–6).
- Produces: `<Street />`, `<Shophouses />`, `<StreetProps />` (no props).

- [ ] **Step 1: Road, sidewalks, kerbs and markings**

Create `src/components/shop3d/world/street/street.jsx`:

```jsx
import { useMemo } from "react";
import MergedMeshes from "../geometry/merged-meshes";
import { UNIT_BOX, UNIT_PLANE } from "../geometry/merge";
import { SIDEWALK_Y, STREET } from "../../../../utils/shop3d/layout";

const LENGTH = STREET.halfLength * 2;
const flat = (mat, x, z, w, d, y = 0) => ({ geo: UNIT_PLANE, mat, position: [x, y, z], rotation: [-Math.PI / 2, 0, 0], scale: [w, d, 1] });
const block = (mat, x, y, z, w, h, d) => ({ geo: UNIT_BOX, mat, position: [x, y, z], scale: [w, h, d] });

const streetParts = () => {
  const { road, nearWalk, farWalk, kerbWidth } = STREET;
  const roadMid = (road.z0 + road.z1) / 2;
  const parts = [flat("asphalt", 0, roadMid, LENGTH, road.z1 - road.z0)];
  // Sidewalk slabs from y 0 up to the sidewalk top, with kerb stones on the road side.
  const near = { z0: nearWalk.z0, z1: nearWalk.z1 - kerbWidth };
  const far = { z0: farWalk.z0 + kerbWidth, z1: farWalk.z1 };
  for (const w of [near, far]) parts.push(block("paver", 0, SIDEWALK_Y / 2, (w.z0 + w.z1) / 2, LENGTH, SIDEWALK_Y, w.z1 - w.z0));
  parts.push(block("kerb", 0, SIDEWALK_Y / 2, nearWalk.z1 - kerbWidth / 2, LENGTH, SIDEWALK_Y, kerbWidth));
  parts.push(block("kerb", 0, SIDEWALK_Y / 2, farWalk.z0 + kerbWidth / 2, LENGTH, SIDEWALK_Y, kerbWidth));
  // Paint sits 2 mm above the asphalt and its material also uses polygonOffset.
  for (let x = -STREET.halfLength + 1.5; x < STREET.halfLength; x += 6) {
    if (x > STREET.crossingX - 4 && x < STREET.crossingX + 10) continue;
    parts.push({ ...flat("roadPaint", x, STREET.laneZ, 3, 0.12, 0.002), keepUV: true });
  }
  STREET.edgeLinesZ.forEach((z) => parts.push({ ...flat("roadPaint", 0, z, LENGTH, 0.1, 0.002), keepUV: true }));
  for (let i = 0; i < 7; i++) parts.push({ ...flat("roadPaint", STREET.crossingX + i, roadMid, 0.5, road.z1 - road.z0 - 1.4, 0.002), keepUV: true });
  return parts;
};

const Street = () => {
  const parts = useMemo(streetParts, []);
  return <MergedMeshes parts={parts} castShadow={false} />;
};

export default Street;
```

(The edge lines stop being drawn under the zebra stripes only visually: both are the same white paint, so where they cross there is nothing to flicker.)

- [ ] **Step 2: Shophouse rows**

Create `src/components/shop3d/world/street/shophouses.jsx`:

```jsx
import { useMemo } from "react";
import { IcosahedronGeometry, Matrix4, PlaneGeometry, Quaternion, Vector3 } from "three";
import MergedMeshes from "../geometry/merged-meshes";
import { partMatrix, UNIT_BOX, UNIT_PLANE } from "../geometry/merge";
import { atlasUV } from "../materials/canvas-textures";
import { useQuality } from "../quality-context";
import { generateRow, SIGN_TEXTS } from "../../../../utils/shop3d/street-gen";
import { BUILDING, FRONT_FACE_Z, SIDEWALK_Y, STREET } from "../../../../utils/shop3d/layout";

const GROUND = 4.0;
const STOREY = 3.4;
const DEPTH = 12;
const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);
const PLANT = new IcosahedronGeometry(0.28, 1);

const cells = new Map();
const cell = (col, row, cols, rows) => {
  const key = `${col}:${row}:${cols}:${rows}`;
  if (!cells.has(key)) cells.set(key, atlasUV(new PlaneGeometry(1, 1), { col, row, cols, rows }));
  return cells.get(key);
};

// One shophouse in its own frame (origin = facade centre on the sidewalk, +z = street),
// placed by `face` (+1 near side, −1 far side).
const houseParts = (house, z, face, detail) => {
  const base = new Matrix4().compose(
    new Vector3(house.x0 + house.w / 2, SIDEWALK_Y, z),
    new Quaternion().setFromAxisAngle(UP, face > 0 ? 0 : Math.PI),
    ONE
  );
  const parts = [];
  const add = (geo, mat, position, scale, rotation = [0, 0, 0], keepUV = false) =>
    parts.push({ geo, mat, keepUV, matrix: base.clone().multiply(partMatrix({ position, rotation, scale })) });
  const w = house.w;
  const height = GROUND + house.floors * STOREY;

  add(UNIT_BOX, house.facade, [0, height / 2, -DEPTH / 2], [w - 0.04, height, DEPTH]);
  add(UNIT_BOX, "slab", [0, height + 0.15, 0.05], [w, 0.3, 0.35]);

  // Ground floor: a lit shop seen through glass, or a closed roller shutter.
  if (house.open) {
    add(cell(house.card, 0, 4, 1), "roomCards", [0, 1.6, 0.03], [w - 0.6, 2.9, 1], [0, 0, 0], true);
    add(UNIT_BOX, "frame", [0, 3.07, 0.06], [w - 0.6, 0.06, 0.12]);
    add(UNIT_BOX, "frame", [-(w / 2 - 0.34), 1.6, 0.06], [0.08, 2.9, 0.12]);
    add(UNIT_BOX, "frame", [w / 2 - 0.34, 1.6, 0.06], [0.08, 2.9, 0.12]);
  } else {
    add(UNIT_BOX, "shutter", [0, 1.6, 0.03], [w - 0.6, 2.9, 0.06], [0, 0, 0], true);
  }
  // LED sign: a backing box with the atlas row 3 mm in front of it.
  add(UNIT_BOX, "frame", [0, 3.5, 0.08], [w - 0.4, 0.7, 0.14]);
  add(cell(0, house.sign, 1, SIGN_TEXTS.length), "signAtlas", [0, 3.5, 0.153], [w - 0.5, 0.6, 1], [0, 0, 0], true);

  house.storeys.forEach((s, f) => {
    const y = GROUND + f * STOREY;
    const ww = w - 1.0;
    if (s.lit) add(cell(s.card, 0, 4, 1), "roomCards", [0, y + 1.5, 0.03], [ww, 2.2, 1], [0, 0, 0], true);
    else add(UNIT_PLANE, "glass", [0, y + 1.5, 0.03], [ww, 2.2, 1]);
    add(UNIT_BOX, "frame", [0, y + 2.62, 0.05], [ww + 0.1, 0.08, 0.1]);
    add(UNIT_BOX, "frame", [0, y + 0.38, 0.05], [ww + 0.1, 0.08, 0.1]);
    for (let k = 0; k <= 2; k++) add(UNIT_BOX, "frame", [-ww / 2 + (k * ww) / 2, y + 1.5, 0.05], [0.06, 2.2, 0.1]);
    if (detail && s.balcony) {
      add(UNIT_BOX, "slab", [0, y + 0.07, 0.45], [w - 0.3, 0.14, 0.9]);
      add(UNIT_PLANE, "railGlass", [0, y + 0.62, 0.88], [w - 0.4, 0.95, 1]);
      add(UNIT_BOX, "alu", [0, y + 1.1, 0.88], [w - 0.3, 0.05, 0.05]);
      if (s.plant) add(PLANT, "leaf", [((Math.abs(house.x0 * 7.13 + f * 3.1) % 1) - 0.5) * (w - 1.2), y + 0.4, 0.5], [1, 1, 1]);
    }
    if (detail && s.ac) add(UNIT_BOX, "ac", [w / 2 - 0.7, y + 2.95, 0.2], [0.8, 0.55, 0.3]);
  });
  return parts;
};

const Shophouses = () => {
  const { farDetail } = useQuality();
  const parts = useMemo(() => {
    const rows = [
      { houses: generateRow({ from: -STREET.halfLength, to: BUILDING.minX - 0.02, seed: 11 }), z: FRONT_FACE_Z, face: 1, detail: true },
      { houses: generateRow({ from: BUILDING.maxX + 0.02, to: STREET.halfLength, seed: 23 }), z: FRONT_FACE_Z, face: 1, detail: true },
      { houses: generateRow({ from: -STREET.halfLength, to: STREET.halfLength, seed: 37 }), z: STREET.farFacadeZ, face: -1, detail: farDetail },
    ];
    return rows.flatMap((row) => row.houses.flatMap((house) => houseParts(house, row.z, row.face, row.detail)));
  }, [farDetail]);
  return <MergedMeshes parts={parts} />;
};

export default Shophouses;
```

- [ ] **Step 3: Street furniture**

Create `src/components/shop3d/world/street/street-props.jsx`:

```jsx
import { useMemo } from "react";
import {
  CatmullRomCurve3, CylinderGeometry, IcosahedronGeometry, Matrix4, MeshStandardMaterial,
  QuadraticBezierCurve3, Quaternion, TorusGeometry, TubeGeometry, Vector3,
} from "three";
import MergedMeshes from "../geometry/merged-meshes";
import { partMatrix, UNIT_BOX, UNIT_PLANE } from "../geometry/merge";
import { textTexture } from "../materials/canvas-textures";
import StaticColliders from "../static-colliders";
import { mulberry32 } from "../../../../utils/shop3d/street-gen";
import { OUTSIDE_COLLIDERS, SIDEWALK_Y, STREET, STREET_PROPS } from "../../../../utils/shop3d/layout";

const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);
const POLE = new CylinderGeometry(0.07, 0.11, 7.5, 12);
const arm = (dir) => new TubeGeometry(new QuadraticBezierCurve3(new Vector3(0, 7.3, 0), new Vector3(0, 7.9, dir * 0.6), new Vector3(0, 7.7, dir * 1.6)), 16, 0.05, 8);
const ARMS = { 1: arm(1), "-1": arm(-1) };
const TRUNK = new CylinderGeometry(0.1, 0.16, 3.4, 8);
const BLOB = new IcosahedronGeometry(1, 1);
const WHEEL = new TorusGeometry(0.26, 0.08, 10, 20);
const STOOL = new CylinderGeometry(0.15, 0.19, 0.46, 16);
const SEAT = new CylinderGeometry(0.17, 0.17, 0.02, 16);

const framed = (x, z, rotY) => new Matrix4().compose(new Vector3(x, SIDEWALK_Y, z), new Quaternion().setFromAxisAngle(UP, rotY), ONE);
const local = (base, geo, mat, position, scale = [1, 1, 1], rotation = [0, 0, 0], keepUV = false) => ({
  geo, mat, keepUV, matrix: base.clone().multiply(partMatrix({ position, rotation, scale })),
});

const lampParts = (l) => [
  { geo: POLE, mat: "pole", position: [l.x, SIDEWALK_Y + 3.75, l.z] },
  { geo: ARMS[l.dir], mat: "pole", position: [l.x, SIDEWALK_Y, l.z] },
  { geo: UNIT_BOX, mat: "pole", position: [l.x, SIDEWALK_Y + 7.68, l.z + l.dir * 1.9], scale: [0.32, 0.12, 0.7] },
  { geo: UNIT_PLANE, mat: "lampHead", position: [l.x, SIDEWALK_Y + 7.615, l.z + l.dir * 1.9], rotation: [Math.PI / 2, 0, 0], scale: [0.26, 0.6, 1], keepUV: true },
];

const treeParts = (t) => {
  const rnd = mulberry32(Math.round(t.x * 100 + t.z));
  const parts = [
    { geo: TRUNK, mat: "trunk", position: [t.x, SIDEWALK_Y + 1.7 * t.s, t.z], scale: t.s },
    { geo: UNIT_BOX, mat: "kerb", position: [t.x, SIDEWALK_Y + 0.1, t.z], scale: [0.9, 0.2, 0.9] },
  ];
  for (let i = 0; i < 6; i++) {
    parts.push({
      geo: BLOB,
      mat: "leaf",
      position: [t.x + (rnd() - 0.5) * 1.8 * t.s, SIDEWALK_Y + (3.4 + rnd() * 1.4) * t.s, t.z + (rnd() - 0.5) * 1.6 * t.s],
      scale: (0.9 + rnd() * 0.6) * t.s,
    });
  }
  return parts;
};

const bikeParts = (m, i) => {
  const base = framed(m.x, m.z, m.rot);
  const body = `bike${i}`;
  return [
    local(base, WHEEL, "tyre", [-0.62, 0.34, 0]),
    local(base, WHEEL, "tyre", [0.62, 0.34, 0]),
    local(base, UNIT_BOX, body, [0, 0.66, 0], [1.0, 0.28, 0.3]),
    local(base, UNIT_BOX, "tyre", [-0.15, 0.85, 0], [0.55, 0.1, 0.3]),
    local(base, UNIT_BOX, body, [0.55, 0.78, 0], [0.14, 0.7, 0.32], [0, 0, -0.35]),
    local(base, UNIT_BOX, "alu", [0.72, 1.15, 0], [0.06, 0.06, 0.6]),
    local(base, UNIT_BOX, "tyre", [0.1, 0.42, 0], [0.5, 0.05, 0.28]),
  ];
};

const stoolParts = (s, i) => [
  { geo: STOOL, mat: `stool${i}`, position: [s.x, SIDEWALK_Y + 0.23, s.z] },
  { geo: SEAT, mat: `stool${i}`, position: [s.x, SIDEWALK_Y + 0.47, s.z] },
];

// A-frame chalkboard by the door: two leaning boards, chalk text on the front one.
const chalkboardParts = ({ x, z, rotY }) => {
  const base = framed(x, z, rotY);
  return [
    local(base, UNIT_BOX, "darkWood", [0, 0.44, 0.1], [0.62, 0.9, 0.03], [-0.22, 0, 0]),
    local(base, UNIT_BOX, "darkWood", [0, 0.44, -0.1], [0.62, 0.9, 0.03], [0.22, 0, 0]),
    local(base, UNIT_PLANE, "chalkSign", [0, 0.445, 0.119], [0.52, 0.76, 1], [-0.22, 0, 0], true),
  ];
};

const cableParts = () =>
  [0, 1].map((i) => {
    const points = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      points.push(new Vector3(-STREET.halfLength + 2 * STREET.halfLength * t, 7.0 + i * 0.25 - Math.sin(Math.PI * t) * 0.8, 8.95 + i * 0.15));
    }
    return { geo: new TubeGeometry(new CatmullRomCurve3(points), 96, 0.012, 4), mat: "tyre" };
  });

const StreetProps = () => {
  const parts = useMemo(
    () => [
      ...STREET_PROPS.lamps.flatMap(lampParts),
      ...STREET_PROPS.trees.flatMap(treeParts),
      ...STREET_PROPS.motorbikes.flatMap(bikeParts),
      ...STREET_PROPS.stools.flatMap(stoolParts),
      ...chalkboardParts(STREET_PROPS.chalkboard),
    ],
    []
  );
  const cables = useMemo(cableParts, []);
  const extra = useMemo(() => {
    const m = {};
    STREET_PROPS.motorbikes.forEach((b, i) => (m[`bike${i}`] = new MeshStandardMaterial({ color: b.color, metalness: 0.4, roughness: 0.35 })));
    STREET_PROPS.stools.forEach((s, i) => (m[`stool${i}`] = new MeshStandardMaterial({ color: s.color, roughness: 0.6 })));
    m.chalkSign = new MeshStandardMaterial({
      map: textTexture({ text: "HÔM NAY\nJÄGERMEISTER\nƯỚP LẠNH", width: 256, height: 384, bg: "#1c1f1d", fg: "#f3efe3", font: "700 30px 'Segoe Print', 'Comic Sans MS', cursive" }),
      roughness: 0.9,
    });
    return m;
  }, []);
  return (
    <>
      <MergedMeshes parts={parts} extraMaterials={extra} />
      <MergedMeshes parts={cables} castShadow={false} />
      <StaticColliders boxes={OUTSIDE_COLLIDERS} />
    </>
  );
};

export default StreetProps;
```

- [ ] **Step 4: Mount the street; drop the old street GLBs**

In `src/components/shop3d/world/world.jsx` add the imports

```jsx
import Street from "./street/street";
import Shophouses from "./street/shophouses";
import StreetProps from "./street/street-props";
```

and render `<Street />`, `<Shophouses />`, `<StreetProps />` as the first three children of the fragment.

In `src/components/shop3d/exterior-scene.component.jsx` delete the three lines rendering `sidewalk-base.glb`, `planter.glb` and `street-lamp.glb` (the new sidewalk replaces the slab; leaving it would z-fight with the paver top at y 0.15).

- [ ] **Step 5: Verify in the browser**

Reload `/vi/shop3d`. Check from the start pose and while walking to both block ends:
- shophouses both sides and across, varied heights, lit cards, LED signs readable (Vietnamese diacritics intact), balconies with glass rails, AC units;
- road texture with lane dashes, edge lines and a zebra crossing; pavers on sidewalks; kerb step when walking onto the road (eye drops 15 cm);
- lamps glowing with light pools (high tier); trees, motorbikes, stools, chalkboard; you collide with lamps, trees, bikes;
- no flicker on markings, kerbs, sign faces or window cards while moving (look along the road at a grazing angle);
- `?quality=low`: no lamp pools, far-side balconies gone, still no flicker.
Take a screenshot from the start pose for the record.

- [ ] **Step 6: Commit**

```bash
git add src/components/shop3d/world/street src/components/shop3d/world/world.jsx src/components/shop3d/exterior-scene.component.jsx
git commit -m "feat(shop3d): modern Saigon street with shophouse rows and street furniture

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: The shop building, room shell and door

**Files:**
- Create: `src/components/shop3d/world/shopfront/shop-building.jsx`, `door.jsx`, `src/components/shop3d/world/interior/room-shell.jsx`
- Modify: `src/components/shop3d/world/world.jsx`, `src/components/shop3d/interior-scene.component.jsx`
- Delete: `src/components/shop3d/exterior-scene.component.jsx`

**Interfaces:**
- Consumes: layout (`BUILDING, DOOR, WINDOW, FRONT_FACE_Z, FLOOR_Y, CEILING_Y`), `MergedMeshes`, `shopSignTexture`, `atlasUV`, `useMats`, `TRACKS` (export it from `atmosphere.jsx` in this task).
- Produces: `<ShopBuilding showInteriorCard />`, `<RoomShell />`, `<Door phase onEnter onExit />`.

- [ ] **Step 1: Export the track light positions**

In `src/components/shop3d/world/atmosphere.jsx` change `const TRACKS = [` to `export const TRACKS = [`.

- [ ] **Step 2: Shop building (exterior)**

Create `src/components/shop3d/world/shopfront/shop-building.jsx`:

```jsx
import { useMemo } from "react";
import { MeshStandardMaterial, PlaneGeometry } from "three";
import MergedMeshes from "../geometry/merged-meshes";
import { UNIT_BOX, UNIT_PLANE } from "../geometry/merge";
import { atlasUV, shopSignTexture } from "../materials/canvas-textures";
import Logo from "../../../../assets/logo.png";
import { BUILDING, DOOR, FRONT_FACE_Z as Z, WINDOW } from "../../../../utils/shop3d/layout";

const OUTER_BACK = 5.53; // the green outer skin runs z 5.53 → 5.6; the plaster inner skin is 5.5 → 5.53
const TOP = BUILDING.groundTop + BUILDING.upperFloors * BUILDING.floorHeight;
const WIN_MID = (WINDOW.x0 + WINDOW.x1) / 2;
const CARD = atlasUV(new PlaneGeometry(1, 1), { col: 0, row: 0, cols: 4, rows: 1 });
const CARD_LIT = [1, 2, 3].map((col) => atlasUV(new PlaneGeometry(1, 1), { col, row: 0, cols: 4, rows: 1 }));

const box = (mat, position, scale, rotation) => ({ geo: UNIT_BOX, mat, position, scale, rotation });
const outer = (x0, x1, y0, y1) => box("green", [(x0 + x1) / 2, (y0 + y1) / 2, (OUTER_BACK + Z) / 2], [x1 - x0, y1 - y0, Z - OUTER_BACK]);

const buildingParts = () => {
  const B = BUILDING;
  const parts = [
    // ground-floor shopfront (green) with the window and door openings
    outer(B.minX, WINDOW.x0, 0, B.groundTop),
    outer(WINDOW.x0, WINDOW.x1, 0, WINDOW.sill),
    outer(WINDOW.x0, WINDOW.x1, WINDOW.top, B.groundTop),
    outer(WINDOW.x1, DOOR.x0, 0, B.groundTop),
    outer(DOOR.x0, DOOR.x1, DOOR.top, B.groundTop),
    outer(DOOR.x1, B.maxX, 0, B.groundTop),
    // upper floors (cream tile) and parapet
    box("facadeCream", [0, (B.groundTop + TOP) / 2, (B.backZ + Z) / 2], [B.maxX - B.minX, TOP - B.groundTop, Z - B.backZ]),
    box("slab", [0, TOP + 0.175, Z - 0.1], [B.maxX - B.minX + 0.2, 0.35, 0.4]),
    box("brass", [0, B.groundTop - 0.05, Z + 0.06], [B.maxX - B.minX + 0.1, 0.25, 0.12]),
    // sign backing; the sign face is its own material (see extraMaterials)
    box("green", [0, 3.5, Z + 0.08], [7.4, 1.0, 0.16]),
    { geo: UNIT_PLANE, mat: "shopSign", position: [0, 3.5, Z + 0.163], scale: [6.9, 0.92, 1], keepUV: true },
    // awning with a front valance
    box("orange", [0, 2.85, Z + 0.62], [9.8, 0.05, 1.3], [0.28, 0, 0]),
    box("orange", [0, 2.56, Z + 1.25], [9.8, 0.22, 0.02]),
    // display window: brass frame, mullion, glass, exterior sill
    box("brass", [WINDOW.x0, (WINDOW.sill + WINDOW.top) / 2, 5.55], [0.08, WINDOW.top - WINDOW.sill + 0.08, 0.14]),
    box("brass", [WINDOW.x1, (WINDOW.sill + WINDOW.top) / 2, 5.55], [0.08, WINDOW.top - WINDOW.sill + 0.08, 0.14]),
    box("brass", [WIN_MID, WINDOW.top, 5.55], [WINDOW.x1 - WINDOW.x0 + 0.08, 0.08, 0.14]),
    box("brass", [WIN_MID, WINDOW.sill, 5.55], [WINDOW.x1 - WINDOW.x0 + 0.08, 0.08, 0.14]),
    box("brass", [WIN_MID, (WINDOW.sill + WINDOW.top) / 2, 5.55], [0.05, WINDOW.top - WINDOW.sill, 0.1]),
    { geo: UNIT_PLANE, mat: "shopGlass", position: [WIN_MID, (WINDOW.sill + WINDOW.top) / 2, 5.565], scale: [WINDOW.x1 - WINDOW.x0, WINDOW.top - WINDOW.sill, 1] },
    box("green", [WIN_MID, WINDOW.sill - 0.03, Z + 0.06], [WINDOW.x1 - WINDOW.x0 + 0.2, 0.06, 0.18]),
    // door frame and threshold (threshold stops 1 cm short of the sidewalk so the tops never meet)
    box("brass", [DOOR.x0, DOOR.top / 2, 5.55], [0.08, DOOR.top + 0.04, 0.14]),
    box("brass", [DOOR.x1, DOOR.top / 2, 5.55], [0.08, DOOR.top + 0.04, 0.14]),
    box("brass", [(DOOR.x0 + DOOR.x1) / 2, DOOR.top, 5.55], [DOOR.x1 - DOOR.x0 + 0.08, 0.08, 0.14]),
    box("brass", [(DOOR.x0 + DOOR.x1) / 2, 0.075, 5.53], [DOOR.x1 - DOOR.x0, 0.15, 0.12]),
  ];
  // wall lanterns either side of the door
  for (const x of [DOOR.x0 - 0.35, DOOR.x1 + 0.35]) {
    parts.push(box("brass", [x, 2.37, Z + 0.09], [0.16, 0.04, 0.16]));
    parts.push(box("brass", [x, 2.03, Z + 0.09], [0.16, 0.04, 0.16]));
    parts.push(box("led", [x, 2.2, Z + 0.09], [0.11, 0.3, 0.11]));
  }
  // upper-floor windows: three per floor, alternating lit rooms and dark glass
  for (let f = 0; f < BUILDING.upperFloors; f++) {
    const y = BUILDING.groundTop + f * BUILDING.floorHeight;
    for (let k = -1; k <= 1; k++) {
      const lit = (f + k + 2) % 2 === 0;
      parts.push({ geo: lit ? CARD_LIT[(f + k + 3) % 3] : UNIT_PLANE, mat: lit ? "roomCards" : "glass", position: [k * 3.2, y + 1.6, Z + 0.03], scale: [2.2, 2.0, 1], keepUV: lit });
      parts.push(box("green", [k * 3.2, y + 0.55, Z + 0.125], [2.4, 0.12, 0.25]));
      parts.push(box("green", [k * 3.2, y + 2.66, Z + 0.06], [2.4, 0.12, 0.12]));
      parts.push(box("green", [k * 3.2, y + 1.6, Z + 0.04], [0.06, 2.0, 0.08]));
    }
  }
  return parts;
};

const ShopBuilding = ({ showInteriorCard }) => {
  const parts = useMemo(buildingParts, []);
  const card = useMemo(() => [{ geo: CARD, mat: "interiorCard", position: [WIN_MID, 1.55, 5.3], scale: [WINDOW.x1 - WINDOW.x0, 2.1, 1], keepUV: true }], []);
  const extra = useMemo(() => {
    const map = shopSignTexture(Logo);
    return { shopSign: new MeshStandardMaterial({ map, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 1.3, roughness: 0.4 }) };
  }, []);
  return (
    <>
      <MergedMeshes parts={parts} extraMaterials={extra} />
      {showInteriorCard && <MergedMeshes parts={card} castShadow={false} />}
    </>
  );
};

export default ShopBuilding;
```

- [ ] **Step 3: Room shell (interior faces of the same walls)**

Create `src/components/shop3d/world/interior/room-shell.jsx`:

```jsx
import { useMemo } from "react";
import { CircleGeometry, CylinderGeometry } from "three";
import MergedMeshes from "../geometry/merged-meshes";
import { UNIT_BOX } from "../geometry/merge";
import { TRACKS } from "../atmosphere";
import { BUILDING, CEILING_Y, DOOR, FLOOR_Y, ROOM, WINDOW } from "../../../../utils/shop3d/layout";

const CAN = new CylinderGeometry(0.05, 0.06, 0.16, 12);
const LENS = new CircleGeometry(0.045, 12);
const box = (mat, position, scale) => ({ geo: UNIT_BOX, mat, position, scale });
const inner = (x0, x1, y0, y1) => box("plaster", [(x0 + x1) / 2, (y0 + y1) / 2, 5.515], [x1 - x0, y1 - y0, 0.03]);

const shellParts = () => {
  const B = BUILDING;
  const wallDepth = 5.53 - B.backZ;
  const wallMidZ = (5.53 + B.backZ) / 2;
  const parts = [
    box("oak", [0, FLOOR_Y / 2, 0], [ROOM.maxX - ROOM.minX, FLOOR_Y, ROOM.maxZ - ROOM.minZ]),
    box("ceiling", [0, (CEILING_Y + B.groundTop) / 2, (B.backZ + ROOM.maxZ) / 2], [B.maxX - B.minX, B.groundTop - CEILING_Y, ROOM.maxZ - B.backZ]),
    box("plaster", [(B.minX + ROOM.minX) / 2, CEILING_Y / 2, wallMidZ], [ROOM.minX - B.minX, CEILING_Y, wallDepth]),
    box("plaster", [(B.maxX + ROOM.maxX) / 2, CEILING_Y / 2, wallMidZ], [B.maxX - ROOM.maxX, CEILING_Y, wallDepth]),
    box("brick", [0, CEILING_Y / 2, (B.backZ + ROOM.minZ) / 2], [ROOM.maxX - ROOM.minX, CEILING_Y, ROOM.minZ - B.backZ]),
    // inner plaster skin of the front wall, with the same openings as the shopfront
    inner(ROOM.minX, WINDOW.x0, 0, CEILING_Y),
    inner(WINDOW.x0, WINDOW.x1, 0, WINDOW.sill),
    inner(WINDOW.x0, WINDOW.x1, WINDOW.top, CEILING_Y),
    inner(WINDOW.x1, DOOR.x0, 0, CEILING_Y),
    inner(DOOR.x0, DOOR.x1, DOOR.top, CEILING_Y),
    inner(DOOR.x1, ROOM.maxX, 0, CEILING_Y),
    // skirting 7.5 mm proud of the walls
    box("green", [ROOM.minX + 0.0075, FLOOR_Y + 0.06, 0], [0.015, 0.12, ROOM.maxZ - ROOM.minZ - 0.1]),
    box("green", [ROOM.maxX - 0.0075, FLOOR_Y + 0.06, 0], [0.015, 0.12, ROOM.maxZ - ROOM.minZ - 0.1]),
    // black track rails under the ceiling
    box("black", [-3.4, CEILING_Y - 0.02, -0.5], [0.06, 0.04, 9]),
    box("black", [-0.95, CEILING_Y - 0.02, -0.5], [0.06, 0.04, 8]),
    box("black", [-0.5, CEILING_Y - 0.02, -4.0], [7, 0.04, 0.06]),
  ];
  for (const track of TRACKS) {
    parts.push({ geo: CAN, mat: "black", position: [track.p[0], CEILING_Y - 0.12, track.p[2]] });
    parts.push({ geo: LENS, mat: "led", position: [track.p[0], CEILING_Y - 0.201, track.p[2]], rotation: [Math.PI / 2, 0, 0], keepUV: true });
  }
  return parts;
};

const RoomShell = () => {
  const parts = useMemo(shellParts, []);
  return <MergedMeshes parts={parts} />;
};

export default RoomShell;
```

- [ ] **Step 4: The door**

Create `src/components/shop3d/world/shopfront/door.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { CylinderGeometry } from "three";
import { useMats } from "../materials/materials-context";
import { useLocale } from "../../../../context/locale.context";
import { DOOR } from "../../../../utils/shop3d/layout";

const OPEN = 1.6; // radians; positive swings the leaf inward (toward −z)
const BAR = new CylinderGeometry(0.018, 0.018, 0.9, 10);
const W = DOOR.leafWidth;
const H = DOOR.leafHeight;

// The shop door, hinged on its left edge. Outside: click → it swings in, then
// onEnter starts the walk-in. Inside: click → onExit. It stays open while you
// walk in or out and closes once you are back outside.
const Door = ({ phase, onEnter, onExit }) => {
  const { t } = useLocale();
  const mats = useMats();
  const leaf = useRef();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const entered = useRef(false);
  useCursor(hovered);

  useEffect(() => {
    if (phase !== "outside") return;
    setOpening(false);
    entered.current = false;
    if (leaf.current) leaf.current.rotation.y = 0;
  }, [phase]);

  useFrame((_state, delta) => {
    if (!leaf.current || !(opening || phase !== "outside")) return;
    leaf.current.rotation.y = Math.min(OPEN, leaf.current.rotation.y + delta * 2.2);
    if (opening && !entered.current && leaf.current.rotation.y >= OPEN - 0.02) {
      entered.current = true;
      onEnter();
    }
  });

  const handleClick = (event) => {
    if (event.delta > 6) return; // that was a drag-to-look, not a click
    event.stopPropagation();
    if (phase === "inside") onExit();
    else if (phase === "outside") setOpening(true);
  };

  const showHint = hovered && (phase === "inside" || (phase === "outside" && !opening));

  return (
    <group
      ref={leaf}
      position={[DOOR.hingeX, 0.15, 5.55]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <mesh material={mats.green} position={[0.05, H / 2, 0]} scale={[0.1, H, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W - 0.05, H / 2, 0]} scale={[0.1, H, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W / 2, 0.08, 0]} scale={[W, 0.16, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W / 2, H - 0.06, 0]} scale={[W, 0.12, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W / 2, 0.32, 0]} scale={[W - 0.2, 0.32, 0.04]}><boxGeometry /></mesh>
      <mesh material={mats.brass} position={[W / 2, 0.49, 0.027]} scale={[W - 0.2, 0.02, 0.006]}><boxGeometry /></mesh>
      <mesh material={mats.shopGlass} position={[W / 2, 1.41, 0.005]} scale={[W - 0.2, H - 0.66, 1]}><planeGeometry /></mesh>
      <mesh material={mats.brass} geometry={BAR} position={[W - 0.2, 1.15, 0.07]} />
      <mesh material={mats.brass} geometry={BAR} position={[W - 0.2, 1.15, -0.07]} />
      {showHint && (
        <Html position={[W / 2, H + 0.2, 0]} center distanceFactor={8}>
          <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
            {phase === "inside" ? t("exitDoor") : t("openDoor")}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Door;
```

- [ ] **Step 5: Swap the envelope into the world**

Replace `src/components/shop3d/world/world.jsx` with:

```jsx
import { useMemo } from "react";
import InteriorScene from "../interior-scene.component";
import Street from "./street/street";
import Shophouses from "./street/shophouses";
import StreetProps from "./street/street-props";
import ShopBuilding from "./shopfront/shop-building";
import Door from "./shopfront/door";
import RoomShell from "./interior/room-shell";
import { useQuality } from "./quality-context";
import { resolveAccessoryPlacements, resolveProductInstances } from "../../../utils/shop3d.utils";
import { ACCESSORY_PLACEMENTS, FIXTURES, PRODUCT_SLOTS } from "../../../utils/shop3d.config";

// Walls and shells swallow pointer events so you cannot hover or click things
// hidden behind them.
const stop = (event) => event.stopPropagation();

// Everything in the 3D world below the atmosphere. Phases: outside → entering →
// inside → exiting → outside.
const World = ({ products, phase, setPhase }) => {
  const quality = useQuality();
  const interiorMounted = quality.interiorAlways || phase !== "outside";
  const bottles = useMemo(() => (products.length ? resolveProductInstances(products, FIXTURES, PRODUCT_SLOTS) : []), [products]);
  const accessories = useMemo(() => resolveAccessoryPlacements(FIXTURES, ACCESSORY_PLACEMENTS), []);
  return (
    <>
      <Street />
      <Shophouses />
      <StreetProps />
      <group onPointerOver={stop} onClick={stop}>
        <ShopBuilding showInteriorCard={!interiorMounted} />
        <RoomShell />
      </group>
      <Door phase={phase} onEnter={() => setPhase("entering")} onExit={() => setPhase("exiting")} />
      {interiorMounted && <InteriorScene bottles={bottles} accessories={accessories} />}
    </>
  );
};

export default World;
```

In `src/components/shop3d/interior-scene.component.jsx` delete the `floor-interior.glb` and `ceiling-spotlight.glb` `GlbModel` lines (the room shell now owns the floor and ceiling; keeping them would z-fight). Delete `src/components/shop3d/exterior-scene.component.jsx` (`git rm`).

- [ ] **Step 6: Verify in the browser**

Reload. Check:
- outside: green shopfront with the gold-bordered sign (logo + "JÄGER THE JÄGER", glowing), orange awning, brass-framed display window showing the interior, cream upper floors with lit/dark windows, wall lanterns;
- the door swings inward, the dolly walks in, the interior has plaster walls, brick back wall, oak floor, dark green ceiling with track cans;
- inside, looking at the front wall: plaster skin with the window and door openings; no light leaks or sunlight on the inner walls;
- exit works and the door closes behind you only once you are outside;
- `?quality=low`: before entering, the window shows the lit interior card; after entering, the real interior;
- flicker sweep along the floor/wall junctions, skirting, threshold, sign, window frame. No console errors.

- [ ] **Step 7: Commit**

```bash
git add -A src/components/shop3d
git commit -m "feat(shop3d): shophouse shopfront, room shell and an inward-swinging door

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Interior fixtures (wall bays, gondolas, counter, back-bar, chiller, tasting bar) and the kept GLBs

**Files:**
- Create: `src/components/shop3d/world/interior/fixtures.jsx`, `kit-glbs.jsx`, `interior.jsx`
- Modify: `src/components/shop3d/world/world.jsx`
- Delete: `src/components/shop3d/interior-scene.component.jsx`, `src/components/shop3d/fixtures.component.jsx`

**Interfaces:**
- Consumes: layout (`WALL_BAYS, WALL_LEVELS, WALL_BAY_TOP, GONDOLAS, GONDOLA_LEVELS, GONDOLA_TOP, COUNTER, BACK_BAR, CHILLER, TASTING_BAR, FLOOR_Y, INTERIOR_COLLIDERS`), `MergedMeshes`, `textTexture`, `useMats`, `GlbModel` (existing), `StaticColliders`.
- Produces: `<Fixtures />`, `<KitGlbs onCheckout onOpenCart />`, `<Interior onCheckout onOpenCart>{children}</Interior>` — children are later the products and the decor.

- [ ] **Step 1: Fixtures**

Create `src/components/shop3d/world/interior/fixtures.jsx`:

```jsx
import { useMemo } from "react";
import { CylinderGeometry, MeshStandardMaterial, BackSide, SphereGeometry } from "three";
import MergedMeshes from "../geometry/merged-meshes";
import { UNIT_BOX, UNIT_PLANE } from "../geometry/merge";
import { textTexture } from "../materials/canvas-textures";
import {
  BACK_BAR, CHILLER, COUNTER, FLOOR_Y, GONDOLA_LEVELS, GONDOLA_TOP, GONDOLAS, TASTING_BAR,
  WALL_BAY_TOP, WALL_BAYS, WALL_LEVELS,
} from "../../../../utils/shop3d/layout";

const PLINTH_TOP = WALL_LEVELS[0]; // 0.18: the plinth top is the bottom "shelf" (cases)
const SHADE = new CylinderGeometry(0.06, 0.22, 0.25, 20, 1, true);
const BULB = new SphereGeometry(0.05, 12, 8);
const ROD = new CylinderGeometry(0.025, 0.025, 1, 10);
const SEAT = new CylinderGeometry(0.18, 0.18, 0.06, 20);
const FOOT = new CylinderGeometry(0.2, 0.2, 0.02, 20);
const box = (mat, position, scale, keepUV = false) => ({ geo: UNIT_BOX, mat, position, scale, keepUV });

// Shelf boards, brass lips and warm LED strips along one face of a shelf unit.
// `P(along, y, depth)` and `S(along, y, depth)` map run coordinates to world xyz.
const shelfFace = (parts, { P, S, lc, len, front, sign, dc, depth, levels }) => {
  for (const y of levels) {
    parts.push(box("darkWood", P(lc, y - 0.015, dc), S(len, 0.03, depth)));
    parts.push(box("brass", P(lc, y + 0.004, front + sign * 0.006), S(len, 0.035, 0.012)));
    parts.push(box("led", P(lc, y - 0.034, front - sign * 0.04), S(len - 0.1, 0.008, 0.02)));
  }
};
const cases = (parts, { P, S, l0, len, y, front, sign }) => {
  const n = Math.floor((len - 0.1) / 0.38);
  for (let i = 0; i < n; i++) parts.push(box("cardboard", P(l0 + 0.24 + i * 0.38, y + 0.131, front - sign * 0.17), S(0.34, 0.26, 0.3), true));
};

const wallBayParts = (bay) => {
  const alongX = bay.facing[1] !== 0; // a bay facing ±z runs along x
  const [l0, l1] = alongX ? [bay.x0, bay.x1] : [bay.z0, bay.z1];
  const [d0, d1] = alongX ? [bay.z0, bay.z1] : [bay.x0, bay.x1];
  const sign = (alongX ? bay.facing[1] : bay.facing[0]) > 0 ? 1 : -1;
  const back = sign > 0 ? d0 : d1;
  const front = sign > 0 ? d1 : d0;
  const len = l1 - l0;
  const lc = (l0 + l1) / 2;
  const depth = d1 - d0;
  const dc = (d0 + d1) / 2;
  const P = (l, y, d) => (alongX ? [l, y, d] : [d, y, l]);
  const S = (sl, sy, sd) => (alongX ? [sl, sy, sd] : [sd, sy, sl]);
  const parts = [
    box("green", P(lc, (FLOOR_Y + PLINTH_TOP) / 2, dc), S(len, PLINTH_TOP - FLOOR_Y, depth)),
    box("darkWood", P(lc, (PLINTH_TOP + WALL_BAY_TOP) / 2, back + sign * 0.012), S(len, WALL_BAY_TOP - PLINTH_TOP, 0.02)),
    box("green", P(lc, WALL_BAY_TOP + 0.125, dc + sign * 0.025), S(len, 0.25, depth + 0.05)),
    box("brass", P(lc, WALL_BAY_TOP + 0.06, front + sign * 0.056), S(len, 0.04, 0.012)),
  ];
  const uprights = Math.max(1, Math.round(len / 1.2));
  for (let i = 0; i <= uprights; i++) {
    const at = Math.min(l1 - 0.02, Math.max(l0 + 0.02, l0 + (i * len) / uprights));
    parts.push(box("darkWood", P(at, (PLINTH_TOP + WALL_BAY_TOP) / 2, dc), S(0.04, WALL_BAY_TOP - PLINTH_TOP, depth)));
  }
  shelfFace(parts, { P, S, lc, len, front, sign, dc, depth, levels: WALL_LEVELS.slice(1) });
  cases(parts, { P, S, l0, len, y: PLINTH_TOP, front, sign });
  return parts;
};

const gondolaParts = (g) => {
  const zc = (g.z0 + g.z1) / 2;
  const len = g.z1 - g.z0;
  const half = g.width / 2;
  const parts = [
    box("green", [g.x, (FLOOR_Y + PLINTH_TOP) / 2, zc], [g.width, PLINTH_TOP - FLOOR_Y, len]),
    box("darkWood", [g.x, (PLINTH_TOP + GONDOLA_TOP) / 2, zc], [0.04, GONDOLA_TOP - PLINTH_TOP, len]),
    box("green", [g.x, GONDOLA_TOP + 0.03, zc], [g.width + 0.04, 0.06, len + 0.04]),
    box("brass", [g.x - half - 0.026, GONDOLA_TOP + 0.03, zc], [0.012, 0.04, len + 0.04]),
    box("brass", [g.x + half + 0.026, GONDOLA_TOP + 0.03, zc], [0.012, 0.04, len + 0.04]),
    box("green", [g.x, (FLOOR_Y + GONDOLA_TOP) / 2, g.z0 - 0.02], [g.width + 0.04, GONDOLA_TOP - FLOOR_Y, 0.04]),
    box("green", [g.x, (FLOOR_Y + GONDOLA_TOP) / 2, g.z1 + 0.02], [g.width + 0.04, GONDOLA_TOP - FLOOR_Y, 0.04]),
  ];
  for (const sign of [1, -1]) {
    // each side is a half-depth shelf face; P/S map (along z, y, across x)
    const P = (l, y, d) => [d, y, l];
    const S = (sl, sy, sd) => [sd, sy, sl];
    const front = g.x + sign * half;
    const dc = g.x + sign * (half / 2 + 0.01);
    shelfFace(parts, { P, S, lc: zc, len, front, sign, dc, depth: half - 0.03, levels: GONDOLA_LEVELS.slice(1) });
    cases(parts, { P, S, l0: g.z0, len, y: PLINTH_TOP, front, sign });
  }
  return parts;
};

const counterParts = () => {
  const cx = (COUNTER.x0 + COUNTER.x1) / 2;
  const cz = (COUNTER.z0 + COUNTER.z1) / 2;
  const len = COUNTER.z1 - COUNTER.z0;
  const parts = [
    box("green", [cx, (FLOOR_Y + COUNTER.top - 0.05) / 2, cz], [COUNTER.x1 - COUNTER.x0, COUNTER.top - 0.05 - FLOOR_Y, len]),
    box("darkWood", [cx - 0.02, COUNTER.top - 0.025, cz], [COUNTER.x1 - COUNTER.x0 + 0.14, 0.05, len + 0.14]),
    box("brass", [COUNTER.x0 - 0.096, COUNTER.top - 0.025, cz], [0.012, 0.05, len + 0.14]),
    box("black", [COUNTER.x0 - 0.01, FLOOR_Y + 0.05, cz], [0.02, 0.1, len]),
  ];
  for (const z of [COUNTER.z0 + 0.45, cz, COUNTER.z1 - 0.45]) parts.push(box("brass", [COUNTER.x0 - 0.006, 0.6, z], [0.012, 0.8, 0.04]));
  // three green pendant lamps above the counter
  for (const z of [COUNTER.z0 + 0.6, cz, COUNTER.z1 - 0.6]) {
    parts.push({ geo: SHADE, mat: "green", position: [cx, 2.62, z] });
    parts.push({ geo: SHADE, mat: "shadeInner", position: [cx, 2.62, z] });
    parts.push({ geo: BULB, mat: "led", position: [cx, 2.53, z] });
    parts.push(box("black", [cx, (2.745 + 3.66) / 2, z], [0.008, 3.66 - 2.745, 0.008]));
  }
  return parts;
};

const backBarParts = () => {
  const { x0, x1, z0, z1, levels, top } = BACK_BAR;
  const zc = (z0 + z1) / 2;
  const len = z1 - z0;
  const depth = x1 - x0;
  const xc = (x0 + x1) / 2;
  const P = (l, y, d) => [d, y, l];
  const S = (sl, sy, sd) => [sd, sy, sl];
  const parts = [
    box("green", [xc, (FLOOR_Y + levels[0]) / 2, zc], [depth, levels[0] - FLOOR_Y, len]),
    box("darkWood", [x1 - 0.012, (levels[0] + top) / 2, zc], [0.02, top - levels[0], len]),
    box("green", [xc - 0.025, top + 0.125, zc], [depth + 0.05, 0.25, len]),
  ];
  for (const z of [z0 + 0.02, zc, z1 - 0.02]) parts.push(box("darkWood", [xc, (levels[0] + top) / 2, z], [depth, top - levels[0], 0.04]));
  shelfFace(parts, { P, S, lc: zc, len, front: x0, sign: -1, dc: xc, depth, levels: levels.slice(1) });
  return parts;
};

const chillerParts = () => {
  const { x0, x1, z0, z1, height, levels } = CHILLER;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  const top = FLOOR_Y + height;
  const parts = [
    box("black", [xc, (FLOOR_Y + 0.36) / 2, zc], [x1 - x0, 0.36 - FLOOR_Y, z1 - z0]),
    box("black", [xc, top - 0.15, zc], [x1 - x0, 0.3, z1 - z0]),
    box("black", [xc, (0.36 + top - 0.3) / 2, z0 + 0.02], [x1 - x0, top - 0.66, 0.04]),
    box("black", [xc, (0.36 + top - 0.3) / 2, z1 - 0.02], [x1 - x0, top - 0.66, 0.04]),
    box("coolLight", [x1 - 0.02, (0.36 + top - 0.3) / 2, zc], [0.02, top - 0.66, z1 - z0 - 0.08]),
    { geo: UNIT_PLANE, mat: "chillerHeader", position: [x0 - 0.003, top - 0.15, zc], rotation: [0, -Math.PI / 2, 0], scale: [z1 - z0 - 0.1, 0.22, 1], keepUV: true },
    { geo: UNIT_BOX, mat: "chillerGlass", position: [x0 - 0.01, (0.36 + top - 0.3) / 2, zc], scale: [0.004, top - 0.66, z1 - z0 - 0.08] },
    box("alu", [x0 - 0.03, 1.2, z1 - 0.12], [0.02, 0.5, 0.03]),
  ];
  for (const y of levels) parts.push(box("alu", [xc + 0.02, y - 0.01, zc], [x1 - x0 - 0.1, 0.02, z1 - z0 - 0.08]));
  return parts;
};

const tastingParts = () => {
  const { x0, x1, z0, z1, top } = TASTING_BAR;
  const xc = (x0 + x1) / 2;
  const zc = (z0 + z1) / 2;
  const parts = [
    box("green", [xc, (FLOOR_Y + top - 0.05) / 2, zc], [x1 - x0, top - 0.05 - FLOOR_Y, z1 - z0]),
    box("darkWood", [xc, top - 0.025, zc + 0.025], [x1 - x0 + 0.1, 0.05, z1 - z0 + 0.1]),
    { geo: ROD, mat: "brass", position: [xc, 0.22, z1 + 0.06], rotation: [0, 0, Math.PI / 2], scale: [1, x1 - x0, 1] },
  ];
  for (const x of [x0 + 0.4, x1 - 0.4]) {
    parts.push({ geo: FOOT, mat: "brass", position: [x, FLOOR_Y + 0.01, z1 + 0.3] });
    parts.push({ geo: ROD, mat: "brass", position: [x, FLOOR_Y + 0.4, z1 + 0.3], scale: [1, 0.76, 1] });
    parts.push({ geo: SEAT, mat: "leather", position: [x, FLOOR_Y + 0.81, z1 + 0.3] });
  }
  return parts;
};

const Fixtures = () => {
  const parts = useMemo(
    () => [
      ...WALL_BAYS.flatMap(wallBayParts),
      ...GONDOLAS.flatMap(gondolaParts),
      ...counterParts(),
      ...backBarParts(),
      ...chillerParts(),
      ...tastingParts(),
    ],
    []
  );
  const extra = useMemo(
    () => ({
      shadeInner: new MeshStandardMaterial({ color: "#d9c8a0", roughness: 0.6, side: BackSide }),
      chillerHeader: new MeshStandardMaterial({
        map: textTexture({ text: "LẠNH • COLD", width: 512, height: 96, bg: "#1e3027", fg: "#f3efe3", font: "700 52px Arial, sans-serif" }),
        roughness: 0.5,
      }),
    }),
    []
  );
  return <MergedMeshes parts={parts} extraMaterials={extra} />;
};

export default Fixtures;
```

Note on the chiller glass: it is a 4 mm box (`chillerGlass` is transparent, so MergedMeshes does not cast its shadow); only its front face is seen from the room (single-sided material, the back face is culled). The header is a plane 3 mm in front of the cabinet, turned to face −x so the text reads left-to-right from the aisle.

- [ ] **Step 2: Kept GLBs, re-materialed and ground-aligned**

Create `src/components/shop3d/world/interior/kit-glbs.jsx`:

```jsx
import { useCallback, useState } from "react";
import { useCursor } from "@react-three/drei";
import { Box3 } from "three";
import GlbModel from "../../glb-model.component";
import { useMats } from "../materials/materials-context";
import { COUNTER, FLOOR_Y, TASTING_BAR } from "../../../../utils/shop3d/layout";

// The old flat-colour kit GLBs reuse the shared PBR set by material name.
const REMAP = { metal_gold: "brass", dark: "black", paint_green: "green", paint_midgreen: "greenMid", accent_orange: "orange", glass_smoked: "smokedGlass" };

const useRematerial = () => {
  const mats = useMats();
  return useCallback(
    (root) => {
      if (root.userData.kitReady) return;
      root.traverse((o) => {
        if (!o.isMesh) return;
        const key = REMAP[o.material?.name];
        if (key) o.material = mats[key];
        o.castShadow = true;
        o.receiveShadow = true;
      });
      // Some kit GLBs are centred, not base-pivoted: drop them onto their surface.
      const box = new Box3().setFromObject(root);
      root.position.y -= box.min.y;
      root.userData.kitReady = true;
    },
    [mats]
  );
};

const Clickable = ({ onSelect, children }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <group
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        if (event.delta > 6) return;
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </group>
  );
};

const KitGlbs = ({ onCheckout, onOpenCart }) => {
  const ready = useRematerial();
  const T = TASTING_BAR.top;
  const z = (TASTING_BAR.z0 + TASTING_BAR.z1) / 2;
  return (
    <group>
      {/* POS terminal — the checkout trigger; screen faces the customer (−x). */}
      <Clickable onSelect={onCheckout}>
        <GlbModel fileName="pos-terminal.glb" position={[3.3, COUNTER.top, 2.75]} rotationY={-Math.PI / 2} onReady={ready} />
      </Clickable>
      <GlbModel fileName="desk-phone.glb" position={[3.5, COUNTER.top, 3.3]} rotationY={1.35} onReady={ready} />
      <GlbModel fileName="gift-box.glb" position={[3.45, COUNTER.top, 1.35]} rotationY={-Math.PI / 2} onReady={ready} />
      {/* A nested stack of shopping baskets by the door opens the cart. */}
      <Clickable onSelect={onOpenCart}>
        {[0, 1, 2].map((i) => (
          <GlbModel key={i} fileName="shopping-basket.glb" position={[1.1, FLOOR_Y + i * 0.09, 4.95]} rotationY={0.2} onReady={ready} />
        ))}
      </Clickable>
      {/* Bar tools on the tasting bar. */}
      <GlbModel fileName="drinking-glass.glb" position={[3.0, T, z]} onReady={ready} />
      <GlbModel fileName="drinking-glass.glb" position={[3.14, T, z + 0.05]} onReady={ready} />
      <GlbModel fileName="jigger.glb" position={[3.4, T, z]} onReady={ready} />
      <GlbModel fileName="pourer.glb" position={[3.62, T, z]} onReady={ready} />
      <GlbModel fileName="shaker.glb" position={[3.88, T, z]} onReady={ready} />
      <GlbModel fileName="flask.glb" position={[4.15, T, z]} rotationY={-0.4} onReady={ready} />
    </group>
  );
};

export default KitGlbs;
```

`GlbModel` calls `onReady` from an effect whose dependencies are `[cloned, onReady]`; `ready` is stable (memoised on `mats`) and guarded by `userData.kitReady`, so the y-shift is applied once.

- [ ] **Step 3: Interior assembly**

Create `src/components/shop3d/world/interior/interior.jsx`:

```jsx
import Fixtures from "./fixtures";
import KitGlbs from "./kit-glbs";
import StaticColliders from "../static-colliders";
import { INTERIOR_COLLIDERS } from "../../../../utils/shop3d/layout";

const stop = (event) => event.stopPropagation();

// The shop floor: shelving (which blocks pointer events, so you cannot click a
// bottle through a gondola), the kept kit GLBs, colliders, and children
// (products and decor, added by later tasks).
const Interior = ({ onCheckout, onOpenCart, children }) => (
  <group>
    <group onPointerOver={stop} onClick={stop}>
      <Fixtures />
    </group>
    <KitGlbs onCheckout={onCheckout} onOpenCart={onOpenCart} />
    <StaticColliders boxes={INTERIOR_COLLIDERS} />
    {children}
  </group>
);

export default Interior;
```

- [ ] **Step 4: Swap the interior into the world**

In `src/components/shop3d/world/world.jsx`:
- remove the imports of `InteriorScene`, `resolveAccessoryPlacements, resolveProductInstances`, `ACCESSORY_PLACEMENTS, FIXTURES, PRODUCT_SLOTS` and the `bottles`/`accessories` memos, and change `import { useMemo } from "react";` to `import { useContext } from "react";`;
- add

```jsx
import { useNavigate } from "react-router-dom";
import Interior from "./interior/interior";
import { CartContext } from "../../../context/cart.context";
import { useLocale } from "../../../context/locale.context";
```

- inside `World`, before `return`:

```jsx
  const { toggleIsCartOpen } = useContext(CartContext);
  const { locale } = useLocale();
  const navigate = useNavigate();
```

- replace `{interiorMounted && <InteriorScene bottles={bottles} accessories={accessories} />}` with

```jsx
      {interiorMounted && (
        <Interior onCheckout={() => navigate(`/${locale}/cartCheckout`)} onOpenCart={toggleIsCartOpen} />
      )}
```

`git rm src/components/shop3d/interior-scene.component.jsx src/components/shop3d/fixtures.component.jsx`. (`product-bottle.component.jsx` is no longer rendered; it is deleted in Task 10.)

- [ ] **Step 5: Verify in the browser**

Inside the shop, check:
- left and back wall bays full height with brass-lipped shelves, warm LED strips under each shelf, crowns with a brass rail, cases on the bottom shelf;
- two gondolas with end caps; aisles are walkable; you collide with every fixture; the arrival pose is clear;
- counter just inside the door on the right with three green pendants, POS (click → checkout route), phone, gift box; back-bar shelving behind it;
- chiller lit cool-white behind glass with the "LẠNH • COLD" header; tasting bar with two stools and bar tools;
- basket stack by the door opens the cart overlay; walking freezes while it is open;
- flicker sweep: shelf lips, LED strips, plinth/floor joints, chiller glass, case boxes. No console errors.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/shop3d
git commit -m "feat(shop3d): heritage bottle-shop fixtures with counter, back-bar, chiller and tasting bar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Real products on the shelves (instanced, clickable, add to cart)

**Files:**
- Create: `src/components/shop3d/world/products/bottle-parts.js`, `bottle-panel.jsx`, `product-shelves.jsx`
- Test: `src/components/shop3d/world/products/bottle-parts.test.js`, `bottle-panel.test.jsx`
- Modify: `src/components/shop3d/world/world.jsx`, `src/pages/shop3d.page.jsx`, `src/utils/shop3d.config.js`
- Delete: `src/components/shop3d/product-bottle.component.jsx`

**Interfaces:**
- Consumes: `buildShelfInstances, groupInstances, BOTTLE_DIMS` (Task 2), `SHELF_RUNS` (Task 1), `useQuality` (Task 5), `getGlbUrl` (existing `shop3d.assets.js`), `getLabelTextureUrl` (existing `shop3d.utils.js`), `CartContext.addItemToCart` (existing).
- Produces:
  - `classifyMaterial(material) → 'slot'|'liquid'|'darkGlass'|'clearGlass'|'label'|'solid'`
  - `prepareBottleMaterial(material, kind, labelTexture?) → Material`
  - `extractBottleParts(scene, labelTexture?) → Array<{ kind, geometry, material }>` (opaque parts first)
  - `hasLabelSlot(scene) → boolean`
  - `<BottlePanel product />` (same markup and behaviour as the old bottle panel)
  - `<ProductShelves products />`

- [ ] **Step 1: Write the failing tests**

Create `src/components/shop3d/world/products/bottle-parts.test.js`:

```js
import { describe, expect, it } from "vitest";
import { BoxGeometry, DoubleSide, FrontSide, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Texture } from "three";
import { classifyMaterial, extractBottleParts, hasLabelSlot } from "./bottle-parts";

const mesh = (material, y = 0) => {
  const m = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), material);
  m.position.y = y;
  return m;
};
const named = (Ctor, name, props = {}) => Object.assign(new Ctor(props), { name });

describe("bottle parts", () => {
  it("classifies the product GLB materials", () => {
    expect(classifyMaterial(named(MeshPhysicalMaterial, "bottle_glass", { transmission: 0.18, opacity: 0.88, transparent: true }))).toBe("darkGlass");
    expect(classifyMaterial(named(MeshPhysicalMaterial, "bottle_glass_clear", { opacity: 0.13, transparent: true }))).toBe("clearGlass");
    expect(classifyMaterial(named(MeshStandardMaterial, "bottle_liquid_amber"))).toBe("liquid");
    expect(classifyMaterial(named(MeshStandardMaterial, "slot_face"))).toBe("slot");
    expect(classifyMaterial(new MeshStandardMaterial({ map: new Texture() }))).toBe("label");
    expect(classifyMaterial(named(MeshStandardMaterial, "cap_green"))).toBe("solid");
  });

  it("drops the liquid behind opaque glass and removes transmission", () => {
    const root = new Group();
    root.add(mesh(named(MeshPhysicalMaterial, "bottle_glass", { transmission: 0.18, opacity: 0.88, transparent: true })));
    root.add(mesh(named(MeshStandardMaterial, "bottle_liquid")));
    root.add(mesh(new MeshStandardMaterial({ map: new Texture(), transparent: true, side: DoubleSide }), 0.12));
    const parts = extractBottleParts(root);
    expect(parts.map((p) => p.kind).sort()).toEqual(["darkGlass", "label"]);
    const glass = parts.find((p) => p.kind === "darkGlass").material;
    expect(glass.transparent).toBe(false);
    expect(glass.transmission).toBe(0);
    const label = parts.find((p) => p.kind === "label");
    expect(label.material.transparent).toBe(false);
    expect(label.material.alphaTest).toBe(0.5);
    expect(label.material.side).toBe(FrontSide);
    label.geometry.computeBoundingBox();
    expect(label.geometry.boundingBox.min.y).toBeCloseTo(0.07); // node transform baked in
  });

  it("keeps the liquid inside clear glass and draws the glass last", () => {
    const root = new Group();
    root.add(mesh(named(MeshPhysicalMaterial, "bottle_glass_clear", { opacity: 0.13, transparent: true })));
    root.add(mesh(named(MeshStandardMaterial, "bottle_liquid_amber", { transparent: true, opacity: 0.62, side: DoubleSide })));
    const parts = extractBottleParts(root);
    expect(parts.map((p) => p.kind)).toEqual(["liquid", "clearGlass"]);
    expect(parts[0].material.transparent).toBe(false);
    expect(parts[1].material.depthWrite).toBe(false);
    expect(parts[1].material.side).toBe(FrontSide);
  });

  it("puts the product label on slot_face meshes", () => {
    const root = new Group();
    root.add(mesh(named(MeshStandardMaterial, "slot_face")));
    expect(hasLabelSlot(root)).toBe(true);
    const label = new Texture();
    expect(extractBottleParts(root, label)[0].material.map).toBe(label);
  });
});
```

Create `src/components/shop3d/world/products/bottle-panel.test.jsx`:

```jsx
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BottlePanel from "./bottle-panel";
import { CartContext } from "../../../../context/cart.context";
import { LocaleProvider } from "../../../../context/locale.context";

const renderPanel = (product, addItemToCart = vi.fn()) => {
  render(
    <BrowserRouter>
      <LocaleProvider>
        <CartContext.Provider value={{ addItemToCart }}>
          <BottlePanel product={product} />
        </CartContext.Provider>
      </LocaleProvider>
    </BrowserRouter>
  );
  return addItemToCart;
};

describe("BottlePanel", () => {
  it("shows name, price and stock and adds one to the cart", () => {
    const product = { _id: "p1", name: "Jagermeister Original 700ml", priceInInteger: 500000, stock: 3 };
    const add = renderPanel(product);
    expect(screen.getByText("Jagermeister Original 700ml")).toBeInTheDocument();
    expect(screen.getByText("500.000₫")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(add).toHaveBeenCalledWith(product, 1);
  });

  it("disables the button when sold out", () => {
    const add = renderPanel({ _id: "p2", name: "Sold", priceInInteger: 1, stock: 0 });
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Hết hàng");
    fireEvent.click(button);
    expect(add).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/shop3d/world/products`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement bottle parts and the panel**

Create `src/components/shop3d/world/products/bottle-parts.js`:

```js
import { FrontSide, MeshPhysicalMaterial } from "three";

// What a product-GLB material is for, so it can be made instancing- and flicker-safe.
export const classifyMaterial = (material) => {
  const name = (material.name || "").toLowerCase();
  if (name === "slot_face") return "slot";
  if (name.includes("liquid")) return "liquid";
  if (name.includes("glass")) return (material.transmission || 0) > 0 || material.opacity >= 0.5 ? "darkGlass" : "clearGlass";
  return material.map ? "label" : "solid";
};

// Dark glass becomes opaque clearcoat glass (no transmission pass: costly and
// it flickers with thousands of instances). Clear glass stays see-through but
// single-sided without depth writes. Labels use alpha testing, not blending.
export const prepareBottleMaterial = (material, kind, labelTexture) => {
  switch (kind) {
    case "darkGlass":
      return new MeshPhysicalMaterial({ name: material.name, color: material.color.clone(), roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
    case "clearGlass":
      return new MeshPhysicalMaterial({ name: material.name, color: material.color.clone(), roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.22, depthWrite: false, side: FrontSide });
    case "liquid": {
      const m = material.clone();
      m.transparent = false;
      m.opacity = 1;
      m.side = FrontSide;
      return m;
    }
    case "label": {
      const m = material.clone();
      if (m.transparent) {
        m.transparent = false;
        m.alphaTest = 0.5;
      }
      m.side = FrontSide;
      return m;
    }
    case "slot": {
      const m = material.clone();
      if (labelTexture) m.map = labelTexture;
      return m;
    }
    default:
      return material.clone();
  }
};

export const hasLabelSlot = (scene) => {
  let found = false;
  scene.traverse((o) => {
    if (o.isMesh && o.material?.name === "slot_face") found = true;
  });
  return found;
};

// Flattens a loaded bottle GLB into instanceable parts: each mesh's geometry with
// its node transform baked in, plus a fixed-up material. Liquid behind opaque
// glass is dropped (never visible). Opaque parts come first, transparent last.
export const extractBottleParts = (scene, labelTexture) => {
  scene.updateMatrixWorld(true);
  const meshes = [];
  scene.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  const kinds = meshes.map((m) => classifyMaterial(m.material));
  const opaqueGlass = kinds.includes("darkGlass");
  const parts = [];
  meshes.forEach((m, i) => {
    if (kinds[i] === "liquid" && opaqueGlass) return;
    parts.push({ kind: kinds[i], geometry: m.geometry.clone().applyMatrix4(m.matrixWorld), material: prepareBottleMaterial(m.material, kinds[i], labelTexture) });
  });
  return parts.sort((a, b) => Number(a.material.transparent) - Number(b.material.transparent));
};
```

Create `src/components/shop3d/world/products/bottle-panel.jsx` (the markup is moved unchanged from `product-bottle.component.jsx`):

```jsx
import { useContext } from "react";
import { CartContext } from "../../../../context/cart.context";
import { useLocale } from "../../../../context/locale.context";

const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

const BottlePanel = ({ product }) => {
  const { addItemToCart } = useContext(CartContext);
  const { t } = useLocale();
  const outOfStock = (product.stock || 0) <= 0;
  return (
    <div className="w-44 -translate-x-1/2 -translate-y-[calc(100%+0.25rem)] rounded border border-warmGold/50 bg-cream p-3 text-center text-ink shadow-xl">
      <p className="font-heading text-sm font-bold leading-tight">{product.name}</p>
      <p className="mt-1 text-sm text-mainOrange">{formatPrice(product.priceInInteger)}₫</p>
      <p className="text-[11px] text-ink/60">{t("stock")}: {product.stock}</p>
      <button
        className="brand-button mt-2 w-full text-xs disabled:opacity-40"
        disabled={outOfStock}
        onClick={(event) => {
          event.stopPropagation();
          addItemToCart(product, 1);
        }}
      >
        {outOfStock ? t("soldOut") : t("addToCart")}
      </button>
    </div>
  );
};

export default BottlePanel;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/shop3d/world/products`
Expected: PASS (6 tests). If `500.000₫` does not match, print `screen.debug()` — jsdom's `Intl` must format `vi-VN` with dots; if it uses a different separator, compare against `new Intl.NumberFormat("vi-VN").format(500000) + "₫"` instead of the literal.

- [ ] **Step 5: Instanced shelves**

Create `src/components/shop3d/world/products/product-shelves.jsx`:

```jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Html, useCursor, useGLTF } from "@react-three/drei";
import { BoxGeometry, Matrix4, MeshBasicMaterial, Quaternion, TextureLoader, Vector3 } from "three";
import BottlePanel from "./bottle-panel";
import { extractBottleParts, hasLabelSlot } from "./bottle-parts";
import { useQuality } from "../quality-context";
import { getGlbUrl } from "../../../../utils/shop3d.assets";
import { getLabelTextureUrl } from "../../../../utils/shop3d.utils";
import { BOTTLE_DIMS, buildShelfInstances, groupInstances } from "../../../../utils/shop3d/product-blocks";
import { SHELF_RUNS } from "../../../../utils/shop3d/layout";

const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);
const HOVER = new Matrix4().makeScale(1.05, 1.05, 1.05);
const PICK = new MeshBasicMaterial({ colorWrite: false, depthWrite: false }); // invisible, but raycastable
const NO_RAYCAST = () => null;
const scratch = new Matrix4();

const useLabelTexture = (product, enabled) => {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const loaded = new TextureLoader().load(getLabelTextureUrl(product));
    loaded.flipY = false;
    setTexture(loaded);
    return () => loaded.dispose();
  }, [product, enabled]);
  return texture;
};

// All bottles of one product: one InstancedMesh per GLB mesh (drawn, never
// raycast) plus one invisible box InstancedMesh used for hover and click.
const ProductGroup = ({ group, onSelect }) => {
  const { scene } = useGLTF(getGlbUrl(group.model));
  const slot = useMemo(() => hasLabelSlot(scene), [scene]);
  const label = useLabelTexture(group.product, slot);
  const parts = useMemo(() => extractBottleParts(scene, label), [scene, label]);
  useEffect(
    () => () =>
      parts.forEach((p) => {
        p.geometry.dispose();
        p.material.dispose();
      }),
    [parts]
  );
  const dims = BOTTLE_DIMS[group.model];
  const pickGeometry = useMemo(() => new BoxGeometry(dims.w, dims.h, dims.d).translate(0, dims.h / 2, 0), [dims]);
  const base = useMemo(
    () => group.instances.map((i) => new Matrix4().compose(new Vector3(...i.position), new Quaternion().setFromAxisAngle(UP, i.rotationY), ONE)),
    [group.instances]
  );
  const meshes = useRef([]);
  const pick = useRef();
  const hovered = useRef(-1);
  const [hot, setHot] = useState(false);
  useCursor(hot);

  const all = () => [...meshes.current, pick.current].filter(Boolean);
  const write = (index, matrix) => {
    for (const m of all()) {
      m.setMatrixAt(index, matrix);
      m.instanceMatrix.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    for (const m of all()) {
      base.forEach((matrix, i) => m.setMatrixAt(i, matrix));
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
    hovered.current = -1;
  }, [base, parts]); // eslint-disable-line react-hooks/exhaustive-deps

  const hover = (index) => {
    if (hovered.current === index) return;
    if (hovered.current >= 0) write(hovered.current, base[hovered.current]);
    hovered.current = index;
    if (index >= 0) write(index, scratch.copy(base[index]).multiply(HOVER));
    setHot(index >= 0);
  };

  return (
    <group>
      {parts.map((p, k) => (
        <instancedMesh
          key={`${group.key}:${k}:${p.material.uuid}`}
          ref={(el) => {
            meshes.current[k] = el;
          }}
          args={[p.geometry, p.material, base.length]}
          raycast={NO_RAYCAST}
          receiveShadow
        />
      ))}
      <instancedMesh
        ref={pick}
        args={[pickGeometry, PICK, base.length]}
        onPointerMove={(event) => {
          event.stopPropagation();
          hover(event.instanceId);
        }}
        onPointerOut={() => hover(-1)}
        onClick={(event) => {
          if (event.delta > 6) return; // a drag-to-look, not a click
          event.stopPropagation();
          onSelect(group.instances[event.instanceId]);
        }}
      />
    </group>
  );
};

// Every real product, repeated in blocks across the shelves. One panel at a time.
const ProductShelves = ({ products }) => {
  const quality = useQuality();
  const groups = useMemo(
    () => groupInstances(buildShelfInstances({ products, runs: SHELF_RUNS, maxDepth: quality.maxDepth, maxInstances: quality.maxInstances })),
    [products, quality]
  );
  const [selected, setSelected] = useState(null);
  useEffect(() => setSelected(null), [groups]);
  return (
    <group onPointerMissed={() => setSelected(null)}>
      {groups.map((group) => (
        <ProductGroup key={group.key} group={group} onSelect={setSelected} />
      ))}
      {selected && (
        <Html position={[selected.position[0], selected.position[1] + selected.height + 0.1, selected.position[2]]} zIndexRange={[100, 0]}>
          <BottlePanel product={selected.product} />
        </Html>
      )}
    </group>
  );
};

export default ProductShelves;
```

- [ ] **Step 5b: Wire it up and clean the old path**

In `src/components/shop3d/world/world.jsx` add `import ProductShelves from "./products/product-shelves";` and render it inside the interior:

```jsx
      {interiorMounted && (
        <Interior onCheckout={() => navigate(`/${locale}/cartCheckout`)} onOpenCart={toggleIsCartOpen}>
          <ProductShelves products={products} />
        </Interior>
      )}
```

In `src/pages/shop3d.page.jsx` replace the `SCENE_GLBS` array with the kit GLBs only, and preload product models once products arrive:

```js
import { BOTTLE_DIMS } from "../utils/shop3d/product-blocks";

const SCENE_GLBS = [
  "pos-terminal.glb", "desk-phone.glb", "shopping-basket.glb", "gift-box.glb",
  "drinking-glass.glb", "jigger.glb", "pourer.glb", "shaker.glb", "flask.glb",
];
```

and inside `fetchProducts`, right after `setProducts(response.data);`:

```js
        new Set(response.data.map((p) => (p.shop3dModel || "").trim().toLowerCase()))
          .forEach((model) => BOTTLE_DIMS[model] && preloadGlb(model));
```

In `src/utils/shop3d.config.js` delete `FIXTURES`, `PRODUCT_SLOTS`, `ACCESSORY_PLACEMENTS` and `LOGO_SLOTS` (and their comments); keep `SLOT_MATERIAL_NAME`. Then run `grep -rn "FIXTURES\|PRODUCT_SLOTS\|ACCESSORY_PLACEMENTS\|LOGO_SLOTS\|product-bottle" src` — it must print nothing outside tests that define their own fixtures. `git rm src/components/shop3d/product-bottle.component.jsx`.

- [ ] **Step 6: Verify in the browser (with real products)**

Run the dev server against an API that has products (local backend, or `VITE_BASE_API_URL=https://jagerthejagershopv3-0-be-9as3.onrender.com npm run dev` — read-only). Inside the shop:
- every wall bay, gondola face, the back-bar, chiller (minis), counter tray (minis) and promo barrel is stocked in product blocks; the two 700 ml products both appear; 1000 ml bottles only on shelves where they fit;
- hover grows the bottle 5 % and shows a pointer; a click opens the panel above that bottle (name, price, stock, Add to cart); a drag does not open it; clicking empty space closes it;
- Add to cart → toast → HUD count grows → cart overlay lists it; POS → checkout route;
- you cannot hover a bottle through a gondola or a wall bay;
- `?quality=low`: fewer bottles (eye level first), 1 deep;
- open DevTools console: no warnings other than the expected `[shop3d] No bottle model for:` when a product has no model.
Run `npx vitest run` — all pass.

- [ ] **Step 7: Commit**

```bash
git add -A src/components/shop3d src/pages/shop3d.page.jsx src/utils/shop3d.config.js
git commit -m "feat(shop3d): stock every shelf with instanced, clickable real products

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Interior decor

**Files:**
- Modify: `src/utils/shop3d/layout.js` (add `DECOR` + its colliders), `src/utils/shop3d/layout.test.js`
- Create: `src/components/shop3d/world/interior/decor.jsx`
- Modify: `src/components/shop3d/world/world.jsx`

**Interfaces:**
- Produces: `DECOR` in layout; `<Decor />`.

- [ ] **Step 1: Add decor positions and colliders to the layout (test first)**

In `src/utils/shop3d/layout.test.js` add:

```js
import { DECOR } from "./layout";

it("keeps floor-standing decor clear of fixtures and the doorway", () => {
  const free = [DECOR.chalkboardInside, ...DECOR.plants];
  for (const d of free) {
    expect(d.x - (d.r ?? 0.35)).toBeGreaterThan(ROOM.minX);
    expect(d.x + (d.r ?? 0.35)).toBeLessThan(ROOM.maxX);
  }
});
```

(the existing "never lets two interior fixtures overlap" and "doorway corridor" tests cover the new colliders once they are in `INTERIOR_COLLIDERS`). Run it — FAIL (`DECOR` undefined).

In `src/utils/shop3d/layout.js`, after `CRATES`, add:

```js
export const DECOR = {
  antler: [-1.0, 3.3, ROOM.minZ],
  neon: [3.55, 2.95, ROOM.minZ],
  posters: [
    { position: [-0.1, 1.75, ROOM.maxZ], rotY: Math.PI, variant: 0 },
    { position: [0.8, 1.75, ROOM.maxZ], rotY: Math.PI, variant: 1 },
    { position: [ROOM.maxX, 1.75, 0.1], rotY: -Math.PI / 2, variant: 2 },
  ],
  chalkboardInside: { x: 0.55, z: 4.65, rotY: -0.35, r: 0.35 },
  plants: [
    { x: 4.35, z: -0.85, s: 1, r: 0.3 },
    { x: 2.55, z: -5.25, s: 0.85, r: 0.22 },
  ],
  mat: [2.3, 4.95],
  fan: [0.3, 2.2],
  clock: [2.3, 3.05, ROOM.maxZ],
};
```

and append to `INTERIOR_COLLIDERS`:

```js
  box(DECOR.chalkboardInside.x - DECOR.chalkboardInside.r, DECOR.chalkboardInside.z - DECOR.chalkboardInside.r, DECOR.chalkboardInside.x + DECOR.chalkboardInside.r, DECOR.chalkboardInside.z + DECOR.chalkboardInside.r),
  ...DECOR.plants.map((p) => box(p.x - p.r, p.z - p.r, p.x + p.r, p.z + p.r)),
```

(`DECOR` must be declared before `INTERIOR_COLLIDERS`.) Run `npx vitest run src/utils/shop3d/layout.test.js` — PASS.

- [ ] **Step 2: Decor component**

Create `src/components/shop3d/world/interior/decor.jsx`:

```jsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3, CylinderGeometry, IcosahedronGeometry, LatheGeometry, Matrix4, MeshStandardMaterial,
  Quaternion, TorusGeometry, TubeGeometry, Vector2, Vector3, CircleGeometry,
} from "three";
import MergedMeshes from "../geometry/merged-meshes";
import { partMatrix, UNIT_BOX, UNIT_PLANE } from "../geometry/merge";
import { posterTexture, textTexture } from "../materials/canvas-textures";
import { useMats } from "../materials/materials-context";
import { CEILING_Y, CRATES, DECOR, FLOOR_Y, PROMO_BARREL } from "../../../../utils/shop3d/layout";

const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);
const framed = (position, rotY = 0) => new Matrix4().compose(new Vector3(...position), new Quaternion().setFromAxisAngle(UP, rotY), ONE);
const local = (base, geo, mat, position, scale = [1, 1, 1], rotation = [0, 0, 0], keepUV = false) => ({
  geo, mat, keepUV, matrix: base.clone().multiply(partMatrix({ position, rotation, scale })),
});

// Barrel: lathe with a bulge, two dark hoops.
const BARREL = new LatheGeometry(
  Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    return new Vector2(PROMO_BARREL.radius - 0.05 + 0.05 * Math.sin(Math.PI * t), t * PROMO_BARREL.height);
  }),
  28
);
const HOOP = new TorusGeometry(PROMO_BARREL.radius - 0.005, 0.012, 6, 32);
const LID = new CircleGeometry(PROMO_BARREL.radius - 0.05, 28);
const POT = new CylinderGeometry(0.2, 0.15, 0.36, 18);
const LEAF = new IcosahedronGeometry(1, 1);
const ANTLER_TINE = (points) => new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p))), 12, 0.022, 6);
const ANTLERS = [
  ANTLER_TINE([[0.06, 0.05, 0.05], [0.2, 0.2, 0.1], [0.3, 0.42, 0.12], [0.28, 0.62, 0.1]]),
  ANTLER_TINE([[0.2, 0.2, 0.1], [0.36, 0.26, 0.12]]),
  ANTLER_TINE([[0.27, 0.36, 0.12], [0.42, 0.46, 0.1]]),
  ANTLER_TINE([[-0.06, 0.05, 0.05], [-0.2, 0.2, 0.1], [-0.3, 0.42, 0.12], [-0.28, 0.62, 0.1]]),
  ANTLER_TINE([[-0.2, 0.2, 0.1], [-0.36, 0.26, 0.12]]),
  ANTLER_TINE([[-0.27, 0.36, 0.12], [-0.42, 0.46, 0.1]]),
];

const decorParts = () => {
  const parts = [];
  // stag antlers on a dark-wood shield with a brass plaque (back wall, above the bay crown)
  const antler = framed([DECOR.antler[0], DECOR.antler[1], DECOR.antler[2] + 0.001]);
  parts.push(local(antler, UNIT_BOX, "darkWood", [0, 0, 0.025], [0.42, 0.5, 0.05]));
  parts.push(local(antler, UNIT_BOX, "brass", [0, -0.16, 0.053], [0.2, 0.06, 0.006]));
  ANTLERS.forEach((geo) => parts.push(local(antler, geo, "bone", [0, 0, 0])));

  // posters: dark-wood frame with the print 2 mm in front
  DECOR.posters.forEach((p, i) => {
    const base = framed(p.position, p.rotY);
    parts.push(local(base, UNIT_BOX, "darkWood", [0, 0, 0.016], [0.6, 0.8, 0.03]));
    parts.push(local(base, UNIT_PLANE, `poster${i}`, [0, 0, 0.033], [0.52, 0.72, 1], [0, 0, 0], true));
  });

  // chalkboard A-frame inside, by the window
  const cb = DECOR.chalkboardInside;
  const board = framed([cb.x, FLOOR_Y, cb.z], cb.rotY);
  parts.push(local(board, UNIT_BOX, "darkWood", [0, 0.5, 0.1], [0.66, 1.0, 0.03], [-0.2, 0, 0]));
  parts.push(local(board, UNIT_BOX, "darkWood", [0, 0.5, -0.1], [0.66, 1.0, 0.03], [0.2, 0, 0]));
  parts.push(local(board, UNIT_PLANE, "chalkInside", [0, 0.505, 0.118], [0.56, 0.86, 1], [-0.2, 0, 0], true));

  // promo barrel and crates by the display window
  const barrel = framed([PROMO_BARREL.x, FLOOR_Y, PROMO_BARREL.z]);
  parts.push(local(barrel, BARREL, "oak", [0, 0, 0]));
  parts.push(local(barrel, HOOP, "black", [0, 0.18, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
  parts.push(local(barrel, HOOP, "black", [0, PROMO_BARREL.height - 0.18, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
  parts.push(local(barrel, LID, "darkWood", [0, PROMO_BARREL.height - 0.002, 0], [1, 1, 1], [-Math.PI / 2, 0, 0]));
  const crates = framed([CRATES.x, FLOOR_Y, CRATES.z], 0.08);
  parts.push(local(crates, UNIT_BOX, "oak", [0, 0.2, 0], [CRATES.w, 0.4, CRATES.d]));
  parts.push(local(crates, UNIT_BOX, "oak", [0.03, 0.601, 0], [CRATES.w - 0.06, 0.4, CRATES.d - 0.04], [0, 0.12, 0]));
  parts.push(local(crates, UNIT_PLANE, "crateStamp", [0, 0.2, CRATES.d / 2 + 0.002], [0.44, 0.22, 1], [0, 0, 0], true));

  // plants in pots
  DECOR.plants.forEach((p, i) => {
    const base = framed([p.x, FLOOR_Y, p.z], i * 1.3);
    parts.push(local(base, POT, "black", [0, 0.18 * p.s, 0], [p.s, p.s, p.s]));
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      parts.push(local(base, LEAF, "leaf", [Math.cos(a) * 0.22 * p.s, (0.55 + (k % 3) * 0.22) * p.s, Math.sin(a) * 0.22 * p.s], [0.28 * p.s, 0.08 * p.s, 0.2 * p.s], [0.4 * Math.sin(a), a, 0.3]));
    }
  });

  // entrance mat (its underside rests on the floor; top 12 mm up)
  parts.push({ geo: UNIT_BOX, mat: "doormat", position: [DECOR.mat[0], FLOOR_Y + 0.006, DECOR.mat[1]], scale: [1.2, 0.012, 0.7], keepUV: true });
  return parts;
};

// Slow ceiling fan (its own meshes so the blades can spin).
const CeilingFan = () => {
  const mats = useMats();
  const blades = useRef();
  useFrame((_s, delta) => {
    if (blades.current) blades.current.rotation.y += delta * 1.4;
  });
  const [x, z] = DECOR.fan;
  return (
    <group position={[x, CEILING_Y, z]}>
      <mesh material={mats.black} position={[0, -0.2, 0]} scale={[0.02, 0.4, 0.02]}><boxGeometry /></mesh>
      <mesh material={mats.black} position={[0, -0.45, 0]}><cylinderGeometry args={[0.12, 0.14, 0.12, 18]} /></mesh>
      <group ref={blades} position={[0, -0.48, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={mats.darkWood} rotation={[0, (i * Math.PI) / 2, 0]} position={[Math.cos((i * Math.PI) / 2) * 0.42, 0, -Math.sin((i * Math.PI) / 2) * 0.42]} scale={[0.6, 0.012, 0.13]}>
            <boxGeometry />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Wall clock above the door, showing real Saigon time.
const WallClock = () => {
  const mats = useMats();
  const hour = useRef();
  const minute = useRef();
  useFrame(() => {
    const now = new Date(Date.now() + 7 * 3600000);
    const m = now.getUTCMinutes() + now.getUTCSeconds() / 60;
    const h = (now.getUTCHours() % 12) + m / 60;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });
  return (
    <group position={[DECOR.clock[0], DECOR.clock[1], DECOR.clock[2] - 0.001]} rotation={[0, Math.PI, 0]}>
      <mesh material={mats.cream} position={[0, 0, 0.02]}><cylinderGeometry args={[0.2, 0.2, 0.04, 32]} /></mesh>
      <mesh material={mats.brass} position={[0, 0, 0.02]}><torusGeometry args={[0.2, 0.015, 8, 40]} /></mesh>
      <group ref={hour} position={[0, 0, 0.042]}>
        <mesh material={mats.black} position={[0, 0.05, 0]} scale={[0.014, 0.1, 0.004]}><boxGeometry /></mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.047]}>
        <mesh material={mats.black} position={[0, 0.075, 0]} scale={[0.01, 0.15, 0.004]}><boxGeometry /></mesh>
      </group>
    </group>
  );
};

// Neon "Jäger the Jäger" on the bare brick; glows (bloom) and casts no shadow.
const Neon = () => {
  const material = useMemo(() => {
    const map = textTexture({ text: "Jäger the Jäger", width: 1024, height: 256, bg: "rgba(0,0,0,0)", fg: "#ff8a3d", font: "italic 700 150px Georgia, serif" });
    return new MeshStandardMaterial({ color: "#000000", map, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 3.2, transparent: true, depthWrite: false });
  }, []);
  return (
    <mesh material={material} position={[DECOR.neon[0], DECOR.neon[1], DECOR.neon[2] + 0.012]} scale={[2.1, 0.52, 1]}>
      <planeGeometry />
    </mesh>
  );
};

const Decor = () => {
  const parts = useMemo(decorParts, []);
  const extra = useMemo(() => {
    const m = {
      bone: new MeshStandardMaterial({ color: "#e9dcc2", roughness: 0.55 }),
      chalkInside: new MeshStandardMaterial({
        map: textTexture({ text: "GỢI Ý HÔM NAY\nJÄGERMEISTER 700ml\nƯỚP LẠNH -18°C", width: 256, height: 400, bg: "#1c1f1d", fg: "#f3efe3", font: "700 22px 'Segoe Print', 'Comic Sans MS', cursive" }),
        roughness: 0.9,
      }),
      crateStamp: new MeshStandardMaterial({ map: textTexture({ text: "JÄGERMEISTER\nWOLFENBÜTTEL", width: 256, height: 128, bg: "#a77b4a", fg: "#2a1a10", font: "700 26px Georgia, serif" }), roughness: 0.9 }),
      doormat: new MeshStandardMaterial({ map: textTexture({ text: "CHÀO MỪNG", width: 512, height: 300, bg: "#1e3027", fg: "#b8922e", font: "700 70px Georgia, serif", border: "#b8922e" }), roughness: 0.95 }),
    };
    DECOR.posters.forEach((p, i) => (m[`poster${i}`] = new MeshStandardMaterial({ map: posterTexture(p.variant), roughness: 0.8 })));
    return m;
  }, []);
  return (
    <>
      <MergedMeshes parts={parts} extraMaterials={extra} />
      <CeilingFan />
      <WallClock />
      <Neon />
    </>
  );
};

export default Decor;
```

`textTexture` with `bg: "rgba(0,0,0,0)"` leaves the canvas transparent where there is no text; the neon plane is the only transparent surface on that wall.

- [ ] **Step 3: Mount it**

In `src/components/shop3d/world/world.jsx` add `import Decor from "./interior/decor";` and render `<Decor />` next to `<ProductShelves products={products} />` inside `<Interior>`.

- [ ] **Step 4: Verify in the browser**

Check each decor piece is where the layout says, faces the room, and nothing clips or z-fights: antler shield above the back bay, glowing neon on the brick (blooms on high tier), posters on the front wall between window and door and on the right wall, chalkboard inside the window, barrel with hoops and the promo bottles on its lid, crate stack with stamp, two potted plants, doormat at the door, the fan turning slowly, the clock showing Saigon time. You collide with the chalkboard and plants; the doorway stays clear.

- [ ] **Step 5: Commit**

```bash
git add src/utils/shop3d/layout.js src/utils/shop3d/layout.test.js src/components/shop3d/world
git commit -m "feat(shop3d): stag mount, neon, posters, chalkboards, barrel, plants, fan and clock

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: People (cashier, stocker, neighbour, passers-by)

**Files:**
- Create: `scripts/build-people-glb.mjs` (adapted copy of `D:\ReactJS\Facebook_post_management\client\scripts\workshop\build-worker-glb.mjs`)
- Create: `src/assets/people/worker.glb`, `src/assets/people/worker-female.glb`, `src/assets/people/LICENSE.txt`
- Create: `src/components/shop3d/world/people/people-assets.js`, `person.jsx`, `people.jsx`
- Modify: `src/components/shop3d/world/world.jsx`, `src/pages/shop3d.page.jsx`

**Interfaces:**
- Consumes: `PEOPLE, FLOOR_Y, SIDEWALK_Y` (Task 1), `createWalker, stepWalker` (Task 4), `useQuality` (Task 5).
- Produces: `PEOPLE_URLS = { male, female }`, `OUTFITS`, `<Person ref body hair outfit position yaw />` with ref API `{ root, play(name, { once, fade, timeScale }), isPlaying(name) }`, `<People phase />`.

- [ ] **Step 1: Copy the male character**

```bash
mkdir -p src/assets/people
cp "D:/ReactJS/Facebook_post_management/client/src/workshop/assets/worker.glb" src/assets/people/worker.glb
cp "D:/ReactJS/Facebook_post_management/client/src/workshop/assets/LICENSE.txt" src/assets/people/LICENSE.txt
```

Append to `src/assets/people/LICENSE.txt` a line: `worker-female.glb: built the same way from Superhero_Female_FullBody (Universal Base Characters, Quaternius, CC0) with the same Universal Animation Library clips.`

- [ ] **Step 2: Build script for the female character**

Copy `D:\ReactJS\Facebook_post_management\client\scripts\workshop\build-worker-glb.mjs` to `scripts/build-people-glb.mjs` and make exactly these edits:

1. Replace the `parseArgs` line with:

```js
const { values: args } = parseArgs({ options: { body: { type: 'string', default: 'male' }, ubc: { type: 'string' }, ual: { type: 'string' }, out: { type: 'string' } } });
if (!args.ubc || !args.ual || !args.out) throw new Error('usage: --body male|female --ubc <pack dir> --ual <UAL1_Standard.glb> --out <file.glb>');

// What differs between the two UBC bodies: file, mesh and material names, and which hair meshes to rig.
const BODIES = {
  male: {
    file: 'Superhero_Male_FullBody.gltf', body: 'Sphere.005_Retopology.004', eyes: 'Face.001', brows: 'Face',
    skinMat: 'MI_Superhero_Male', hairMat: 'MI_Hair_1', browsRef: 'Eyebrows_Regular',
    hair: { Hair_Beard: 'hair_beard', Hair_SimpleParted: 'hair_parted', Hair_Buzzed: 'hair_buzzed' },
  },
  female: {
    file: 'Superhero_Female_FullBody.gltf', body: 'Superhero_Female', eyes: 'Eyes', brows: 'Eyebrows',
    skinMat: 'MI_Superhero_Female', hairMat: 'MI_Hair_2', browsRef: 'Eyebrows_Female',
    hair: { Hair_Long: 'hair_long', Hair_Buns: 'hair_buns' },
  },
};
const BODY = BODIES[args.body];
if (!BODY) throw new Error(`--body must be one of ${Object.keys(BODIES).join(', ')}`);
```

2. Delete the `const HAIR = { … };` line and change `for (const [file, name] of Object.entries(HAIR))` to `for (const [file, name] of Object.entries(BODY.hair))`.
3. `readLoose(path.join(ubc, 'Base Characters/Godot - UE/Superhero_Male_FullBody.gltf'))` → `readLoose(path.join(ubc, 'Base Characters/Godot - UE', BODY.file))`.
4. `nodeByMesh('Sphere.005_Retopology.004')` → `nodeByMesh(BODY.body)`; `nodeByMesh('Face.001')` → `nodeByMesh(BODY.eyes)`; `nodeByMesh('Face')` → `nodeByMesh(BODY.brows)`.
5. `matByName('MI_Superhero_Male')` → `matByName(BODY.skinMat)`; `matByName('MI_Hair_1')` → `matByName(BODY.hairMat)`.
6. In the eyebrow check block: `'Eyebrows_Regular.gltf'` → `` `${BODY.browsRef}.gltf` `` and replace the `throw new Error('built-in eyebrows differ …')` with `console.warn(\`brows: built-in eyebrows differ from ${BODY.browsRef} by ${(d * 1000).toFixed(2)} mm; keeping the built-in mesh\`);` (the check stays informative; the built-in mesh is the one that ships).
7. Replace the header comment's first paragraph with: `Builds the 3D shop's people (src/assets/people/worker.glb and worker-female.glb) from the CC0 Quaternius packs. Adapted from the workshop app's build-worker-glb.mjs: --body picks the male or female base body.` and update the run example to use `--body female` and the `src/assets/people/` output path.

- [ ] **Step 3: Build `worker-female.glb`**

Run from a scratch folder outside the repo that has the tool dependencies (the earlier workshop build left one at `C:\tmp\worker-pack\tools`; it is our own folder with npm packages, not part of the downloaded packs):

```bash
cp scripts/build-people-glb.mjs C:/tmp/worker-pack/tools/build-people-glb.mjs
UAL="$(find C:/tmp/worker-pack/ual/x -name UAL1_Standard.glb -path '*Unreal-Godot*' | head -1)"; echo "$UAL"
cd C:/tmp/worker-pack/tools && node build-people-glb.mjs --body female \
  --ubc "C:/tmp/worker-pack/ubc/x/Universal Base Characters[Standard]" --ual "$UAL" --out C:/tmp/worker-pack/out/worker-female-raw.glb
cd C:/tmp/worker-pack/out && npx -y @gltf-transform/cli@4.5.1 optimize worker-female-raw.glb worker-female-opt.glb --compress false --texture-compress webp --texture-size 1024 --join false --palette false --simplify false
npx -y @gltf-transform/cli@4.5.1 meshopt worker-female-opt.glb "D:/ReactJS/jagershop/jagerthejagershopV3.0/src/assets/people/worker-female.glb" --quantization-volume scene
npx -y @gltf-transform/cli@4.5.1 inspect "D:/ReactJS/jagershop/jagerthejagershopV3.0/src/assets/people/worker-female.glb"
```

Expected: the build logs `body split`, two `hair … ->` lines (hair_long, hair_buns), 11 `clip …` lines; `inspect` lists one skin, meshes `body, eyes, brows, hair_long, hair_buns`, materials `MI_Skin, MI_Suit, MI_Accent, MI_Hair, MI_Eyes`, 11 animations; the file is under 1 MB. If the body split logs 0 accent triangles, that is fine (the female suit has no dark shorts in the atlas).

- [ ] **Step 4: People assets and Person**

Create `src/components/shop3d/world/people/people-assets.js`:

```js
import maleUrl from "../../../../assets/people/worker.glb?url";
import femaleUrl from "../../../../assets/people/worker-female.glb?url";

// CC0 Quaternius characters with the Universal Animation Library clips (see LICENSE.txt).
export const PEOPLE_URLS = { male: maleUrl, female: femaleUrl };
```

Create `src/components/shop3d/world/people/person.jsx`:

```jsx
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AnimationMixer, LoopOnce, LoopRepeat } from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PEOPLE_URLS } from "./people-assets";

export const OUTFITS = {
  staff: { body: "#1e3027", accent: "#2b2b2b" },
  localA: { body: "#c9b8a0", accent: "#3d5a7a" },
  localB: { body: "#b04a5a", accent: "#2f2f38" },
  localC: { body: "#3f6f8f", accent: "#d8d0c0" },
  localD: { body: "#e0c36a", accent: "#4a3b2c" },
};
const HAIRS = ["hair_beard", "hair_parted", "hair_buzzed", "hair_long", "hair_buns"];

// One rigged character (skinned clone of the shared GLB) with its own mixer.
// The ref exposes { root, play(name, { once, fade, timeScale }), isPlaying(name) };
// routines move `root` directly every frame.
const Person = forwardRef(({ body, hair = [], outfit, position, yaw = 0 }, ref) => {
  const { scene, animations } = useGLTF(PEOPLE_URLS[body]);
  const root = useMemo(() => {
    const copy = cloneSkinned(scene);
    const colours = OUTFITS[outfit];
    copy.traverse((o) => {
      if (HAIRS.includes(o.name)) o.visible = hair.includes(o.name);
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false; // skinned bounds do not follow the animation
      const name = o.material?.name;
      if (name === "MI_Suit" || name === "MI_Accent") {
        const m = o.material.clone();
        m.color.set(name === "MI_Suit" ? colours.body : colours.accent);
        o.material = m;
      }
    });
    return copy;
  }, [scene, outfit, hair]);

  const mixer = useMemo(() => new AnimationMixer(root), [root]);
  const actions = useMemo(() => Object.fromEntries(animations.map((clip) => [clip.name, mixer.clipAction(clip)])), [animations, mixer]);
  const current = useRef(null);

  const api = useMemo(
    () => ({
      root,
      play(name, { once = false, fade = 0.3, timeScale = 1 } = {}) {
        const next = actions[name];
        if (!next) return;
        next.timeScale = timeScale;
        if (current.current === next && !once) return;
        next.reset();
        next.setLoop(once ? LoopOnce : LoopRepeat, Infinity);
        next.clampWhenFinished = once;
        next.enabled = true;
        next.setEffectiveWeight(1);
        if (current.current && current.current !== next) next.crossFadeFrom(current.current, fade, false);
        next.play();
        current.current = next;
      },
      isPlaying(name) {
        const action = actions[name];
        return Boolean(action && current.current === action && action.isRunning());
      },
    }),
    [root, actions]
  );
  useImperativeHandle(ref, () => api, [api]);

  useLayoutEffect(() => {
    root.position.fromArray(position);
    root.rotation.y = yaw;
  }, [root]); // eslint-disable-line react-hooks/exhaustive-deps -- initial placement only; routines move it after

  useEffect(() => {
    api.play("Idle_Loop", { fade: 0 });
    return () => mixer.stopAllAction();
  }, [api, mixer]);

  useFrame((_state, delta) => mixer.update(Math.min(delta, 0.1)));
  return <primitive object={root} />;
});
Person.displayName = "Person";

export default Person;
```

- [ ] **Step 5: Routines and the cast**

Create `src/components/shop3d/world/people/people.jsx`:

```jsx
import { Component, Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Person from "./person";
import { useQuality } from "../quality-context";
import { createWalker, stepWalker } from "../../../../utils/shop3d/people-paths";
import { FLOOR_Y, PEOPLE, SIDEWALK_Y } from "../../../../utils/shop3d/layout";

const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const WALK_CLIP_SPEED = 1.2; // m/s the Walk_Loop clip is authored for

// Behind the counter: idles, now and then talks or taps the POS, turns to face you when you are near.
const Cashier = ({ spec }) => {
  const ref = useRef();
  const timer = useRef(6);
  const state = useRef("idle");
  useFrame(({ camera }, delta) => {
    const p = ref.current;
    if (!p) return;
    const dx = camera.position.x - spec.spot[0];
    const dz = camera.position.z - spec.spot[2];
    const want = Math.hypot(dx, dz) < 3 ? Math.atan2(dx, dz) : spec.yaw;
    p.root.rotation.y = lerpAngle(p.root.rotation.y, want, Math.min(1, delta * 3));
    timer.current -= delta;
    if (timer.current > 0) return;
    if (state.current === "idle") {
      if (Math.random() < 0.5) {
        p.play("Idle_Talking_Loop");
        state.current = "talk";
        timer.current = 4;
      } else {
        p.play("Interact", { once: true });
        state.current = "interact";
        timer.current = 2.6;
      }
    } else {
      p.play("Idle_Loop");
      state.current = "idle";
      timer.current = 7 + Math.random() * 7;
    }
  });
  return <Person ref={ref} body={spec.body} hair={spec.hair} outfit={spec.outfit} position={spec.spot} yaw={spec.yaw} />;
};

// Walks its path back and forth, pausing for you; the stocker works the shelf at each end.
const Walker = ({ spec }) => {
  const ref = useRef();
  const walker = useRef(createWalker({ points: spec.path, speed: spec.speed, endPause: spec.endPause }));
  const anim = useRef(null);
  const y = spec.inside ? FLOOR_Y : SIDEWALK_Y;
  useFrame(({ camera }, delta) => {
    const p = ref.current;
    if (!p) return;
    const r = stepWalker(walker.current, Math.min(delta, 0.1), [camera.position.x, camera.position.z]);
    walker.current = r.walker;
    p.root.position.set(r.position[0], y, r.position[1]);
    const working = !r.moving && r.walker.wait > 0;
    const yaw = working && spec.endYaws ? spec.endYaws[r.walker.dir < 0 ? 1 : 0] : r.heading;
    p.root.rotation.y = lerpAngle(p.root.rotation.y, yaw, Math.min(1, delta * 6));
    let want = r.moving ? "walk" : "idle";
    if (working && spec.role === "stocker") want = anim.current === "work" || anim.current === "workDone" ? anim.current : "work";
    if (anim.current === "work" && !p.isPlaying("PickUp_Table")) want = "workDone";
    if (want === anim.current) return;
    anim.current = want;
    if (want === "walk") p.play("Walk_Loop", { timeScale: spec.speed / WALK_CLIP_SPEED });
    else if (want === "work") p.play("PickUp_Table", { once: true });
    else p.play("Idle_Loop");
  });
  const start = spec.path[0];
  return <Person ref={ref} body={spec.body} hair={spec.hair} outfit={spec.outfit} position={[start[0], y, start[1]]} yaw={0} />;
};

// On a plastic stool: sitting idle, sometimes chatting.
const Sitter = ({ spec }) => {
  const ref = useRef();
  const timer = useRef(0);
  const talking = useRef(true);
  useFrame((_s, delta) => {
    const p = ref.current;
    if (!p) return;
    timer.current -= delta;
    if (timer.current > 0) return;
    talking.current = !talking.current;
    p.play(talking.current ? "Sitting_Talking_Loop" : "Sitting_Idle_Loop", { fade: 0.5 });
    timer.current = talking.current ? 4 + Math.random() * 3 : 8 + Math.random() * 8;
  });
  return <Person ref={ref} body={spec.body} hair={spec.hair} outfit={spec.outfit} position={spec.spot} yaw={spec.yaw} />;
};

class PersonBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn("[shop3d] a person failed to load and is skipped:", error?.message);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const ROLES = { cashier: Cashier, stocker: Walker, walker: Walker, sitter: Sitter };

// Ambient people. They never block you (no colliders). On the low tier only
// the people on your side of the door are mounted.
const People = ({ phase }) => {
  const quality = useQuality();
  const showInside = quality.peopleAlways || phase !== "outside";
  const showOutside = quality.peopleAlways || phase !== "inside";
  return PEOPLE.filter((spec) => (spec.inside ? showInside : showOutside)).map((spec) => {
    const Role = ROLES[spec.role];
    return (
      <PersonBoundary key={spec.id}>
        <Suspense fallback={null}>
          <Role spec={spec} />
        </Suspense>
      </PersonBoundary>
    );
  });
};

export default People;
```

- [ ] **Step 6: Mount and preload**

In `src/components/shop3d/world/world.jsx` add `import People from "./people/people";` and render `<People phase={phase} />` after `<Door … />`.

In `src/pages/shop3d.page.jsx` add

```js
import { useGLTF } from "@react-three/drei";
import { PEOPLE_URLS } from "../components/shop3d/world/people/people-assets";
```

and extend the WebGL-gated preload line: `if (isWebGLAvailable()) { SCENE_GLBS.forEach(preloadGlb); Object.values(PEOPLE_URLS).forEach((url) => useGLTF.preload(url)); }`.

- [ ] **Step 7: Verify in the browser**

Check:
- outside: a neighbour sits on the red stool (hips on the seat, not floating or sunk) and alternates idle/chat; three passers-by walk the sidewalks with feet not sliding, turn around in the haze, and stop when you stand in their way;
- inside: the cashier stands behind the counter facing the aisle, idles, talks or taps, turns toward you within ~3 m; the stocker walks the aisle between the gondolas and plays the pick-up at each end facing a shelf;
- staff wear green; locals wear varied colours; hair toggles as configured;
- nobody blocks you; no console errors; `?quality=low` mounts only the people on your side of the door.

- [ ] **Step 8: Commit**

```bash
git add scripts/build-people-glb.mjs src/assets/people src/components/shop3d/world src/pages/shop3d.page.jsx
git commit -m "feat(shop3d): ambient staff, a sitting neighbour and passers-by

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Backend — theme setting (separate repo)

**Repo:** `D:\ReactJS\jagershop\jagerthejagershopV3.0_BE` — first `git checkout -b feat/shop3d-theme-setting`.

**Files:**
- Create: `src/model/shopSetting.model.js`, `src/app/controllers/settings.controller.js`, `src/routes/settings.route.js`
- Test: `src/app/controllers/settings.controller.test.js` (Node's built-in `node:test`, no DB)
- Modify: `src/routes/index.route.js`

**Interfaces:**
- Produces: `GET /api/settings/shop3d` → `200 { shop3dTheme }` (default `"auto"`); `PUT /api/settings/shop3d` (`requireAdmin`) with `{ shop3dTheme }` → `200 { shop3dTheme }`, `400` for a value outside `auto|none|tet|christmas|midautumn|halloween`.

- [ ] **Step 1: Write the failing test**

Create `src/app/controllers/settings.controller.test.js`:

```js
const test = require("node:test");
const assert = require("node:assert");
const { ShopSetting } = require("../../model/shopSetting.model");
const controller = require("./settings.controller");

const res = () => {
  const r = { statusCode: 0, body: null };
  r.status = (code) => ((r.statusCode = code), r);
  r.json = (body) => ((r.body = body), r);
  return r;
};

test("GET returns auto when nothing is stored", async () => {
  ShopSetting.findOne = () => ({ lean: async () => null });
  const r = res();
  await controller.getShop3dTheme({}, r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body, { shop3dTheme: "auto" });
});

test("GET returns the stored theme", async () => {
  ShopSetting.findOne = () => ({ lean: async () => ({ shop3dTheme: "tet" }) });
  const r = res();
  await controller.getShop3dTheme({}, r);
  assert.deepEqual(r.body, { shop3dTheme: "tet" });
});

test("PUT rejects unknown themes without touching the DB", async () => {
  let touched = false;
  ShopSetting.findOneAndUpdate = () => {
    touched = true;
  };
  const r = res();
  await controller.setShop3dTheme({ body: { shop3dTheme: "easter" } }, r);
  assert.equal(r.statusCode, 400);
  assert.equal(touched, false);
});

test("PUT upserts a valid theme", async () => {
  let args;
  ShopSetting.findOneAndUpdate = (...a) => {
    args = a;
    return { lean: async () => ({ shop3dTheme: "christmas" }) };
  };
  const r = res();
  await controller.setShop3dTheme({ body: { shop3dTheme: "christmas" } }, r);
  assert.equal(r.statusCode, 200);
  assert.deepEqual(r.body, { shop3dTheme: "christmas" });
  assert.deepEqual(args[0], { key: "main" });
  assert.equal(args[2].upsert, true);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test src/app/controllers/settings.controller.test.js`
Expected: FAIL — `Cannot find module '../../model/shopSetting.model'`.

- [ ] **Step 3: Implement**

Create `src/model/shopSetting.model.js`:

```js
const mongoose = require("mongoose");

// Shop-wide settings, one document (key "main"). Today only the 3D shop's seasonal theme.
const SHOP3D_THEMES = ["auto", "none", "tet", "christmas", "midautumn", "halloween"];

const shopSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    shop3dTheme: { type: String, enum: SHOP3D_THEMES, default: "auto" },
  },
  { timestamps: true }
);

const ShopSetting = mongoose.model("ShopSettings", shopSettingSchema);
module.exports = { ShopSetting, SHOP3D_THEMES };
```

Create `src/app/controllers/settings.controller.js`:

```js
const { ShopSetting, SHOP3D_THEMES } = require("../../model/shopSetting.model");

const getShop3dTheme = async (req, res) => {
  try {
    const doc = await ShopSetting.findOne({ key: "main" }).lean();
    return res.status(200).json({ shop3dTheme: doc?.shop3dTheme || "auto" });
  } catch (error) {
    return res.status(500).json({ errorMessage: "Không tải được cài đặt." });
  }
};

const setShop3dTheme = async (req, res) => {
  const { shop3dTheme } = req.body || {};
  if (!SHOP3D_THEMES.includes(shop3dTheme)) {
    return res.status(400).json({ errorMessage: "Chủ đề không hợp lệ." });
  }
  try {
    const doc = await ShopSetting.findOneAndUpdate(
      { key: "main" },
      { $set: { shop3dTheme } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return res.status(200).json({ shop3dTheme: doc.shop3dTheme });
  } catch (error) {
    return res.status(500).json({ errorMessage: "Không lưu được cài đặt." });
  }
};

module.exports = { getShop3dTheme, setShop3dTheme };
```

Create `src/routes/settings.route.js`:

```js
const express = require("express");
const router = express.Router();
const settingsController = require("../app/controllers/settings.controller");
const requireAdmin = require("../middlewares/requireAdmin.middleware");

router.get("/shop3d", settingsController.getShop3dTheme);
router.put("/shop3d", requireAdmin, settingsController.setShop3dTheme);

module.exports = router;
```

In `src/routes/index.route.js` add `const settingsRouter = require("../routes/settings.route");` with the other requires and `app.use("/api/settings", settingsRouter);` right after `app.use("/api/assets", assetsRouter);` (before the `/` catch-all).

- [ ] **Step 4: Run tests and a load check**

Run: `node --test src/app/controllers/settings.controller.test.js` — PASS (4 tests).
Run: `node -e "require('./src/routes/index.route.js'); console.log('routes ok')"` — prints `routes ok`.

- [ ] **Step 5: Commit (backend repo)**

```bash
git add src/model/shopSetting.model.js src/app/controllers/settings.controller.js src/app/controllers/settings.controller.test.js src/routes/settings.route.js src/routes/index.route.js
git commit -m "feat(be): shop-wide setting for the 3D shop's seasonal theme

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Seasonal themes in the frontend (API, hook, admin select, decor layers)

**Files:**
- Create: `src/services/settings.api.js`, `src/hooks/useShop3dTheme.hook.js`, `src/components/admin-shop3d-theme/shop3d-theme-select.component.jsx`
- Create: `src/components/shop3d/world/themes/theme-kit.jsx`, `theme-layer.jsx`, `tet.jsx`, `christmas.jsx`, `midautumn.jsx`, `halloween.jsx`
- Test: `src/hooks/useShop3dTheme.test.jsx`, `src/components/admin-shop3d-theme/shop3d-theme-select.test.jsx`
- Modify: `src/pages/shop3d.page.jsx`, `src/components/shop3d/scene-canvas.component.jsx`, `src/components/shop3d/world/world.jsx`, `src/pages/adminAssets.page.jsx`, `src/context/locale.context.jsx`

**Interfaces:**
- Consumes: `resolveTheme, THEME_SETTINGS` (Task 3), `ANCHORS, CEILING_Y` (Task 1), `useMats`, `textTexture` (Task 5).
- Produces: `settingsApi.getShop3dTheme() → Promise<{ shop3dTheme }>`, `settingsApi.setShop3dTheme(value)`; `useShop3dTheme(now?) → theme | null`; `<Shop3dThemeSelect />`; `<ThemeLayer theme />`. `SceneCanvas` and `World` gain a `theme` prop.

- [ ] **Step 1: Locale strings**

In `src/context/locale.context.jsx`, after the `shop3dLoading` line of each language add:

vi:
```js
    shop3dTheme: "Chủ đề cửa hàng 3D",
    shop3dTheme_auto: "Tự động theo ngày",
    shop3dTheme_none: "Không trang trí",
    shop3dTheme_tet: "Tết Nguyên Đán",
    shop3dTheme_christmas: "Giáng Sinh",
    shop3dTheme_midautumn: "Trung Thu",
    shop3dTheme_halloween: "Halloween",
    shop3dThemeSaved: "Đã lưu chủ đề.",
    shop3dThemeSaveFailed: "Không lưu được chủ đề.",
```

en:
```js
    shop3dTheme: "3D shop theme",
    shop3dTheme_auto: "Auto by date",
    shop3dTheme_none: "No decorations",
    shop3dTheme_tet: "Tết (Lunar New Year)",
    shop3dTheme_christmas: "Christmas",
    shop3dTheme_midautumn: "Mid-Autumn",
    shop3dTheme_halloween: "Halloween",
    shop3dThemeSaved: "Theme saved.",
    shop3dThemeSaveFailed: "Couldn't save the theme.",
```

- [ ] **Step 2: Write the failing tests**

Create `src/hooks/useShop3dTheme.test.jsx`:

```jsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useShop3dTheme } from "./useShop3dTheme.hook";
import { settingsApi } from "../services/settings.api";

vi.mock("../services/settings.api", () => ({ settingsApi: { getShop3dTheme: vi.fn(), setShop3dTheme: vi.fn() } }));

const june = new Date("2026-06-01T12:00:00+07:00");
const december = new Date("2026-12-10T12:00:00+07:00");
const wrap = (entry = "/vi/shop3d") => ({ children }) => <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;

describe("useShop3dTheme", () => {
  beforeEach(() => vi.mocked(settingsApi.getShop3dTheme).mockReset());

  it("uses the admin setting from the backend", async () => {
    vi.mocked(settingsApi.getShop3dTheme).mockResolvedValue({ shop3dTheme: "tet" });
    const { result } = renderHook(() => useShop3dTheme(june), { wrapper: wrap() });
    await waitFor(() => expect(result.current).toBe("tet"));
  });

  it("falls back to the date when the backend fails", async () => {
    vi.mocked(settingsApi.getShop3dTheme).mockRejectedValue(new Error("404"));
    const { result } = renderHook(() => useShop3dTheme(december), { wrapper: wrap() });
    await waitFor(() => expect(settingsApi.getShop3dTheme).toHaveBeenCalled());
    expect(result.current).toBe("christmas");
  });

  it("lets ?theme= override everything", async () => {
    vi.mocked(settingsApi.getShop3dTheme).mockResolvedValue({ shop3dTheme: "none" });
    const { result } = renderHook(() => useShop3dTheme(june), { wrapper: wrap("/vi/shop3d?theme=halloween") });
    await waitFor(() => expect(settingsApi.getShop3dTheme).toHaveBeenCalled());
    expect(result.current).toBe("halloween");
  });
});
```

Create `src/components/admin-shop3d-theme/shop3d-theme-select.test.jsx`:

```jsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Shop3dThemeSelect from "./shop3d-theme-select.component";
import { LocaleProvider } from "../../context/locale.context";
import { settingsApi } from "../../services/settings.api";

vi.mock("../../services/settings.api", () => ({ settingsApi: { getShop3dTheme: vi.fn(), setShop3dTheme: vi.fn() } }));

const renderSelect = () =>
  render(
    <BrowserRouter>
      <LocaleProvider>
        <Shop3dThemeSelect />
      </LocaleProvider>
    </BrowserRouter>
  );

describe("Shop3dThemeSelect", () => {
  beforeEach(() => {
    vi.mocked(settingsApi.getShop3dTheme).mockResolvedValue({ shop3dTheme: "christmas" });
    vi.mocked(settingsApi.setShop3dTheme).mockReset();
  });

  it("shows the current setting and every choice", async () => {
    renderSelect();
    const select = screen.getByLabelText("Chủ đề cửa hàng 3D");
    await waitFor(() => expect(select).toHaveValue("christmas"));
    expect(screen.getAllByRole("option")).toHaveLength(6);
  });

  it("saves a new choice", async () => {
    vi.mocked(settingsApi.setShop3dTheme).mockResolvedValue({ shop3dTheme: "tet" });
    renderSelect();
    const select = screen.getByLabelText("Chủ đề cửa hàng 3D");
    await waitFor(() => expect(select).toHaveValue("christmas"));
    fireEvent.change(select, { target: { value: "tet" } });
    expect(settingsApi.setShop3dTheme).toHaveBeenCalledWith("tet");
    expect(await screen.findByRole("status")).toHaveTextContent("Đã lưu chủ đề.");
  });

  it("reverts and says so when saving fails", async () => {
    vi.mocked(settingsApi.setShop3dTheme).mockRejectedValue(new Error("403"));
    renderSelect();
    const select = screen.getByLabelText("Chủ đề cửa hàng 3D");
    await waitFor(() => expect(select).toHaveValue("christmas"));
    fireEvent.change(select, { target: { value: "none" } });
    expect(await screen.findByRole("status")).toHaveTextContent("Không lưu được chủ đề.");
    expect(select).toHaveValue("christmas");
  });
});
```

Run: `npx vitest run src/hooks/useShop3dTheme.test.jsx src/components/admin-shop3d-theme` — FAIL (modules not found).

- [ ] **Step 3: API, hook, admin select**

Create `src/services/settings.api.js`:

```js
import axios from "axios";
import { apiUrl } from "../utils/api.utils";

export const settingsApi = {
  getShop3dTheme: () => axios.get(apiUrl("/api/settings/shop3d")).then((response) => response.data),
  setShop3dTheme: (shop3dTheme) =>
    axios.put(apiUrl("/api/settings/shop3d"), { shop3dTheme }, { withCredentials: true }).then((response) => response.data),
};
```

Create `src/hooks/useShop3dTheme.hook.js`:

```js
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { settingsApi } from "../services/settings.api";
import { resolveTheme } from "../utils/shop3d/themes";

// The seasonal theme to show: ?theme= override, else the admin setting, else by date.
// A failed request (e.g. an older backend without the route) just means "auto".
export const useShop3dTheme = (now) => {
  const { search } = useLocation();
  const override = new URLSearchParams(search).get("theme") || undefined;
  const [setting, setSetting] = useState("auto");
  useEffect(() => {
    let alive = true;
    settingsApi
      .getShop3dTheme()
      .then((data) => alive && setSetting(data?.shop3dTheme || "auto"))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return resolveTheme(setting, now || new Date(), override);
};
```

Create `src/components/admin-shop3d-theme/shop3d-theme-select.component.jsx`:

```jsx
import { useEffect, useState } from "react";
import { useLocale } from "../../context/locale.context";
import { settingsApi } from "../../services/settings.api";
import { THEME_SETTINGS } from "../../utils/shop3d/themes";

// Admin control for the 3D shop's seasonal decor.
const Shop3dThemeSelect = () => {
  const { t } = useLocale();
  const [value, setValue] = useState("auto");
  const [status, setStatus] = useState("");

  useEffect(() => {
    settingsApi
      .getShop3dTheme()
      .then((data) => setValue(data?.shop3dTheme || "auto"))
      .catch(() => {});
  }, []);

  const handleChange = async (event) => {
    const next = event.target.value;
    const previous = value;
    setValue(next);
    setStatus("");
    try {
      await settingsApi.setShop3dTheme(next);
      setStatus(t("shop3dThemeSaved"));
    } catch (_error) {
      setValue(previous);
      setStatus(t("shop3dThemeSaveFailed"));
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border border-warmGold/25 bg-mainGreen p-4">
      <label htmlFor="shop3d-theme" className="font-heading text-sm font-bold uppercase text-cream">
        {t("shop3dTheme")}
      </label>
      <select id="shop3d-theme" value={value} onChange={handleChange} className="border border-warmGold/40 bg-ink px-3 py-2 text-cream">
        {THEME_SETTINGS.map((option) => (
          <option key={option} value={option}>
            {t(`shop3dTheme_${option}`)}
          </option>
        ))}
      </select>
      {status && (
        <span role="status" className="text-sm text-cream/70">
          {status}
        </span>
      )}
    </div>
  );
};

export default Shop3dThemeSelect;
```

In `src/pages/adminAssets.page.jsx` import it and render `<Shop3dThemeSelect />` right after the heading block (`</div>` that closes the `mb-8` heading).

Run the two test files — PASS (6 tests).

- [ ] **Step 4: Theme kit**

Create `src/components/shop3d/world/themes/theme-kit.jsx`:

```jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3, Color, CylinderGeometry, ExtrudeGeometry, IcosahedronGeometry, LatheGeometry,
  Matrix4, MeshBasicMaterial, MeshStandardMaterial, Shape, SphereGeometry, TorusGeometry, TubeGeometry, Vector2, Vector3,
} from "three";
import { textTexture } from "../materials/canvas-textures";
import { useMats } from "../materials/materials-context";

const cache = new Map();
const cached = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};
// Glowing paper/fabric: lit by the room and emissive from within (blooms on high tier).
export const glowMaterial = (colour, power = 0.9) =>
  cached(`glow:${colour}:${power}`, () => new MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: power, roughness: 0.7 }));
export const plainMaterial = (colour, roughness = 0.6, metalness = 0) =>
  cached(`plain:${colour}:${roughness}:${metalness}`, () => new MeshStandardMaterial({ color: colour, roughness, metalness }));

export const catenary = (from, to, sag, n = 24) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return new Vector3(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - Math.sin(Math.PI * t) * sag, from[2] + (to[2] - from[2]) * t);
  });

const LANTERN = new LatheGeometry(
  Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return new Vector2(0.02 + Math.sin(Math.PI * t) * 0.2, t * 0.36 - 0.18);
  }),
  20
);
const CAP = new CylinderGeometry(0.07, 0.07, 0.04, 16);
const TASSEL = new CylinderGeometry(0.01, 0.025, 0.18, 8);

// Red Tết / Chinese-style lantern hanging from `y` on a short cord.
export const Lantern = ({ position, colour = "#c8102e", scale = 1, cord = 0.3 }) => {
  const mats = useMats();
  return (
    <group position={position} scale={scale}>
      <mesh material={mats.black} position={[0, cord / 2, 0]} scale={[0.006, cord, 0.006]}><boxGeometry /></mesh>
      <mesh geometry={CAP} material={mats.brass} position={[0, -0.0, 0]} />
      <mesh geometry={LANTERN} material={glowMaterial(colour)} position={[0, -0.2, 0]} castShadow />
      <mesh geometry={CAP} material={mats.brass} position={[0, -0.4, 0]} />
      <mesh geometry={TASSEL} material={glowMaterial("#f2c14e", 0.4)} position={[0, -0.51, 0]} />
    </group>
  );
};

const BULB = new SphereGeometry(0.022, 8, 6);
const BULB_MATERIAL = new MeshBasicMaterial({ toneMapped: false });
// Bright little bulbs at the given points: one instanced draw call, colour per bulb.
export const Bulbs = ({ points, colours = ["#ffd27a"], drop = 0 }) => {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new Matrix4();
    const c = new Color();
    points.forEach((p, i) => {
      ref.current.setMatrixAt(i, m.makeTranslation(p.x, p.y - drop, p.z));
      ref.current.setColorAt(i, c.set(colours[i % colours.length]).multiplyScalar(2.2));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [points, colours, drop]);
  return <instancedMesh ref={ref} args={[BULB, BULB_MATERIAL, points.length]} />;
};

// Bulbs hanging along a sagging wire.
export const StringLights = ({ from, to, sag = 0.2, count = 36, colours = ["#ffd27a"] }) => {
  const points = useMemo(() => catenary(from, to, sag, count - 1), [from, to, sag, count]);
  const wire = useMemo(() => new TubeGeometry(new CatmullRomCurve3(points), count * 2, 0.004, 4), [points, count]);
  const mats = useMats();
  return (
    <group>
      <mesh geometry={wire} material={mats.black} />
      <Bulbs points={points} colours={colours} drop={0.03} />
    </group>
  );
};

// Gift box with a ribbon cross and a bow.
export const GiftBox = ({ position, size = [0.3, 0.22, 0.3], colour = "#c8102e", ribbon = "#f2c14e", rotationY = 0 }) => {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={plainMaterial(colour)} position={[0, h / 2, 0]} scale={size} castShadow><boxGeometry /></mesh>
      <mesh material={plainMaterial(ribbon, 0.4, 0.3)} position={[0, h / 2, 0]} scale={[w + 0.004, h + 0.004, 0.04]}><boxGeometry /></mesh>
      <mesh material={plainMaterial(ribbon, 0.4, 0.3)} position={[0, h / 2, 0]} scale={[0.04, h + 0.004, d + 0.004]}><boxGeometry /></mesh>
      <mesh material={plainMaterial(ribbon, 0.4, 0.3)} position={[0, h + 0.03, 0]} rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[0.04, 0.012, 6, 16]} /></mesh>
    </group>
  );
};

// Text banner (a plane with a canvas texture), 2 mm in front of whatever it hangs on.
export const Banner = ({ position, rotationY = 0, text, width, height, bg, fg, font }) => {
  const material = useMemo(
    () => new MeshStandardMaterial({ map: textTexture({ text, width: 1024, height: Math.round((1024 * height) / width), bg, fg, font }), roughness: 0.7 }),
    [text, width, height, bg, fg, font]
  );
  return (
    <mesh material={material} position={position} rotation={[0, rotationY, 0]} scale={[width, height, 1]}>
      <planeGeometry />
    </mesh>
  );
};

const POT = new CylinderGeometry(0.24, 0.18, 0.34, 20);
const CANOPY = new IcosahedronGeometry(0.42, 2);
const FRUIT = new SphereGeometry(0.03, 8, 6);
// Potted tree with round fruit or blossoms (kumquat, peach, apricot…).
export const PottedTree = ({ position, fruit = "#f39c12", leaf = "#2f5b36", count = 40, potColour = "#7a2d1a", canopyScale = [1, 1.1, 1] }) => {
  const ref = useRef();
  const leafMat = plainMaterial(leaf, 0.85);
  const fruitMat = useMemo(() => new MeshStandardMaterial({ color: fruit, roughness: 0.4, emissive: fruit, emissiveIntensity: 0.15 }), [fruit]);
  useLayoutEffect(() => {
    const m = new Matrix4();
    const v = new Vector3();
    for (let i = 0; i < count; i++) {
      const a = i * 2.399; // golden angle
      const y = 1 - (2 * (i + 0.5)) / count;
      const r = Math.sqrt(1 - y * y);
      v.set(Math.cos(a) * r * 0.43 * canopyScale[0], y * 0.43 * canopyScale[1], Math.sin(a) * r * 0.43 * canopyScale[2]);
      ref.current.setMatrixAt(i, m.makeTranslation(v.x, v.y + 0.95, v.z));
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [count, canopyScale]);
  return (
    <group position={position}>
      <mesh geometry={POT} material={plainMaterial(potColour, 0.5)} position={[0, 0.17, 0]} castShadow />
      <mesh material={plainMaterial("#4a3b2c", 1)} position={[0, 0.5, 0]} scale={[0.04, 0.4, 0.04]}><cylinderGeometry /></mesh>
      <mesh geometry={CANOPY} material={leafMat} position={[0, 0.95, 0]} scale={canopyScale} castShadow />
      <instancedMesh ref={ref} args={[FRUIT, fruitMat, count]} />
    </group>
  );
};

// Five-point star (Mid-Autumn star lantern / Christmas tree topper).
export const starGeometry = (outer = 0.22, inner = 0.09, depth = 0.05) =>
  cached(`star:${outer}:${inner}:${depth}`, () => {
    const shape = new Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    return new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 }).translate(0, 0, -depth / 2);
  });

export const TORUS = (radius, tube) => cached(`torus:${radius}:${tube}`, () => new TorusGeometry(radius, tube, 10, 36));
```

- [ ] **Step 5: The four themes**

Create `src/components/shop3d/world/themes/tet.jsx`:

```jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Matrix4, MeshStandardMaterial, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { Banner, GiftBox, Lantern, PottedTree, plainMaterial } from "./theme-kit";
import { ANCHORS } from "../../../../utils/shop3d/layout";

const PETAL = new SphereGeometry(0.028, 6, 5);
// A vase of branches with blossoms: pink peach (đào) or yellow apricot (mai).
const BlossomVase = ({ position, colour }) => {
  const ref = useRef();
  const branches = useMemo(
    () =>
      [
        [[0, 0.3, 0], [0.05, 0.8, 0.02], [0.25, 1.2, 0.05], [0.4, 1.45, 0.1]],
        [[0, 0.3, 0], [-0.05, 0.75, 0], [-0.3, 1.15, -0.05], [-0.42, 1.35, -0.08]],
        [[0, 0.3, 0], [0.02, 0.9, -0.05], [0.05, 1.4, -0.15], [0.12, 1.65, -0.2]],
      ].map((pts) => new CatmullRomCurve3(pts.map((p) => new Vector3(...p)))),
    []
  );
  const tubes = useMemo(() => branches.map((c) => new TubeGeometry(c, 20, 0.018, 5)), [branches]);
  const material = useMemo(() => new MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0.25, roughness: 0.6 }), [colour]);
  const count = 120;
  useLayoutEffect(() => {
    const m = new Matrix4();
    for (let i = 0; i < count; i++) {
      const c = branches[i % branches.length];
      const p = c.getPoint(0.35 + ((i * 0.6180339) % 1) * 0.65);
      m.makeTranslation(p.x + Math.sin(i * 7.1) * 0.05, p.y + Math.cos(i * 3.3) * 0.04, p.z + Math.sin(i * 5.7) * 0.05);
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [branches]);
  return (
    <group position={position}>
      <mesh material={plainMaterial("#f4f1ea", 0.25)} position={[0, 0.17, 0]} castShadow><cylinderGeometry args={[0.1, 0.14, 0.34, 20]} /></mesh>
      <mesh material={plainMaterial("#1d4f91", 0.3)} position={[0, 0.2, 0]} scale={[1.01, 0.12, 1.01]}><cylinderGeometry args={[0.105, 0.125, 0.34, 20]} /></mesh>
      {tubes.map((t, i) => (
        <mesh key={i} geometry={t} material={plainMaterial("#3b2416", 0.9)} castShadow />
      ))}
      <instancedMesh ref={ref} args={[PETAL, material, count]} />
    </group>
  );
};

const Tet = () => {
  const { awning, ceiling, doorSides, windowInside, counterTop, facadeBand, sidewalkByDoor } = ANCHORS;
  const awningLanterns = [-4, -2, 0, 2, 4].map((x) => [x, awning.y - 0.05, awning.z]);
  return (
    <group>
      {ceiling.map((p, i) => (
        <Lantern key={`c${i}`} position={[p[0], p[1] - 0.35, p[2]]} cord={0.35} scale={1.2} />
      ))}
      {awningLanterns.map((p, i) => (
        <Lantern key={`a${i}`} position={p} cord={0.12} />
      ))}
      <Banner position={[0, facadeBand.y + 0.3, facadeBand.z]} text="CHÚC MỪNG NĂM MỚI" width={6.4} height={0.6} bg="#b3001b" fg="#f6d36b" font="700 92px Georgia, serif" />
      <BlossomVase position={windowInside} colour="#f49ac2" />
      <BlossomVase position={doorSides[0]} colour="#ffd23f" />
      <PottedTree position={doorSides[1]} fruit="#f39c12" />
      <PottedTree position={sidewalkByDoor} fruit="#f39c12" count={30} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={plainMaterial("#c8102e", 0.5)} position={[counterTop[0] - 0.1 + i * 0.03, counterTop[1] + 0.002 + i * 0.004, counterTop[2] - 0.35 + i * 0.07]} rotation={[0, 0.3 * i, 0]} scale={[0.09, 0.004, 0.17]}>
          <boxGeometry />
        </mesh>
      ))}
      <GiftBox position={[counterTop[0], counterTop[1], counterTop[2]]} size={[0.24, 0.16, 0.24]} />
    </group>
  );
};

export default Tet;
```

Create `src/components/shop3d/world/themes/christmas.jsx`:

```jsx
import { useMemo } from "react";
import { ConeGeometry } from "three";
import { Vector3 } from "three";
import { Bulbs, GiftBox, StringLights, TORUS, glowMaterial, plainMaterial, starGeometry } from "./theme-kit";
import { ANCHORS } from "../../../../utils/shop3d/layout";

const TIERS = [new ConeGeometry(0.55, 0.8, 18), new ConeGeometry(0.45, 0.7, 18), new ConeGeometry(0.32, 0.6, 18)];
const BULBS = ["#ff4d4d", "#ffd27a", "#6fd3ff", "#8dff7a"];

const ChristmasTree = ({ position }) => {
  const spiral = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const a = t * Math.PI * 9;
      const r = 0.55 * (1 - t) + 0.06;
      pts.push(new Vector3(Math.cos(a) * r, 0.35 + t * 1.55, Math.sin(a) * r));
    }
    return pts;
  }, []);
  return (
    <group position={position}>
      <mesh material={plainMaterial("#5a3a22", 0.9)} position={[0, 0.18, 0]}><cylinderGeometry args={[0.06, 0.08, 0.36, 10]} /></mesh>
      {TIERS.map((geo, i) => (
        <mesh key={i} geometry={geo} material={plainMaterial("#1f5a32", 0.85)} position={[0, 0.7 + i * 0.5, 0]} castShadow />
      ))}
      <Bulbs points={spiral} colours={BULBS} />
      <mesh geometry={starGeometry(0.12, 0.05, 0.03)} material={glowMaterial("#ffd23f", 2)} position={[0, 2.08, 0]} />
    </group>
  );
};

const Christmas = () => {
  const { awning, shelfCrowns, windowInside, doorTop, counterTop } = ANCHORS;
  return (
    <group>
      <ChristmasTree position={windowInside} />
      {[[0.35, -0.3, "#c8102e"], [-0.3, 0.35, "#1f5a32"], [0.4, 0.3, "#f3efe3"]].map(([dx, dz, c], i) => (
        <GiftBox key={i} position={[windowInside[0] + dx, windowInside[1], windowInside[2] + dz]} colour={c} ribbon={c === "#f3efe3" ? "#c8102e" : "#f2c14e"} rotationY={i} />
      ))}
      {shelfCrowns.map((c, i) => (
        <StringLights key={`s${i}`} from={c.from} to={c.to} sag={0.08} count={60} colours={BULBS} />
      ))}
      <StringLights from={[awning.x0, awning.y, awning.z]} to={[awning.x1, awning.y, awning.z]} sag={0.25} count={50} colours={["#ffd27a"]} />
      <group position={doorTop}>
        <mesh geometry={TORUS(0.22, 0.06)} material={plainMaterial("#1f5a32", 0.85)} />
        <mesh material={plainMaterial("#c8102e", 0.5)} position={[0, -0.2, 0.05]} scale={[0.12, 0.08, 0.03]}><boxGeometry /></mesh>
      </group>
      <StringLights from={[counterTop[0] - 0.36, counterTop[1] - 0.03, 1.0]} to={[counterTop[0] - 0.36, counterTop[1] - 0.03, 3.6]} sag={0.12} count={24} colours={BULBS} />
      <GiftBox position={counterTop} size={[0.22, 0.18, 0.22]} />
    </group>
  );
};

export default Christmas;
```

Create `src/components/shop3d/world/themes/midautumn.jsx`:

```jsx
import { useMemo } from "react";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { Lantern, glowMaterial, plainMaterial, starGeometry } from "./theme-kit";
import { textTexture } from "../materials/canvas-textures";
import { ANCHORS } from "../../../../utils/shop3d/layout";

const MOON = new SphereGeometry(4, 32, 16);
const PAPER = ["#ff6b6b", "#ffd23f", "#4ecdc4", "#f78fb3", "#ff9f43"];

// Star lantern (đèn ông sao) on a bamboo stick.
const StarLantern = ({ position, colour = "#e63946", rotationY = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh material={plainMaterial("#c9a15a", 0.8)} position={[0, 0.6, 0]} scale={[0.015, 1.2, 0.015]}><cylinderGeometry /></mesh>
    <mesh geometry={starGeometry(0.26, 0.11, 0.08)} material={glowMaterial(colour, 1.1)} position={[0, 1.3, 0]} />
  </group>
);

const MooncakeBox = ({ position }) => {
  const lid = useMemo(() => new MeshBasicMaterial({ map: textTexture({ text: "TRUNG THU", width: 256, height: 256, bg: "#a4161a", fg: "#f6d36b", font: "700 44px Georgia, serif", border: "#f6d36b" }) }), []);
  return (
    <group position={position}>
      <mesh material={plainMaterial("#a4161a", 0.5)} position={[0, 0.05, 0]} scale={[0.26, 0.1, 0.26]} castShadow><boxGeometry /></mesh>
      <mesh material={lid} position={[0, 0.1015, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.25, 0.25, 1]}><planeGeometry /></mesh>
    </group>
  );
};

const MidAutumn = () => {
  const { doorSides, windowInside, ceiling, awning, counterTop, skyMoon } = ANCHORS;
  const moon = useMemo(() => new MeshBasicMaterial({ color: "#fff1c1", toneMapped: false, fog: false }), []);
  return (
    <group>
      <mesh geometry={MOON} material={moon} position={skyMoon} />
      <StarLantern position={doorSides[0]} colour="#e63946" rotationY={0.3} />
      <StarLantern position={doorSides[1]} colour="#ffd23f" rotationY={-0.3} />
      <StarLantern position={windowInside} colour="#ff9f43" />
      {ceiling.map((p, i) => (
        <Lantern key={`c${i}`} position={[p[0], p[1] - 0.4, p[2]]} cord={0.4} colour={PAPER[i % PAPER.length]} />
      ))}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <Lantern key={`a${i}`} position={[x, awning.y - 0.05, awning.z]} cord={0.12} colour={PAPER[(i + 2) % PAPER.length]} scale={0.8} />
      ))}
      <MooncakeBox position={[counterTop[0], counterTop[1], counterTop[2]]} />
      <MooncakeBox position={[counterTop[0] + 0.05, counterTop[1] + 0.1, counterTop[2] + 0.02]} />
    </group>
  );
};

export default MidAutumn;
```

Create `src/components/shop3d/world/themes/halloween.jsx`:

```jsx
import { useMemo } from "react";
import { DoubleSide, MeshStandardMaterial, SphereGeometry, CanvasTexture, SRGBColorSpace } from "three";
import { plainMaterial } from "./theme-kit";
import { ANCHORS } from "../../../../utils/shop3d/layout";

// Ribbed pumpkin: a sphere pushed in and out around its axis.
const pumpkinGeometry = (() => {
  const g = new SphereGeometry(0.22, 32, 16);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = 1 + 0.07 * Math.cos(8 * Math.atan2(z, x));
    p.setXYZ(i, x * k, y * 0.78, z * k);
  }
  g.computeVertexNormals();
  return g;
})();

const faceTexture = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#e8740c";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#ffcf4a";
  g.beginPath(); g.moveTo(70, 50); g.lineTo(95, 20); g.lineTo(115, 50); g.fill();
  g.beginPath(); g.moveTo(140, 50); g.lineTo(162, 20); g.lineTo(185, 50); g.fill();
  g.beginPath(); g.moveTo(60, 75); g.lineTo(196, 75); g.lineTo(170, 105); g.lineTo(86, 105); g.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
};

const Pumpkin = ({ position, scale = 1, glowing = false, rotationY = 0 }) => {
  const material = useMemo(() => {
    if (!glowing) return plainMaterial("#e8740c", 0.55);
    const map = faceTexture();
    return new MeshStandardMaterial({ color: "#e8740c", map, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 0.9, roughness: 0.55 });
  }, [glowing]);
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh geometry={pumpkinGeometry} material={material} position={[0, 0.17, 0]} castShadow />
      <mesh material={plainMaterial("#3d5a1f", 0.8)} position={[0, 0.37, 0]} scale={[0.025, 0.08, 0.025]}><cylinderGeometry /></mesh>
    </group>
  );
};

const webTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.strokeStyle = "rgba(240,240,240,0.9)";
  g.lineWidth = 2;
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 256, Math.sin(a) * 256); g.stroke();
  }
  for (let r = 40; r < 256; r += 40) {
    g.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * (Math.PI / 2);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.quadraticCurveTo(Math.cos(a - Math.PI / 12) * r * 0.85, Math.sin(a - Math.PI / 12) * r * 0.85, x, y);
    }
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
};

const Halloween = () => {
  const { doorSides, shelfEnds, counterTop, ceilingCorners, sidewalkByDoor } = ANCHORS;
  const web = useMemo(() => new MeshStandardMaterial({ map: webTexture(), alphaTest: 0.4, side: DoubleSide, roughness: 1 }), []);
  return (
    <group>
      <Pumpkin position={doorSides[0]} scale={1.4} glowing />
      <Pumpkin position={doorSides[1]} scale={1.1} rotationY={1} />
      <Pumpkin position={sidewalkByDoor} scale={0.8} rotationY={2} />
      {shelfEnds.map((p, i) => (
        <Pumpkin key={i} position={[p[0], p[1], p[2] + 0.12]} scale={0.8} glowing={i === 0} rotationY={i} />
      ))}
      <Pumpkin position={counterTop} scale={0.5} glowing />
      {ceilingCorners.map((p, i) => (
        <mesh key={i} material={web} position={[p[0] + (i === 0 ? 0.3 : -0.3), p[1] - 0.3, p[2] + 0.3]} rotation={[0, i === 0 ? Math.PI / 4 : -Math.PI / 4, i === 0 ? Math.PI : -Math.PI / 2]} scale={[0.9, 0.9, 1]}>
          <planeGeometry />
        </mesh>
      ))}
      <pointLight color="#8a3ffc" intensity={4} distance={7} decay={2} position={[-1, 3.2, -1]} />
      <pointLight color="#ff7a18" intensity={6} distance={5} decay={2} position={[2.3, 1.2, 6.5]} />
    </group>
  );
};

export default Halloween;
```

(The cobweb is the one deliberate double-sided surface: it is alpha-tested, not blended, so it never sorts or flickers.)

Create `src/components/shop3d/world/themes/theme-layer.jsx`:

```jsx
import Tet from "./tet";
import Christmas from "./christmas";
import MidAutumn from "./midautumn";
import Halloween from "./halloween";

const LAYERS = { tet: Tet, christmas: Christmas, midautumn: MidAutumn, halloween: Halloween };

// Mounts the decor for the active seasonal theme, or nothing.
const ThemeLayer = ({ theme }) => {
  const Layer = LAYERS[theme];
  return Layer ? <Layer /> : null;
};

export default ThemeLayer;
```

- [ ] **Step 6: Wire the theme through**

- `src/pages/shop3d.page.jsx`: `import { useShop3dTheme } from "../hooks/useShop3dTheme.hook";`, call `const theme = useShop3dTheme();` near the other hooks (before any early return), and pass `theme={theme}` to `<SceneCanvas>`.
- `src/components/shop3d/scene-canvas.component.jsx`: accept `theme` and pass it to `<World theme={theme} … />`.
- `src/components/shop3d/world/world.jsx`: accept `theme`; `import ThemeLayer from "./themes/theme-layer";` and render `<ThemeLayer theme={theme} />` last in the fragment.

- [ ] **Step 7: Verify each theme in the browser**

Open `/vi/shop3d?theme=tet`, `?theme=christmas`, `?theme=midautumn`, `?theme=halloween`, `?theme=none`. For each: walk the street and the shop and screenshot the shopfront and the counter area. Check props sit on their anchors (no floating, no clipping into shelves, nothing in the doorway), glowing pieces bloom on high tier, no flicker on the banner, mooncake lids, envelopes or cobwebs. With no `?theme=` the date decides (today, 2026-11-02 → no theme, until the admin picks one). Run `npx vitest run` — all pass.

- [ ] **Step 8: Commit**

```bash
git add -A src
git commit -m "feat(shop3d): Tết, Christmas, Mid-Autumn and Halloween decor with an admin theme setting

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Performance, flicker sweep and full verification

**Files:**
- Modify: `src/components/shop3d/scene-canvas.component.jsx` (dev-only debug handle)
- Modify: as findings require

- [ ] **Step 1: Dev-only debug handle**

Change `SceneCanvas`'s `onCreated` to receive the scene too and add a dev-only handle:

```js
        onCreated={({ gl, scene, camera }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          camera.lookAt(...START_POSE.target);
          if (import.meta.env.DEV) window.__shop3d = { gl, scene, camera };
        }}
```

This lets the browser checks read `window.__shop3d.gl.info.render`.

- [ ] **Step 2: Lint and tests**

Run: `npx eslint src/components/shop3d src/utils/shop3d src/hooks/useShop3dTheme.hook.js src/services/settings.api.js src/components/admin-shop3d-theme --max-warnings 0`
Expected: no errors (fix any reported).
Run: `npx vitest run` — all suites pass (paste the summary into the report).
Run: `npx vite build` — succeeds; note the `shop3d` chunk size.

- [ ] **Step 3: Desktop check (1440×900, high tier)**

With products available, run through and screenshot:
1. start pose (street, shop, sky); walk both block ends; cross the road; kerb steps.
2. door → walk in; look around all four walls.
3. hover + click a bottle on each run type (wall bay, gondola, back-bar, chiller mini, counter tray, barrel); add two different products; toast; HUD count; cart overlay; close; POS → checkout route; back; basket → cart.
4. walk out; the door closes behind you.
5. themes via `?theme=`.
Measure: in the console, average FPS over 5 s (`let n=0,t=performance.now();(function f(){n++; if(performance.now()-t<5000) requestAnimationFrame(f); else console.log(n/5)})()`) outside and inside; `window.__shop3d.gl.info.render` → `calls` < 250 and `triangles` within budget. Record the numbers.

- [ ] **Step 4: Phone check (390×844, low tier)**

Resize to mobile (touch emulation, so the tier is low), reload, repeat steps 1–4 using the joystick and drag. Record FPS and draw calls. If FPS < 30 on the low tier, lower `QUALITY.low.maxInstances` (e.g. 300) and `dpr` (`[1, 1]`), re-measure, and note the change.

- [ ] **Step 5: Flicker sweep**

At both tiers, slowly strafe and turn past: road markings at a grazing angle, kerbs, sign faces, window cards, balcony glass, the threshold, skirting, shelf lips and LED strips, case boxes, chiller glass, neon, posters, doormat, theme banners. Any shimmer → fix with the rules (offset ≥ 1–2 mm, `polygonOffset`, remove a duplicate surface, or stop a transparent overlap) and re-check.

- [ ] **Step 6: Commit and hand over**

```bash
git add -A src
git commit -m "chore(shop3d): verification fixes and a dev-only debug handle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Report: what was built, the measured FPS/draw calls per tier, screenshots, anything not verified (e.g. a real phone), and that nothing was pushed (frontend branch `feat/shop3d-street-and-store`, backend branch `feat/shop3d-theme-setting`).
