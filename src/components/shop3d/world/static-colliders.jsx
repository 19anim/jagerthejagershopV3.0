import { useEffect } from "react";
import { Box3, Vector3 } from "three";
import { PLAYER_RADIUS, useCollision } from "../../../context/collision.context";

// Registers layout colliders ({ min: [x,z], max: [x,z] }) with the walk controller,
// inflated by the player radius. `boxes` must be a stable (module-level) array.
const StaticColliders = ({ boxes }) => {
  const collision = useCollision();
  useEffect(() => {
    if (!collision) return undefined;
    const off = boxes.map((b) =>
      collision.register(
        new Box3(
          new Vector3(b.min[0] - PLAYER_RADIUS, -1, b.min[1] - PLAYER_RADIUS),
          new Vector3(b.max[0] + PLAYER_RADIUS, 6, b.max[1] + PLAYER_RADIUS)
        )
      )
    );
    return () => off.forEach((unregister) => unregister());
  }, [collision, boxes]);
  return null;
};

export default StaticColliders;
