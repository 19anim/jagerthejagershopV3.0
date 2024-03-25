import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homePage.page";
import ProductsPage from "./pages/productsPage.page";
import AuthPage from "./pages/auth.page";
import UserPage from "./pages/user.page";
import CartCheckoutPage from "./pages/cartCheckout.page";
import { UserContext } from "./context/user.context";
import { useContext, useEffect } from "react";
import axios from "axios";

const App = () => {
  const { isLoggedIn, setIsLoggedIn, setUserName, setEmail } =
    useContext(UserContext);
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products/*" element={<ProductsPage />} />
      <Route
        path="/authentication/*"
        element={!isLoggedIn ? <AuthPage /> : <Navigate to="/user" replace />}
      />
      <Route path="/user/*" element={<UserPage />} />
      <Route path="/cartCheckout/*" element={<CartCheckoutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
