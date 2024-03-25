import { CartContext } from "../../context/cart.context";
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CartCheckoutItem from "./cartCheckoutItem.component";
import EstimatedTransferFee from "./estimatedTransferFee.component";
import OrderSummary from "./orderSummary.component";

const CartCheckout = () => {
  const { cartItems, deliveryPrice } = useContext(CartContext);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    setSubtotal(
      cartItems.reduce((acc, cartItem) => {
        return acc + cartItem.quantity * cartItem.priceInInteger;
      }, 0)
    );
  }, [cartItems]);
  return (
    <div className="grid grid-cols-[1fr_500px] gap-8">
      <div className="bg-mainGreen rounded-lg p-10">
        <div className="flex justify-between text-xl mb-5">
          <p className="text-3xl">Shopping Cart</p>
          <Link
            to="/products"
            className="flex justify-center items-center text-3xl text-mainOrange"
          >
            <ion-icon name="arrow-back-outline"></ion-icon>
            <p className="ml-2">Continue Shopping</p>
          </Link>
        </div>
        <div className="flex flex-col gap-5">
          {cartItems.map((cartItem) => {
            return (
              <div key={cartItem.name}>
                <CartCheckoutItem cartItem={cartItem} />
                <hr className="mt-5 border-gray-500" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <EstimatedTransferFee />
        <OrderSummary cartItems={cartItems}/>
      </div>
    </div>
  );
};

export default CartCheckout;
