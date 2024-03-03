import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CategoriesContext = createContext({
  categories: [],
});

export const CategoriesProvider = ({ children }) => {
  const API_GET_CATEGORIES = "http://localhost:3000/api/categories";
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const respone = await axios.get(API_GET_CATEGORIES);
      setCategories(respone.data);
    };
    fetchCategories();
  }, []);

  const value = {categories};
  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
