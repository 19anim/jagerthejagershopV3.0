import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/user.context";
import CreateProductPage from "../../pages/createProduct.page";
import AdminOrdersList from "../adminOrdersList/adminOrdersList.component";
import AdminProductsPage from "../../pages/adminProducts.page";
import EditProductPage from "../../pages/editProduct.page";
import CreateCategoryPage from "../../pages/createCategory.page";
import EditCategoryPage from "../../pages/editCategory.page";
import OrderDetail from "../orderHistory/orderDetail.component";
import AdminProductDetailsPage from "../../pages/adminProductDetails.page";
import AdminAssetsPage from "../../pages/adminAssets.page";

const AdminProtectedRoutes = () => {
  const { isAdmin, isAuthLoading } = useContext(UserContext);

  if (isAuthLoading) {
    return null;
  }

  return isAdmin ? (
    <Routes>
      <Route path="/createProduct" element={<CreateProductPage />} />
      <Route path="/products" element={<AdminProductsPage />} />
      <Route path="/products/:productId/edit" element={<EditProductPage />} />
      <Route path="/categories/create" element={<CreateCategoryPage />} />
      <Route path="/categories/:categoryId/edit" element={<EditCategoryPage />} />
      <Route path="/product-details" element={<AdminProductDetailsPage />} />
      <Route path="/assets" element={<AdminAssetsPage />} />
      <Route path="/orders" element={<AdminOrdersList />}/>
      <Route path="/orders/:orderId" element={<OrderDetail />}/>
    </Routes>
  ) : (
    <Navigate to="/" />
  );
};

export default AdminProtectedRoutes;
