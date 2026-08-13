export const ASSET_CATEGORIES = ["product", "category"];

export const categoryLabel = (t, category) =>
  category === "product" ? t("assetCategoryProduct") : t("assetCategoryCategory");

export const formatBytes = (bytes) => {
  if (!bytes) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};
