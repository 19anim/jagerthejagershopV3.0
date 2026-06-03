import { Routes, Route } from "react-router-dom";
import CategoriesPage from "./categories.page";
import ProductPerCategory from "./productPerCategory.page";
import AllProductsPage from "./allProducts.page";
import ProductDetailPage from "./productDetail.page";

const ProductsPage = () => {
  return (
    <Routes>
      <Route index element={<CategoriesPage />} />
      <Route path="all" element={<AllProductsPage />} />
      <Route path=":categorySlug/:productSlug" element={<ProductDetailPage />} />
      <Route path=":slug" element={<ProductPerCategory />} />
    </Routes>
  );
};

export default ProductsPage;
