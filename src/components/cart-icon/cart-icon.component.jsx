import { useContext } from "react";
import { CartContext } from "../../context/cart.context";

const CartIcon = ({ cartDropdownRef }) => {
  const { toggleIsCartOpen } = useContext(CartContext);
  const handleCartIconClick = () => {
    toggleIsCartOpen(cartDropdownRef);
  };
  return (
    <div className="flex items-center" onClick={handleCartIconClick}>
      <ion-icon
        name="cart-outline"
        class="relative peer text-2xl cursor-pointer"
      ></ion-icon>
    </div>
  );
};

export default CartIcon;
