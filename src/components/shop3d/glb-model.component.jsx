import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { getGlbUrl } from "../../utils/shop3d.assets";

const GlbModel = ({ fileName, position = [0, 0, 0], rotationY = 0, scale = 1, onReady, children, ...groupProps }) => {
  const { scene } = useGLTF(getGlbUrl(fileName));
  const cloned = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = Array.isArray(child.material)
          ? child.material.map((material) => material.clone())
          : child.material.clone();
      }
    });
    return copy;
  }, [scene]);

  useEffect(() => {
    if (onReady) onReady(cloned);
  }, [cloned, onReady]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale} {...groupProps}>
      <primitive object={cloned} />
      {children}
    </group>
  );
};

export const preloadGlb = (fileName) => useGLTF.preload(getGlbUrl(fileName));

export default GlbModel;
