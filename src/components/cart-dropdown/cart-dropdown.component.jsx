import { CartContext } from "../../context/cart.context";
import { useContext, forwardRef, useState, useEffect } from "react";
import CartItem from "./cart-item.component";

const CartDropdown = forwardRef(function CartDropdown(props, ref) {
  const { cartItems, toggleIsCartOpen,  } = useContext(CartContext);
  const [ total, setTotal ] = useState(0);
  const handleCartOnClick = () => {
    toggleIsCartOpen(ref);
  };
  const tempItem = {
    name: "Jagermeister Original 1000ml",
    image:
      "https://i.pinimg.com/564x/fc/e8/b8/fce8b83ae9866f04933103b9fa8be106.jpg",
    priceInInteger: "500.000 VNĐ",
    quantity: 1,
  };
  const calculateTotal = () => {
    let result = cartItems.reduce((acc, cartItem) => {
      return acc + cartItem.priceInInteger * cartItem.quantity;
    }, 0);
    setTotal(result);
  };
  useEffect(calculateTotal, [cartItems])
  return (
    <div
      ref={ref}
      id="cart-dropdown"
      className="w-[415px] duration-1000 bg-mainGreen text-wheat fixed inset-[0_-415px_0_auto] z-10 grid grid-rows-[70px_1fr_70px_70px]"
    >
      <h2 className="font-semibold text-3xl m-auto">SHOPPING CART</h2>
      <div className="p-5">
        {cartItems.map((cartItem) => {
          return <CartItem key={cartItem._id} cartItem={cartItem}></CartItem>;
        })}
      </div>
      <div className="text-xl m-auto">Total: {total.toLocaleString()} VNĐ</div>
      <button onClick={handleCartOnClick}>CLOSE</button>
    </div>
  );
});
export default CartDropdown;
