import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BackSide, BoxGeometry, Color, FogExp2, Mesh, MeshBasicMaterial, PMREMGenerator, Scene,
  ShaderMaterial, SphereGeometry, Vector2, Vector3,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useQuality } from "./quality-context";
import { isInsideShop, STREET_PROPS } from "../../../utils/shop3d/layout";

export const SUN_DIR = new Vector3(-1, 0.22, -0.15).normalize();
const FOG_COLOUR = new Color("#5b5873");
const SKY_GEO = new SphereGeometry(140, 32, 16);

const skyMaterial = () =>
  new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { sun: { value: SUN_DIR } },
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec3 vDir; uniform vec3 sun;
      void main(){
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 zen = vec3(0.09, 0.12, 0.25), mid = vec3(0.45, 0.32, 0.45), hor = vec3(1.0, 0.55, 0.32);
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h));
        c = mix(c, zen, smoothstep(0.15, 0.65, h));
        float s = max(dot(normalize(vDir), sun), 0.0);
        c += vec3(1.0, 0.55, 0.25) * pow(s, 24.0) * 0.9 + vec3(1.0, 0.45, 0.2) * pow(s, 4.0) * 0.25;
        if (vDir.y < 0.0) c = mix(hor * 0.5, vec3(0.2, 0.18, 0.22), clamp(-vDir.y * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

const Sky = () => {
  const ref = useRef();
  const material = useMemo(skyMaterial, []);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return <mesh ref={ref} geometry={SKY_GEO} material={material} renderOrder={-1} frustumCulled={false} />;
};

// Two prefiltered environment maps: the dusk sky outside, a warm dim room inside.
const useEnvironments = () => {
  const gl = useThree((state) => state.gl);
  const maps = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const outdoor = new Scene();
    outdoor.add(new Mesh(new SphereGeometry(10, 32, 16), skyMaterial()));
    const indoor = new Scene();
    indoor.add(new Mesh(new BoxGeometry(10, 4, 11), new MeshBasicMaterial({ color: "#2a1f17", side: BackSide })));
    const strip = (x, z, w, d, colour, power) => {
      const m = new Mesh(new BoxGeometry(w, 0.05, d), new MeshBasicMaterial({ color: new Color(colour).multiplyScalar(power) }));
      m.position.set(x, 1.95, z);
      indoor.add(m);
    };
    strip(-3, 0, 0.3, 8, "#ffd7a3", 6);
    strip(1, 0, 0.3, 8, "#ffd7a3", 6);
    strip(0, -5, 8, 0.3, "#ffcf8a", 3);
    const result = { outdoor: pmrem.fromScene(outdoor, 0.04).texture, indoor: pmrem.fromScene(indoor, 0.04).texture };
    pmrem.dispose();
    return result;
  }, [gl]);
  useEffect(() => () => {
    maps.outdoor.dispose();
    maps.indoor.dispose();
  }, [maps]);
  return maps;
};

const SKY_OUT = new Color("#7f8fbf");
const GROUND_OUT = new Color("#3a2c25");
const SKY_IN = new Color("#ffe7c4");
const GROUND_IN = new Color("#3a2a1c");

const LampSpot = ({ lamp }) => {
  const ref = useRef();
  useEffect(() => {
    const light = ref.current;
    light.target.position.set(lamp.x, 0, lamp.z + lamp.dir * 2.6);
    light.target.updateMatrixWorld();
  }, [lamp]);
  return <spotLight ref={ref} color="#ffcf8f" intensity={240} distance={26} angle={1.0} penumbra={0.6} decay={2} position={[lamp.x, 7.55, lamp.z + lamp.dir * 1.9]} />;
};

const SUN_TARGET = new Vector3(0, 4, 7.5);
const Sun = ({ size }) => {
  const ref = useRef();
  useEffect(() => {
    ref.current.target.position.copy(SUN_TARGET);
    ref.current.target.updateMatrixWorld();
  }, []);
  const position = SUN_TARGET.clone().addScaledVector(SUN_DIR, 60).toArray();
  return (
    <directionalLight
      ref={ref}
      color="#ffad70"
      intensity={1.6}
      position={position}
      castShadow
      shadow-mapSize={[size, size]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-17}
      shadow-camera-right={17}
      shadow-camera-top={17}
      shadow-camera-bottom={-17}
      shadow-camera-near={1}
      shadow-camera-far={130}
    />
  );
};

