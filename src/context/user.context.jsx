import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  email: "",
  setEmail: () => {},
  userInfor: {},
  setUserInfor: () => {},
  defaultUserInfor: {},
});
const OAUTH_API_URL = import.meta.env.VITE_API_URL_OAuth || VITE_API_URL_OAuth;
const UPDATEUSERINFORMATION_API_URL = import.meta.env.VITE_API_URL_UPDATEUSERINFORMATION || VITE_API_URL_UPDATEUSERINFORMATION;
const GETUSERINFORMATION_API_URL =
  import.meta.env.VITE_API_URL_GETUSERINFORMATION ||
  VITE_API_URL_GETUSERINFORMATION;

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
    role: [],
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  //const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [userInfor, setUserInfor] = useState(defaultUserInfor);
  const navigate = useNavigate();

  useEffect(() => {
    const isUserLoggedIn = async () => {
      const result = await axios(OAUTH_API_URL, {
        withCredentials: true,
      });
      setIsLoggedIn(result.data.isLoggedIn);
      if (result.status == 200) {
        //setUserName(result.data.userInfor.userName);
        setEmail(result.data.userInfor.email);
      }
    };
    isUserLoggedIn();
  }, []);

  // useEffect(() => {
  //   console.log(userInfor);
  //   setUserName(userInfor.userName);
  // }, [userInfor.userName]);

  useEffect(() => {
    const getUserInfor = async () => {
      try {
        const result = await axios.post(
          GETUSERINFORMATION_API_URL,
          { userName: userInfor.userName },
          { withCredentials: true }
        );
        if (result.status == 200 && result.data !== null) {
          const { data } = result;
          setUserInfor(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUserInfor();
    return () => {
      setIsUpdate(false);
    };
  }, [isLoggedIn, isUpdate]);

  const updateUserInfor = async (newUserInfor, isNavigated = true) => {
    try {
      const result = await axios.put(
        `${UPDATEUSERINFORMATION_API_URL}/${userInfor.userName}`,
        newUserInfor
        //{ withCredentials: true }
      );
      if (result.status == 200 && isNavigated) {
        navigate("/user/userInformation");
      }
    } catch (error) {
      console.log(error);
    }

    setIsUpdate(true);
  };

  const value = {
    isLoggedIn,
    setIsLoggedIn,
    email,
    setEmail,
    userInfor,
    setUserInfor,
    updateUserInfor,
    defaultUserInfor,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
