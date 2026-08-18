import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const ShopModeSelector = () => {
  const { mode, setMode } = useShopMode();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  if (mode !== null) return null;

  const chooseClassic = () => setMode(SHOP_MODE.CLASSIC);
  const choose3D = () => {
    setMode(SHOP_MODE.THREE_D);
    navigate(`/${locale}/shop3d`);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101a15]/95 p-5">
      <div className="w-full max-w-2xl border border-warmGold/50 bg-cream p-7 text-center text-ink shadow-2xl md:p-10">
        <img src={Logo} alt="JagerTheJager Shop" className="mx-auto mb-5 w-40" />
        <p className="brand-kicker mb-2">{t("chooseExperience")}</p>
        <p className="mx-auto mb-7 max-w-md text-sm leading-6 text-ink/70">{t("chooseExperienceBody")}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={chooseClassic}
            className="flex-1 border border-warmGold/40 bg-white/60 p-5 text-left transition hover:border-mainOrange"
          >
            <span className="font-heading text-lg font-bold uppercase">{t("classicMode")}</span>
            <span className="mt-1 block text-xs text-ink/60">{t("classicModeBody")}</span>
            <span className="brand-button mt-4 inline-block">{t("enterClassic")}</span>
          </button>
          <button
            onClick={choose3D}
            className="flex-1 border border-warmGold/40 bg-white/60 p-5 text-left transition hover:border-mainOrange"
          >
            <span className="font-heading text-lg font-bold uppercase">{t("threeDMode")}</span>
            <span className="mt-1 block text-xs text-ink/60">{t("threeDModeBody")}</span>
            <span className="brand-button mt-4 inline-block">{t("enter3D")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopModeSelector;
