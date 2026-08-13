import { useEffect, useState } from "react";
import { useLocale } from "../../context/locale.context";
import { ASSET_CATEGORIES, categoryLabel } from "./assetUtils";

const AssetUploadPanel = ({ selectedAsset, onUpload }) => {
  const { t } = useLocale();
  const [category, setCategory] = useState("product");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (selectedAsset) {
      setCategory(selectedAsset.category);
      setLabel(selectedAsset.label);
      setUploadMode("replace");
    } else {
      setUploadMode("create");
    }
  }, [selectedAsset]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files[0];
    if (!nextFile) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(nextFile.type)) {
      event.target.value = "";
      setErrorMessage(t("invalidProductImageType"));
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setErrorMessage(t("productImageTooLarge"));
      return;
    }
    setFile(nextFile);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      if (uploadMode === "replace" && selectedAsset) {
        await onUpload({ mode: "replace", id: selectedAsset._id, file });
      } else {
        await onUpload({ mode: "create", category, label, file });
      }
      setFile(null);
      if (uploadMode === "create") setLabel("");
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("assetSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4 border-b border-white/10 p-4" onSubmit={handleSubmit}>
      {selectedAsset && (
        <div className="flex flex-wrap gap-4 text-sm text-cream/80">
          <label className="flex items-center gap-2">
            <input type="radio" checked={uploadMode === "replace"} onChange={() => setUploadMode("replace")} />
            {t("assetUploadModeReplace")}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={uploadMode === "create"} onChange={() => setUploadMode("create")} />
            {t("assetUploadModeCreate")}
          </label>
        </div>
      )}
      {uploadMode === "create" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("assetCategory")}</span>
            <select
              className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {ASSET_CATEGORIES.map((option) => (
                <option key={option} value={option}>{categoryLabel(t, option)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("assetLabel")}</span>
            <input
              className="border border-white/15 bg-[#14231d] px-3 py-2 text-cream outline-none focus:ring-2 focus:ring-mainOrange"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              required
              type="text"
            />
            <span className="text-xs text-cream/50">{t("assetLabelHint")}</span>
          </label>
        </div>
      )}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-mainOrange">{t("assetFile")}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} required />
      </label>
      {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
      <button className="brand-button w-fit" disabled={isSubmitting || !file}>
        {isSubmitting ? t("assetUploading") : t("assetUpload")}
      </button>
    </form>
  );
};

export default AssetUploadPanel;
