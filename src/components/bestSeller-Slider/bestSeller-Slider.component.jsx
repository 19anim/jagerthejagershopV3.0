import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./bestSeller-Silder.style.css";
import { apiUrl } from "../../utils/api.utils";
import { fallbackImage, getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";
import { getProductDetailPath } from "../../utils/product.utils";

const BestSellerSlider = ({ onProductsLoaded }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { localize, t } = useLocale();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get(apiUrl("/api/products/getBestSellers?limit=7"));
        if (!Array.isArray(response.data)) {
          throw new Error("Best-seller API returned an invalid response.");
        }
        setProducts(response.data);
        onProductsLoaded?.(response.data);
      } catch (_error) {
        setProducts([]);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBestSellers();
  }, [onProductsLoaded]);

  const rotateSlides = (direction) => {
    setProducts((current) => {
      if (current.length < 2) return current;
      if (direction === "next") return [...current.slice(1), current[0]];
      return [current[current.length - 1], ...current.slice(0, -1)];
    });
  };

  if (isLoading) return <p className="px-5 py-16 text-center text-cream">{t("loading")}</p>;
  if (hasError) return <p className="px-5 py-16 text-center text-mainOrange">{t("bestSellerError")}</p>;
  if (products.length === 0) return null;

  return (
    <section className="px-4 pb-16 text-cream md:px-8 md:pb-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="brand-kicker mb-2">{t("heroEyebrow")}</p>
            <h2 className="font-heading text-3xl font-bold uppercase md:text-5xl">{t("bestSellers")}</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-cream/65">{t("bestSellerBody")}</p>
        </div>

        <div className="best-seller-original">
          <div className="slide">
            {products.map((product) => (
              <article
                key={product._id}
                className="slide-item"
                style={{ backgroundImage: `url(${getOptimizedImageUrl(product.image, "card")})` }}
              >
                <img
                  className="slide-item__fallback"
                  src={getOptimizedImageUrl(product.image, "card")}
                  onError={(event) => { event.currentTarget.parentElement.style.backgroundImage = `url(${fallbackImage})`; }}
                  alt=""
                />
                <div className="slide-item__shade" />
                <div className="slide-item--content">
                  <p className="content--eyebrow">{product.vol || t("bestSellers")}</p>
                  <h3 className="content--name">{product.name}</h3>
                  <p className="content--price">{product.price}</p>
                  <Link className="content--button" to={localize(getProductDetailPath(product))}>{t("shopNow")}</Link>
                </div>
              </article>
            ))}
          </div>

          <div className="animation-buttons">
            <button onClick={() => rotateSlides("prev")} className="animation--prevButton" aria-label={t("previous")}>
              <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <button onClick={() => rotateSlides("next")} className="animation--nextButton" aria-label={t("next")}>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellerSlider;
