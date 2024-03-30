import { Link } from "react-router-dom";

const OrderItem = ({ orderItem, orderIndex }) => {
  const { createdAt, total, paymentMethod, status, _id, items, address, ward, district, city } = orderItem;
  const buyAt = new Date(createdAt);
  const orderDate = `${buyAt.getDate()}/${
    buyAt.getMonth() + 1
  }/${buyAt.getFullYear()}`;
  const deliveryAddress = `${address}, ${ward}, ${district}, ${city}`;
  return (
    <div>
      <h2 className="text-2xl text-mainOrange font-medium">Order Number {orderIndex}</h2>
      <div className="grid grid-cols-[1fr_1fr_2fr_1fr_2fr_1fr_1fr]">
        <div>
          <p className="text-xl">Order date</p>
          <p className="text-lg">{orderDate}</p>
        </div>
        <div>
          <p className="text-xl">Total</p>
          <p>{total.toLocaleString()} VNĐ</p>
        </div>
        <div>
          <p className="text-xl">Delivery Address</p>
          <p className="text-lg">{deliveryAddress}</p>
        </div>
        <div>
          <p className="text-xl">Product Count</p>
          <p className="text-lg">{items.length}</p>
        </div>
        <div>
          <p className="text-xl">Payment Method</p>
          <p className="text-lg">{paymentMethod.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-xl">Status</p>
          <p className="text-lg">{status[0].statusName}</p>
        </div>
        <div>
          <Link to={`/user/orders/orderDetail/${_id}`}>
            <button className="text-black font-medium bg-mainOrange px-4 py-2 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_10px_#6e9f65]">
              View Detail
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
