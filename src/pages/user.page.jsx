import { UserContext } from "../context/user.context";
import { useContext, useEffect, useState } from "react";
import UserInfor from "../components/userInfor/userInfor.component";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorMessage from "../components/errorMessage/errorMessage.component";
import AuthLayout from "../components/auth-related/authLayout.component";
import UpdateUserInfor from "../components/userInfor/updateUserInfor.component";
import OrderPage from "./orders.page";

const UserPage = () => {
  const { isLoggedIn, userInfor } = useContext(UserContext);
  return (
    <Routes>
      {isLoggedIn && userInfor && (
        <>
          <Route path="/" element={<AuthLayout />}>
            <Route path="userInformation" element={<UserInfor />} />
            <Route path="updateInformation" element={<UpdateUserInfor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="orders/*" element={<OrderPage />} />
        </>
      )}
      {(!isLoggedIn || !userInfor) && (
        <Route path="*" element={<AuthLayout />}>
          <Route
            path="*"
            element={
              <ErrorMessage errorMessage="Not Authorized, please login" />
            }
          />
        </Route>
      )}
    </Routes>
  );
};

export default UserPage;
