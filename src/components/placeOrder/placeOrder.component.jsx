import { useContext, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import FitButton from "../button/fitButton.component";
import { CartContext } from "../../context/cart.context";
import axios from "axios";
import { UserContext } from "../../context/user.context";
import Momo from "../../assets/momo.jpg";
import Techcombank from "../../assets/techcombank.jpg";
import { useLocale } from "../../context/locale.context";
import { apiUrl } from "../../utils/api.utils";

const paymentOptions = [
  {
    method: "CASH",
    labelKey: "cashPayment",
    imageSrc: null,
    defaultChecked: true,
  },
  {
    method: "TRANSFER_TECHCOMBANK",
    labelKey: "techcombankPayment",
    imageSrc: Techcombank,
    defaultChecked: false,
  },
  {
    method: "TRANSFER_MOMO",
    labelKey: "momoPayment",
    imageSrc: Momo,
    defaultChecked: false,
  },
];

const PlaceOrder = () => {
  const PLACEORDER_API_URL = apiUrl("/api/orders/placeOrder");
  const modalRef = useRef();
  const navigate = useNavigate();
  const [paymentMethodValue, setPaymentMethodValue] = useState(
    paymentOptions[0]
  );
  const {
    deliveryPrice,
    subtotal,
    cartItems,
    setCartItems,
    setDeliveryPrice,
    refreshCartItemsWithProducts,
  } = useContext(CartContext);
  const { userInfor, isLoggedIn } = useContext(UserContext);
  const [orderDetailId, setOrderDetailId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { localize, t } = useLocale();

  const handleOnChange = (event) => {
    const chosenOption = paymentOptions.find((paymentOption) => {
      return paymentOption.method == event.target.value;
    });
    setPaymentMethodValue(chosenOption);
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (cartItems.length === 0) {
      setErrorMessage(t("emptyCart"));
      return;
    }
    if (deliveryPrice <= 0) {
      setErrorMessage(t("deliveryRequired"));
      return;
    }
    try {
      const productResponses = await Promise.all(
        cartItems.map((cartItem) => axios.get(apiUrl(`/api/products/getProductById/${cartItem._id}`)))
      );
      const changedItemsCount = refreshCartItemsWithProducts(productResponses.map((response) => response.data));
      if (changedItemsCount > 0) {
        setErrorMessage(t("cartRevalidated"));
        return;
      }
      const result = await axios.post(
        PLACEORDER_API_URL,
        {
          order: {
            userInfor: userInfor,
            items: cartItems,
            total: (subtotal + deliveryPrice).toLocaleString(),
            paymentMethod: paymentMethodValue.method,
          },
        },
        { withCredentials: true }
      );
      if (result.status === 200) {
        localStorage.removeItem("cart_items");
        setCartItems([]);
        setDeliveryPrice(0);
        handleModalTemp();
        setOrderDetailId(result.data._id);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("orderFailed"));
    }
  };

  const handleModal = () => {
    const classList = modalRef.current.classList;
    classList.toggle("flex");
    classList.toggle("hidden");
    if (isLoggedIn) {
      navigate(localize(`/user/orders/orderDetail/${orderDetailId}`));
    } else {
      navigate(localize("/"));
    }
  };
  const handleModalTemp = () => {
    const classList = modalRef.current.classList;
    classList.toggle("flex");
    classList.toggle("hidden");
  };
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 md:px-8 lg:grid-cols-[1fr_400px]">
      <div className="brand-panel p-5 md:p-8">
        {/* This is to do the modal */}
        <div
          ref={modalRef}
          className="justify-center items-center w-dvw h-dvh absolute top-0 left-0 bg-[rgba(0,0,0,0.5)] z-10 hidden"
        >
          <div className="brand-panel flex min-h-[220px] w-[min(500px,calc(100vw-32px))] flex-col items-center justify-center gap-3 p-6 text-center shadow-2xl">
            <p className="font-heading text-2xl font-extrabold uppercase text-mainOrange md:text-3xl">{t("orderSuccess")}</p>
            <p className="text-cream/75">{t("orderSuccessBody")}</p>
            <FitButton onClick={handleModal}>{t("close")}</FitButton>
          </div>
        </div>
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <p className="font-heading text-2xl font-bold uppercase md:text-3xl">{t("selectPayment")}</p>
          <Link
            to={localize("/products")}
            className="flex items-center text-sm font-bold uppercase tracking-wider text-mainOrange"
          >
            <ion-icon name="arrow-back-outline"></ion-icon>
            <p className="ml-2">{t("continueShopping")}</p>
          </Link>
        </div>
        <div className="text-xl font-medium text-mainOrange-50 mb-3">
          {t("total")}: {(subtotal + deliveryPrice).toLocaleString()} VNĐ
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
                  {t(paymentOption.labelKey)}
                </label>
              </div>
            );
          })}
          {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
          <FitButton type="submit">{t("placeOrder")}</FitButton>
        </form>
      </div>
      <div className="brand-panel flex min-h-[280px] items-center justify-center p-5">
        {paymentMethodValue && paymentMethodValue.imageSrc && (
          <img
            className="w-[360px] h-[360px] rounded-2xl"
            src={paymentMethodValue.imageSrc}
            alt="QR Code"
          />
        )}
        {paymentMethodValue && !paymentMethodValue.imageSrc && (
          <p className="text-xl font-medium">
            {t("cashPaymentBody")}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
