import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { apiUrl } from "../utils/api.utils";
import { useLocale } from "../context/locale.context";

const emptyForm = {
  productIds: [],
  descriptionTitle: "",
  description: "",
};

const AdminProductDetailsPage = () => {
  const [products, setProducts] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingDescriptionId, setEditingDescriptionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLocale();

  const fetchData = async () => {
    const [productsResponse, descriptionsResponse] = await Promise.all([
      axios.get(apiUrl("/api/products/getAllProducts")),
      axios.get(apiUrl("/api/productsDescription/getAllProductDescriptions")),
    ]);
    setProducts(productsResponse.data);
    setDescriptions(descriptionsResponse.data);
  };

  useEffect(() => {
    fetchData().catch(() => setErrorMessage(t("productDetailsLoadFailed")));
  }, []);

  const otherAssignedProductIds = useMemo(
    () =>
      new Set(
        descriptions
          .filter((description) => description._id !== editingDescriptionId)
          .flatMap((description) => description.products || [])
          .map((product) => product._id)
          .filter(Boolean),
      ),
    [descriptions, editingDescriptionId],
  );

  const assignableProducts = useMemo(
    () => products.filter((product) => !otherAssignedProductIds.has(product._id)),
    [otherAssignedProductIds, products],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingDescriptionId("");
  };

  const handleEdit = (description) => {
    setEditingDescriptionId(description._id);
    setForm({
      productIds: (description.products || []).map((product) => product._id),
      descriptionTitle: description.descriptionTitle,
      description: description.description,
    });
    setMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setErrorMessage("");
    try {
      if (editingDescriptionId) {
        await axios.put(
          apiUrl(`/api/productsDescription/${editingDescriptionId}`),
          {
            productIds: form.productIds,
            descriptionTitle: form.descriptionTitle,
            description: form.description,
          },
          { withCredentials: true },
        );
        setMessage(t("productDetailUpdated"));
      } else {
        await axios.post(apiUrl("/api/productsDescription/create"), form, {
          withCredentials: true,
        });
        setMessage(t("productDetailCreated"));
      }
      resetForm();
      await fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("productDetailSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProduct = (productId) => {
    setForm((current) => {
      const isSelected = current.productIds.includes(productId);
      return {
        ...current,
        productIds: isSelected
          ? current.productIds.filter((selectedProductId) => selectedProductId !== productId)
          : [...current.productIds, productId],
      };
    });
  };

  const handleDelete = async (descriptionId) => {
    if (!window.confirm(t("confirmDeleteProductDetail"))) return;
    setMessage("");
    setErrorMessage("");
    try {
      await axios.delete(apiUrl(`/api/productsDescription/${descriptionId}`), {
        withCredentials: true,
      });
      setMessage(t("productDetailDeleted"));
      if (editingDescriptionId === descriptionId) resetForm();
      await fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("productDetailDeleteFailed"));
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="brand-kicker mb-2">{t("adminProductDetailsEyebrow")}</p>
        <h1 className="font-heading text-3xl font-bold uppercase text-cream">
          {t("adminProductDetails")}
        </h1>
      </div>

      {(message || errorMessage) && (
        <p className={`mb-4 ${errorMessage ? "text-red-300" : "text-green-300"}`}>
          {errorMessage || message}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form className="brand-panel flex flex-col gap-5 p-5 md:p-8" onSubmit={handleSubmit}>
          <h2 className="font-heading text-xl font-bold uppercase">
            {editingDescriptionId ? t("editProductDetail") : t("addProductDetail")}
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">
              {t("assignedProducts")}
            </span>
            <div className="max-h-64 overflow-y-auto border border-white/15 bg-[#14231d] p-3">
              {assignableProducts.map((product) => (
                <label className="mb-3 flex items-start gap-3 last:mb-0" key={product._id}>
                  <input
                    checked={form.productIds.includes(product._id)}
                    className="mt-1"
                    onChange={() => toggleProduct(product._id)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-bold text-cream">{product.name}</span>
                    <span className="text-xs text-cream/50">{product.category?.name || "-"}</span>
                  </span>
                </label>
              ))}
              {assignableProducts.length === 0 && (
                <p className="text-cream/60">{t("noAssignableProducts")}</p>
              )}
            </div>
            <p className="text-xs text-cream/50">
              {form.productIds.length} {t("selectedProducts")}
            </p>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">
              {t("detailTitle")}
            </span>
            <input
              className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream outline-none focus:ring-2 focus:ring-mainOrange"
              onChange={(event) =>
                setForm((current) => ({ ...current, descriptionTitle: event.target.value }))
              }
              required
              type="text"
              value={form.descriptionTitle}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">
              {t("detailText")}
            </span>
            <textarea
              className="min-h-40 border border-white/15 bg-[#14231d] px-3 py-2 text-cream outline-none focus:ring-2 focus:ring-mainOrange"
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              required
              value={form.description}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="brand-button"
              disabled={isSubmitting || form.productIds.length === 0}
            >
              {isSubmitting ? t("saving") : t("saveInformation")}
            </button>
            {editingDescriptionId && (
              <button className="brand-button-outline" onClick={resetForm} type="button">
                {t("close")}
              </button>
            )}
          </div>
        </form>

        <div className="brand-panel overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-heading text-xl font-bold uppercase">{t("productDetailList")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#14231d] font-heading text-xs uppercase tracking-wider text-cream">
                <tr>
                  <th className="p-3">{t("assignedProducts")}</th>
                  <th className="p-3">{t("category")}</th>
                  <th className="p-3">{t("detailTitle")}</th>
                  <th className="p-3">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {descriptions.map((description) => (
                  <tr className="border-b border-white/10 text-cream/80" key={description._id}>
                    <td className="p-3 font-bold text-cream">
                      {(description.products || []).map((product) => product.name).join(", ") ||
                        "-"}
                    </td>
                    <td className="p-3">
                      {Array.from(
                        new Set(
                          (description.products || [])
                            .map((product) => product.category?.name)
                            .filter(Boolean),
                        ),
                      ).join(", ") || "-"}
                    </td>
                    <td className="p-3">{description.descriptionTitle}</td>
                    <td className="p-3">
                      <button
                        className="mr-4 font-bold text-mainOrange"
                        onClick={() => handleEdit(description)}
                      >
                        {t("edit")}
                      </button>
                      <button
                        className="font-bold text-red-300"
                        onClick={() => handleDelete(description._id)}
                      >
                        {t("remove")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {descriptions.length === 0 && (
            <p className="p-5 text-cream/65">{t("emptyProductDetails")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminProductDetailsPage;
