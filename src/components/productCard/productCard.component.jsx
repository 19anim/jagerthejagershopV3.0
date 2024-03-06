import { useState } from "react";

const ProductCard = ({ product }) => {
  const { name, image, price } = product;
  const [quantity, setQuantity] = useState(0);
  const handlePlusButton = () => {
    setQuantity(parseInt(quantity) + 1);
  };
  const handleMinusButton = () => {
    setQuantity(parseInt(quantity) - 1);
  };
  const handleQuantityOnChange = (e) => {
    const { value } = e.target;
    setQuantity(value);
  };
  return (
    <>
      <div className="w-[315px] h-[525px] bg-[#fefcfb] rounded-[50px_50px_20px_20px] mx-4 mb-3">
        <div
          className="w-[100%] h-[375px] bg-center bg-cover rounded-[20px_20px_0_0] mb-[17.5px]"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="h-[150px] text-black font-[Montserrat] px-5">
          <p className="font-bold text-lg h-[56px]">{name}</p>
          <p className=" font-medium text-sm">Price: {price}</p>
          <div className="grid grid-cols-[30%_70%]">
            <div className="flex items-center">
              <button className="flex items-center" onClick={handleMinusButton}>
                <ion-icon name="remove-circle-outline"></ion-icon>
              </button>
              <input
                className="w-[30px] text-center"
                type="number"
                value={quantity}
                onChange={handleQuantityOnChange}
              />
              <button className="flex items-center" onClick={handlePlusButton}>
                <ion-icon name="add-circle-outline"></ion-icon>
              </button>
            </div>
            <button className="py-2 px-4 border rounded-3xl bg-mainOrange">
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
