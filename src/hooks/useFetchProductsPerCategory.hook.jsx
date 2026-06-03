import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "../utils/api.utils";

const useFetchProductsPerCategory = () => {
  const GETCATEGORIESBYSLUG_API_URL = apiUrl("/api/categories/getCategoryBySlug");
  const GETPRODUCTSBYCATEGORYID = apiUrl("/api/products/getProductByCategoryId");

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const category = await axios(`${GETCATEGORIESBYSLUG_API_URL}/${slug}`);
        const productsData = await axios(
          `${GETPRODUCTSBYCATEGORYID}/${category.data._id}`
        );
        setProducts(productsData.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error.message)
      }
    };
    fetchCategory();
  }, [slug]);
  return [isLoading, products];
};

export default useFetchProductsPerCategory;
