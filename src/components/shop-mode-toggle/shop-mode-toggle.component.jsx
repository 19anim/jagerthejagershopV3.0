import { useNavigate } from "react-router-dom";
import { useLocale } from "../../context/locale.context";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

const ShopModeToggle = () => {
  const { mode, setMode } = useShopMode();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const is3D = mode === SHOP_MODE.THREE_D;

  const handleClick = () => {
    if (is3D) {
      setMode(SHOP_MODE.CLASSIC);
      navigate(`/${locale}`);
    } else {
      setMode(SHOP_MODE.THREE_D);
      navigate(`/${locale}/shop3d`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hidden text-xs font-bold uppercase tracking-widest text-cream/80 transition hover:text-mainOrange sm:inline-block"
    >
      {is3D ? t("exitToClassic") : t("exitTo3D")}
    </button>
  );
};

export default ShopModeToggle;
