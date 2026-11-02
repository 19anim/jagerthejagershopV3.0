import { useEffect, useMemo, useState } from "react";
import { useCursor, useGLTF } from "@react-three/drei";
import { Box3, BufferAttribute, Matrix4 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { partMatrix } from "../geometry/merge";
import { useMats } from "../materials/materials-context";
import { getGlbUrl } from "../../../../utils/shop3d.assets";
import { COUNTER, FLOOR_Y, TASTING_BAR } from "../../../../utils/shop3d/layout";

// The old flat-colour kit GLBs reuse the shared PBR set by material name.
const REMAP = { metal_gold: "brass", dark: "black", paint_green: "green", paint_midgreen: "greenMid", accent_orange: "orange", glass_smoked: "smokedGlass" };
const KEEP = ["position", "normal", "uv"];

// Flattens a kit GLB into one geometry per material, with every placement baked
// in. These models are built from dozens of small parts (a basket has ~30), so
// drawing them part by part costs hundreds of draw calls; merged they cost a few.
// Some kit GLBs are centred rather than base-pivoted, so each is dropped onto y = 0 first.
const flattenKit = (scene, mats, placements) => {
  scene.updateMatrixWorld(true);
  const ground = new Matrix4().makeTranslation(0, -new Box3().setFromObject(scene).min.y, 0);
  const byMaterial = new Map();
  for (const placement of placements) {
    const place = partMatrix({ position: placement.position, rotation: [0, placement.rotationY || 0, 0] }).multiply(ground);
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const key = REMAP[o.material?.name];
      const material = key ? mats[key] : o.material;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const name of Object.keys(g.attributes)) if (!KEEP.includes(name)) g.deleteAttribute(name);
      if (!g.attributes.uv) g.setAttribute("uv", new BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.applyMatrix4(place.clone().multiply(o.matrixWorld));
      if (!byMaterial.has(material)) byMaterial.set(material, []);
      byMaterial.get(material).push(g);
    });
  }
  return [...byMaterial].map(([material, list]) => {
    const geometry = mergeGeometries(list, false);
    list.forEach((g) => g.dispose());
    return { material, geometry };
  });
};

// One kit GLB drawn at one or more placements ({ position, rotationY }).
// `placements` must be stable (module-level) so the merge runs once.
const KitModel = ({ fileName, placements }) => {
  const { scene } = useGLTF(getGlbUrl(fileName));
  const mats = useMats();
  const parts = useMemo(() => flattenKit(scene, mats, placements), [scene, mats, placements]);
  useEffect(() => () => parts.forEach((p) => p.geometry.dispose()), [parts]);
  return parts.map((p, i) => <mesh key={i} geometry={p.geometry} material={p.material} receiveShadow />);
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

const T = TASTING_BAR.top;
const BAR_Z = (TASTING_BAR.z0 + TASTING_BAR.z1) / 2;
const PLACE = {
  pos: [{ position: [3.3, COUNTER.top, 2.75], rotationY: -Math.PI / 2 }], // screen faces the customer (−x)
  phone: [{ position: [3.5, COUNTER.top, 3.3], rotationY: 1.35 }],
  gift: [{ position: [3.45, COUNTER.top, 1.35], rotationY: -Math.PI / 2 }],
  baskets: [0, 1, 2].map((i) => ({ position: [1.1, FLOOR_Y + i * 0.09, 4.95], rotationY: 0.2 })), // a nested stack by the door
  glasses: [{ position: [3.0, T, BAR_Z] }, { position: [3.14, T, BAR_Z + 0.05] }],
  jigger: [{ position: [3.4, T, BAR_Z] }],
  pourer: [{ position: [3.62, T, BAR_Z] }],
  shaker: [{ position: [3.88, T, BAR_Z] }],
  flask: [{ position: [4.15, T, BAR_Z], rotationY: -0.4 }],
};

const KitGlbs = ({ onCheckout, onOpenCart }) => (
  <group>
    {/* POS terminal — the checkout trigger. */}
    <Clickable onSelect={onCheckout}>
      <KitModel fileName="pos-terminal.glb" placements={PLACE.pos} />
    </Clickable>
    <KitModel fileName="desk-phone.glb" placements={PLACE.phone} />
    <KitModel fileName="gift-box.glb" placements={PLACE.gift} />
    {/* The basket stack opens the cart. */}
    <Clickable onSelect={onOpenCart}>
      <KitModel fileName="shopping-basket.glb" placements={PLACE.baskets} />
    </Clickable>
    {/* Bar tools on the tasting bar. */}
    <KitModel fileName="drinking-glass.glb" placements={PLACE.glasses} />
    <KitModel fileName="jigger.glb" placements={PLACE.jigger} />
    <KitModel fileName="pourer.glb" placements={PLACE.pourer} />
    <KitModel fileName="shaker.glb" placements={PLACE.shaker} />
    <KitModel fileName="flask.glb" placements={PLACE.flask} />
  </group>
);

export default KitGlbs;
