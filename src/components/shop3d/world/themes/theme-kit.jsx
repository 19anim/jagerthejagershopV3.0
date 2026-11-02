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
