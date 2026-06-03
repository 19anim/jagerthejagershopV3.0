import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import ProductCard from "../components/productCard/productCard.component";
import ProductDiscoveryControls from "../components/product-discovery-controls/product-discovery-controls.component";
import { CategoriesContext } from "../context/categories.context";
import { useLocale } from "../context/locale.context";
import { apiUrl } from "../utils/api.utils";
import { DEFAULT_PRODUCT_SORT, filterAndSortProducts } from "../utils/product.utils";

const defaultFilters = {
  searchTerm: "",
  category: "ALL",
  inStockOnly: false,
  bestSellerOnly: false,
  sortBy: DEFAULT_PRODUCT_SORT,
};

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const { categories } = useContext(CategoriesContext);
  const { t } = useLocale();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(apiUrl("/api/products/getAllProducts"));
        setProducts(response.data);
      } catch (_error) {
        setErrorMessage(t("productsLoadFailed"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [t]);

  const visibleProducts = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="brand-kicker mb-2">JAGER THE JAGER · SHOP</p>
          <h1 className="font-heading text-3xl font-extrabold uppercase text-cream md:text-5xl">{t("allProducts")}</h1>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-cream/55">{visibleProducts.length} {t("items")}</p>
      </div>
      <ProductDiscoveryControls categories={categories} filters={filters} onFiltersChange={setFilters} />
      {errorMessage && <p className="mb-4 text-red-300">{errorMessage}</p>}
      {visibleProducts.length === 0 ? (
        <p className="border border-white/10 bg-[#14231d] p-5 text-cream/70">{t("emptyFilteredProducts")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );
};

export default AllProductsPage;
