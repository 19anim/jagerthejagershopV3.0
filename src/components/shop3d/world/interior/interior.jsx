import Fixtures from "./fixtures";
import KitGlbs from "./kit-glbs";
import StaticColliders from "../static-colliders";
import { INTERIOR_COLLIDERS } from "../../../../utils/shop3d/layout";

const stop = (event) => event.stopPropagation();

// The shop floor: shelving (which blocks pointer events, so you cannot click a
// bottle through a gondola), the kept kit GLBs, colliders, and children
// (products and decor, added by later tasks).
const Interior = ({ onCheckout, onOpenCart, children }) => (
  <group>
    <group onPointerOver={stop} onClick={stop}>
      <Fixtures />
    </group>
    <KitGlbs onCheckout={onCheckout} onOpenCart={onOpenCart} />
    <StaticColliders boxes={INTERIOR_COLLIDERS} />
    {children}
  </group>
);

export default Interior;
