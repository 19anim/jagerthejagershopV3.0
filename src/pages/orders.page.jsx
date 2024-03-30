import { Routes, Route, Navigate } from "react-router-dom";
import Orders from "../components/userInfor/myOrders.component";
import OrderDetail from "../components/orderHistory/orderDetail.component";

const OrderPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Orders />} />
      <Route path="/orderDetail/:orderId" element={<OrderDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default OrderPage;
