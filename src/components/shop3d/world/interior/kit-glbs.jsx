import { useCallback, useState } from "react";
import { useCursor } from "@react-three/drei";
import { Box3 } from "three";
import GlbModel from "../../glb-model.component";
import { useMats } from "../materials/materials-context";
import { COUNTER, FLOOR_Y, TASTING_BAR } from "../../../../utils/shop3d/layout";

// The old flat-colour kit GLBs reuse the shared PBR set by material name.
const REMAP = { metal_gold: "brass", dark: "black", paint_green: "green", paint_midgreen: "greenMid", accent_orange: "orange", glass_smoked: "smokedGlass" };

const useRematerial = () => {
  const mats = useMats();
  return useCallback(
    (root) => {
      if (root.userData.kitReady) return;
      root.traverse((o) => {
        if (!o.isMesh) return;
        const key = REMAP[o.material?.name];
        if (key) o.material = mats[key];
        o.castShadow = true;
        o.receiveShadow = true;
      });
      // Some kit GLBs are centred, not base-pivoted: drop them onto their surface.
      const box = new Box3().setFromObject(root);
      root.position.y -= box.min.y;
      root.userData.kitReady = true;
    },
    [mats]
  );
};

const Clickable = ({ onSelect, children }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <group
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        if (event.delta > 6) return;
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </group>
  );
};

const KitGlbs = ({ onCheckout, onOpenCart }) => {
  const ready = useRematerial();
  const T = TASTING_BAR.top;
  const z = (TASTING_BAR.z0 + TASTING_BAR.z1) / 2;
  return (
    <group>
      {/* POS terminal — the checkout trigger; screen faces the customer (−x). */}
      <Clickable onSelect={onCheckout}>
        <GlbModel fileName="pos-terminal.glb" position={[3.3, COUNTER.top, 2.75]} rotationY={-Math.PI / 2} onReady={ready} />
      </Clickable>
      <GlbModel fileName="desk-phone.glb" position={[3.5, COUNTER.top, 3.3]} rotationY={1.35} onReady={ready} />
      <GlbModel fileName="gift-box.glb" position={[3.45, COUNTER.top, 1.35]} rotationY={-Math.PI / 2} onReady={ready} />
      {/* A nested stack of shopping baskets by the door opens the cart. */}
      <Clickable onSelect={onOpenCart}>
        {[0, 1, 2].map((i) => (
          <GlbModel key={i} fileName="shopping-basket.glb" position={[1.1, FLOOR_Y + i * 0.09, 4.95]} rotationY={0.2} onReady={ready} />
        ))}
      </Clickable>
      {/* Bar tools on the tasting bar. */}
      <GlbModel fileName="drinking-glass.glb" position={[3.0, T, z]} onReady={ready} />
      <GlbModel fileName="drinking-glass.glb" position={[3.14, T, z + 0.05]} onReady={ready} />
      <GlbModel fileName="jigger.glb" position={[3.4, T, z]} onReady={ready} />
      <GlbModel fileName="pourer.glb" position={[3.62, T, z]} onReady={ready} />
      <GlbModel fileName="shaker.glb" position={[3.88, T, z]} onReady={ready} />
      <GlbModel fileName="flask.glb" position={[4.15, T, z]} rotationY={-0.4} onReady={ready} />
    </group>
  );
};

export default KitGlbs;
