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
