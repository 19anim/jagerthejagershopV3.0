import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({
  categories: [],
});

export const UserProvider = ({ children }) => {
  const API_GET_CATEGORIES = import.meta.env.VITE_BASE_API_URL + "";
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const respone = await axios.get(API_GET_CATEGORIES);
      setCategories(respone.data);
    };
    fetchCategories();
  }, []);

  const value = { categories };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
