const CartItem = ({ cartItem }) => {
  const { name, image, priceInInteger, quantity } = cartItem;
  return (
    <div className="grid grid-cols-[50px_150px_80px_1fr] gap-[10px] items-center mb-5 text-[14px] text-center">
      <img src={image} alt="" />
      <p>{name}</p>
      <p>{(priceInInteger * quantity).toLocaleString()} VNĐ</p>
      <div className="flex items-center gap-2">
        <button className="flex items-center">
          <ion-icon name="remove-circle-outline"></ion-icon>
        </button>
        <p>{quantity}</p>
        <button className="flex items-center">
          <ion-icon name="add-circle-outline"></ion-icon>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
