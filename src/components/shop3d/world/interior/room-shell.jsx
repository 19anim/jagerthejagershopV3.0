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
