import { useContext } from "react";
import Categories from "../components/categories/categories.component";
import LoadingSpinner from "../components/loading-spinner/loading-spinner.component";
import { CategoriesContext } from "../context/categories.context";

const CategoriesPage = () => {
  const { isCategoriesLoaded } = useContext(CategoriesContext);
  return <>{isCategoriesLoaded ? <Categories /> : <LoadingSpinner />}</>;
};

export default CategoriesPage;
