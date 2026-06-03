import { DEFAULT_PRODUCT_SORT } from "../../utils/product.utils";
import { useLocale } from "../../context/locale.context";

const ProductDiscoveryControls = ({
  categories,
  filters,
  onFiltersChange,
  showCategoryFilter = true,
}) => {
  const { t } = useLocale();
  const updateFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });

  return (
    <div className="mb-6 grid gap-3 border border-warmGold/25 bg-mainGreen p-4 md:grid-cols-[1fr_180px_180px]">
      <input
        className="border border-white/15 bg-[#14231d] px-4 py-3 text-sm text-cream outline-none focus:border-mainOrange"
        onChange={(event) => updateFilter("searchTerm", event.target.value)}
        placeholder={t("searchProducts")}
        type="search"
        value={filters.searchTerm}
      />
      {showCategoryFilter && (
        <select
          className="border border-white/15 bg-[#14231d] px-4 py-3 text-sm text-cream outline-none focus:border-mainOrange"
          onChange={(event) => updateFilter("category", event.target.value)}
          value={filters.category}
        >
          <option value="ALL">{t("allCategories")}</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
      )}
      <select
        className="border border-white/15 bg-[#14231d] px-4 py-3 text-sm text-cream outline-none focus:border-mainOrange"
        onChange={(event) => updateFilter("sortBy", event.target.value)}
        value={filters.sortBy || DEFAULT_PRODUCT_SORT}
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="price-asc">{t("sortPriceAsc")}</option>
        <option value="price-desc">{t("sortPriceDesc")}</option>
        <option value="best-selling">{t("sortBestSelling")}</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-cream/80">
        <input
          checked={filters.inStockOnly}
          onChange={(event) => updateFilter("inStockOnly", event.target.checked)}
          type="checkbox"
        />
        {t("inStockOnly")}
      </label>
      <label className="flex items-center gap-2 text-sm text-cream/80">
        <input
          checked={filters.bestSellerOnly}
          onChange={(event) => updateFilter("bestSellerOnly", event.target.checked)}
          type="checkbox"
        />
        {t("bestSeller")}
      </label>
    </div>
  );
};

export default ProductDiscoveryControls;
