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

const ExteriorScene = ({ onEnter, onExit, inside = false }) => {
  const { t } = useLocale();
  const logoTexture = useLogoTexture();
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);
  const enteredRef = useRef(false);
  const doorRef = useRef();
  useCursor(hovered);

  // Clicking the door means "enter" from the street and "exit" once inside.
  const handleDoorClick = () => {
    if (inside) {
      onExit?.();
    } else {
      setOpening(true);
    }
  };

  // Once we're back outside (inside → false), swing the leaf shut and re-arm the
  // one-shot entry trigger so the door can be opened and entered again.
  useEffect(() => {
    if (inside) return;
    setOpening(false);
    enteredRef.current = false;
    if (doorRef.current) doorRef.current.rotation.y = 0;
  }, [inside]);

  const attachLogo = (fileName) => (root) => {
    const slot = LOGO_SLOTS.find((entry) => entry.glb === fileName);
    if (slot && logoTexture) applyTextureToSlot(root, SLOT_MATERIAL_NAME, logoTexture);
  };

  useFrame((_state, delta) => {
    if (!opening || !doorRef.current) return;
    // Contract: animate rotationY 0 → −1.6 rad to swing the leaf inward.
    const target = -1.6;
    doorRef.current.rotation.y = Math.max(target, doorRef.current.rotation.y - delta * 2.2);
    // Trigger the walk-in once, as the door finishes swinging open.
    if (doorRef.current.rotation.y <= target + 0.02 && !enteredRef.current) {
      enteredRef.current = true;
      onEnter();
    }
  });

  return (
    <group>
      {/* Placement from the authoritative README/scene-placement contract for the
          enlarged 06 Building-envelope set. floor-interior is 0.06 m thick (walking
          surface y = 0.06). Interior clear 9.5 × 11.0 × 3.6 m; shopfront faces +z
          with the front wall face at z ≈ 5.6. */}
      <GlbModel fileName="sidewalk-base.glb" position={[0, 0, 6.9]} />
      {/* wall-set is the complete enclosing building; sits on the floor at y = 0.06.
          Outer 9.90 × 11.40, H 3.80, t 0.20. Openings (README): door x 1.63→2.97
          (centre 2.30), window x −3.39→−1.71 (centre −2.55, sill 0). */}
      <GlbModel fileName="wall-set.glb" position={[0, 0.06, 0]} />
      {/* Roof pivot is the ceiling underside (visible ceiling face); place at y = 3.66. */}
      <GlbModel fileName="roof.glb" position={[0, 3.66, 0]} />
      {/* Doorway frame drops into the wall's door opening (centre x 2.30). */}
      <GlbModel fileName="doorway-frame.glb" position={[2.30, 0.06, 5.60]} />
      {/* Display window STANDS ON THE FLOOR — it carries its own 0.35 m plinth, so
          y = floor 0.06 (not a sill height). Fills the window hole (centre x −2.55). */}
      <GlbModel fileName="display-window.glb" position={[-2.55, 0.06, 5.60]} />
      {/* Sign on the fascia above the openings. */}
      <GlbModel fileName="signboard.glb" position={[0, 3.5, 5.72]} onReady={attachLogo("signboard.glb")} />
      <GlbModel fileName="planter.glb" position={[4.4, 0, 6.2]} />
      <GlbModel fileName="street-lamp.glb" position={[-4.9, 0, 6.4]} onReady={attachLogo("street-lamp.glb")} />
      {/* The door's pivot is its HINGE AXIS (local x = 0, leaf extends +x). Per
          the contract, the group origin = doorway_frame x − 0.50 (= 1.80), y + 0.03
          threshold tread top (= 0.09), at the front wall face (z 5.60); it swings
          inward (rotationY 0 → −1.6 rad) about that hinge. */}
      <group
        ref={doorRef}
        position={[1.80, 0.09, 5.60]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleDoorClick}
      >
        <GlbModel fileName="entrance-door.glb" position={[0, 0, 0]} />
        {hovered && (!opening || inside) && (
          <Html position={[0.5, 2.4, 0]} center distanceFactor={8}>
            <div className="whitespace-nowrap rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
              {inside ? t("exitDoor") : t("openDoor")}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default ExteriorScene;
