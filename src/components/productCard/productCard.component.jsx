import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/cart.context";
import { fallbackImage, getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";
import { clampQuantityToStock, getProductDetailPath, getProductStock } from "../../utils/product.utils";

const ProductCard = ({ product }) => {
  const { addItemToCart } = useContext(CartContext);
  const { name, image, price, vol } = product;
  const [quantity, setQuantity] = useState(1);
  const { localize, t } = useLocale();
  const stock = getProductStock(product);
  const isSoldOut = stock <= 0;

  return (
    <article className="group flex h-full flex-col border border-warmGold/20 bg-mainGreen shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <Link to={localize(getProductDetailPath(product))} className="aspect-[4/5] overflow-hidden bg-[#102019]">
        <img
          src={getOptimizedImageUrl(image, "card")}
          onError={(event) => { event.currentTarget.src = fallbackImage; }}
          alt={name}
          loading="lazy"
          className="size-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="brand-kicker mb-2">{vol || "JAGER THE JAGER"}</p>
        <Link to={localize(getProductDetailPath(product))} className="font-heading text-sm font-bold uppercase leading-5 text-cream transition hover:text-mainOrange">{name}</Link>
        <p className="mt-2 text-sm font-bold text-mainOrange">{price}</p>
        <p className={`mt-1 text-xs font-bold uppercase tracking-widest ${isSoldOut ? "text-red-300" : "text-cream/55"}`}>
          {isSoldOut ? t("soldOut") : `${t("stock")}: ${stock}`}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-1 text-cream">
            <button disabled={isSoldOut} onClick={() => setQuantity(clampQuantityToStock(Number(quantity) - 1, stock))}><ion-icon name="remove-circle-outline"></ion-icon></button>
            <input className="w-7 bg-transparent text-center text-sm" disabled={isSoldOut} max={stock} min="1" type="number" value={isSoldOut ? 0 : quantity} onChange={(event) => setQuantity(clampQuantityToStock(event.target.value, stock))} />
            <button disabled={isSoldOut || quantity >= stock} onClick={() => setQuantity(clampQuantityToStock(Number(quantity) + 1, stock))}><ion-icon name="add-circle-outline"></ion-icon></button>
          </div>
          <button className="brand-button min-h-0 px-3 py-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-50" disabled={isSoldOut} onClick={() => addItemToCart(product, quantity)}>{isSoldOut ? t("soldOut") : t("addToCart")}</button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
