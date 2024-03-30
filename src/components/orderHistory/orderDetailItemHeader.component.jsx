const OrderDetailItemHeader = ({ label, value }) => {
  return (
    <div>
      <p className="text-2xl text-mainOrange">{label}</p>
      <p className="text-xl">{value}</p>
    </div>
  );
};

export default OrderDetailItemHeader;
