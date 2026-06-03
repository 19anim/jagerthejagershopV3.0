import { UserContext } from "../context/user.context";
import { useContext } from "react";
import UserInfor from "../components/userInfor/userInfor.component";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorMessage from "../components/errorMessage/errorMessage.component";
import AuthLayout from "../components/auth-related/authLayout.component";
import UpdateUserInfor from "../components/userInfor/updateUserInfor.component";
import Orders from "../components/userInfor/myOrders.component";
import OrderDetail from "../components/orderHistory/orderDetail.component";
import { useLocale } from "../context/locale.context";
import AccountLayout from "../components/userInfor/accountLayout.component";

const UserPage = () => {
  const { isLoggedIn, userInfor } = useContext(UserContext);
  const { localize, t } = useLocale();
  return (
    <Routes>
      {isLoggedIn && userInfor && (
        <>
          <Route path="/" element={<AccountLayout />}>
            <Route path="userInformation" element={<UserInfor />} />
            <Route path="updateInformation" element={<UpdateUserInfor />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/orderDetail/:orderId" element={<OrderDetail embedded />} />
            <Route path="*" element={<Navigate to={localize("/user/userInformation")} replace />} />
          </Route>
        </>
      )}
      {(!isLoggedIn || !userInfor) && (
        <Route path="*" element={<AuthLayout />}>
          <Route
            path="*"
            element={
              <ErrorMessage errorMessage={t("unauthorized")} />
            }
          />
        </Route>
      )}
    </Routes>
  );
};

export default UserPage;
