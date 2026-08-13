import { useEffect, useState } from "react";
import { getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";
import { assetsApi } from "../../services/assets.api";
import { ASSET_CATEGORIES, categoryLabel } from "./assetUtils";

const AssetPickerModal = ({ category, onSelect, onClose }) => {
  const { t } = useLocale();
  const [filterCategory, setFilterCategory] = useState(category);
  const [assets, setAssets] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    assetsApi
      .list({ category: filterCategory || undefined, status: "active" })
      .then((response) => setAssets(response.items))
      .catch(() => setErrorMessage(t("assetActionFailed")));
  }, [filterCategory]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="brand-panel max-h-[80vh] w-full max-w-2xl overflow-y-auto p-5 md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-bold uppercase text-cream">{t("assetPickerTitle")}</h2>
          <button
            className="brand-button-outline !min-h-0 !px-3 !py-1.5 !text-[0.68rem]"
            onClick={onClose}
            type="button"
          >
            {t("close")}
          </button>
        </div>

        <select
          className="mb-4 border border-white/15 bg-[#14231d] px-3 py-2 text-sm text-cream"
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
        >
          <option value="">{t("assetAllTypes")}</option>
          {ASSET_CATEGORIES.map((option) => (
            <option key={option} value={option}>{categoryLabel(t, option)}</option>
          ))}
        </select>

        {errorMessage && <p className="mb-4 text-sm text-red-300">{errorMessage}</p>}

        {assets.length === 0 && !errorMessage && (
          <p className="text-sm text-cream/60">{t("assetPickerEmpty")}</p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets.map((asset) => (
            <button
              key={asset._id}
              type="button"
              className="flex flex-col items-center gap-2 border border-white/10 p-2 text-center hover:border-mainOrange"
              onClick={() => onSelect(asset)}
            >
              <img
                className="size-24 object-cover"
                src={getOptimizedImageUrl(asset.active?.secureUrl, "thumbnail")}
                alt={asset.label}
              />
              <span className="truncate text-xs text-cream/80">{asset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetPickerModal;
