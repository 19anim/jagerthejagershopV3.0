import { useMemo } from "react";
import { ConeGeometry } from "three";
import { Vector3 } from "three";
import { Bulbs, GiftBox, StringLights, TORUS, glowMaterial, plainMaterial, starGeometry } from "./theme-kit";
import { ANCHORS } from "../../../../utils/shop3d/layout";

const TIERS = [new ConeGeometry(0.55, 0.8, 18), new ConeGeometry(0.45, 0.7, 18), new ConeGeometry(0.32, 0.6, 18)];
const BULBS = ["#ff4d4d", "#ffd27a", "#6fd3ff", "#8dff7a"];

const ChristmasTree = ({ position }) => {
  const spiral = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const a = t * Math.PI * 9;
      const r = 0.55 * (1 - t) + 0.06;
      pts.push(new Vector3(Math.cos(a) * r, 0.35 + t * 1.55, Math.sin(a) * r));
    }
    return pts;
  }, []);
  return (
    <group position={position}>
      <mesh material={plainMaterial("#5a3a22", 0.9)} position={[0, 0.18, 0]}><cylinderGeometry args={[0.06, 0.08, 0.36, 10]} /></mesh>
      {TIERS.map((geo, i) => (
        <mesh key={i} geometry={geo} material={plainMaterial("#1f5a32", 0.85)} position={[0, 0.7 + i * 0.5, 0]} castShadow />
      ))}
      <Bulbs points={spiral} colours={BULBS} />
      <mesh geometry={starGeometry(0.12, 0.05, 0.03)} material={glowMaterial("#ffd23f", 2)} position={[0, 2.08, 0]} />
    </group>
  );
};

const Christmas = () => {
  const { awning, shelfCrowns, windowInside, doorTop, counterTop } = ANCHORS;
  return (
    <group>
      <ChristmasTree position={windowInside} />
      {[[0.35, -0.3, "#c8102e"], [-0.3, 0.35, "#1f5a32"], [0.4, 0.3, "#f3efe3"]].map(([dx, dz, c], i) => (
        <GiftBox key={i} position={[windowInside[0] + dx, windowInside[1], windowInside[2] + dz]} colour={c} ribbon={c === "#f3efe3" ? "#c8102e" : "#f2c14e"} rotationY={i} />
      ))}
      {shelfCrowns.map((c, i) => (
        <StringLights key={`s${i}`} from={c.from} to={c.to} sag={0.08} count={60} colours={BULBS} />
      ))}
      <StringLights from={[awning.x0, awning.y, awning.z]} to={[awning.x1, awning.y, awning.z]} sag={0.25} count={50} colours={["#ffd27a"]} />
      <group position={doorTop}>
        <mesh geometry={TORUS(0.22, 0.06)} material={plainMaterial("#1f5a32", 0.85)} />
        <mesh material={plainMaterial("#c8102e", 0.5)} position={[0, -0.2, 0.05]} scale={[0.12, 0.08, 0.03]}><boxGeometry /></mesh>
      </group>
      <StringLights from={[counterTop[0] - 0.36, counterTop[1] - 0.03, 1.0]} to={[counterTop[0] - 0.36, counterTop[1] - 0.03, 3.6]} sag={0.12} count={24} colours={BULBS} />
      <GiftBox position={counterTop} size={[0.22, 0.18, 0.22]} />
    </group>
  );
};

export default Christmas;
