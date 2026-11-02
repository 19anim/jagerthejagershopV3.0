import { useLayoutEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Matrix4, MeshStandardMaterial, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { Banner, GiftBox, Lantern, PottedTree, plainMaterial } from "./theme-kit";
import { ANCHORS } from "../../../../utils/shop3d/layout";

const PETAL = new SphereGeometry(0.028, 6, 5);
// A vase of branches with blossoms: pink peach (đào) or yellow apricot (mai).
const BlossomVase = ({ position, colour }) => {
  const ref = useRef();
  const branches = useMemo(
    () =>
      [
        [[0, 0.3, 0], [0.05, 0.8, 0.02], [0.25, 1.2, 0.05], [0.4, 1.45, 0.1]],
        [[0, 0.3, 0], [-0.05, 0.75, 0], [-0.3, 1.15, -0.05], [-0.42, 1.35, -0.08]],
        [[0, 0.3, 0], [0.02, 0.9, -0.05], [0.05, 1.4, -0.15], [0.12, 1.65, -0.2]],
      ].map((pts) => new CatmullRomCurve3(pts.map((p) => new Vector3(...p)))),
    []
  );
  const tubes = useMemo(() => branches.map((c) => new TubeGeometry(c, 20, 0.018, 5)), [branches]);
  const material = useMemo(() => new MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0.25, roughness: 0.6 }), [colour]);
  const count = 120;
  useLayoutEffect(() => {
    const m = new Matrix4();
    for (let i = 0; i < count; i++) {
      const c = branches[i % branches.length];
      const p = c.getPoint(0.35 + ((i * 0.6180339) % 1) * 0.65);
      m.makeTranslation(p.x + Math.sin(i * 7.1) * 0.05, p.y + Math.cos(i * 3.3) * 0.04, p.z + Math.sin(i * 5.7) * 0.05);
      ref.current.setMatrixAt(i, m);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [branches]);
  return (
    <group position={position}>
      <mesh material={plainMaterial("#f4f1ea", 0.25)} position={[0, 0.17, 0]} castShadow><cylinderGeometry args={[0.1, 0.14, 0.34, 20]} /></mesh>
      <mesh material={plainMaterial("#1d4f91", 0.3)} position={[0, 0.2, 0]} scale={[1.01, 0.12, 1.01]}><cylinderGeometry args={[0.105, 0.125, 0.34, 20]} /></mesh>
      {tubes.map((t, i) => (
        <mesh key={i} geometry={t} material={plainMaterial("#3b2416", 0.9)} castShadow />
      ))}
      <instancedMesh ref={ref} args={[PETAL, material, count]} />
    </group>
  );
};

const Tet = () => {
  const { awning, ceiling, doorSides, windowInside, counterTop, facadeBand, sidewalkByDoor } = ANCHORS;
  const awningLanterns = [-4, -2, 0, 2, 4].map((x) => [x, awning.y - 0.05, awning.z]);
  return (
    <group>
      {ceiling.map((p, i) => (
        <Lantern key={`c${i}`} position={[p[0], p[1] - 0.35, p[2]]} cord={0.35} scale={1.2} />
      ))}
      {awningLanterns.map((p, i) => (
        <Lantern key={`a${i}`} position={p} cord={0.12} />
      ))}
      <Banner position={[0, facadeBand.y + 0.3, facadeBand.z]} text="CHÚC MỪNG NĂM MỚI" width={6.4} height={0.6} bg="#b3001b" fg="#f6d36b" font="700 74px Georgia, serif" />
      <BlossomVase position={windowInside} colour="#f49ac2" />
      <BlossomVase position={doorSides[0]} colour="#ffd23f" />
      <PottedTree position={doorSides[1]} fruit="#f39c12" />
      <PottedTree position={sidewalkByDoor} fruit="#f39c12" count={30} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={plainMaterial("#c8102e", 0.5)} position={[counterTop[0] - 0.1 + i * 0.03, counterTop[1] + 0.002 + i * 0.004, counterTop[2] - 0.35 + i * 0.07]} rotation={[0, 0.3 * i, 0]} scale={[0.09, 0.004, 0.17]}>
          <boxGeometry />
        </mesh>
      ))}
      <GiftBox position={[counterTop[0], counterTop[1], counterTop[2]]} size={[0.24, 0.16, 0.24]} />
    </group>
  );
};

export default Tet;
