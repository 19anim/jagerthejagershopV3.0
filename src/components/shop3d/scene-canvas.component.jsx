import { Suspense, useContext, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader, PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import WalkControls from "./walk-controls.component";
import { CartContext } from "../../context/cart.context";
import { CollisionProvider } from "../../context/collision.context";
import { QUALITY, detectTier } from "./world/quality";
import { QualityContext } from "./world/quality-context";
import { MaterialsProvider } from "./world/materials/materials-context";
import Atmosphere from "./world/atmosphere";
import CameraDolly from "./world/camera-dolly";
import World from "./world/world";
import { ENTER_PATH, EXIT_PATH, INSIDE_BOUNDS, OUTSIDE_BOUNDS, START_POSE, groundHeight } from "../../utils/shop3d/layout";

// The 3D shop. You start on the far sidewalk and walk (same controls inside and
// out); clicking the door dollies you in, clicking it again dollies you out.
const SceneCanvas = ({ products, phase, setPhase, moveRef }) => {
  const { isCartOpen } = useContext(CartContext);
  const [tier, setTier] = useState(() => detectTier(typeof window === "undefined" ? undefined : window));
  const quality = QUALITY[tier];
  const inside = phase === "inside";
  const outside = phase === "outside";

  return (
    <>
      <Canvas
        dpr={quality.dpr}
        shadows="soft"
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: START_POSE.position, fov: 60, near: 0.08, far: 160 }}
        onCreated={({ gl, scene, camera }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          camera.lookAt(...START_POSE.target);
          if (import.meta.env.DEV) window.__shop3d = { gl, scene, camera };
        }}
      >
        <QualityContext.Provider value={quality}>
          <PerformanceMonitor bounds={() => [28, 50]} flipflops={1} onDecline={() => setTier("low")} />
          <CollisionProvider>
            <Suspense fallback={null}>
              <MaterialsProvider>
                <Atmosphere />
                <World products={products} phase={phase} setPhase={setPhase} />
              </MaterialsProvider>
            </Suspense>
            <CameraDolly active={phase === "entering"} path={ENTER_PATH} onArrived={() => setPhase("inside")} />
            <CameraDolly active={phase === "exiting"} path={EXIT_PATH} onArrived={() => setPhase("outside")} />
            {/* Freeze walking while the cart overlay is open so keys/drag behind the blur don't move the camera. */}
            <WalkControls
              enabled={(inside || outside) && !isCartOpen}
              moveRef={moveRef}
              bounds={inside ? INSIDE_BOUNDS : OUTSIDE_BOUNDS}
              groundAt={groundHeight}
            />
          </CollisionProvider>
        </QualityContext.Provider>
      </Canvas>
      <Loader />
    </>
  );
};

export default SceneCanvas;
