import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../context/locale.context";
import { assetsApi } from "../services/assets.api";
import AssetFilters from "../components/admin-assets/AssetFilters.component";
import AssetUploadPanel from "../components/admin-assets/AssetUploadPanel.component";
import AssetLibrary from "../components/admin-assets/AssetLibrary.component";
import AssetDetailPanel from "../components/admin-assets/AssetDetailPanel.component";

const AdminAssetsPage = () => {
  const { t } = useLocale();
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState({ category: "", status: "", label: "" });
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [usage, setUsage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAssets = useCallback(async () => {
    const response = await assetsApi.list({
      category: filters.category || undefined,
      status: filters.status || undefined,
      label: filters.label || undefined,
    });
    setAssets(response.items);
  }, [filters.category, filters.status, filters.label]);

  useEffect(() => {
    fetchAssets().catch(() => setErrorMessage(t("assetActionFailed")));
  }, [fetchAssets]);

  useEffect(() => {
    if (!selectedAssetId) {
      setUsage(null);
      return;
    }
    assetsApi
      .usage(selectedAssetId)
      .then(setUsage)
      .catch(() => setUsage(null));
  }, [selectedAssetId]);

  const selectedAsset = assets.find((asset) => asset._id === selectedAssetId) || null;

  const confirmUsageImpact = () => {
    const productCount = usage?.products?.length || 0;
    const categoryCount = usage?.categories?.length || 0;
    if (!productCount && !categoryCount) return true;
    return window.confirm(
      t("assetUsageWarning")
        .replace("{products}", productCount)
        .replace("{categories}", categoryCount)
    );
  };

  const handleUpload = async ({ mode, id, category, label, file }) => {
    setErrorMessage("");
    if (mode === "replace") {
      if (!confirmUsageImpact()) return;
      await assetsApi.replace(id, file);
    } else {
      const created = await assetsApi.upload({ category, label, file });
      setSelectedAssetId(created._id);
    }
    await fetchAssets();
  };

  const handleRollback = async (id, version) => {
    setErrorMessage("");
    if (!confirmUsageImpact()) return;
    try {
      await assetsApi.setActiveVersion(id, version);
      await fetchAssets();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("assetActionFailed"));
    }
  };

  const handleArchive = async (id) => {
    setErrorMessage("");
    try {
      await assetsApi.archive(id);
      await fetchAssets();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("assetActionFailed"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("assetConfirmDelete"))) return;
    setErrorMessage("");
    try {
      await assetsApi.remove(id);
      setSelectedAssetId(null);
      await fetchAssets();
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("assetActionFailed"));
    }
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="brand-kicker mb-2">{t("adminAssetsEyebrow")}</p>
        <h1 className="font-heading text-3xl font-bold uppercase text-cream">{t("adminAssets")}</h1>
      </div>

      {errorMessage && <p className="mb-4 text-red-300">{errorMessage}</p>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
        <div className="border border-warmGold/25 bg-mainGreen shadow-2xl">
          <AssetUploadPanel selectedAsset={selectedAsset} onUpload={handleUpload} />
          <AssetFilters filters={filters} onChange={setFilters} />
          <AssetLibrary assets={assets} selectedAssetId={selectedAssetId} onSelect={setSelectedAssetId} />
        </div>

        <div className="border border-warmGold/25 bg-mainGreen shadow-2xl">
          <AssetDetailPanel
            asset={selectedAsset}
            usage={usage}
            onRollback={handleRollback}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </section>
  );
};

export default AdminAssetsPage;
