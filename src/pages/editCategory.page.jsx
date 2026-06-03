import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AdminCategoryForm from "../components/admin-category-form/admin-category-form.component";
import { CategoriesContext } from "../context/categories.context";
import { apiUrl } from "../utils/api.utils";
import { useLocale } from "../context/locale.context";

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [message, setMessage] = useState("");
  const { refreshCategories } = useContext(CategoriesContext);
  const { t } = useLocale();

  useEffect(() => {
    axios.get(apiUrl(`/api/categories/getCategoryById/${categoryId}`)).then((response) => setCategory(response.data));
  }, [categoryId]);

  if (!category) return <p className="p-8 text-cream">{t("loading")}</p>;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <p className="brand-kicker mb-2">{t("adminCatalogEyebrow")}</p>
      <h1 className="mb-6 font-heading text-3xl font-bold uppercase text-cream">{t("editCategory")}</h1>
      {message && <p className="mb-4 text-green-300">{message}</p>}
      <AdminCategoryForm
        initialCategory={category}
        endpoint={`/api/categories/EditCategoryById/${categoryId}`}
        method="PUT"
        submitLabel={t("saveInformation")}
        onSuccess={() => {
          setMessage(t("categoryUpdated"));
          refreshCategories();
        }}
      />
    </section>
  );
};

export default EditCategoryPage;
