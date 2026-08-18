import { useState } from "react";
import { useCursor } from "@react-three/drei";
import GlbModel from "./glb-model.component";

const ClickableFixture = ({ fileName, position, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      <GlbModel fileName={fileName} position={[0, 0, 0]} />
    </group>
  );
};

const Fixtures = ({ onCheckout, onOpenCart }) => (
  <group>
    <ClickableFixture fileName="cashier-counter.glb" position={[2.4, 0, 1.2]} onSelect={onCheckout} />
    <ClickableFixture fileName="pos-terminal.glb" position={[2.4, 0.9, 1.2]} onSelect={onCheckout} />
    <ClickableFixture fileName="shopping-basket.glb" position={[1.6, 0, 1.6]} onSelect={onOpenCart} />
    <GlbModel fileName="shipping-station.glb" position={[3.2, 0, -1.4]} />
    <GlbModel fileName="contact-board.glb" position={[3.4, 1.4, -2.2]} />
    <GlbModel fileName="desk-phone.glb" position={[2.4, 0.95, 0.9]} />
  </group>
);

export default Fixtures;
