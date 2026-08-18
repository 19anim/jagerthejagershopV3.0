import { useCallback, useEffect, useState } from "react";

export const SHOP_MODE = { CLASSIC: "classic", THREE_D: "3d" };
export const SHOP_MODE_STORAGE_KEY = "shop_mode";

const listeners = new Set();

const readStoredMode = () => {
  const stored = localStorage.getItem(SHOP_MODE_STORAGE_KEY);
  return stored === SHOP_MODE.CLASSIC || stored === SHOP_MODE.THREE_D ? stored : null;
};

export const useShopMode = () => {
  const [mode, setModeState] = useState(readStoredMode);

  useEffect(() => {
    const listener = () => setModeState(readStoredMode());
    listeners.add(listener);
    listener();
    const onStorage = (event) => {
      if (event.key === SHOP_MODE_STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setMode = useCallback((nextMode) => {
    if (nextMode !== SHOP_MODE.CLASSIC && nextMode !== SHOP_MODE.THREE_D) return;
    localStorage.setItem(SHOP_MODE_STORAGE_KEY, nextMode);
    listeners.forEach((notify) => notify());
  }, []);

  return { mode, hasChosen: mode !== null, setMode };
};
