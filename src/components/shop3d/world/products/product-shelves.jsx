import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Html, useCursor, useGLTF } from "@react-three/drei";
import { BoxGeometry, Matrix4, MeshBasicMaterial, Quaternion, TextureLoader, Vector3 } from "three";
import BottlePanel from "./bottle-panel";
import { extractBottleParts, hasLabelSlot } from "./bottle-parts";
import { useQuality } from "../quality-context";
import { CartContext } from "../../../../context/cart.context";
import { useLocale } from "../../../../context/locale.context";
import { getGlbUrl } from "../../../../utils/shop3d.assets";
import { getLabelTextureUrl } from "../../../../utils/shop3d.utils";
import { BOTTLE_DIMS, buildShelfInstances, groupInstances } from "../../../../utils/shop3d/product-blocks";
import { SHELF_RUNS } from "../../../../utils/shop3d/layout";

const UP = new Vector3(0, 1, 0);
const ONE = new Vector3(1, 1, 1);
const HOVER = new Matrix4().makeScale(1.05, 1.05, 1.05);
const PICK = new MeshBasicMaterial({ colorWrite: false, depthWrite: false }); // invisible, but raycastable
const NO_RAYCAST = () => null;
const scratch = new Matrix4();

const useLabelTexture = (product, enabled) => {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const loaded = new TextureLoader().load(getLabelTextureUrl(product));
    loaded.flipY = false;
    setTexture(loaded);
    return () => loaded.dispose();
  }, [product, enabled]);
  return texture;
};

// All bottles of one product: one InstancedMesh per GLB mesh (drawn, never
// raycast) plus one invisible box InstancedMesh used for hover and click.
const ProductGroup = ({ group, onSelect }) => {
  const { scene } = useGLTF(getGlbUrl(group.model));
  const slot = useMemo(() => hasLabelSlot(scene), [scene]);
  const label = useLabelTexture(group.product, slot);
  const parts = useMemo(() => extractBottleParts(scene, label), [scene, label]);
  useEffect(
    () => () =>
      parts.forEach((p) => {
        p.geometry.dispose();
        p.material.dispose();
      }),
    [parts]
  );
  const dims = BOTTLE_DIMS[group.model];
  const pickGeometry = useMemo(() => new BoxGeometry(dims.w, dims.h, dims.d).translate(0, dims.h / 2, 0), [dims]);
  const base = useMemo(
    () => group.instances.map((i) => new Matrix4().compose(new Vector3(...i.position), new Quaternion().setFromAxisAngle(UP, i.rotationY), ONE)),
    [group.instances]
  );
  const meshes = useRef([]);
  const pick = useRef();
  const hovered = useRef(-1);
  const [hot, setHot] = useState(false);
  useCursor(hot);

  const all = () => [...meshes.current, pick.current].filter(Boolean);
  const write = (index, matrix) => {
    for (const m of all()) {
      m.setMatrixAt(index, matrix);
      m.instanceMatrix.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    for (const m of all()) {
      base.forEach((matrix, i) => m.setMatrixAt(i, matrix));
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
    hovered.current = -1;
  }, [base, parts]); // eslint-disable-line react-hooks/exhaustive-deps

  const hover = (index) => {
    if (hovered.current === index) return;
    if (hovered.current >= 0) write(hovered.current, base[hovered.current]);
    hovered.current = index;
    if (index >= 0) write(index, scratch.copy(base[index]).multiply(HOVER));
    setHot(index >= 0);
  };

  return (
    <group>
      {parts.map((p, k) => (
        <instancedMesh
          key={`${group.key}:${k}:${p.material.uuid}`}
          ref={(el) => {
            meshes.current[k] = el;
          }}
          args={[p.geometry, p.material, base.length]}
          raycast={NO_RAYCAST}
          receiveShadow
        />
      ))}
      <instancedMesh
        ref={pick}
        args={[pickGeometry, PICK, base.length]}
        onPointerMove={(event) => {
          event.stopPropagation();
          hover(event.instanceId);
        }}
        onPointerOut={() => hover(-1)}
        onClick={(event) => {
          if (event.delta > 6) return; // a drag-to-look, not a click
          event.stopPropagation();
          onSelect(group.instances[event.instanceId]);
        }}
      />
    </group>
  );
};

// Every real product, repeated in blocks across the shelves. One panel at a time.
const ProductShelves = ({ products }) => {
  const quality = useQuality();
  const groups = useMemo(
    () => groupInstances(buildShelfInstances({ products, runs: SHELF_RUNS, maxDepth: quality.maxDepth, maxInstances: quality.maxInstances })),
    [products, quality]
  );
  const [selected, setSelected] = useState(null);
  useEffect(() => setSelected(null), [groups]);
  // Read contexts here (inside the R3F tree); <Html> renders a separate root without them.
  const { addItemToCart } = useContext(CartContext);
  const { t } = useLocale();
  return (
    <group onPointerMissed={() => setSelected(null)}>
      {groups.map((group) => (
        <ProductGroup key={group.key} group={group} onSelect={setSelected} />
      ))}
      {selected && (
        <Html position={[selected.position[0], selected.position[1] + selected.height + 0.1, selected.position[2]]} zIndexRange={[100, 0]}>
          <BottlePanel product={selected.product} t={t} onAdd={(product) => addItemToCart(product, 1)} />
        </Html>
      )}
    </group>
  );
};

export default ProductShelves;
