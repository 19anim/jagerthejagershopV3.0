import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";
import AssetPickerModal from "../admin-assets/AssetPickerModal.component";

const emptyCategory = {
  name: "",
};

const AdminCategoryForm = ({ initialCategory, endpoint, method, submitLabel, onSuccess }) => {
  const [category, setCategory] = useState(emptyCategory);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [assetId, setAssetId] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLocale();

  useEffect(() => {
    if (initialCategory) {
      setCategory({ name: initialCategory.name || "" });
      setPreviewUrl(initialCategory.image || "");
    }
  }, [initialCategory]);

  useEffect(() => () => {
    if (imageFile && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [imageFile, previewUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setImageFile(null);
      setErrorMessage(t("invalidCategoryImageType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setImageFile(null);
      setErrorMessage(t("categoryImageTooLarge"));
      return;
    }
    setImageFile(file);
    setAssetId(null);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleAssetSelect = (asset) => {
    setImageFile(null);
    setAssetId(asset._id);
    setPreviewUrl(asset.active?.secureUrl || "");
    setIsPickerOpen(false);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const data = new FormData();
    data.append("name", category.name);
    if (imageFile) data.append("image", imageFile);
    else if (assetId) data.append("assetId", assetId);

    try {
      await axios.request({
        method,
        url: apiUrl(endpoint),
        data,
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!initialCategory) {
        setCategory(emptyCategory);
        setImageFile(null);
        setAssetId(null);
        setPreviewUrl("");
      }
      onSuccess?.();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("categorySaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="brand-panel grid gap-5 p-5 md:p-8" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("categoryName")}</span>
        <input
          className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream outline-none focus:ring-2 focus:ring-mainOrange"
          name="name"
          value={category.name}
          onChange={(event) => setCategory({ name: event.target.value })}
          required
          type="text"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("categoryImage")}</span>
        <div className="flex flex-wrap items-center gap-3">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} required={!initialCategory && !assetId} />
          <button type="button" className="brand-button-outline" onClick={() => setIsPickerOpen(true)}>{t("assetPicker")}</button>
        </div>
      </label>
      {assetId && <p className="text-xs text-mainOrange">{t("assetPickedLabel")}</p>}
      {previewUrl && (
        <img
          src={previewUrl.startsWith("blob:") ? previewUrl : getOptimizedImageUrl(previewUrl, "thumbnail")}
          alt={t("categoryPreview")}
          className="size-40 object-cover"
        />
      )}
      {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
      <button className="brand-button w-fit" disabled={isSubmitting}>{isSubmitting ? t("saving") : submitLabel}</button>
      {isPickerOpen && (
        <AssetPickerModal category="category" onSelect={handleAssetSelect} onClose={() => setIsPickerOpen(false)} />
      )}
    </form>
  );
};

export default AdminCategoryForm;
