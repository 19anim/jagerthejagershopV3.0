import { useContext } from "react";
import { CategoriesContext } from "../../context/categories.context";
import CategoryItem from "../category-item/category-item.component";

const Categories = () => {
  const { categories } = useContext(CategoriesContext);
  return (
    <div className="flex flex-wrap w-[100%] justify-between">
      {categories.map((category) => {
        return (
          <CategoryItem key={category._id} category={category}></CategoryItem>
        );
      })}
    </div>
  );
};

export default Categories;
