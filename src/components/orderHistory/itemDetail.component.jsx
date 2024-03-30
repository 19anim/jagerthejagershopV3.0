
const ItemDetail = ({ cartItem }) => {
  const {item, quantity} = cartItem;
  const { name, category, priceInInteger, image } = item;
  return (
    <div className="grid grid-cols-[150px_1fr] gap-x-10">
      <img src={image} alt="" />
      <div className="flex flex-col gap-2">
        <p className="text-2xl">Product Name: {name}</p>
        <p className="text-wheat text-xl">Type: {category.name}</p>
        <p className="text-xl">Quantity: {quantity}</p>
        <p className="text-xl">Price per one: {priceInInteger.toLocaleString()} VNĐ</p>
        <p className="text-xl">Total: {(priceInInteger * quantity).toLocaleString()} VNĐ</p>
      </div>
    </div>
  );
};

export default ItemDetail;
