import { useEffect, useState } from "react";
import { useLocale } from "../../context/locale.context";
import { settingsApi } from "../../services/settings.api";
import { THEME_SETTINGS } from "../../utils/shop3d/themes";

// Admin control for the 3D shop's seasonal decor.
const Shop3dThemeSelect = () => {
  const { t } = useLocale();
  const [value, setValue] = useState("auto");
  const [status, setStatus] = useState("");

  useEffect(() => {
    settingsApi
      .getShop3dTheme()
      .then((data) => setValue(data?.shop3dTheme || "auto"))
      .catch(() => {});
  }, []);

  const handleChange = async (event) => {
    const next = event.target.value;
    const previous = value;
    setValue(next);
    setStatus("");
    try {
      await settingsApi.setShop3dTheme(next);
      setStatus(t("shop3dThemeSaved"));
    } catch (_error) {
      setValue(previous);
      setStatus(t("shop3dThemeSaveFailed"));
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border border-warmGold/25 bg-mainGreen p-4">
      <label htmlFor="shop3d-theme" className="font-heading text-sm font-bold uppercase text-cream">
        {t("shop3dTheme")}
      </label>
      <select id="shop3d-theme" value={value} onChange={handleChange} className="border border-warmGold/40 bg-ink px-3 py-2 text-cream">
        {THEME_SETTINGS.map((option) => (
          <option key={option} value={option}>
            {t(`shop3dTheme_${option}`)}
          </option>
        ))}
      </select>
      {status && (
        <span role="status" className="text-sm text-cream/70">
          {status}
        </span>
      )}
    </div>
  );
};

export default Shop3dThemeSelect;
