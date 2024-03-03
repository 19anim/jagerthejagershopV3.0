import CartDropdownHeader from "./cart-dropdown-header.component";
import CartDropdownItems from "./cart-dropdown-items.component";

const CartDropdown = () => {
  const pickedItems = [
    {
      Name: "Jagermeister Original 700ml",
      Quantity: 4,
      PricePerOne: 400000,
    },
    {
      Name: "Jagermeister Original 1000ml",
      Quantity: 10,
      PricePerOne: 500000,
    },
    {
      Name: "Jagermeister Original 20ml",
      Quantity: 4,
      PricePerOne: 60000,
    },
    {
      Name: "Jagermeister Manifest 1000ml",
      Quantity: 2,
      PricePerOne: 2700000,
    },
  ];
  return (
    <div
      id="cart-dropdown"
      className="w-[280px] h-[380px] p-5 text-black rounded-[10px] bg-white absolute top-[150px] right-[60px] flex gap-4 flex-col z-10 border border-black"
    >
      {/* <CartDropdownHeader Items={pickedItems} />
      <hr></hr>
      <CartDropdownItems Items={pickedItems} />
      <hr></hr> */}
      <div className="h-[280px] overflow-scroll"></div>
      <button className=" border border-black py-2 px-6 text-sm mt-auto">
        CheckOut
      </button>
    </div>
  );
};

export default CartDropdown;
