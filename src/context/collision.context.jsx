import { createContext, useContext, useMemo, useRef } from "react";

// Player half-width used to inflate fixture AABBs (Minkowski sum), so the walking
// camera can be treated as a single point in the collision test. ~0.30 m ≈ a
// person's shoulder half-width: small enough to slip through the ~0.8 m gap beside
// the cashier counter, large enough that you never clip a corner.
export const PLAYER_RADIUS = 0.3;

// Shared store of world-space, player-inflated Box3 colliders for blocking
// fixtures. The store is a REF, not state: colliders are consumed inside the
// WalkControls render loop, so registering one must never re-render the canvas.
const CollisionContext = createContext(null);

export const CollisionProvider = ({ children }) => {
  const colliders = useRef([]); // Box3[] in WORLD space, already inflated by PLAYER_RADIUS

  const api = useMemo(
    () => ({
      colliders,
      // Register a collider and return its own unregister (React-idiomatic
      // cleanup: callers just `return collision.register(box)` from an effect).
      register(box) {
        colliders.current.push(box);
        return () => {
          const index = colliders.current.indexOf(box);
          if (index !== -1) colliders.current.splice(index, 1);
        };
      },
    }),
    []
  );

  return <CollisionContext.Provider value={api}>{children}</CollisionContext.Provider>;
};

export const useCollision = () => useContext(CollisionContext);

export { CollisionContext };
