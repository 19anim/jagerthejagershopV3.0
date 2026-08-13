import { useState } from "react";
import { Link } from "react-router-dom";
import { getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";
import { categoryLabel, formatBytes, formatDate } from "./assetUtils";

const UsageGroup = ({ title, items, buildLink }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!items.length) return null;

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-bold text-cream"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span>{isExpanded ? "▾" : "▸"}</span>
        {title} ({items.length})
      </button>
      {isExpanded && (
        <ul className="mt-2 grid gap-1 pl-5 text-sm text-cream/80">
          {items.map((item) => (
            <li key={item._id}>
              <Link className="hover:text-mainOrange" to={buildLink(item)}>{item.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AssetDetailPanel = ({ asset, usage, onRollback, onArchive, onDelete }) => {
  const { t } = useLocale();

  if (!asset) {
    return <p className="p-4 text-sm text-cream/60">{t("assetNoSelection")}</p>;
  }

  const sortedVersions = [...asset.versions].sort((a, b) => b.version - a.version);
  const usageProducts = usage?.products || [];
  const usageCategories = usage?.categories || [];

  return (
    <div className="grid gap-4 p-4">
      <div className="flex items-start gap-4">
        <img
          className="size-32 shrink-0 object-cover"
          src={getOptimizedImageUrl(asset.active?.secureUrl, "card")}
          alt={asset.label}
        />
        <div className="text-sm text-cream/80">
          <p className="font-heading text-lg font-bold text-cream">{asset.label}</p>
          <p>{categoryLabel(t, asset.category)}</p>
          <p>{t("assetActiveVersion")}: v{asset.activeVersion}</p>
          <p>{t("assetStatus")}: {asset.status === "active" ? t("assetStatusActive") : t("assetStatusArchived")}</p>
        </div>
      </div>

      {(usageProducts.length > 0 || usageCategories.length > 0) && (
        <div className="grid gap-2 border border-white/10 p-3">
          <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-mainOrange">
            {t("assetUsedBy")} ({usageProducts.length + usageCategories.length})
          </h3>
          <UsageGroup
            title={t("assetUsedByProducts")}
            items={usageProducts}
            buildLink={(item) => `/admin/products/${item._id}/edit`}
          />
          <UsageGroup
            title={t("assetUsedByCategories")}
            items={usageCategories}
            buildLink={(item) => `/admin/categories/${item._id}/edit`}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button className="brand-button-outline" onClick={() => onArchive(asset._id)} disabled={asset.status === "archived"}>
          {t("assetArchive")}
        </button>
        <button
          className="brand-button-outline text-red-300"
          onClick={() => onDelete(asset._id)}
          disabled={asset.status !== "archived"}
          title={asset.status !== "archived" ? t("assetDeleteRequiresArchive") : undefined}
        >
          {t("assetDelete")}
        </button>
      </div>

      <div>
        <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-widest text-mainOrange">{t("assetVersionHistory")}</h3>
        <div className="grid gap-2">
          {sortedVersions.map((version) => (
            <div key={version.version} className="flex items-center gap-3 border border-white/10 p-2 text-sm text-cream/80">
              <img className="size-12 object-cover" src={getOptimizedImageUrl(version.secureUrl, "thumbnail")} alt={`v${version.version}`} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-cream">v{version.version}{version.version === asset.activeVersion ? ` · ${t("assetStatusActive")}` : ""}</p>
                <p className="text-xs text-cream/50">{formatBytes(version.bytes)} · {formatDate(version.uploadedAt)}</p>
              </div>
              {version.version !== asset.activeVersion && (
                <button
                  className="brand-button-outline shrink-0 !min-h-0 !px-3 !py-1.5 !text-[0.68rem]"
                  onClick={() => onRollback(asset._id, version.version)}
                >
                  {t("assetRollback")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPanel;
