import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/productCard/productCard.component";

const ProductPerCategory = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchCategory = async () => {
      const category = await axios(`http://localhost:3000/api/categories/getCategoryBySlug/${slug}`);
      const productsData = await axios(`http://localhost:3000/api/products/getProductByCategoryId/${category.data._id}`)
      setProducts(productsData.data);
    }
    fetchCategory();
  },[]);
  return (
    <div className="grid grid-cols-[repeat(5,1fr)]">
      {products.map((product) => {
        return <ProductCard key={product._id} product={product}></ProductCard>
      })}
    </div>
  );
};

export default ProductPerCategory;
