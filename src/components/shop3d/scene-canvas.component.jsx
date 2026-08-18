import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import ExteriorScene from "./exterior-scene.component";
import InteriorScene from "./interior-scene.component";

const SceneCanvas = ({ bottles }) => {
  const [view, setView] = useState("exterior");

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 6], fov: 55 }}
      shadows
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
        {view === "exterior" ? (
          <ExteriorScene onEnter={() => setView("interior")} />
        ) : (
          <InteriorScene bottles={bottles} />
        )}
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={9}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        enableDamping
      />
    </Canvas>
  );
};

export default SceneCanvas;
