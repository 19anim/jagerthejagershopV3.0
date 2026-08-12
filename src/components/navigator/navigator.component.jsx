import { useContext } from "react";
import { Link } from "react-router-dom";
import CartDropdown from "../cart-dropdown/cart-dropdown.component";
import { UserContext } from "../../context/user.context";
import { CartContext } from "../../context/cart.context";
import UserIcon from "../user-icon/user-icon.component";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";

const Navigator = () => {
  const { isLoggedIn, isAdmin } = useContext(UserContext);
  const { cartItems, toggleIsCartOpen } = useContext(CartContext);
  const { locale, localize, setLocale, t } = useLocale();

  return (
    <>
      <div className="bg-mainOrange px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white">{t("shipping")}</div>
      <header className="sticky top-0 z-40 border-b border-warmGold/20 bg-mainGreen text-cream shadow-lg">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to={localize("/")} className="shrink-0"><img src={Logo} alt="JagerTheJager Shop" className="w-28 md:w-40" /></Link>
          <nav className="hidden items-center gap-7 font-heading text-xs font-bold uppercase tracking-[0.12em] md:flex">
            <Link className="transition hover:text-mainOrange" to={localize("/")}>{t("home")}</Link>
            <Link className="transition hover:text-mainOrange" to={localize("/products")}>{t("products")}</Link>
            {isAdmin && (
              <div className="group relative -my-2 py-2">
                <span className="cursor-pointer transition hover:text-mainOrange">{t("adminSection")}</span>
                <div className="absolute left-0 top-full hidden min-w-[220px] flex-col border border-warmGold/30 bg-[#14231d] py-2 text-cream shadow-2xl group-hover:flex z-50">
                  <Link className="px-4 py-2 hover:text-mainOrange" to="/admin/products">{t("adminCatalog")}</Link>
                  <Link className="px-4 py-2 hover:text-mainOrange" to="/admin/product-details">{t("adminProductDetails")}</Link>
                  <Link className="px-4 py-2 hover:text-mainOrange" to="/admin/orders">{t("adminOrders")}</Link>
                </div>
              </div>
            )}
          </nav>
          <div className="flex items-center gap-3 md:gap-5">
            <button className="text-xs font-bold tracking-widest text-cream/80 transition hover:text-mainOrange" onClick={() => setLocale(locale === "vi" ? "en" : "vi")}>{locale === "vi" ? "EN" : "VI"}</button>
            {isLoggedIn ? <UserIcon /> : <Link aria-label={t("signIn")} to={localize("/authentication/sign-in")}><ion-icon name="person-circle-outline" class="text-2xl"></ion-icon></Link>}
            <button className="relative flex items-center" onClick={toggleIsCartOpen} aria-label={t("cart")}>
              <ion-icon name="bag-outline" class="text-2xl"></ion-icon>
              {cartItems.length > 0 && <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-mainOrange text-[10px] font-bold text-white">{cartItems.length}</span>}
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-6 border-t border-white/10 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-widest md:hidden">
          <Link to={localize("/")}>{t("home")}</Link>
          <Link to={localize("/products")}>{t("products")}</Link>
          {isAdmin && <Link to="/admin/products">{t("adminCatalog")}</Link>}
          {isAdmin && <Link to="/admin/product-details">{t("adminProductDetails")}</Link>}
          {isAdmin && <Link to="/admin/orders">{t("adminOrders")}</Link>}
        </div>
      </header>
      <CartDropdown />
    </>
  );
};

export default Navigator;
