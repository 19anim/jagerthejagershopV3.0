import { CartContext } from "../../context/cart.context";
import { useContext } from "react";
import Button from "../button/button.component";
import { Link } from "react-router-dom";
import { useLocale } from "../../context/locale.context";
import { getProductStock } from "../../utils/product.utils";

const OrderSummary = () => {
  const { cartItems, deliveryPrice, subtotal } = useContext(CartContext);
  const { localize, t } = useLocale();
  const hasInvalidStock = cartItems.some((cartItem) => cartItem.quantity > getProductStock(cartItem));
  const canPlaceOrder = cartItems.length > 0 && deliveryPrice > 0 && !hasInvalidStock;

  return (
    <div className="brand-panel p-5">
      <h3 className="mb-5 font-heading text-2xl font-bold uppercase">{t("orderSummary")}</h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <p>{t("subtotal")}</p>
          <p>{subtotal.toLocaleString()} VNĐ</p>
        </div>
        <div className="flex justify-between">
          <p>{t("deliveryFee")}</p>
          <p>
            {deliveryPrice !== 0 && deliveryPrice !== -1
              ? `${deliveryPrice.toLocaleString()} VNĐ`
              : "----"}
          </p>
        </div>
        <hr className="border-gray-500" />
        <div className="flex justify-between">
          <p>
            <strong>{t("total")}</strong>
          </p>
          <p>
            <strong>
              {deliveryPrice !== -1
                ? `${(subtotal + deliveryPrice).toLocaleString()} VNĐ`
                : `${subtotal.toLocaleString()} VNĐ`}
            </strong>
          </p>
        </div>
      </div>
      <div className="mt-5">
        {!canPlaceOrder && cartItems.length > 0 && (
          <p className="mb-3 text-sm text-red-300">
            {hasInvalidStock ? t("cartStockInvalid") : t("deliveryRequired")}
          </p>
        )}
        {canPlaceOrder ? (
          <Link to={localize("/cartCheckout/placeOrder")}>
            <Button>{t("placeOrder")}</Button>
          </Link>
        ) : (
          <button className="brand-button w-full cursor-not-allowed opacity-50" disabled>
            {t("placeOrder")}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
