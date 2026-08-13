import { useLocale } from "../../context/locale.context";
import { ASSET_CATEGORIES, categoryLabel } from "./assetUtils";

const AssetFilters = ({ filters, onChange }) => {
  const { t } = useLocale();

  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap gap-3 border-b border-white/10 p-4">
      <select
        className="border border-white/15 bg-[#14231d] px-3 py-2 text-sm text-cream"
        value={filters.category}
        onChange={(event) => update({ category: event.target.value })}
      >
        <option value="">{t("assetAllCategories")}</option>
        {ASSET_CATEGORIES.map((category) => (
          <option key={category} value={category}>{categoryLabel(t, category)}</option>
        ))}
      </select>
      <select
        className="border border-white/15 bg-[#14231d] px-3 py-2 text-sm text-cream"
        value={filters.status}
        onChange={(event) => update({ status: event.target.value })}
      >
        <option value="">{t("assetAllStatuses")}</option>
        <option value="active">{t("assetStatusActive")}</option>
        <option value="archived">{t("assetStatusArchived")}</option>
      </select>
      <input
        className="flex-1 min-w-[180px] border border-white/15 bg-[#14231d] px-3 py-2 text-sm text-cream outline-none focus:ring-2 focus:ring-mainOrange"
        placeholder={t("assetSearchPlaceholder")}
        value={filters.label}
        onChange={(event) => update({ label: event.target.value })}
        type="text"
      />
    </div>
  );
};

export default AssetFilters;
