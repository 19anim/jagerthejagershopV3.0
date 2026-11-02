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
