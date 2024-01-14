const CartDropdownHeader = ({ Items }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <ion-icon name="bag-handle-outline" class="text-3xl"></ion-icon>
        <span className="text-[20px] font-light">
          <strong>
            {Items.reduce((acc, currentPickedItem) => {
              return acc + currentPickedItem.Quantity;
            }, 0)}{" "}
            Item(s)
          </strong>
        </span>
      </div>
      <div>
        <span className="text-[20px] font-light">
          <strong>
            Total:{" "}
            {Items.reduce((acc, currentPickedItem) => {
              return (
                acc + currentPickedItem.Quantity * currentPickedItem.PricePerOne
              );
            }, 0)}{" "}
            VNĐ
          </strong>
        </span>
      </div>
    </div>
  );
};

export default CartDropdownHeader;
