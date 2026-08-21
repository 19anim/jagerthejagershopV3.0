import { CartContext } from "../../context/cart.context";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartCheckoutItem from "./cartCheckoutItem.component";
import EstimatedTransferFee from "./estimatedTransferFee.component";
import OrderSummary from "./orderSummary.component";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const CartCheckout = () => {
  const { cartItems } = useContext(CartContext);
  const { localize, t, locale } = useLocale();
  const { mode } = useShopMode();
  const navigate = useNavigate();
  const is3D = mode === SHOP_MODE.THREE_D;
  return (
    <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 md:px-8 lg:grid-cols-[1fr_380px]">
      <div className="brand-panel p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-bold uppercase">{t("cart")}</h1>
          {is3D ? (
            <button
              onClick={() => navigate(`/${locale}/shop3d`)}
              className="text-sm font-bold uppercase tracking-wider text-mainOrange"
            >
              × {t("returnToShop")}
            </button>
          ) : (
            <Link to={localize("/products")} className="text-sm font-bold uppercase tracking-wider text-mainOrange">← {t("products")}</Link>
          )}
        </div>
        {cartItems.length === 0 ? <p className="text-cream/70">{t("emptyCart")}</p> : <div className="flex flex-col gap-5">{cartItems.map((item) => <CartCheckoutItem key={item._id} cartItem={item} />)}</div>}
      </div>
      <div className="flex flex-col gap-4"><EstimatedTransferFee /><OrderSummary /></div>
    </section>
  );
};

export default CartCheckout;
