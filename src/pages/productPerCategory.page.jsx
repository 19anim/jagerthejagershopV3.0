import { useContext, useMemo, useState } from "react";
import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import ProductCard from "../components/productCard/productCard.component";
import ProductDiscoveryControls from "../components/product-discovery-controls/product-discovery-controls.component";
import { CategoriesContext } from "../context/categories.context";
import useFetchProductsPerCategory from "../hooks/useFetchProductsPerCategory.hook";
import { useLocale } from "../context/locale.context";
import { DEFAULT_PRODUCT_SORT, filterAndSortProducts } from "../utils/product.utils";

const defaultFilters = {
  searchTerm: "",
  category: "ALL",
  inStockOnly: false,
  bestSellerOnly: false,
  sortBy: DEFAULT_PRODUCT_SORT,
};

const ProductPerCategory = () => {
  const [isLoading, products] = useFetchProductsPerCategory();
  const [filters, setFilters] = useState(defaultFilters);
  const { categories } = useContext(CategoriesContext);
  const { t } = useLocale();
  const visibleProducts = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);
  return isLoading ? (
    <LoadingSpinner />
  ) : products.length === 0 ? (
    <section className="mx-auto flex min-h-[420px] max-w-[1440px] items-center px-4 py-16 md:px-8">
      <div className="max-w-2xl border border-warmGold/35 bg-mainGreen p-7 shadow-2xl md:p-10">
        <p className="brand-kicker mb-3">JAGER THE JAGER · SOON</p>
        <h1 className="font-heading text-3xl font-extrabold uppercase leading-tight text-cream md:text-5xl">{t("emptyProductsTitle")}</h1>
        <p className="mt-4 max-w-xl leading-7 text-cream/70">{t("emptyProductsBody")}</p>
      </div>
    </section>
  ) : (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <ProductDiscoveryControls categories={categories} filters={filters} onFiltersChange={setFilters} showCategoryFilter={false} />
      {visibleProducts.length === 0 ? (
        <p className="border border-white/10 bg-[#14231d] p-5 text-cream/70">{t("emptyFilteredProducts")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {visibleProducts?.map((product) => {
            return <ProductCard key={product._id} product={product}></ProductCard>;
          })}
        </div>
      )}
    </section>
  );
};

export default ProductPerCategory;
