import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import ProductCard from "../components/productCard/productCard.component";
import useFetchProductsPerCategory from "../hooks/useFetchProductsPerCategory.hook";

const ProductPerCategory = () => {
  const [isLoading, products] = useFetchProductsPerCategory();
  return isLoading ? (
    <LoadingSpinner />
  ) : (
    <div className="grid md:grid-cols-[repeat(5,1fr)] grid-cols-[repeat(2,1fr)]">
      {products?.map((product) => {
        return <ProductCard key={product._id} product={product}></ProductCard>;
      })}
    </div>
  );
};

export default ProductPerCategory;
