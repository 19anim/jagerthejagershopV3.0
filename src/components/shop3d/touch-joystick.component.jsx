import { useEffect, useRef, useState } from "react";

// On-screen thumb-stick for touch devices. It writes a normalised vector into
// the shared moveRef ({ x: strafe −1..1, y: forward −1..1 }) that WalkControls
// reads each frame. Hidden on devices with a fine pointer (mouse) — there the
// keyboard handles movement. No external dependency; pure pointer events.
const RADIUS = 48; // px, max thumb travel from centre

const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: coarse)").matches;

const TouchJoystick = ({ moveRef }) => {
  const [visible, setVisible] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const baseRef = useRef(null);
  const activeId = useRef(null);

  useEffect(() => {
    setVisible(isCoarsePointer());
  }, []);

  if (!visible) return null;

  const setVector = (dx, dy) => {
    const dist = Math.min(RADIUS, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const nx = (Math.cos(angle) * dist) / RADIUS;
    const ny = (Math.sin(angle) * dist) / RADIUS;
    setKnob({ x: nx * RADIUS, y: ny * RADIUS });
    // Screen y grows downward → forward (walk into the scene) is negative y.
    if (moveRef) moveRef.current = { x: nx, y: -ny };
  };

  const reset = () => {
    activeId.current = null;
    setKnob({ x: 0, y: 0 });
    if (moveRef) moveRef.current = { x: 0, y: 0 };
  };

  const onPointerDown = (e) => {
    activeId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e);
  };

  const handleMove = (e) => {
    if (activeId.current !== e.pointerId || !baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setVector(e.clientX - cx, e.clientY - cy);
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={onPointerDown}
      onPointerMove={handleMove}
      onPointerUp={reset}
      onPointerCancel={reset}
      className="pointer-events-auto relative size-28 shrink-0 touch-none rounded-full border border-cream/30 bg-black/30"
      aria-label="Movement joystick"
    >
      <div
        className="absolute left-1/2 top-1/2 size-12 rounded-full bg-cream/70"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
};

export default TouchJoystick;
