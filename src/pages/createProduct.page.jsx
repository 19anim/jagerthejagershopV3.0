import { useContext, useState } from "react";
import AdminProductForm from "../components/admin-product-form/admin-product-form.component";
import { CategoriesContext } from "../context/categories.context";
import { useLocale } from "../context/locale.context";

const CreateProductPage = () => {
  const { categories } = useContext(CategoriesContext);
  const [message, setMessage] = useState("");
  const { t } = useLocale();

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <p className="brand-kicker mb-2">{t("adminProductsEyebrow")}</p>
      <h1 className="mb-6 font-heading text-3xl font-bold uppercase text-cream">{t("addProduct")}</h1>
      {message && <p className="mb-4 text-green-300">{message}</p>}
      <AdminProductForm categories={categories} endpoint="/api/products/create" method="POST" submitLabel={t("addProduct")} onSuccess={() => setMessage(t("productAdded"))} />
    </section>
  );
};

export default CreateProductPage;
