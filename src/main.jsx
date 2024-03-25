import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./App.css";
import Navigator from "./components/navigator/navigator.component";
import Footer from "./components/footer/footer.component.jsx";
import { BrowserRouter } from "react-router-dom";
import { CategoriesProvider } from "./context/categories.context.jsx";
import { CartProvider } from "./context/cart.context.jsx";
import { UserProvider } from "./context/user.context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <CategoriesProvider>
          <CartProvider>
            <Navigator />
            <App />
            <Footer />
          </CartProvider>
        </CategoriesProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
