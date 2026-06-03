export const DEFAULT_PRODUCT_SORT = "newest";

export const getProductCategorySlug = (product) => product?.category?.slug || "all";

export const getProductDetailPath = (product) =>
  `/products/${getProductCategorySlug(product)}/${product?.slug || product?._id}`;

export const getProductStock = (product) => Math.max(0, Number(product?.stock) || 0);

export const clampQuantityToStock = (quantity, stock) => {
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const normalizedStock = getProductStock({ stock });
  if (normalizedStock <= 0) return 0;
  return Math.min(normalizedQuantity, normalizedStock);
};

export const filterAndSortProducts = (products, filters = {}) => {
  const {
    searchTerm = "",
    category = "ALL",
    inStockOnly = false,
    bestSellerOnly = false,
    sortBy = DEFAULT_PRODUCT_SORT,
  } = filters;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return [...products]
    .filter((product) => {
      const searchableText = [
        product.name,
        product.vol,
        product.category?.name,
        product.category?.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory = category === "ALL" || product.category?._id === category || product.category?.slug === category;
      const matchesStock = !inStockOnly || getProductStock(product) > 0;
      const matchesBestSeller = !bestSellerOnly || product.isBestSeller;
      return matchesSearch && matchesCategory && matchesStock && matchesBestSeller;
    })
    .sort((firstProduct, secondProduct) => {
      if (sortBy === "price-asc") return firstProduct.priceInInteger - secondProduct.priceInInteger;
      if (sortBy === "price-desc") return secondProduct.priceInInteger - firstProduct.priceInInteger;
      if (sortBy === "best-selling") return (secondProduct.soldAmount || 0) - (firstProduct.soldAmount || 0);
      return new Date(secondProduct.createdAt || 0) - new Date(firstProduct.createdAt || 0);
    });
};
