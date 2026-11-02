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
  const lastSecond = useRef(-1);
  useFrame(() => {
    const second = Math.floor(Date.now() / 1000);
    if (second === lastSecond.current) return; // hands only need to move once a second
    lastSecond.current = second;
    const now = new Date(second * 1000 + 7 * 3600000);
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
    const map = textTexture({ text: "Jäger the Jäger", width: 1024, height: 256, bg: "rgba(0,0,0,0)", fg: "#ff8a3d", font: "italic 700 112px Georgia, serif" });
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
