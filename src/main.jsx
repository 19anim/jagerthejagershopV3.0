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
import { LocaleProvider } from "./context/locale.context.jsx";
import AgeGate from "./components/age-gate/age-gate.component.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <UserProvider>
          <CategoriesProvider>
            <CartProvider>
              <AgeGate />
              <Navigator />
              <main className="min-h-[60vh]">
                <App />
              </main>
              <Footer />
            </CartProvider>
          </CategoriesProvider>
        </UserProvider>
      </LocaleProvider>
    </BrowserRouter>
  </React.StrictMode>
);
