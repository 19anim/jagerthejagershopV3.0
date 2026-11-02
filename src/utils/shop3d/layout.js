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
  box(COUNTER.x1, COUNTER.z0, BACK_BAR.x0, COUNTER.z1), // staff space behind the counter
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
    { x: -4.5, z: 17.9, rot: -1.8, color: "#a8262a" }, // kept clear of START_POSE (x 2.3)
  ],
  stools: [
    { x: 6.4, z: 6.45, color: "#d33a3a" },
    { x: 7.05, z: 6.6, color: "#2f63c4" },
  ],
  chalkboard: { x: 0.0, z: 6.3, rotY: 0.3 },
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
  { id: "walkerA", body: "female", hair: ["hair_long"], outfit: "localB", role: "walker", inside: false, path: [[-22, 7.25], [22, 7.25]], speed: 1.15, endPause: 0 },
  { id: "walkerB", body: "male", hair: ["hair_parted"], outfit: "localC", role: "walker", inside: false, path: [[21, 19.6], [-21, 19.6]], speed: 1.25, endPause: 0 },
  { id: "walkerC", body: "female", hair: ["hair_buns"], outfit: "localD", role: "walker", inside: false, path: [[-18, 19.0], [-3, 19.0], [14, 19.0]], speed: 1.05, endPause: 3 },
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
