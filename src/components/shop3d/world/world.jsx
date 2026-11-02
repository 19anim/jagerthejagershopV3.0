import { useMemo } from "react";
import InteriorScene from "../interior-scene.component";
import Street from "./street/street";
import Shophouses from "./street/shophouses";
import StreetProps from "./street/street-props";
import ShopBuilding from "./shopfront/shop-building";
import Door from "./shopfront/door";
import RoomShell from "./interior/room-shell";
import { useQuality } from "./quality-context";
import { resolveAccessoryPlacements, resolveProductInstances } from "../../../utils/shop3d.utils";
import { ACCESSORY_PLACEMENTS, FIXTURES, PRODUCT_SLOTS } from "../../../utils/shop3d.config";

// Walls and shells swallow pointer events so you cannot hover or click things
// hidden behind them.
const stop = (event) => event.stopPropagation();

// Everything in the 3D world below the atmosphere. Phases: outside → entering →
// inside → exiting → outside.
const World = ({ products, phase, setPhase }) => {
  const quality = useQuality();
  const interiorMounted = quality.interiorAlways || phase !== "outside";
  const bottles = useMemo(() => (products.length ? resolveProductInstances(products, FIXTURES, PRODUCT_SLOTS) : []), [products]);
  const accessories = useMemo(() => resolveAccessoryPlacements(FIXTURES, ACCESSORY_PLACEMENTS), []);
  return (
    <>
      <Street />
      <Shophouses />
      <StreetProps />
      <group onPointerOver={stop} onClick={stop}>
        <ShopBuilding showInteriorCard={!interiorMounted} />
        <RoomShell />
      </group>
      <Door phase={phase} onEnter={() => setPhase("entering")} onExit={() => setPhase("exiting")} />
      {interiorMounted && <InteriorScene bottles={bottles} accessories={accessories} />}
    </>
  );
};

export default World;
