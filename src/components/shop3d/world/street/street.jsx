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
