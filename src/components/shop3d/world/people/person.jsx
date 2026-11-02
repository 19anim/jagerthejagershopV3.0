import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { AnimationMixer, LoopOnce, LoopRepeat } from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { PEOPLE_URLS } from "./people-assets";

export const OUTFITS = {
  staff: { body: "#31533e", accent: "#dd5a12" },
  localA: { body: "#2f5d8a", accent: "#2b2b2b" },
  localB: { body: "#b04a5a", accent: "#2f2f38" },
  localC: { body: "#3f6f8f", accent: "#d8d0c0" },
  localD: { body: "#e0c36a", accent: "#4a3b2c" },
};
const HAIRS = ["hair_beard", "hair_parted", "hair_buzzed", "hair_long", "hair_buns"];

// One rigged character (skinned clone of the shared GLB) with its own mixer.
// The ref exposes { root, play(name, { once, fade, timeScale }), isPlaying(name) };
// routines move `root` directly every frame.
const Person = forwardRef(({ body, hair = [], outfit, position, yaw = 0 }, ref) => {
  const { scene, animations } = useGLTF(PEOPLE_URLS[body]);
  const root = useMemo(() => {
    const copy = cloneSkinned(scene);
    const colours = OUTFITS[outfit];
    copy.traverse((o) => {
      if (HAIRS.includes(o.name)) o.visible = hair.includes(o.name);
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false; // skinned bounds do not follow the animation
      const name = o.material?.name;
      if (name === "MI_Suit" || name === "MI_Accent") {
        const m = o.material.clone();
        m.color.set(name === "MI_Suit" ? colours.body : colours.accent);
        o.material = m;
      }
    });
    return copy;
  }, [scene, outfit, hair]);

  const mixer = useMemo(() => new AnimationMixer(root), [root]);
  const actions = useMemo(() => Object.fromEntries(animations.map((clip) => [clip.name, mixer.clipAction(clip)])), [animations, mixer]);
  const current = useRef(null);

  const api = useMemo(
    () => ({
      root,
      play(name, { once = false, fade = 0.3, timeScale = 1 } = {}) {
        const next = actions[name];
        if (!next) return;
        next.timeScale = timeScale;
        if (current.current === next && !once) return;
        next.reset();
        next.setLoop(once ? LoopOnce : LoopRepeat, Infinity);
        next.clampWhenFinished = once;
        next.enabled = true;
        next.setEffectiveWeight(1);
        if (current.current && current.current !== next) next.crossFadeFrom(current.current, fade, false);
        next.play();
        current.current = next;
      },
      isPlaying(name) {
        const action = actions[name];
        return Boolean(action && current.current === action && action.isRunning());
      },
    }),
    [root, actions]
  );
  useImperativeHandle(ref, () => api, [api]);

  useLayoutEffect(() => {
    root.position.fromArray(position);
    root.rotation.y = yaw;
  }, [root]); // eslint-disable-line react-hooks/exhaustive-deps -- initial placement only; routines move it after

  useEffect(() => {
    api.play("Idle_Loop", { fade: 0 });
    return () => mixer.stopAllAction();
  }, [api, mixer]);

  useFrame((_state, delta) => mixer.update(Math.min(delta, 0.1)));
  return <primitive object={root} />;
});
Person.displayName = "Person";

export default Person;
