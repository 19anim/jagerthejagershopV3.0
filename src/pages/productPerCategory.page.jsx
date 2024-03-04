import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  return <div>
    {products.map((product) => {
      return <h2 key={product._id}>{product.name}</h2>
    })}
  </div>
};

export default ProductPerCategory;
