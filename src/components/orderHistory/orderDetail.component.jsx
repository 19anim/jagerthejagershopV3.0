import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import OrderDetailItem from "./orderDetailItem.component";

const OrderDetail = () => {
  const GETORDERBYORDERID_API_URL =
    import.meta.env.VITE_API_URL_GETORDERBYORDERID ||
    VITE_API_URL_GETORDERBYORDERID;
  const { orderId } = useParams();
  const [orderItem, setOrderItem] = useState({});
  useEffect(() => {
    const getOrder = async () => {
      const result = await axios.get(`${GETORDERBYORDERID_API_URL}/${orderId}`);
      setOrderItem(result.data);
    };
    if (orderId) getOrder();
  }, [orderId]);
  return (
    <div className="bg-mainGreen rounded-3xl p-8">
      <p className="text-3xl font-bold text-mainOrange mb-5">Order Detail</p>
      <OrderDetailItem orderItem={orderItem} />
    </div>
  );
};

export default OrderDetail;
