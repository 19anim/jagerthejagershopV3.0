import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage.page";
import CreateProductPage from "./pages/createProduct.page";
import ProductsPage from "./pages/productsPage.page";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/create" element={<CreateProductPage />} />
    </Routes>
  );
};

export default App;
