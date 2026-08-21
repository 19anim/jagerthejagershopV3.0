import { Suspense, useContext, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import ExteriorScene from "./exterior-scene.component";
import InteriorScene from "./interior-scene.component";
import WalkControls from "./walk-controls.component";
import { CartContext } from "../../context/cart.context";
import { CollisionProvider } from "../../context/collision.context";

// wall-set is a full enclosing building (06 Building-envelope README): outer
// footprint 9.90 × 11.40 m, clear interior 9.5 × 11.0 × 3.6 m, sits on the 0.06 m
// floor, shopfront facing +z with the front wall face at z ≈ 5.6. The door opening
// is x 1.63 → 2.97 (centre 2.30). Interior furnishings live INSIDE it at the same
// origin (floor-interior drops straight in), the back-wall shelves at z ≈ −5.3.
// The walls + roof occlude the interior from the street, so entry is a camera
// walk-in through the door opening, not a scene swap — and exit reverses the dolly.
const EXTERIOR_POSE = { position: new Vector3(2.30, 1.7, 11.0), target: new Vector3(2.30, 1.5, 5.6) };
const INTERIOR_POSE = { position: new Vector3(1.8, 1.6, 3.6), target: new Vector3(-0.8, 1.2, -4.5) };

// Smoothly lerps the camera + OrbitControls target toward a pose, then reports
// arrival. Used both ways: entry → INTERIOR_POSE, exit → EXTERIOR_POSE.
const CameraDolly = ({ active, pose, controlsRef, onArrived }) => {
  const desired = useRef(new Vector3());
  useFrame((state, delta) => {
    if (!active) return;
    const t = Math.min(1, delta * 1.6);
    state.camera.position.lerp(pose.position, t);
    if (controlsRef.current) {
      desired.current.copy(controlsRef.current.target).lerp(pose.target, t);
      controlsRef.current.target.copy(desired.current);
      controlsRef.current.update();
    }
    if (state.camera.position.distanceTo(pose.position) < 0.05) onArrived();
  });
  return null;
};

const SceneCanvas = ({ bottles, accessories, phase, setPhase, moveRef }) => {
  const controlsRef = useRef();
  const { isCartOpen } = useContext(CartContext);

  const entering = phase === "entering";
  const exiting = phase === "exiting";
  const inside = phase === "inside";
  const outside = phase === "outside";

  return (
    <Canvas dpr={[1, 2]} camera={{ position: EXTERIOR_POSE.position.toArray(), fov: 55 }} shadows>
      <CollisionProvider>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
        <ExteriorScene
          inside={inside || entering}
          onEnter={() => setPhase("entering")}
          onExit={() => setPhase("exiting")}
        />
        {/* Interior furnishings sit INSIDE the building at the shared origin;
            they mount as soon as entry begins and stay mounted until we are back
            outside, so the street view stays clean. */}
        {!outside && <InteriorScene bottles={bottles} accessories={accessories} />}
      </Suspense>

      <CameraDolly
        active={entering}
        pose={INTERIOR_POSE}
        controlsRef={controlsRef}
        onArrived={() => setPhase("inside")}
      />
      <CameraDolly
        active={exiting}
        pose={EXTERIOR_POSE}
        controlsRef={controlsRef}
        onArrived={() => setPhase("outside")}
      />

      {/* Outside: orbit the storefront. Inside: walk as a person. During the
          entering/exiting dolly neither is active so the lerp owns the camera. */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enabled={outside}
        target={EXTERIOR_POSE.target.toArray()}
        minDistance={2}
        maxDistance={13}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        enableDamping
      />
      {/* Freeze walking while the cart overlay is open so keys/drag behind the
          blur don't move the camera. */}
      <WalkControls enabled={inside && !isCartOpen} moveRef={moveRef} />
      </CollisionProvider>
    </Canvas>
  );
};

export default SceneCanvas;
