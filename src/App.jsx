import { Navigate, Route, Routes, useParams } from "react-router-dom";
import HomePage from "./pages/homePage.page";
import ProductsPage from "./pages/productsPage.page";
import AuthPage from "./pages/auth.page";
import UserPage from "./pages/user.page";
import CartCheckoutPage from "./pages/cartCheckout.page";
import AdminProtectedRoutes from "./components/adminProtectedRoutes/adminProtectedRoutes.component";
import { UserContext } from "./context/user.context";
import { useContext } from "react";

const LocalizedRoutes = () => {
  const { locale } = useParams();
  const { isLoggedIn } = useContext(UserContext);

  if (locale !== "vi" && locale !== "en") return <Navigate to="/vi" replace />;

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="products/*" element={<ProductsPage />} />
      <Route path="authentication/*" element={!isLoggedIn ? <AuthPage /> : <Navigate to={`/${locale}/user`} replace />} />
      <Route path="user/*" element={<UserPage />} />
      <Route path="cartCheckout/*" element={<CartCheckoutPage />} />
      <Route path="*" element={<Navigate to={`/${locale}`} replace />} />
    </Routes>
  );
};

const App = () => (
  <Routes>
    <Route path="/admin/*" element={<AdminProtectedRoutes />} />
    <Route path="/:locale/*" element={<LocalizedRoutes />} />
    <Route path="/" element={<Navigate to="/vi" replace />} />
    <Route path="*" element={<Navigate to="/vi" replace />} />
  </Routes>
);

export default App;
