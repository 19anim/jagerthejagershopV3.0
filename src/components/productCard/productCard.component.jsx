import { useState, useContext } from "react";
import { CartContext } from "../../context/cart.context";

const ProductCard = ({ product }) => {
  const { addItemToCart, modifyCartItemInCartDropdown } = useContext(CartContext);
  const { name, image, price } = product;
  const [quantity, setQuantity] = useState(1);
  const handlePlusButton = () => {
    setQuantity(parseInt(quantity) + 1);
  };
  const handleMinusButton = () => {
    if (quantity > 1) {
      setQuantity(parseInt(quantity) - 1);
    }
  };
  const handleQuantityOnChange = (e) => {
    const { value } = e.target;
    setQuantity(value);
  };
  const addProductToCart = () => {
    addItemToCart(product, quantity);
  };
  return (
    <>
      <div className="md:w-[315px] md:h-[525px] h-[250px] bg-[#fefcfb] rounded-[50px_50px_20px_20px] mx-4 mb-3">
        <div
          className="md:w-[100%] md:h-[375px] w-full h-[60%] bg-center bg-cover rounded-[20px_20px_0_0] mb-2 md:mb-[17.5px]"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="md:h-[150px] h-[40%] text-black font-[Montserrat] px-5">
          <p className="font-bold  md:h-[56px] text-[12px] md:text-lg md:leading-7 leading-4">{name}</p>
          <p className=" font-medium md:text-sm text-[10px]">Price: {price}</p>
          <div className="flex flex-col md:grid md:grid-cols-[30%_70%]">
            <div className="flex items-center text-[12px] md:text-[16px]">
              <button className="flex items-center md" onClick={handleMinusButton}>
                <ion-icon name="remove-circle-outline"></ion-icon>
              </button>
              <input
                className="md:w-[30px] w-[20px] text-center"
                type="number"
                value={quantity}
                onChange={handleQuantityOnChange}
              />
              <button className="flex items-center" onClick={handlePlusButton}>
                <ion-icon name="add-circle-outline"></ion-icon>
              </button>
            </div>
            <button
              className="md:py-2 md:px-4 px-2 w-fit md:text-[16px] text-[8px] border rounded-3xl bg-mainOrange"
              onClick={addProductToCart}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
