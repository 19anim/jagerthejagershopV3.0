import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import { useCollision } from "../../context/collision.context";

// First-person "walk through the shop" controller. Replaces OrbitControls while
// the camera is inside the building: WASD/arrow keys translate along the floor,
// pointer-drag looks around, the camera is pinned to eye height and clamped
// inside the wall shell so you can never walk through a wall or see the street.
//
// Bounds derive from the enlarged 06 Building-envelope README: clear interior
// 9.5 × 11.0 m on the 0.06 m floor, inner wall faces at x ≈ ±4.75, back z ≈ −5.5,
// front wall face at z ≈ 5.6. We keep ~0.7 m clearance off each inner face so the
// near clip never punches through geometry.
export const EYE_HEIGHT = 1.6;
export const WALK_BOUNDS = { minX: -4.05, maxX: 4.05, minZ: -4.8, maxZ: 5.0 };

const WALK_SPEED = 2.6; // metres / second
const LOOK_SENSITIVITY = 0.0026; // radians / pixel
const MAX_PITCH = 1.2; // clamp so you can't flip over

const MOVE_KEYS = {
  KeyW: "forward", ArrowUp: "forward",
  KeyS: "back", ArrowDown: "back",
  KeyA: "left", ArrowLeft: "left",
  KeyD: "right", ArrowRight: "right",
};

// True if the XZ point lies inside any collider box. Boxes are already inflated
// by the player radius, so the walking camera is tested as a single point.
// Strict comparisons mean a point resting exactly on an inflated face reads as
// outside, which avoids jitter at the contact surface.
const blocked = (x, z, boxes) => {
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (x > b.min.x && x < b.max.x && z > b.min.z && z < b.max.z) return true;
  }
  return false;
};

// `moveRef` is an optional shared { current: { x, y } } written by the on-screen
// touch joystick (x = strafe −1..1, y = forward −1..1); keyboard input is added
// on top so both schemes work together.
const WalkControls = ({ enabled, moveRef }) => {
  const { camera, gl } = useThree();
  const collision = useCollision();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef({ forward: false, back: false, left: false, right: false });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const euler = useRef(new Euler(0, 0, 0, "YXZ"));

  // Seed yaw/pitch from wherever the entry dolly left the camera looking, so the
  // hand-off to walk mode doesn't snap the view.
  useEffect(() => {
    if (!enabled) return;
    euler.current.setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = euler.current.y;
    pitch.current = euler.current.x;
  }, [enabled, camera]);

  // Drag-to-look on the canvas. Drags that start on HUD buttons never reach the
  // canvas element (they sit above it with pointer-events), so no filtering here.
  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    const onDown = (e) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * LOOK_SENSITIVITY;
      pitch.current -= dy * LOOK_SENSITIVITY;
      pitch.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch.current));
    };
    const onUp = () => { dragging.current = false; };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, gl]);

  // Keyboard walk state.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (down) => (e) => {
      const action = MOVE_KEYS[e.code];
      if (!action) return;
      keys.current[action] = down;
      e.preventDefault();
    };
    const kd = onKey(true);
    const ku = onKey(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      keys.current = { forward: false, back: false, left: false, right: false };
    };
  }, [enabled]);

  useFrame((_state, delta) => {
    if (!enabled) return;

    // Orient the camera from accumulated yaw/pitch.
    euler.current.set(pitch.current, yaw.current, 0, "YXZ");
    camera.quaternion.setFromEuler(euler.current);

    // Horizontal forward/right basis (ignore pitch so looking up doesn't slow you).
    forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    const joystick = moveRef?.current || { x: 0, y: 0 };
    let moveF = (keys.current.forward ? 1 : 0) - (keys.current.back ? 1 : 0) + joystick.y;
    let moveR = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0) + joystick.x;
    moveF = Math.max(-1, Math.min(1, moveF));
    moveR = Math.max(-1, Math.min(1, moveR));

    if (moveF !== 0 || moveR !== 0) {
      const step = WALK_SPEED * delta;
      const boxes = collision?.colliders.current;

      const prevX = camera.position.x;
      const prevZ = camera.position.z;

      // Full desired move for this frame.
      camera.position.addScaledVector(forward.current, moveF * step);
      camera.position.addScaledVector(right.current, moveR * step);

      if (boxes && boxes.length) {
        // Axis-separated resolve so the player slides along a fixture face
        // instead of hard-stopping when walking into it diagonally.
        const wantX = camera.position.x;
        const wantZ = camera.position.z;
        let resolvedX = prevX;
        let resolvedZ = prevZ;
        if (!blocked(wantX, prevZ, boxes)) resolvedX = wantX;
        if (!blocked(resolvedX, wantZ, boxes)) resolvedZ = wantZ;
        camera.position.x = resolvedX;
        camera.position.z = resolvedZ;
      }
    }

    // Pin eye height and keep the camera inside the walls.
    camera.position.y = EYE_HEIGHT;
    camera.position.x = Math.max(WALK_BOUNDS.minX, Math.min(WALK_BOUNDS.maxX, camera.position.x));
    camera.position.z = Math.max(WALK_BOUNDS.minZ, Math.min(WALK_BOUNDS.maxZ, camera.position.z));
  });

  return null;
};

export default WalkControls;
