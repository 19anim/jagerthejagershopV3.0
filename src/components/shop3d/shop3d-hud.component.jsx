import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/cart.context";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const Shop3DHud = () => {
  const { cartItems, toggleIsCartOpen } = useContext(CartContext);
  const { t, locale } = useLocale();
  const { setMode } = useShopMode();
  const navigate = useNavigate();

  const exitToClassic = () => {
    setMode(SHOP_MODE.CLASSIC);
    navigate(`/${locale}`);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
      <div className="flex items-start justify-between">
        <button onClick={exitToClassic} className="brand-button-outline pointer-events-auto text-xs">
          {t("exitToClassic")}
        </button>
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
      <p className="mx-auto rounded bg-black/40 px-3 py-1 text-center text-[11px] font-bold uppercase tracking-widest text-cream">
        {t("shop3dHelp")}
      </p>
    </div>
  );
};

export default Shop3DHud;
