import { useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { useContext, useEffect, useState } from "react";
import OrderDetailItem from "./orderDetailItem.component";
import { useLocale } from "../../context/locale.context";
import { UserContext } from "../../context/user.context";
import AdminOrderStatus from "../admin-order-status/admin-order-status.component";

const OrderDetail = ({ embedded = false }) => {
  const GETORDERBYORDERID_API_URL = apiUrl("/api/orders/getOrderByOrderId");
  const { orderId } = useParams();
  const [orderItem, setOrderItem] = useState({});
  const { t } = useLocale();
  const { isAdmin } = useContext(UserContext);
  useEffect(() => {
    const getOrder = async () => {
      const result = await axios.get(`${GETORDERBYORDERID_API_URL}/${orderId}`, { withCredentials: true });
      setOrderItem(result.data);
    };
    if (orderId) getOrder();
  }, [orderId]);
  return (
    <div className={embedded ? "" : "brand-panel mx-auto my-10 max-w-5xl p-5 md:p-8"}>
      <p className="mb-5 font-heading text-3xl font-bold uppercase text-mainOrange">{t("orderDetail")}</p>
      {isAdmin && orderItem?._id && (
        <div className="mb-6">
          <AdminOrderStatus order={orderItem} onStatusUpdated={setOrderItem} />
        </div>
      )}
      <OrderDetailItem orderItem={orderItem} />
    </div>
  );
};

export default OrderDetail;
