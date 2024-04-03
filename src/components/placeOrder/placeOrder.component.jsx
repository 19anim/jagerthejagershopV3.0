import { useContext, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import FitButton from "../button/fitButton.component";
import { CartContext } from "../../context/cart.context";
import axios from "axios";
import { UserContext } from "../../context/user.context";

const paymentOptions = [
  {
    method: "CASH",
    radioLabel: "Made payment by cash when receive the parcel",
    imageSrc: null,
    defaultChecked: true,
  },
  {
    method: "TRANSFER_TECHCOMBANK",
    radioLabel: "Made payment by bank transfer through Techcombank",
    imageSrc: "../src/assets/techcombank.jpg",
    defaultChecked: false,
  },
  {
    method: "TRANSFER_MOMO",
    radioLabel: "Made payment by bank transfer through Momo",
    imageSrc: "../src/assets/momo.jpg",
    defaultChecked: false,
  },
];

const PlaceOrder = () => {
  const PLACEORDER_API_URL =
    import.meta.env.VITE_API_URL_PLACEORDER || VITE_API_URL_PLACEORDER;
  const modalRef = useRef();
  const navigate = useNavigate();
  const [paymentMethodValue, setPaymentMethodValue] = useState(
    paymentOptions[0]
  );
  const { deliveryPrice, subtotal, cartItems, setCartItems, setDeliveryPrice } =
    useContext(CartContext);
  const { userName, userInfor, isLoggedIn } = useContext(UserContext);
  const [orderDetailId, setOrderDetailId] = useState("");

  const handleOnChange = (event) => {
    const chosenOption = paymentOptions.find((paymentOption) => {
      return paymentOption.method == event.target.value;
    });
    setPaymentMethodValue(chosenOption);
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post(PLACEORDER_API_URL, {
        order: {
          userName: userName !== "" ? userName : "Guess",
          userInfor: userInfor,
          items: cartItems,
          total: (subtotal + deliveryPrice).toLocaleString(),
          paymentMethod: paymentMethodValue.method,
        },
      });
      if (result.status === 200) {
        localStorage.removeItem("cart_items");
        setCartItems([]);
        setDeliveryPrice(0);
        handleModalTemp();
        setOrderDetailId(result.data._id);
        // if (isLoggedIn) {
        //   navigate(`/user/orders/orderDetail/${result.data._id}`);
        // } else {
        //   navigate(`/`);
        // }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleModal = () => {
    const classList = modalRef.current.classList;
    classList.toggle("flex");
    classList.toggle("hidden");
    if (isLoggedIn) {
      navigate(`/user/orders/orderDetail/${orderDetailId}`);
    } else {
      navigate(`/`);
    }
  };
  const handleModalTemp = () => {
    const classList = modalRef.current.classList;
    classList.toggle("flex");
    classList.toggle("hidden");
  };
  return (
    <div className="grid grid-cols-[1fr_400px] gap-8">
      <div className="bg-mainGreen rounded-xl p-10">
        {/* This is to do the modal */}
        <div
          ref={modalRef}
          className="justify-center items-center w-dvw h-dvh absolute top-0 left-0 bg-[rgba(0,0,0,0.5)] z-10 hidden"
        >
          <div className="w-[500px] h-[200px] bg-[#363636] rounded-xl flex flex-col justify-center items-center gap-2">
            <p className="text-mainOrange text-3xl">Order Successfully</p>
            <p className="text-wheat text-lg text-center">
              Thank you for purchasing at JAGERTHEJAGERSHOP
            </p>
            <p className="text-wheat text-lg text-center">
              Ở đây iem bán thuốc ho con hươu
            </p>
            <FitButton onClick={handleModal}>Close</FitButton>
          </div>
        </div>
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
        <div className="text-xl font-medium text-mainOrange-50 mb-3">
          Total price: {(subtotal + deliveryPrice).toLocaleString()} VNĐ
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
