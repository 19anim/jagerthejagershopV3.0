import { useContext } from "react";
import { Link } from "react-router-dom";
import { CategoriesContext } from "../../context/categories.context";
import CategoryItem from "../category-item/category-item.component";
import { useLocale } from "../../context/locale.context";

const Categories = () => {
  const { categories } = useContext(CategoriesContext);
  const { t } = useLocale();
  if (categories.length === 0) {
    return (
      <section className="mx-auto flex min-h-[420px] max-w-[1440px] items-center px-4 py-16 md:px-8">
        <div className="max-w-2xl border border-warmGold/35 bg-mainGreen p-7 shadow-2xl md:p-10">
          <p className="brand-kicker mb-3">JAGER THE JAGER · SOON</p>
          <h1 className="font-heading text-3xl font-extrabold uppercase leading-tight text-cream md:text-5xl">{t("emptyCategoriesTitle")}</h1>
          <p className="mt-4 max-w-xl leading-7 text-cream/70">{t("emptyCategoriesBody")}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold uppercase text-cream">{t("products")}</h1>
        <Link className="brand-button min-h-0 px-4 py-2" to="all">{t("viewAllProducts")}</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((category) => {
          return (
            <CategoryItem key={category._id} category={category}></CategoryItem>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
