import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";
import TouchJoystick from "./touch-joystick.component";

const Shop3DHud = ({ phase = "outside", onExit, moveRef }) => {
  const { cartItems, toggleIsCartOpen } = useContext(CartContext);
  const { t, locale } = useLocale();
  const { setMode } = useShopMode();
  const navigate = useNavigate();

  const inside = phase === "inside";

  const exitToClassic = () => {
    setMode(SHOP_MODE.CLASSIC);
    navigate(`/${locale}`);
  };

  const helpText = inside ? t("shop3dWalkHelp") : t("shop3dHelp");

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <button onClick={exitToClassic} className="brand-button-outline pointer-events-auto text-xs">
            {t("exitToClassic")}
          </button>
          {inside && (
            <button onClick={onExit} className="brand-button-outline pointer-events-auto text-xs">
              {t("exitShop")}
            </button>
          )}
        </div>
        <button
          onClick={toggleIsCartOpen}
          className="brand-button pointer-events-auto relative text-xs"
          aria-label={t("cart")}
        >
          {t("cart")}
          {cartItems.length > 0 && (
            <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-mainOrange">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-end justify-between gap-4">
        {inside ? <TouchJoystick moveRef={moveRef} /> : <span />}
        <p className="mx-auto rounded bg-black/40 px-3 py-1 text-center text-[11px] font-bold uppercase tracking-widest text-cream">
          {helpText}
        </p>
        <span className="w-24 shrink-0" />
      </div>
    </div>
  );
};

export default Shop3DHud;
