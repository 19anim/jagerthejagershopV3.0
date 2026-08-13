import { getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";
import { categoryLabel } from "./assetUtils";

const AssetLibrary = ({ assets, selectedAssetId, onSelect }) => {
  const { t } = useLocale();

  return (
    <div className="divide-y divide-white/10">
      {assets.map((asset) => (
        <button
          key={asset._id}
          type="button"
          onClick={() => onSelect(asset._id)}
          className={`flex w-full items-center gap-3 p-3 text-left text-sm hover:bg-white/5 ${
            selectedAssetId === asset._id ? "bg-white/10" : ""
          }`}
        >
          <img
            className="size-14 shrink-0 object-cover"
            src={getOptimizedImageUrl(asset.active?.secureUrl, "thumbnail")}
            alt={asset.label}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-cream">{asset.label}</p>
            <p className="text-xs text-cream/50">
              {categoryLabel(t, asset.category)} · v{asset.activeVersion} · {asset.versionCount} {t("assetVersionCount").toLowerCase()}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-bold uppercase ${asset.status === "active" ? "text-mainOrange" : "text-cream/40"}`}>
            {asset.status === "active" ? t("assetStatusActive") : t("assetStatusArchived")}
          </span>
        </button>
      ))}
      {assets.length === 0 && <p className="p-4 text-sm text-cream/60">{t("assetEmptyLibrary")}</p>}
    </div>
  );
};

export default AssetLibrary;
