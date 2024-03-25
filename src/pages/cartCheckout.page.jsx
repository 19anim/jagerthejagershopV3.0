import CartCheckout from "../components/cartCheckout/cartCheckout.component";
import PlaceOrder from "../components/placeOrder/placeOrder.component";
import { Routes, Route } from "react-router-dom";

const CartCheckoutPage = () => {
  return (
    <Routes>
      <Route index element={<CartCheckout />} />
      <Route path="placeOrder" element={<PlaceOrder />} />
    </Routes>
  );
};

export default CartCheckoutPage;
