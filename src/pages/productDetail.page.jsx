import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/productCard/productCard.component";
import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import { CartContext } from "../context/cart.context";
import { useLocale } from "../context/locale.context";
import { apiUrl } from "../utils/api.utils";
import { fallbackImage, getOptimizedImageUrl } from "../utils/image.utils";
import { clampQuantityToStock, getProductStock } from "../utils/product.utils";

const ProductDetailPage = () => {
  const { productSlug } = useParams();
  const { addItemToCart } = useContext(CartContext);
  const { localize, t } = useLocale();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await axios.get(apiUrl(`/api/products/getProductBySlug/${productSlug}`));
        setProduct(response.data);
        setQuantity(clampQuantityToStock(1, response.data.stock));
        if (response.data.category?._id) {
          const relatedResponse = await axios.get(apiUrl(`/api/products/getProductByCategoryId/${response.data.category._id}`));
          setRelatedProducts(relatedResponse.data.filter((item) => item._id !== response.data._id).slice(0, 5));
        }
      } catch (_error) {
        setErrorMessage(t("productDetailLoadFailed"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productSlug, t]);

  const stock = getProductStock(product);
  const isSoldOut = stock <= 0;
  const detail = useMemo(() => product?.description || {}, [product]);

  if (isLoading) return <LoadingSpinner />;
  if (errorMessage || !product) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-cream md:px-8">
        <div className="brand-panel p-7">
          <p className="mb-5 text-red-300">{errorMessage || t("productDetailLoadFailed")}</p>
          <Link className="brand-button" to={localize("/products/all")}>{t("allProducts")}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 text-cream md:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <div className="overflow-hidden border border-warmGold/25 bg-[#102019]">
          <img
            className="aspect-[4/5] size-full object-cover"
            src={getOptimizedImageUrl(product.image, "large")}
            onError={(event) => { event.currentTarget.src = fallbackImage; }}
            alt={product.name}
          />
        </div>
        <div className="brand-panel flex flex-col justify-center p-5 md:p-8">
          <p className="brand-kicker mb-3">{product.category?.name || t("products")}</p>
          <h1 className="font-heading text-3xl font-extrabold uppercase leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-mainOrange">{product.vol}</p>
          <p className="mt-5 text-2xl font-bold text-mainOrange">{product.price}</p>
          <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${isSoldOut ? "text-red-300" : "text-cream/60"}`}>
            {isSoldOut ? t("soldOut") : `${t("stock")}: ${stock}`}
          </p>
          {detail.descriptionTitle && <h2 className="mt-8 font-heading text-xl font-bold uppercase">{detail.descriptionTitle}</h2>}
          {detail.description && <p className="mt-3 whitespace-pre-line leading-7 text-cream/75">{detail.description}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex min-h-[44px] items-center border border-white/15">
              <button className="px-3 disabled:opacity-40" disabled={isSoldOut} onClick={() => setQuantity(clampQuantityToStock(quantity - 1, stock))}>-</button>
              <input className="w-12 bg-transparent text-center" disabled={isSoldOut} max={stock} min="1" type="number" value={isSoldOut ? 0 : quantity} onChange={(event) => setQuantity(clampQuantityToStock(event.target.value, stock))} />
              <button className="px-3 disabled:opacity-40" disabled={isSoldOut || quantity >= stock} onClick={() => setQuantity(clampQuantityToStock(quantity + 1, stock))}>+</button>
            </div>
            <button className="brand-button disabled:cursor-not-allowed disabled:opacity-50" disabled={isSoldOut} onClick={() => addItemToCart(product, quantity)}>{isSoldOut ? t("soldOut") : t("addToCart")}</button>
          </div>
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 font-heading text-2xl font-bold uppercase">{t("relatedProducts")}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((relatedProduct) => <ProductCard key={relatedProduct._id} product={relatedProduct} />)}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetailPage;
