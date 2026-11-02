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
