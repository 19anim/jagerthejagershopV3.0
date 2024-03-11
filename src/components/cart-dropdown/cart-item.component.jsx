import { useContext } from "react";
import { CartContext } from "../../context/cart.context";

const CartItem = ({ cartItem }) => {
  const { name, image, priceInInteger, quantity } = cartItem;
  const { modifyCartItemInCartDropdown } = useContext(CartContext);
  const handlePlusButton = () => {
    modifyCartItemInCartDropdown(cartItem, "INCREASE_BUTTON");
  };
  const handleMinusButton = () => {
    modifyCartItemInCartDropdown(cartItem, "DECREASE_BUTTON");
  };
  return (
    <div className="grid grid-cols-[50px_150px_80px_1fr] gap-[10px] items-center mb-5 text-[14px] text-center">
      <img src={image} alt="" />
      <p>{name}</p>
      <p>{(priceInInteger * quantity).toLocaleString()} VNĐ</p>
      <div className="flex items-center gap-2">
        <button className="flex items-center" onClick={handleMinusButton}>
          <ion-icon name="remove-circle-outline"></ion-icon>
        </button>
        <p>{quantity}</p>
        <button className="flex items-center" onClick={handlePlusButton}>
          <ion-icon name="add-circle-outline"></ion-icon>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
