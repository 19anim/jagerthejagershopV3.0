import { useEffect, useState } from "react";
import { useLocale } from "../../context/locale.context";

// Brief "added to basket" confirmation for the walk-through shop. `trigger` is a
// counter the page bumps whenever the cart gains an item; each bump re-shows the
// toast for ~1.6s. pointer-events-none so it never blocks the scene.
const Shop3DToast = ({ trigger }) => {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 z-40 flex justify-center">
      <div
        className={`flex items-center gap-2 rounded-full border border-warmGold/40 bg-mainGreen/95 px-4 py-2 text-sm font-bold text-cream shadow-xl transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <ion-icon name="bag-check-outline" class="text-lg text-mainOrange"></ion-icon>
        {t("addedToCart")}
      </div>
    </div>
  );
};

export default Shop3DToast;
