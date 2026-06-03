import { useNavigate } from "react-router-dom";
import { useLocale } from "../../context/locale.context";
import { getOptimizedImageUrl } from "../../utils/image.utils";

const CategoryItem = ({ category }) => {
  const { image, name, slug } = category;
  const navigate = useNavigate();
  const { t } = useLocale();
  const onClickHandler = () => navigate(slug);
  return (
    <div
      onClick={onClickHandler}
      className="group relative flex h-[250px] cursor-pointer items-end overflow-hidden md:h-[360px]"
    >
      <div
        className="absolute inset-0 size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${getOptimizedImageUrl(image, "card")})` }}
      ></div>
      <div className="relative w-full bg-mainGreen/90 px-4 py-4 text-cream">
        <h2 className="font-heading text-sm font-bold uppercase md:text-base">{name}</h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-mainOrange">{t("shopNow")}</p>
      </div>
    </div>
  );
};

export default CategoryItem;
