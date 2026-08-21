import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3 } from "three";
import { getGlbUrl } from "../../utils/shop3d.assets";
import { useCollision, PLAYER_RADIUS } from "../../context/collision.context";

const GlbModel = ({ fileName, position = [0, 0, 0], rotationY = 0, scale = 1, blocking = false, onReady, children, ...groupProps }) => {
  const { scene } = useGLTF(getGlbUrl(fileName));
  const groupRef = useRef();
  const collision = useCollision(); // null when rendered outside a CollisionProvider
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

  // Register a world-space, player-inflated AABB for blocking fixtures. Fixtures
  // are static, so this runs once (re-keyed only if the identity/transform
  // actually changes) — never per frame.
  useEffect(() => {
    if (!blocking || !collision) return undefined;
    const group = groupRef.current;
    if (!group) return undefined;
    // Box3.setFromObject reads matrixWorld; flush this group and its parents so
    // position/rotation/scale are baked in before we snapshot. Without this the
    // box would land at the origin, unrotated.
    group.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(group);
    box.expandByScalar(PLAYER_RADIUS); // inflate so the player can be tested as a point
    return collision.register(box);
  }, [blocking, collision, cloned, position, rotationY, scale]);

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} scale={scale} {...groupProps}>
      <primitive object={cloned} />
      {children}
    </group>
  );
};

export const preloadGlb = (fileName) => useGLTF.preload(getGlbUrl(fileName));

export default GlbModel;