const TRACKS = [
  { p: [-3.4, 3.5, -2.0], t: [-4.6, 1.2, -2.0] },
  { p: [-0.95, 3.5, -1.3], t: [-0.95, 0, -1.3], shadow: true },
  { p: [-1.0, 3.5, -4.0], t: [-1.0, 1.2, -5.4] },
  { p: [-1.6, 3.5, 3.0], t: [-2.4, 0.8, 4.6] },
];
const TrackSpot = ({ track, shadowSize }) => {
  const ref = useRef();
  useEffect(() => {
    ref.current.target.position.fromArray(track.t);
    ref.current.target.updateMatrixWorld();
  }, [track]);
  return (
    <spotLight
      ref={ref}
      color="#ffd7a3"
      intensity={30}
      distance={10}
      angle={0.65}
      penumbra={0.7}
      decay={2}
      position={track.p}
      castShadow={Boolean(track.shadow)}
      shadow-mapSize={[shadowSize, shadowSize]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
};

const Bloom = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), 0.5, 0.45, 0.9));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame(() => composer.render(), 1); // priority 1: the composer takes over rendering
  return null;
};

// Everything that sets the mood: sky, environment, fog, exposure, lights, bloom.
// "Inside-ness" eases from 0 to 1 as the camera crosses the door, driving the
// fog density, exposure, hemisphere colours and which environment map is used.
const Atmosphere = () => {
  const quality = useQuality();
  const { scene, gl } = useThree();
  const envs = useEnvironments();
  const hemi = useRef();
  const k = useRef(0);
  const fog = useMemo(() => new FogExp2(FOG_COLOUR, 0.016), []);

  useEffect(() => {
    scene.fog = fog;
    scene.environment = envs.outdoor;
    return () => {
      scene.fog = null;
      scene.environment = null;
    };
  }, [scene, fog, envs]);

  useFrame(({ camera }, delta) => {
    const target = isInsideShop(camera.position.x, camera.position.z) ? 1 : 0;
    k.current += (target - k.current) * Math.min(1, delta * 3);
    const v = k.current;
    fog.density = 0.016 + (0.003 - 0.016) * v;
    gl.toneMappingExposure = 1.1 + (1.0 - 1.1) * v;
    const env = v > 0.5 ? envs.indoor : envs.outdoor;
    if (scene.environment !== env) scene.environment = env;
    if (hemi.current) {
      hemi.current.color.copy(SKY_OUT).lerp(SKY_IN, v);
      hemi.current.groundColor.copy(GROUND_OUT).lerp(GROUND_IN, v);
      hemi.current.intensity = 0.35 + 0.05 * v;
    }
  });

  return (
    <>
      <Sky />
      <hemisphereLight ref={hemi} args={[SKY_OUT, GROUND_OUT, 0.35]} />
      <Sun size={quality.shadowMapSize} />
      <pointLight color="#ffb866" intensity={6} distance={9} decay={2} position={[-1.5, 2.3, 6.4]} />
      {quality.lampLights && STREET_PROPS.lamps.filter((l) => l.light).map((l) => <LampSpot key={`${l.x}:${l.z}`} lamp={l} />)}
      {(quality.tier === "high" ? TRACKS : TRACKS.slice(0, 2)).map((track) => (
        <TrackSpot key={track.p.join(":")} track={track} shadowSize={Math.min(1024, quality.shadowMapSize)} />
      ))}
      <pointLight color="#ffc98a" intensity={6} distance={6} decay={2} position={[3.35, 2.5, 2.3]} />
      {quality.tier === "high" && <pointLight color="#ff7a30" intensity={3} distance={4} decay={2} position={[3.6, 2.9, -5.0]} />}
      {quality.bloom && <Bloom />}
    </>
  );
};

export default Atmosphere;
