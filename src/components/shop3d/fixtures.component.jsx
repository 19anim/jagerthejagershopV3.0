import { useState } from "react";
import { useCursor } from "@react-three/drei";
import GlbModel from "./glb-model.component";

const ClickableFixture = ({ fileName, position, rotationY = 0, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      <GlbModel fileName={fileName} position={[0, 0, 0]} />
    </group>
  );
};

// Cashier counter — position/rotation/top come verbatim from the placement
// contract (scene-placement.json: cashier_counter [3.6, 0.06, 1.0], rotationY
// −1.5708, top_surface_local 1.105 → worktop world y = 0.06 + 1.105 = 1.165).
// Rotated −90°, the counter's 2.2 m LENGTH runs along world z ∈ [−0.15, 2.15] and
// its DEPTH along world x: customer side x = 3.25 (−x faces the room), staff side
// x = 3.95. Every on-top item's position AND rotation is taken verbatim from the
// contract's `on_top` block (pos-terminal + phone face the customer; phone angled
// to the staff side). Props are base-pivot, so y = 1.165 rests them on the worktop.
// The counter itself is static scenery — ONLY the POS terminal drives checkout,
// so a stray click on the counter no longer navigates.
const COUNTER = [3.6, 0.06, 1.0];
const COUNTER_TOP = 1.165;

const Fixtures = ({ onCheckout, onOpenCart }) => (
  <group>
    <GlbModel fileName="cashier-counter.glb" position={COUNTER} rotationY={-1.5708} blocking />
    {/* Counter-top items — positions/rotations verbatim from scene-placement.json
        cashier_counter.on_top. */}
    {/* Gift box, logo_slot faces the customer (−x). */}
    <GlbModel fileName="gift-box.glb" position={[3.7, COUNTER_TOP, 1.95]} rotationY={-1.5708} />
    {/* Desk phone, staff side, keypad toward +x. */}
    <GlbModel fileName="desk-phone.glb" position={[3.72, COUNTER_TOP, 0.95]} rotationY={1.35} />
    {/* POS terminal — the sole checkout trigger; screen faces the customer (−x). */}
    <ClickableFixture
      fileName="pos-terminal.glb"
      position={[3.55, COUNTER_TOP, 1.55]}
      rotationY={-1.5708}
      onSelect={onCheckout}
    />
    {/* Shopping basket sits on the counter; clicking it still opens the cart. */}
    <ClickableFixture
      fileName="shopping-basket.glb"
      position={[3.6, COUNTER_TOP, 0.15]}
      rotationY={-1.5708}
      onSelect={onOpenCart}
    />
    {/* Both mount on the RIGHT wall (inner face x=+4.75), rotated −90° to face the
        room (−x). Shipping station (0.75 m deep) sits half its depth off the wall;
        the contact board's backing rests on the wall face. */}
    <GlbModel fileName="shipping-station.glb" position={[4.37, 0.06, -2.2]} rotationY={-1.5708} />
    <GlbModel fileName="contact-board.glb" position={[4.74, 1.4, -3.4]} rotationY={-1.5708} />
  </group>
);

export default Fixtures;
