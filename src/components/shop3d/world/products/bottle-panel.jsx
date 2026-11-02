// The add-to-cart panel shown above a clicked bottle. It renders inside drei's
// <Html>, which is a separate React root without the app's contexts, so the
// caller passes the translator and the add-to-cart callback in.
const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

const BottlePanel = ({ product, t, onAdd }) => {
  const outOfStock = (product.stock || 0) <= 0;
  return (
    <div className="w-44 -translate-x-1/2 -translate-y-[calc(100%+0.25rem)] rounded border border-warmGold/50 bg-cream p-3 text-center text-ink shadow-xl">
      <p className="font-heading text-sm font-bold leading-tight">{product.name}</p>
      <p className="mt-1 text-sm text-mainOrange">{formatPrice(product.priceInInteger)}₫</p>
      <p className="text-[11px] text-ink/60">{t("stock")}: {product.stock}</p>
      <button
        className="brand-button mt-2 w-full text-xs disabled:opacity-40"
        disabled={outOfStock}
        onClick={(event) => {
          event.stopPropagation();
          onAdd(product);
        }}
      >
        {outOfStock ? t("soldOut") : t("addToCart")}
      </button>
    </div>
  );
};

export default BottlePanel;
