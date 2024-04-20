import { Routes, Route } from "react-router-dom";
import CategoriesPage from "./categories.page";
import CreateProductPage from "./createProduct.page";
import ProductPerCategory from "./productPerCategory.page";

const ProductsPage = () => {
  return (
    <Routes>
      <Route index element={<CategoriesPage />} />
      <Route path=":slug" element={<ProductPerCategory />} />
    </Routes>
  );
};

export default ProductsPage;
