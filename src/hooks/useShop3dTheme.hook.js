import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { settingsApi } from "../services/settings.api";
import { resolveTheme } from "../utils/shop3d/themes";

// The seasonal theme to show: ?theme= override, else the admin setting, else by date.
// A failed request (e.g. an older backend without the route) just means "auto".
export const useShop3dTheme = (now) => {
  const { search } = useLocation();
  const override = new URLSearchParams(search).get("theme") || undefined;
  const [setting, setSetting] = useState("auto");
  useEffect(() => {
    let alive = true;
    settingsApi
      .getShop3dTheme()
      .then((data) => alive && setSetting(data?.shop3dTheme || "auto"))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return resolveTheme(setting, now || new Date(), override);
};
