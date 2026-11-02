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
