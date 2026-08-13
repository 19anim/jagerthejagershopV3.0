import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { apiUrl } from "../utils/api.utils";
import { getOptimizedImageUrl } from "../utils/image.utils";
import { useLocale } from "../context/locale.context";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLocale();

  const fetchProducts = async () => {
    const response = await axios.get(apiUrl("/api/products/getAllProducts"));
    setProducts(response.data);
  };

  const fetchCategories = async () => {
    const response = await axios.get(apiUrl("/api/categories/getAllCategories"));
    setCategories(response.data);
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).catch(() => {
      setErrorMessage(t("catalogLoadFailed"));
    });
  }, []);

  const deleteProduct = async (productId) => {
    if (!window.confirm(t("confirmDeleteProduct"))) return;
    try {
      await axios.delete(apiUrl(`/api/products/DeleteProductById/${productId}`), { withCredentials: true });
      setProducts((current) => current.filter((product) => product._id !== productId));
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("productDeleteFailed"));
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm(t("confirmDeleteCategory"))) return;
    try {
      await axios.delete(apiUrl(`/api/categories/DeleteCategoryById/${categoryId}`), { withCredentials: true });
      setCategories((current) => current.filter((category) => category._id !== categoryId));
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("categoryDeleteFailed"));
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="brand-kicker mb-2">{t("adminCatalogEyebrow")}</p>
          <h1 className="font-heading text-3xl font-bold uppercase text-cream">{t("adminCatalog")}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="brand-button" to="/admin/createProduct">{t("addProduct")}</Link>
          <Link className="brand-button" to="/admin/categories/create">{t("addCategory")}</Link>
          <Link className="brand-button-outline" to="/admin/product-details">{t("adminProductDetails")}</Link>
        </div>
      </div>

      {errorMessage && <p className="mb-4 text-red-300">{errorMessage}</p>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <div className="overflow-hidden border border-warmGold/25 bg-mainGreen shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
            <h2 className="font-heading text-xl font-bold uppercase text-cream">{t("adminProducts")}</h2>
            <span className="text-sm text-cream/60">{products.length} {t("items")}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#14231d] font-heading text-xs uppercase tracking-wider text-cream">
                <tr>
                  <th className="p-3">{t("image")}</th>
                  <th className="p-3">{t("productName")}</th>
                  <th className="p-3">{t("category")}</th>
                  <th className="p-3">{t("displayPrice")}</th>
                  <th className="p-3">{t("sold")}</th>
                  <th className="p-3">{t("stock")}</th>
                  <th className="p-3">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr className="border-b border-white/10 text-cream/80" key={product._id}>
                    <td className="p-3"><img className="size-16 object-cover" src={getOptimizedImageUrl(product.image, "thumbnail")} alt={product.name} /></td>
                    <td className="p-3 font-bold text-cream">{product.name}</td>
                    <td className="p-3">{product.category?.name || "-"}</td>
                    <td className="p-3">{product.price}</td>
                    <td className="p-3">{product.soldAmount}</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3">
                      <Link className="mr-4 font-bold text-mainOrange" to={`/admin/products/${product._id}/edit`}>{t("edit")}</Link>
                      <button className="font-bold text-red-300" onClick={() => deleteProduct(product._id)}>{t("remove")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-warmGold/25 bg-mainGreen shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
            <h2 className="font-heading text-xl font-bold uppercase text-cream">{t("adminCategories")}</h2>
            <span className="text-sm text-cream/60">{categories.length} {t("items")}</span>
          </div>
          <div className="divide-y divide-white/10">
            {categories.map((category) => (
              <div className="grid grid-cols-[64px_1fr_auto] items-center gap-3 p-4 text-sm text-cream/80" key={category._id}>
                <img className="size-16 object-cover" src={getOptimizedImageUrl(category.image, "thumbnail")} alt={category.name} />
                <div>
                  <p className="font-bold text-cream">{category.name}</p>
                  <p className="text-xs text-cream/50">/{category.slug}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link className="font-bold text-mainOrange" to={`/admin/categories/${category._id}/edit`}>{t("edit")}</Link>
                  <button className="font-bold text-red-300" onClick={() => deleteCategory(category._id)}>{t("remove")}</button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="p-4 text-sm text-cream/60">{t("emptyCategoriesBody")}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminProductsPage;
