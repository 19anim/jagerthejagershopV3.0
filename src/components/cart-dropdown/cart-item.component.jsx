import { useContext } from "react";
import { CartContext } from "../../context/cart.context";
import { getOptimizedImageUrl } from "../../utils/image.utils";
import { getProductStock } from "../../utils/product.utils";
import { useLocale } from "../../context/locale.context";

const CartItem = ({ cartItem }) => {
  const { name, image, priceInInteger, quantity } = cartItem;
  const { modifyCartItemInCartDropdown } = useContext(CartContext);
  const { t } = useLocale();
  const stock = getProductStock(cartItem);
  return (
    <div className="mb-5 grid grid-cols-[64px_1fr] gap-3 border-b border-white/10 pb-5 text-sm">
      <img className="size-16 object-cover" src={getOptimizedImageUrl(image, "thumbnail")} alt={name} />
      <div>
        <p className="font-heading font-semibold">{name}</p>
        <p className="text-cream/70">{(priceInInteger * quantity).toLocaleString()} VNĐ</p>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => modifyCartItemInCartDropdown(cartItem, "DECREASE_BUTTON")}><ion-icon name="remove-circle-outline"></ion-icon></button>
          <p>{quantity}</p>
          <button disabled={quantity >= stock} onClick={() => modifyCartItemInCartDropdown(cartItem, "INCREASE_BUTTON")}><ion-icon name="add-circle-outline"></ion-icon></button>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-cream/45">{t("stock")}: {stock}</p>
      </div>
    </div>
  );
};

export default CartItem;
