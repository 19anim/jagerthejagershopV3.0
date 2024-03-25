import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const defaultUserInfor = {
  userName: "",
  email: "",
  receipentName: "",
  address: "",
  phoneNumber: "",
};

export const UserContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userName: "",
  setUserName: () => {},
  email: "",
  setEmail: () => {},
  userInfor: {},
  setUserInfor: () => {},
});

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [userInfor, setUserInfor] = useState(defaultUserInfor);
  const navigate = useNavigate();

  useEffect(() => {
    const isUserLoggedIn = async () => {
      const result = await axios(
        `${import.meta.env.VITE_BASE_API_URL}/users/oAuth`,
        {
          withCredentials: true,
        }
      );
      setIsLoggedIn(result.data.isLoggedIn);
      if (result.status == 200) {
        setUserName(result.data.userInfor.userName);
        setEmail(result.data.userInfor.email);
      }
    };
    isUserLoggedIn();
  }, []);

  useEffect(() => {
    const getUserInfor = async () => {
      try {
        const result = await axios.post(
          `${import.meta.env.VITE_BASE_API_URL}/users/getUserInformation`,
          { userName: userName },
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

  const updateUserInfor = async (newUserInfor) => {
    try {
      const result = await axios.put(
        `${
          import.meta.env.VITE_BASE_API_URL
        }/users/editUserInformation/${userName}`,
        newUserInfor
        //{ withCredentials: true }
      );
      if (result.status == 200) {
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
    userName,
    setUserName,
    email,
    setEmail,
    userInfor,
    setUserInfor,
    updateUserInfor,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
