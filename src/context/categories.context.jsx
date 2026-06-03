import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiUrl } from "../utils/api.utils";

export const CategoriesContext = createContext({
  categories: [],
  isCategoriesLoaded: false,
  refreshCategories: () => {},
});

export const CategoriesProvider = ({ children }) => {
  const API_GET_CATEGORIES = apiUrl("/api/categories/getAllCategories");
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(API_GET_CATEGORIES);
      setCategories(response.data);
    } finally {
      setIsCategoriesLoaded(true);
    }
  }, [API_GET_CATEGORIES]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value = { categories, isCategoriesLoaded, refreshCategories: fetchCategories };
  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
