import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/user.context";
import CreateProductPage from "../../pages/createProduct.page";
import AdminOrdersList from "../adminOrdersList/adminOrdersList.component";

const AdminProtectedRoutes = () => {
  const { isAdmin } = useContext(UserContext);
  return isAdmin ? (
    <Routes>
      <Route path="/createProduct" element={<CreateProductPage />} />
      <Route path="/orders" element={<AdminOrdersList />}/>
    </Routes>
  ) : (
    <Navigate to="/" />
  );
};

export default AdminProtectedRoutes;
