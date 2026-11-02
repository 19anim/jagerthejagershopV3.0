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
