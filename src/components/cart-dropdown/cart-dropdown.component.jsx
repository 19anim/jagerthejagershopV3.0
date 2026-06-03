import { CartContext } from "../../context/cart.context";
import { useContext } from "react";
import CartItem from "./cart-item.component";
import { Link } from "react-router-dom";
import { useLocale } from "../../context/locale.context";

const CartDropdown = () => {
  const { cartItems, isCartOpen, subtotal, toggleIsCartOpen } = useContext(CartContext);
  const { localize, t } = useLocale();

  return (
    <>
      {isCartOpen && <button aria-label={t("close")} className="fixed inset-0 z-40 bg-black/45" onClick={toggleIsCartOpen} />}
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-mainGreen text-cream shadow-2xl transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <h2 className="font-heading text-xl font-bold uppercase tracking-wider">{t("cart")}</h2>
          <button onClick={toggleIsCartOpen} aria-label={t("close")}><ion-icon name="close-outline" class="text-3xl"></ion-icon></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? <p className="text-cream/70">{t("emptyCart")}</p> : cartItems.map((item) => <CartItem key={item._id} cartItem={item} />)}
        </div>
        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex justify-between font-bold"><span>{t("total")}</span><span>{subtotal.toLocaleString()} VNĐ</span></div>
          <Link to={localize("/cartCheckout")} onClick={toggleIsCartOpen} className="brand-button w-full">{t("checkout")}</Link>
        </div>
      </aside>
    </>
  );
};

export default CartDropdown;
