import OrderDetailItemHeader from "./orderDetailItemHeader.component";
import ItemDetail from "./itemDetail.component";
import { useLocale } from "../../context/locale.context";

const OrderDetailItem = ({ orderItem }) => {
  const {
    createdAt,
    total,
    paymentMethod,
    status,
    items,
    address,
    ward,
    district,
    city,
  } = orderItem;
  const { t } = useLocale();
  const buyAt = new Date(createdAt);
  const orderDate = `${buyAt.getDate()}/${
    buyAt.getMonth() + 1
  }/${buyAt.getFullYear()}`;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="gap-5 flex flex-col">
        {items &&
          items.map((item) => {
            return <ItemDetail key={item._id} cartItem={item} />;
          })}
      </div>
      <div className="flex flex-col gap-5 mb-3">
        <OrderDetailItemHeader label={t("orderDate")} value={orderDate} />
        <OrderDetailItemHeader label={t("total")} value={`${total?.toLocaleString?.() || total || 0} VNĐ`} />
        <OrderDetailItemHeader label={t("paymentMethod")} value={paymentMethod} />
        <OrderDetailItemHeader
          label={t("deliveryAddress")}
          value={`${address}, ${ward}, ${district}, ${city}`}
        />
        {status?.[0] && (
          <OrderDetailItemHeader
            label={t("status")}
            value={status[0].statusName}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetailItem;
