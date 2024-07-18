import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const useFetchProductsPerCategory = () => {
  const GETCATEGORIESBYSLUG_API_URL =
    import.meta.env.VITE_API_URL_GETCATEGORIESBYSLUG ||
    VITE_API_URL_GETCATEGORIESBYSLUG;
  const GETPRODUCTSBYCATEGORYID =
    import.meta.env.VITE_API_URL_GETPRODUCTSBYCATEGORYID ||
    VITE_API_URL_GETPRODUCTSBYCATEGORYID;

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
  }, []);
  return [isLoading, products];
};

export default useFetchProductsPerCategory;
