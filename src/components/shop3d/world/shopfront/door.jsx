import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { CylinderGeometry } from "three";
import { useMats } from "../materials/materials-context";
import { useLocale } from "../../../../context/locale.context";
import { DOOR } from "../../../../utils/shop3d/layout";

const OPEN = 1.6; // radians; positive swings the leaf inward (toward −z)
const BAR = new CylinderGeometry(0.018, 0.018, 0.9, 10);
const W = DOOR.leafWidth;
const H = DOOR.leafHeight;

// The shop door, hinged on its left edge. Outside: click → it swings in, then
// onEnter starts the walk-in. Inside: click → onExit. It stays open while you
// walk in or out and closes once you are back outside.
const Door = ({ phase, onEnter, onExit }) => {
  const { t } = useLocale();
  const mats = useMats();
  const leaf = useRef();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const entered = useRef(false);
  useCursor(hovered);

  useEffect(() => {
    if (phase !== "outside") return;
    setOpening(false);
    entered.current = false;
    if (leaf.current) leaf.current.rotation.y = 0;
  }, [phase]);

  useFrame((_state, delta) => {
    if (!leaf.current || !(opening || phase !== "outside")) return;
    leaf.current.rotation.y = Math.min(OPEN, leaf.current.rotation.y + delta * 2.2);
    if (opening && !entered.current && leaf.current.rotation.y >= OPEN - 0.02) {
      entered.current = true;
      onEnter();
    }
  });

  const handleClick = (event) => {
    if (event.delta > 6) return; // that was a drag-to-look, not a click
    event.stopPropagation();
    if (phase === "inside") onExit();
    else if (phase === "outside") setOpening(true);
  };

  const showHint = hovered && (phase === "inside" || (phase === "outside" && !opening));

  return (
    <group
      ref={leaf}
      position={[DOOR.hingeX, 0.15, 5.55]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <mesh material={mats.green} position={[0.05, H / 2, 0]} scale={[0.1, H, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W - 0.05, H / 2, 0]} scale={[0.1, H, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W / 2, 0.08, 0]} scale={[W, 0.16, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W / 2, H - 0.06, 0]} scale={[W, 0.12, 0.05]} castShadow><boxGeometry /></mesh>
      <mesh material={mats.green} position={[W / 2, 0.32, 0]} scale={[W - 0.2, 0.32, 0.04]}><boxGeometry /></mesh>
      <mesh material={mats.brass} position={[W / 2, 0.49, 0.027]} scale={[W - 0.2, 0.02, 0.006]}><boxGeometry /></mesh>
      <mesh material={mats.shopGlass} position={[W / 2, 1.41, 0.005]} scale={[W - 0.2, H - 0.66, 1]}><planeGeometry /></mesh>
      <mesh material={mats.brass} geometry={BAR} position={[W - 0.2, 1.15, 0.07]} />
      <mesh material={mats.brass} geometry={BAR} position={[W - 0.2, 1.15, -0.07]} />
      {showHint && (
        <Html position={[W / 2, H + 0.2, 0]} center distanceFactor={8}>
          <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
            {phase === "inside" ? t("exitDoor") : t("openDoor")}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Door;
