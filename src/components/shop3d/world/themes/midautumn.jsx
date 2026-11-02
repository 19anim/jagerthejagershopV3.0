import { useMemo } from "react";
import { MeshBasicMaterial, SphereGeometry } from "three";
import { Lantern, glowMaterial, plainMaterial, starGeometry } from "./theme-kit";
import { textTexture } from "../materials/canvas-textures";
import { ANCHORS } from "../../../../utils/shop3d/layout";

const MOON = new SphereGeometry(4, 32, 16);
const PAPER = ["#ff6b6b", "#ffd23f", "#4ecdc4", "#f78fb3", "#ff9f43"];

// Star lantern (đèn ông sao) on a bamboo stick.
const StarLantern = ({ position, colour = "#e63946", rotationY = 0 }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh material={plainMaterial("#c9a15a", 0.8)} position={[0, 0.6, 0]} scale={[0.015, 1.2, 0.015]}><cylinderGeometry /></mesh>
    <mesh geometry={starGeometry(0.26, 0.11, 0.08)} material={glowMaterial(colour, 1.1)} position={[0, 1.3, 0]} />
  </group>
);

const MooncakeBox = ({ position }) => {
  const lid = useMemo(() => new MeshBasicMaterial({ map: textTexture({ text: "TRUNG THU", width: 256, height: 256, bg: "#a4161a", fg: "#f6d36b", font: "700 44px Georgia, serif", border: "#f6d36b" }) }), []);
  return (
    <group position={position}>
      <mesh material={plainMaterial("#a4161a", 0.5)} position={[0, 0.05, 0]} scale={[0.26, 0.1, 0.26]} castShadow><boxGeometry /></mesh>
      <mesh material={lid} position={[0, 0.1015, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.25, 0.25, 1]}><planeGeometry /></mesh>
    </group>
  );
};

const MidAutumn = () => {
  const { doorSides, windowInside, ceiling, awning, counterTop, skyMoon } = ANCHORS;
  const moon = useMemo(() => new MeshBasicMaterial({ color: "#fff1c1", toneMapped: false, fog: false }), []);
  return (
    <group>
      <mesh geometry={MOON} material={moon} position={skyMoon} />
      <StarLantern position={doorSides[0]} colour="#e63946" rotationY={0.3} />
      <StarLantern position={doorSides[1]} colour="#ffd23f" rotationY={-0.3} />
      <StarLantern position={windowInside} colour="#ff9f43" />
      {ceiling.map((p, i) => (
        <Lantern key={`c${i}`} position={[p[0], p[1] - 0.4, p[2]]} cord={0.4} colour={PAPER[i % PAPER.length]} />
      ))}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <Lantern key={`a${i}`} position={[x, awning.y - 0.05, awning.z]} cord={0.12} colour={PAPER[(i + 2) % PAPER.length]} scale={0.8} />
      ))}
      <MooncakeBox position={[counterTop[0], counterTop[1], counterTop[2]]} />
      <MooncakeBox position={[counterTop[0] + 0.05, counterTop[1] + 0.1, counterTop[2] + 0.02]} />
    </group>
  );
};

export default MidAutumn;
