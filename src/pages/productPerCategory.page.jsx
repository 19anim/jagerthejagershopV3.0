import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/productCard/productCard.component";

const ProductPerCategory = () => {
  const GETCATEGORIESBYSLUG_API_URL =
    import.meta.env.VITE_API_URL_GETCATEGORIESBYSLUG ||
    VITE_API_URL_GETCATEGORIESBYSLUG;
  const GETPRODUCTSBYCATEGORYID =
    import.meta.env.VITE_API_URL_GETPRODUCTSBYCATEGORYID ||
    VITE_API_URL_GETPRODUCTSBYCATEGORYID;
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchCategory = async () => {
      const category = await axios(`${GETCATEGORIESBYSLUG_API_URL}/${slug}`);
      const productsData = await axios(
        `${GETPRODUCTSBYCATEGORYID}/${category.data._id}`
      );
      setProducts(productsData.data);
    };
    fetchCategory();
  }, []);
  return (
    <div className="grid md:grid-cols-[repeat(5,1fr)] grid-cols-[repeat(2,1fr)]">
      {products.map((product) => {
        return <ProductCard key={product._id} product={product}></ProductCard>;
      })}
    </div>
  );
};

export default ProductPerCategory;
