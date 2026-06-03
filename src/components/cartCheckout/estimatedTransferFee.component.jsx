import { useContext, useState } from "react";
import axios from "axios";
import FloattingInput from "../floatting-input/floatting-input.component";
import Button from "../button/button.component";
import { CartContext } from "../../context/cart.context";
import { UserContext } from "../../context/user.context";
import { apiUrl } from "../../utils/api.utils";
import { useLocale } from "../../context/locale.context";

const EstimatedTransferFee = () => {
  const { deliveryPrice, setDeliveryPrice } = useContext(CartContext);
  const { userInfor, setUserInfor, isLoggedIn, updateUserInfor } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();

  const handleChange = (event) => setUserInfor({ ...userInfor, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(apiUrl("/api/delivery/estimate"), userInfor);
      setDeliveryPrice(response.data.deliveryPrice);
      if (isLoggedIn) updateUserInfor(userInfor, false);
    } catch (_error) {
      setDeliveryPrice(-1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="brand-panel p-5">
      <p className="mb-5 leading-6 text-cream/75">{t("deliveryEstimateBody")}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {[[t("recipientName"), "receipentName"], [t("phoneNumber"), "phoneNumber"], [t("address"), "address"], [t("ward"), "ward"], [t("district"), "district"]].map(([label, name]) => (
          <FloattingInput key={name} labelName={label} inputOption={{ type: "text", name, required: true, onChange: handleChange, value: userInfor[name] || "" }} />
        ))}
        <h3>{t("deliveryFee")}: {deliveryPrice === -1 ? t("deliveryFeeError") : `${deliveryPrice.toLocaleString()} VNĐ`}</h3>
        <Button disabled={isLoading}>{isLoading ? t("calculating") : t("estimateDelivery")}</Button>
      </form>
    </div>
  );
};

export default EstimatedTransferFee;
