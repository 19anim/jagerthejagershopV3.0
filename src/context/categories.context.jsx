import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CategoriesContext = createContext({
  categories: [],
});

export const CategoriesProvider = ({ children }) => {
  const API_GET_CATEGORIES =
    import.meta.env.VITE_API_URL_GETCATEGORIES || VITE_API_URL_GETCATEGORIES;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const respone = await axios.get(API_GET_CATEGORIES);
      setCategories(respone.data);
    };
    fetchCategories();
  }, []);

  const value = { categories };
  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
