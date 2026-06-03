import { CartContext } from "../../context/cart.context";
import { useContext } from "react";
import { getOptimizedImageUrl } from "../../utils/image.utils";
import { getProductStock } from "../../utils/product.utils";
import { useLocale } from "../../context/locale.context";

const CartCheckoutItem = ({ cartItem }) => {
  const { modifyCartItemInCartDropdown } = useContext(CartContext);
  const { name, category, quantity, priceInInteger, image } = cartItem;
  const { t } = useLocale();
  const stock = getProductStock(cartItem);
  return (
    <article className="grid grid-cols-[96px_1fr] gap-4 border-b border-white/10 pb-5 md:grid-cols-[140px_1fr]">
      <img className="aspect-square size-full object-cover" src={getOptimizedImageUrl(image, "thumbnail")} alt={name} />
      <div>
        <h2 className="font-heading text-base font-bold uppercase md:text-xl">{name}</h2>
        <p className="mt-1 text-sm text-wheat">{category?.name}</p>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => modifyCartItemInCartDropdown(cartItem, "DECREASE_BUTTON")}><ion-icon name="remove-circle-outline"></ion-icon></button>
          <p>{quantity}</p>
          <button disabled={quantity >= stock} onClick={() => modifyCartItemInCartDropdown(cartItem, "INCREASE_BUTTON")}><ion-icon name="add-circle-outline"></ion-icon></button>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-cream/45">{t("stock")}: {stock}</p>
        <p className="mt-2 font-bold text-mainOrange">{(priceInInteger * quantity).toLocaleString()} VNĐ</p>
      </div>
    </article>
  );
};

export default CartCheckoutItem;
