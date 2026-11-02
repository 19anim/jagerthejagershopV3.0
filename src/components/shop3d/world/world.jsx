import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Street from "./street/street";
import Shophouses from "./street/shophouses";
import StreetProps from "./street/street-props";
import ShopBuilding from "./shopfront/shop-building";
import Door from "./shopfront/door";
import RoomShell from "./interior/room-shell";
import Interior from "./interior/interior";
import ProductShelves from "./products/product-shelves";
import Decor from "./interior/decor";
import People from "./people/people";
import ThemeLayer from "./themes/theme-layer";
import { useQuality } from "./quality-context";
import { CartContext } from "../../../context/cart.context";
import { useLocale } from "../../../context/locale.context";

// Walls and shells swallow pointer events so you cannot hover or click things
// hidden behind them.
const stop = (event) => event.stopPropagation();

// Everything in the 3D world below the atmosphere. Phases: outside → entering →
// inside → exiting → outside.
const World = ({ products, phase, setPhase, theme }) => {
  const quality = useQuality();
  const interiorMounted = quality.interiorAlways || phase !== "outside";
  const { toggleIsCartOpen } = useContext(CartContext);
  const { locale } = useLocale();
  const navigate = useNavigate();
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
      <People phase={phase} />
      {interiorMounted && (
        <Interior onCheckout={() => navigate(`/${locale}/cartCheckout`)} onOpenCart={toggleIsCartOpen}>
          <ProductShelves products={products} />
          <Decor />
        </Interior>
      )}
      <ThemeLayer theme={theme} />
    </>
  );
};

export default World;
