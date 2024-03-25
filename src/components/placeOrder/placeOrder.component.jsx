import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import FitButton from "../button/fitButton.component";

const PlaceOrder = () => {
  const [paymentMethodValue, setPaymentMethodValue] = useState({});
  const paymentOptions = [
    {
      method: "cash",
      radioLabel: "Made payment by cash when receive the parcel",
      imageSrc: null,
      note: "Test CASH",
      defaultChecked: true,
    },
    {
      method: "techcombank",
      radioLabel: "Made payment by bank transfer through Techcombank",
      imageSrc: "../src/assets/techcombank.jpg",
      note: "",
      defaultChecked: false,
    },
    {
      method: "momo",
      radioLabel: "Made payment by bank transfer through Momo",
      imageSrc: "../src/assets/momo.jpg",
      note: "",
      defaultChecked: false,
    },
  ];
  const handleOnChange = (event) => {
    const testOption = paymentOptions.find((paymentOption) => {
      return paymentOption.method == event.target.value;
    });
    setPaymentMethodValue(testOption);
  };
  const handleOnSubmit = (event) => {
    event.preventDefault();
    console.log("submitted");
  };
  return (
    <div className="grid grid-cols-[1fr_400px] gap-8">
      <div className="bg-mainGreen rounded-xl p-10">
        <div className="flex justify-between mb-10">
          <p className="text-3xl">Select payment method</p>
          <Link
            to="/products"
            className="flex justify-center items-center text-mainOrange text-3xl"
          >
            <ion-icon name="arrow-back-outline"></ion-icon>
            <p className="ml-2">Continue Shopping</p>
          </Link>
        </div>
        <form onSubmit={handleOnSubmit} className="flex flex-col gap-3">
          {paymentOptions.map((paymentOption) => {
            return (
              <div
                key={paymentOption.method}
                className="flex items-center gap-5"
              >
                <input
                  className="w-5 h-5"
                  type="radio"
                  name="paymentMethod"
                  id={paymentOption.method}
                  value={paymentOption.method}
                  onChange={handleOnChange}
                  defaultChecked={paymentOption.defaultChecked}
                />
                <label className="text-xl" htmlFor={paymentOption.method}>
                  {paymentOption.radioLabel}
                </label>
              </div>
            );
          })}
          <FitButton type="submit">Place order</FitButton>
        </form>
      </div>
      <div className="bg-mainGreen rounded-xl h-[400px] p-5 flex justify-center items-center">
        {paymentMethodValue && paymentMethodValue.imageSrc && (
          <img
            className="w-[360px] h-[360px] rounded-2xl"
            src={paymentMethodValue.imageSrc}
            alt="QR Code"
          />
        )}
        {paymentMethodValue && !paymentMethodValue.imageSrc && (
          <p className="text-xl font-medium">
            You selected the CASH payment method, please prepare cash when you
            receive the parcel
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
