import { getOptimizedImageUrl } from "../../utils/image.utils";
import { useLocale } from "../../context/locale.context";

const ItemDetail = ({ cartItem }) => {
  const { item, quantity } = cartItem;
  const { name, category, priceInInteger, image } = item;
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 md:grid-cols-[150px_1fr]">
      <img className="size-full object-cover" src={getOptimizedImageUrl(image, "thumbnail")} alt={name} />
      <div className="flex flex-col gap-2">
        <p className="font-heading text-lg font-bold uppercase md:text-2xl">{name}</p>
        <p className="text-wheat">{category?.name || "-"}</p>
        <p>{t("quantity")}: {quantity}</p>
        <p>{t("price")}: {priceInInteger.toLocaleString()} VNĐ</p>
        <p>{t("total")}: {(priceInInteger * quantity).toLocaleString()} VNĐ</p>
      </div>
    </div>
  );
};

export default ItemDetail;
