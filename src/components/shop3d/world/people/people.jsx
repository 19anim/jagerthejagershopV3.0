import { Component, Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Person from "./person";
import { useQuality } from "../quality-context";
import { createWalker, stepWalker } from "../../../../utils/shop3d/people-paths";
import { FLOOR_Y, PEOPLE, SIDEWALK_Y } from "../../../../utils/shop3d/layout";

const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const WALK_CLIP_SPEED = 1.2; // m/s the Walk_Loop clip is authored for

// Behind the counter: idles, now and then talks or taps the POS, turns to face you when you are near.
const Cashier = ({ spec }) => {
  const ref = useRef();
  const timer = useRef(6);
  const state = useRef("idle");
  useFrame(({ camera }, delta) => {
    const p = ref.current;
    if (!p) return;
    const dx = camera.position.x - spec.spot[0];
    const dz = camera.position.z - spec.spot[2];
    const want = Math.hypot(dx, dz) < 3 ? Math.atan2(dx, dz) : spec.yaw;
    p.root.rotation.y = lerpAngle(p.root.rotation.y, want, Math.min(1, delta * 3));
    timer.current -= delta;
    if (timer.current > 0) return;
    if (state.current === "idle") {
      if (Math.random() < 0.5) {
        p.play("Idle_Talking_Loop");
        state.current = "talk";
        timer.current = 4;
      } else {
        p.play("Interact", { once: true });
        state.current = "interact";
        timer.current = 2.6;
      }
    } else {
      p.play("Idle_Loop");
      state.current = "idle";
      timer.current = 7 + Math.random() * 7;
    }
  });
  return <Person ref={ref} body={spec.body} hair={spec.hair} outfit={spec.outfit} position={spec.spot} yaw={spec.yaw} />;
};

// Walks its path back and forth, pausing for you; the stocker works the shelf at each end.
const Walker = ({ spec }) => {
  const ref = useRef();
  const walker = useRef(createWalker({ points: spec.path, speed: spec.speed, endPause: spec.endPause }));
  const anim = useRef(null);
  const y = spec.inside ? FLOOR_Y : SIDEWALK_Y;
  useFrame(({ camera }, delta) => {
    const p = ref.current;
    if (!p) return;
    const r = stepWalker(walker.current, Math.min(delta, 0.1), [camera.position.x, camera.position.z]);
    walker.current = r.walker;
    p.root.position.set(r.position[0], y, r.position[1]);
    const working = !r.moving && r.walker.wait > 0;
    const yaw = working && spec.endYaws ? spec.endYaws[r.walker.dir < 0 ? 1 : 0] : r.heading;
    p.root.rotation.y = lerpAngle(p.root.rotation.y, yaw, Math.min(1, delta * 6));
    let want = r.moving ? "walk" : "idle";
    if (working && spec.role === "stocker") want = anim.current === "work" || anim.current === "workDone" ? anim.current : "work";
    if (anim.current === "work" && !p.isPlaying("PickUp_Table")) want = "workDone";
    if (want === anim.current) return;
    anim.current = want;
    if (want === "walk") p.play("Walk_Loop", { timeScale: spec.speed / WALK_CLIP_SPEED });
    else if (want === "work") p.play("PickUp_Table", { once: true });
    else p.play("Idle_Loop");
  });
  const start = spec.path[0];
  return <Person ref={ref} body={spec.body} hair={spec.hair} outfit={spec.outfit} position={[start[0], y, start[1]]} yaw={0} />;
};

// On a plastic stool: sitting idle, sometimes chatting.
const Sitter = ({ spec }) => {
  const ref = useRef();
  const timer = useRef(0);
  const talking = useRef(true);
  useFrame((_s, delta) => {
    const p = ref.current;
    if (!p) return;
    timer.current -= delta;
    if (timer.current > 0) return;
    talking.current = !talking.current;
    p.play(talking.current ? "Sitting_Talking_Loop" : "Sitting_Idle_Loop", { fade: 0.5 });
    timer.current = talking.current ? 4 + Math.random() * 3 : 8 + Math.random() * 8;
  });
  return <Person ref={ref} body={spec.body} hair={spec.hair} outfit={spec.outfit} position={spec.spot} yaw={spec.yaw} />;
};

class PersonBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn("[shop3d] a person failed to load and is skipped:", error?.message);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const ROLES = { cashier: Cashier, stocker: Walker, walker: Walker, sitter: Sitter };

// Ambient people. They never block you (no colliders). On the low tier only
// the people on your side of the door are mounted.
const People = ({ phase }) => {
  const quality = useQuality();
  const showInside = quality.peopleAlways || phase !== "outside";
  const showOutside = quality.peopleAlways || phase !== "inside";
  return PEOPLE.filter((spec) => (spec.inside ? showInside : showOutside)).map((spec) => {
    const Role = ROLES[spec.role];
    return (
      <PersonBoundary key={spec.id}>
        <Suspense fallback={null}>
          <Role spec={spec} />
        </Suspense>
      </PersonBoundary>
    );
  });
};

export default People;
