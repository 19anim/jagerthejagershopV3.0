import { useEffect, useMemo } from "react";
import { mergeParts } from "./merge";
import { UV_METRES, useMats } from "../materials/materials-context";

// Renders parts merged into one mesh per material. `parts` must be memoised by
// the caller: a new array re-merges everything. `extraMaterials` adds one-off
// materials (a coloured motorbike, a texture with text) under their own keys.
const MergedMeshes = ({ parts, extraMaterials, castShadow = true, receiveShadow = true, ...groupProps }) => {
  const shared = useMats();
  const mats = extraMaterials ? { ...shared, ...extraMaterials } : shared;
  const merged = useMemo(() => mergeParts(parts, UV_METRES), [parts]);
  useEffect(() => () => merged.forEach((g) => g.dispose()), [merged]);
  return (
    <group {...groupProps}>
      {[...merged].map(([key, geometry]) => {
        const material = mats[key];
        if (!material) throw new Error(`Unknown material key: ${key}`);
        return (
          <mesh
            key={key}
            geometry={geometry}
            material={material}
            castShadow={castShadow && !material.transparent && !material.userData.noShadow}
            receiveShadow={receiveShadow}
          />
        );
      })}
    </group>
  );
};

export default MergedMeshes;
