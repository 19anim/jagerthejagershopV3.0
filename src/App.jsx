import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage.page";
import ProductsPage from "./pages/productsPage.page";
import UserPage from "./pages/user.page";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products/*" element={<ProductsPage />} />
      <Route path="/user/*" element={<UserPage/>}/>
    </Routes>
  );
};

export default App;
