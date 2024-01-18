import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Navigator from "./components/navigator/navigator.component";
import Footer from "./components/footer/footer.component.jsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navigator />
      <App />
      <Footer />
    </BrowserRouter>
  </React.StrictMode>
);
