import { CartContext } from "../../context/cart.context";
import { useContext } from "react";

const CartCheckoutItem = ({ cartItem }) => {
  const { modifyCartItemInCartDropdown } = useContext(CartContext);
  const { name, category, quantity, priceInInteger } = cartItem;
  const handlePlusButton = () => {
    modifyCartItemInCartDropdown(cartItem, "INCREASE_BUTTON");
  };
  const handleMinusButton = () => {
    modifyCartItemInCartDropdown(cartItem, "DECREASE_BUTTON");
  };
  return (
    <div className="grid grid-cols-[150px_1fr] gap-x-10">
      <img
        src={cartItem.image}
        alt=""
      />
      <div className="flex flex-col justify-between">
        <p className=" text-2xl">Product Name: {name}</p>
        <p className="text-wheat">Type: {category.name}</p>
        <div className="flex items-center gap-2">
          Quantity:
          <button className="flex items-center" onClick={handleMinusButton}>
            <ion-icon name="remove-circle-outline"></ion-icon>
          </button>
          <p>{quantity}</p>
          <button className="flex items-center" onClick={handlePlusButton}>
            <ion-icon name="add-circle-outline"></ion-icon>
          </button>
        </div>
        <p>Price: {(priceInInteger * quantity).toLocaleString()} VNĐ</p>
      </div>
    </div>
  );
};

export default CartCheckoutItem;
