import { CartContext } from "../../context/cart.context";
import { useContext, forwardRef, useState, useEffect } from "react";
import CartItem from "./cart-item.component";
import DropdownButton from "../button/dropdownButton.component";
import { Link } from "react-router-dom";

const CartDropdown = forwardRef(function CartDropdown(props, ref) {
  const { cartItems, toggleIsCartOpen } = useContext(CartContext);
  const [total, setTotal] = useState(0);
  const handleCartOnClick = () => {
    toggleIsCartOpen(ref);
  };
  const calculateTotal = () => {
    let result = cartItems.reduce((acc, cartItem) => {
      return acc + cartItem.priceInInteger * cartItem.quantity;
    }, 0);
    setTotal(result);
  };
  useEffect(calculateTotal, [cartItems]);
  return (
    <div
      ref={ref}
      id="cart-dropdown"
      className="sm:w-[415px] w-full duration-1000 bg-mainGreen text-wheat fixed inset-[0_-641px_0_auto] z-10 grid grid-rows-[70px_1fr_70px_200px]"
    >
      <h2 className="font-semibold text-3xl m-auto">SHOPPING CART</h2>
      <div className="p-5 overflow-y-scroll scrollbar-black scrollbar-webkit">
        {cartItems.map((cartItem) => {
          return <CartItem key={cartItem._id} cartItem={cartItem}></CartItem>;
        })}
      </div>
      <div className="text-xl m-auto">Total: {total.toLocaleString()} VNĐ</div>
      <div className="flex flex-col gap-3 w-full justify-center items-center">
        <Link to="/cartCheckout" className="w-full flex justify-center items-center">
          <DropdownButton onClick={handleCartOnClick}>
            GO TO CHECKOUT
          </DropdownButton>
        </Link>
        <DropdownButton onClick={handleCartOnClick}>CLOSE</DropdownButton>
      </div>
    </div>
  );
});
export default CartDropdown;
