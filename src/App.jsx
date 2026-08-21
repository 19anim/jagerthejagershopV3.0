import { Navigate, Route, Routes, useParams, useLocation } from "react-router-dom";
import { useShopMode, SHOP_MODE } from "./hooks/useShopMode.hook";
import HomePage from "./pages/homePage.page";
import ProductsPage from "./pages/productsPage.page";
import AuthPage from "./pages/auth.page";
import UserPage from "./pages/user.page";
import CartCheckoutPage from "./pages/cartCheckout.page";
import AdminProtectedRoutes from "./components/adminProtectedRoutes/adminProtectedRoutes.component";
import { UserContext } from "./context/user.context";
import { useContext, lazy, Suspense } from "react";
import LoadingSpinner from "./components/loading-spinner/loading-spinner.component";

const Shop3DPage = lazy(() => import("./pages/shop3d.page"));

// Routes that stay reachable while 3D mode is active (the shop itself, the
// checkout/payment flow reached from the cashier, and auth/user for login-gated
// checkout). Any other classic route redirects into the 3D shop.
const THREE_D_ALLOWED = ["shop3d", "cartCheckout", "authentication", "user"];

const LocalizedRoutes = () => {
  const { locale } = useParams();
  const { isLoggedIn } = useContext(UserContext);
  const { mode } = useShopMode();
  const { pathname } = useLocation();

  if (locale !== "vi" && locale !== "en") return <Navigate to="/vi" replace />;

  if (mode === SHOP_MODE.THREE_D) {
    const sub = pathname.replace(/^\/(vi|en)\/?/, "").split("/")[0];
    if (!THREE_D_ALLOWED.includes(sub)) {
      return <Navigate to={`/${locale}/shop3d`} replace />;
    }
  }

  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="products/*" element={<ProductsPage />} />
      <Route path="authentication/*" element={!isLoggedIn ? <AuthPage /> : <Navigate to={`/${locale}/user`} replace />} />
      <Route path="user/*" element={<UserPage />} />
      <Route path="cartCheckout/*" element={<CartCheckoutPage />} />
      <Route
        path="shop3d"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <Shop3DPage />
          </Suspense>
        }
      />
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
