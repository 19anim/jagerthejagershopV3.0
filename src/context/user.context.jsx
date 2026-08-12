import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api.utils";
import { useLocale } from "./locale.context";

export const UserContext = createContext({
  isLoggedIn: false,
  isAdmin: false,
  isAuthLoading: true,
  setIsLoggedIn: () => {},
  email: "",
  setEmail: () => {},
  userInfor: {},
  setUserInfor: () => {},
  setIsAdmin: () => {},
  updateUserInfor: () => {},
  defaultUserInfor: {},
});

const OAUTH_API_URL = apiUrl("/api/users/oAuth");
const UPDATEUSERINFORMATION_API_URL = apiUrl("/api/users/editUserInformation");
const GETUSERINFORMATION_API_URL = apiUrl("/api/users/getUserInformation");

export const UserProvider = ({ children }) => {
  const defaultUserInfor = {
    userName: "",
    email: "",
    receipentName: "",
    address: "",
    ward: "",
    district: "",
    city: "",
    phoneNumber: "",
    roles: [],
    telegramLinked: false,
  };
  const ADMIN_ROLE = "ADMIN";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [email, setEmail] = useState("");
  const [userInfor, setUserInfor] = useState(defaultUserInfor);
  const navigate = useNavigate();
  const { localize } = useLocale();
  
  const isAdminData = localStorage.getItem("isAdmin");
  const [isAdmin, setIsAdmin] = useState(isAdminData === "true");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const isUserLoggedIn = async () => {
      try {
        const result = await axios(OAUTH_API_URL, { withCredentials: true });
        setIsLoggedIn(result.data.isLoggedIn);
        if (result.status == 200) {
          setUserInfor(result.data.userInfor);
          setEmail(result.data.userInfor.email);
        }
      } catch (_error) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        localStorage.removeItem("isAdmin");
      } finally {
        setIsAuthLoading(false);
      }
    };

    isUserLoggedIn();
  }, []);

  useEffect(() => {
    const getUserInfor = async () => {
      if (isAuthLoading) {
        return;
      }
      if (!isLoggedIn || !userInfor.userName) {
        setIsAdmin(false);
        localStorage.removeItem("isAdmin");
        return;
      }
      try {
        const result = await axios.post(
          GETUSERINFORMATION_API_URL,
          { userName: userInfor.userName },
          { withCredentials: true }
        );
        if (result.status == 200 && result.data !== null) {
          const { data } = result;
          const userRolesName = data.roles.map((role) => role.role);
          const haveAdminRole =
            userRolesName.indexOf(ADMIN_ROLE) !== -1 ? true : false;
          setUserInfor(data);
          setIsAdmin(haveAdminRole);
          localStorage.setItem("isAdmin", haveAdminRole);
        }
      } catch (error) {
        console.log(error);
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          localStorage.removeItem("isAdmin");
        }
      }
    };
    getUserInfor();
    return () => {
      setIsUpdate(false);
    };
  }, [isLoggedIn, isUpdate, isAuthLoading]);

  const updateUserInfor = async (newUserInfor, isNavigated = true) => {
    try {
      const result = await axios.put(
        `${UPDATEUSERINFORMATION_API_URL}/${userInfor.userName}`,
        newUserInfor,
        { withCredentials: true }
      );
      if (result.status == 200 && isNavigated) {
        navigate(localize("/user/userInformation"));
      }
    } catch (error) {
      console.log(error);
    }

    setIsUpdate(true);
  };

  const value = {
    isLoggedIn,
    isAdmin,
    isAuthLoading,
    setIsLoggedIn,
    email,
    setEmail,
    userInfor,
    setUserInfor,
    setIsAdmin,
    updateUserInfor,
    defaultUserInfor,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
