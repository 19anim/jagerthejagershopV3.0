import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AdminProductForm from "../components/admin-product-form/admin-product-form.component";
import { CategoriesContext } from "../context/categories.context";
import { apiUrl } from "../utils/api.utils";
import { useLocale } from "../context/locale.context";

const EditProductPage = () => {
  const { productId } = useParams();
  const { categories } = useContext(CategoriesContext);
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const { t } = useLocale();

  useEffect(() => {
    axios.get(apiUrl(`/api/products/getProductById/${productId}`)).then((response) => setProduct(response.data));
  }, [productId]);

  if (!product) return <p className="p-8 text-cream">{t("loading")}</p>;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <p className="brand-kicker mb-2">{t("adminProductsEyebrow")}</p>
      <h1 className="mb-6 font-heading text-3xl font-bold uppercase text-cream">{t("editProduct")}</h1>
      {message && <p className="mb-4 text-green-300">{message}</p>}
      <AdminProductForm initialProduct={product} categories={categories} endpoint={`/api/products/EditProductById/${productId}`} method="PUT" submitLabel={t("saveInformation")} onSuccess={() => setMessage(t("productUpdated"))} />
    </section>
  );
};

export default EditProductPage;
