import { CartContext } from "../../context/cart.context";
import { useContext } from "react";
import Button from "../button/button.component";
import { Link } from "react-router-dom";

const OrderSummary = () => {
  const { deliveryPrice, subtotal } = useContext(CartContext);

  return (
    <div className="bg-mainGreen rounded-lg p-5">
      <h3 className="mb-5 text-2xl">Order Summary</h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{subtotal.toLocaleString()} VNĐ</p>
        </div>
        <div className="flex justify-between">
          <p>Delivery Fee</p>
          <p>
            {deliveryPrice !== 0 && deliveryPrice !== -1
              ? `${deliveryPrice.toLocaleString()} VNĐ`
              : "----"}
          </p>
        </div>
        <hr className="border-gray-500" />
        <div className="flex justify-between">
          <p>
            <strong>Total</strong>
          </p>
          <p>
            <strong>
              {deliveryPrice !== -1
                ? `${(subtotal + deliveryPrice).toLocaleString()} VNĐ`
                : `${subtotal.toLocaleString()} VNĐ`}
            </strong>
          </p>
        </div>
      </div>
      <div className="mt-5">
        <Link to="/cartCheckout/placeOrder">
          <Button>Place order</Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSummary;
