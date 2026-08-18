import { useEffect, useRef, useState } from "react";
import { TextureLoader } from "three";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import GlbModel from "./glb-model.component";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";
import { LOGO_SLOTS, SLOT_MATERIAL_NAME } from "../../utils/shop3d.config";

const applyTextureToSlot = (root, materialName, texture) => {
  root.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === materialName) {
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });
};

const useLogoTexture = () => {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const loaded = new TextureLoader().load(Logo);
    loaded.flipY = false;
    setTexture(loaded);
    return () => loaded.dispose();
  }, []);
  return texture;
};

const ExteriorScene = ({ onEnter }) => {
  const { t } = useLocale();
  const logoTexture = useLogoTexture();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const doorRef = useRef();
  useCursor(hovered);

  const attachLogo = (fileName) => (root) => {
    const slot = LOGO_SLOTS.find((entry) => entry.glb === fileName);
    if (slot && logoTexture) applyTextureToSlot(root, SLOT_MATERIAL_NAME, logoTexture);
  };

  useFrame((_state, delta) => {
    if (!opening || !doorRef.current) return;
    const target = -Math.PI / 2;
    doorRef.current.rotation.y = Math.max(target, doorRef.current.rotation.y - delta * 2.2);
    if (doorRef.current.rotation.y <= target + 0.02) onEnter();
  });

  return (
    <group>
      <GlbModel fileName="sidewalk-base.glb" position={[0, 0, 0]} />
      <GlbModel fileName="facade.glb" position={[0, 0, 0]} />
      <GlbModel fileName="display-window.glb" position={[-1.6, 0, 0.1]} />
      <GlbModel fileName="planter.glb" position={[1.8, 0, 0.6]} />
      <GlbModel fileName="signboard.glb" position={[0, 2.6, 0.1]} onReady={attachLogo("signboard.glb")} />
      <GlbModel fileName="street-lamp.glb" position={[-2.6, 0, 0.8]} onReady={attachLogo("street-lamp.glb")} />
      <group
        ref={doorRef}
        position={[0.5, 0, 0.2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setOpening(true)}
      >
        <GlbModel fileName="entrance-door.glb" position={[0, 0, 0]} />
        {hovered && !opening && (
          <Html position={[0, 2.1, 0]} center distanceFactor={8}>
            <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
              {t("openDoor")}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default ExteriorScene;
