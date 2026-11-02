import { useMemo } from "react";
import { DoubleSide, MeshStandardMaterial, SphereGeometry, CanvasTexture, SRGBColorSpace } from "three";
import { plainMaterial } from "./theme-kit";
import { ANCHORS } from "../../../../utils/shop3d/layout";

// Ribbed pumpkin: a sphere pushed in and out around its axis.
const pumpkinGeometry = (() => {
  const g = new SphereGeometry(0.22, 32, 16);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = 1 + 0.07 * Math.cos(8 * Math.atan2(z, x));
    p.setXYZ(i, x * k, y * 0.78, z * k);
  }
  g.computeVertexNormals();
  return g;
})();

const faceTexture = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#e8740c";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#ffcf4a";
  g.beginPath(); g.moveTo(70, 50); g.lineTo(95, 20); g.lineTo(115, 50); g.fill();
  g.beginPath(); g.moveTo(140, 50); g.lineTo(162, 20); g.lineTo(185, 50); g.fill();
  g.beginPath(); g.moveTo(60, 75); g.lineTo(196, 75); g.lineTo(170, 105); g.lineTo(86, 105); g.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
};

const Pumpkin = ({ position, scale = 1, glowing = false, rotationY = 0 }) => {
  const material = useMemo(() => {
    if (!glowing) return plainMaterial("#e8740c", 0.55);
    const map = faceTexture();
    return new MeshStandardMaterial({ color: "#e8740c", map, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 0.9, roughness: 0.55 });
  }, [glowing]);
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh geometry={pumpkinGeometry} material={material} position={[0, 0.17, 0]} castShadow />
      <mesh material={plainMaterial("#3d5a1f", 0.8)} position={[0, 0.37, 0]} scale={[0.025, 0.08, 0.025]}><cylinderGeometry /></mesh>
    </group>
  );
};

const webTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.strokeStyle = "rgba(240,240,240,0.9)";
  g.lineWidth = 2;
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 256, Math.sin(a) * 256); g.stroke();
  }
  for (let r = 40; r < 256; r += 40) {
    g.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * (Math.PI / 2);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.quadraticCurveTo(Math.cos(a - Math.PI / 12) * r * 0.85, Math.sin(a - Math.PI / 12) * r * 0.85, x, y);
    }
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
};

const Halloween = () => {
  const { doorSides, shelfEnds, counterTop, ceilingCorners, sidewalkByDoor } = ANCHORS;
  const web = useMemo(() => new MeshStandardMaterial({ map: webTexture(), alphaTest: 0.4, side: DoubleSide, roughness: 1 }), []);
  return (
    <group>
      <Pumpkin position={doorSides[0]} scale={1.4} glowing />
      <Pumpkin position={doorSides[1]} scale={1.1} rotationY={1} />
      <Pumpkin position={sidewalkByDoor} scale={0.8} rotationY={2} />
      {shelfEnds.map((p, i) => (
        <Pumpkin key={i} position={[p[0], p[1], p[2] + 0.12]} scale={0.8} glowing={i === 0} rotationY={i} />
      ))}
      <Pumpkin position={counterTop} scale={0.5} glowing />
      {ceilingCorners.map((p, i) => (
        <mesh key={i} material={web} position={[p[0] + (i === 0 ? 0.3 : -0.3), p[1] - 0.3, p[2] + 0.3]} rotation={[0, i === 0 ? Math.PI / 4 : -Math.PI / 4, i === 0 ? Math.PI : -Math.PI / 2]} scale={[0.9, 0.9, 1]}>
          <planeGeometry />
        </mesh>
      ))}
      <pointLight color="#8a3ffc" intensity={4} distance={7} decay={2} position={[-1, 3.2, -1]} />
      <pointLight color="#ff7a18" intensity={6} distance={5} decay={2} position={[2.3, 1.2, 6.5]} />
    </group>
  );
};

export default Halloween;
