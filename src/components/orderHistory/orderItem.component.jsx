import { Link } from "react-router-dom";
import { useLocale } from "../../context/locale.context";

const OrderItem = ({ orderItem, orderIndex, detailPath, action }) => {
  const { createdAt, total, paymentMethod, status, _id, items, address, ward, district, city } = orderItem;
  const { localize, t } = useLocale();
  const buyAt = new Date(createdAt);
  const orderDate = `${buyAt.getDate()}/${buyAt.getMonth() + 1}/${buyAt.getFullYear()}`;
  const deliveryAddress = [address, ward, district, city].filter(Boolean).join(", ");

  return (
    <article className="border border-white/10 bg-[#14231d] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold uppercase text-mainOrange">{t("orderNumber")} {orderIndex}</h2>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {action}
          <Link className="brand-button min-h-0 px-3 py-2 text-[11px]" to={detailPath || localize(`/user/orders/orderDetail/${_id}`)}>{t("viewDetail")}</Link>
        </div>
      </div>
      <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Info label={t("orderDate")} value={orderDate} />
        <Info label={t("total")} value={`${total.toLocaleString()} VNĐ`} />
        <Info label={t("deliveryAddress")} value={deliveryAddress} />
        <Info label={t("productCount")} value={items.length} />
        <Info label={t("paymentMethod")} value={paymentMethod.toUpperCase()} />
        <Info label={t("status")} value={status?.[0]?.statusName || "-"} />
      </div>
    </article>
  );
};

const Info = ({ label, value }) => <div><p className="text-xs font-bold uppercase tracking-widest text-cream/45">{label}</p><p className="mt-1 leading-6 text-cream/85">{value}</p></div>;

export default OrderItem;
