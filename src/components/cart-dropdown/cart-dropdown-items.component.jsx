const CartDropdownItems = ({ Items }) => {
  return (
    <div>
      {Items.map((Item) => {
        const { Name, Quantity, PricePerOne } = Item;
        return (
          <div
            key={Name}
            className="grid grid-cols-[20%_80%] items-center pb-3"
          >
            <img
              src="../src/assets/logo.png"
              alt="logo"
              className="max-w-[60px]"
            />
            <div>
              <h5 className="text-mainOrgane font-normal">
                <strong>{Name}</strong>
              </h5>
              <p className="text-sm">Quantity: {Quantity.toString()}</p>
              <p className="text-sm">
                Total: {(PricePerOne * Quantity).toString()} VNĐ
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartDropdownItems;
