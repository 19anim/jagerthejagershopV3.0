import { useMemo } from "react";
import ExteriorScene from "../exterior-scene.component";
import InteriorScene from "../interior-scene.component";
import { resolveAccessoryPlacements, resolveProductInstances } from "../../../utils/shop3d.utils";
import { ACCESSORY_PLACEMENTS, FIXTURES, PRODUCT_SLOTS } from "../../../utils/shop3d.config";

// Everything in the 3D world below the atmosphere. Phases: outside → entering →
// inside → exiting → outside.
const World = ({ products, phase, setPhase }) => {
  const bottles = useMemo(() => (products.length ? resolveProductInstances(products, FIXTURES, PRODUCT_SLOTS) : []), [products]);
  const accessories = useMemo(() => resolveAccessoryPlacements(FIXTURES, ACCESSORY_PLACEMENTS), []);
  const inside = phase === "inside" || phase === "entering";
  return (
    <>
      <ExteriorScene inside={inside} onEnter={() => setPhase("entering")} onExit={() => setPhase("exiting")} />
      {phase !== "outside" && <InteriorScene bottles={bottles} accessories={accessories} />}
    </>
  );
};

export default World;
