import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import AppShell from "./components/app-shell/app-shell.component.jsx";
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
              <AppShell />
            </CartProvider>
          </CategoriesProvider>
        </UserProvider>
      </LocaleProvider>
    </BrowserRouter>
  </React.StrictMode>
);
