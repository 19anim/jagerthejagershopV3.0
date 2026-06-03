const OrderDetailItemHeader = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-mainOrange">{label}</p>
      <p className="mt-1 text-sm leading-6 text-cream/85">{value}</p>
    </div>
  );
};

export default OrderDetailItemHeader;
