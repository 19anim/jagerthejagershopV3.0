import { useEffect, useState } from "react";
import OrderDetailItemHeader from "./orderDetailItemHeader.component";
import { Link } from "react-router-dom";
import ItemDetail from "./itemDetail.component";

const OrderDetailItem = ({ orderItem }) => {
  const {
    createdAt,
    total,
    paymentMethod,
    status,
    _id,
    items,
    address,
    ward,
    district,
    city,
  } = orderItem;
  const buyAt = new Date(createdAt);
  const orderDate = `${buyAt.getDate()}/${
    buyAt.getMonth() + 1
  }/${buyAt.getFullYear()}`;
  return (
    <div className="grid grid-cols-[auto_auto]">
      <div className="gap-5 flex flex-col">
        {items &&
          items.map((item) => {
            return <ItemDetail key={item._id} cartItem={item} />;
          })}
      </div>
      <div className="flex flex-col gap-5 mb-3">
        <OrderDetailItemHeader label={"Order date"} value={orderDate} />
        <OrderDetailItemHeader label={"Total"} value={`${total} VNĐ`} />
        <OrderDetailItemHeader label={"Payment Method"} value={paymentMethod} />
        <OrderDetailItemHeader
          label={"Delivery Address"}
          value={`${address}, ${ward}, ${district}, ${city}`}
        />
        {status && (
          <OrderDetailItemHeader
            label={"Status"}
            value={status[0].statusName}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetailItem;
