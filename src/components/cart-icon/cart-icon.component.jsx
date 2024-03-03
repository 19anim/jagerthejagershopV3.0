import { useContext } from "react";
import { CartContext } from "../../context/cart.context";

const CartIcon = () => {
  const { toggleIsCartOpen } = useContext(CartContext);

  return (
    <div onClick={toggleIsCartOpen}>
      <ion-icon
        name="cart-outline"
        class="relative peer text-2xl cursor-pointer"
      ></ion-icon>
    </div>
  );
};

export default CartIcon;
