import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";

const emptyProduct = {
  name: "",
  vol: "",
  price: "",
  priceInInteger: 0,
  stock: 0,
  category: "",
  isBestSeller: false,
};

const AdminProductForm = ({ initialProduct, categories, endpoint, method, submitLabel, onSuccess }) => {
  const [product, setProduct] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLocale();
  const labels = {
    name: t("productName"),
    vol: t("volume"),
    price: t("displayPrice"),
    priceInInteger: t("numericPrice"),
    stock: t("stock"),
  };

  useEffect(() => {
    if (initialProduct) {
      setProduct({ ...emptyProduct, ...initialProduct, category: initialProduct.category?._id || initialProduct.category || "" });
      setPreviewUrl(initialProduct.image || "");
    }
  }, [initialProduct]);

  useEffect(() => () => {
    if (imageFile && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [imageFile, previewUrl]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setProduct((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setImageFile(null);
      setErrorMessage(t("invalidProductImageType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setImageFile(null);
      setErrorMessage(t("productImageTooLarge"));
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    const data = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (!["_id", "__v", "createdAt", "updatedAt", "image", "imagePublicId", "slug"].includes(key)) data.append(key, value ?? "");
    });
    if (imageFile) data.append("image", imageFile);

    try {
      await axios.request({
        method,
        url: apiUrl(endpoint),
        data,
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!initialProduct) {
        setProduct(emptyProduct);
        setImageFile(null);
        setPreviewUrl("");
      }
      onSuccess?.();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("productSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="brand-panel grid gap-5 p-5 md:grid-cols-2 md:p-8" onSubmit={handleSubmit}>
    {["name", "vol", "price", "priceInInteger", "stock"].map((field) => (
        <label className="flex flex-col gap-2 text-sm" key={field}>
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{labels[field]}</span>
          <input className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream outline-none focus:ring-2 focus:ring-mainOrange" name={field} value={product[field] ?? ""} onChange={handleChange} required={field !== "description"} type={["priceInInteger", "stock"].includes(field) ? "number" : "text"} />
        </label>
      ))}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("category")}</span>
        <select className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream" name="category" value={product.category} onChange={handleChange} required>
          <option value="">{t("selectCategory")}</option>
          {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-3 self-end text-sm"><input type="checkbox" name="isBestSeller" checked={product.isBestSeller} onChange={handleChange} /> {t("bestSeller")}</label>
      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("productImage")}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} required={!initialProduct} />
      </label>
      {previewUrl && <img src={previewUrl.startsWith("blob:") ? previewUrl : getOptimizedImageUrl(previewUrl, "thumbnail")} alt="Product preview" className="size-40 object-cover" />}
      {errorMessage && <p className="text-sm text-red-300 md:col-span-2">{errorMessage}</p>}
      <button className="brand-button md:col-span-2 md:w-fit" disabled={isSubmitting}>{isSubmitting ? t("saving") : submitLabel}</button>
    </form>
  );
};

export default AdminProductForm;
