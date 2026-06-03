import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/user.context";
import OrderItem from "../orderHistory/orderItem.component";
import { useLocale } from "../../context/locale.context";

const Orders = () => {
  const GETORDERBYUSER_API_URL = apiUrl("/api/orders/getOrderByUser");
  const { userInfor } = useContext(UserContext);
  const { t } = useLocale();
  const { userName } = userInfor;
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const getOrders = async () => {
      const result = await axios.get(`${GETORDERBYUSER_API_URL}/${userName}`, { withCredentials: true });
      if (result.status === 200) setOrderItems(result.data);
    };
    getOrders();
  }, [userName]);

  return (
    <div>
      <p className="brand-kicker mb-2">JAGER THE JAGER · ACCOUNT</p>
      <h1 className="font-heading text-3xl font-extrabold uppercase text-cream">{t("orderList")}</h1>
      <div className="mt-6 flex flex-col gap-5">
        {orderItems.length === 0
          ? <p className="border border-white/10 bg-[#14231d] p-5 leading-7 text-cream/70">{t("emptyOrders")}</p>
          : orderItems.map((orderItem, index) => <OrderItem key={orderItem._id} orderItem={orderItem} orderIndex={index + 1} />)}
      </div>
    </div>
  );
};

export default Orders;
