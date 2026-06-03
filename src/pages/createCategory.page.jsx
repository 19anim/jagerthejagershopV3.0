import { useContext, useState } from "react";
import AdminCategoryForm from "../components/admin-category-form/admin-category-form.component";
import { CategoriesContext } from "../context/categories.context";
import { useLocale } from "../context/locale.context";

const CreateCategoryPage = () => {
  const [message, setMessage] = useState("");
  const { refreshCategories } = useContext(CategoriesContext);
  const { t } = useLocale();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <p className="brand-kicker mb-2">{t("adminCatalogEyebrow")}</p>
      <h1 className="mb-6 font-heading text-3xl font-bold uppercase text-cream">{t("addCategory")}</h1>
      {message && <p className="mb-4 text-green-300">{message}</p>}
      <AdminCategoryForm
        endpoint="/api/categories"
        method="POST"
        submitLabel={t("addCategory")}
        onSuccess={() => {
          setMessage(t("categoryAdded"));
          refreshCategories();
        }}
      />
    </section>
  );
};

export default CreateCategoryPage;
