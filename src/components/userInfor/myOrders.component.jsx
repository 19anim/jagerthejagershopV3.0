import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/user.context";
import OrderItem from "../orderHistory/orderItem.component";

const Orders = () => {
  const GETORDERBYUSER_API_URL =
    import.meta.env.VITE_API_URL_GETORDERBYUSER || VITE_API_URL_GETORDERBYUSER;
  const { userInfor } = useContext(UserContext);
  const { userName } = userInfor;
  const [orderItems, setOrderItems] = useState([]);
  useEffect(() => {
    const getOrders = async () => {
      const result = await axios.get(`${GETORDERBYUSER_API_URL}/${userName}`);
      if (result.status === 200) {
        setOrderItems(result.data);
      }
    };
    getOrders();
  }, []);
  return (
    <div className="bg-mainGreen rounded-3xl p-8">
      <h3 className="text-3xl font-bold text-mainOrange">ORDER LIST</h3>
      <div className="flex flex-col mt-5 gap-10 max-h-[400px] overflow-y-scroll scrollbar-gray scrollbar-webkit">
        {orderItems &&
          orderItems.map((orderItem, index) => {
            const orderIndex = index + 1;
            return (
              <OrderItem
                key={orderItem._id}
                orderItem={orderItem}
                orderIndex={orderIndex}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Orders;
