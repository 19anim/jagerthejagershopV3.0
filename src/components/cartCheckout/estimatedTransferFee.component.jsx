import { useContext, useState } from "react";
import axios from "axios";
import FloattingInput from "../floatting-input/floatting-input.component";
import Button from "../button/button.component";
import { CartContext } from "../../context/cart.context";

const defaultDeliveryAddress = {
  address: "",
  ward: "",
  district: "",
};

const EstimatedTransferFee = () => {
  const [deliveryAddress, setDeliveryAddress] = useState(
    defaultDeliveryAddress
  );
  const { deliveryPrice, setDeliveryPrice } = useContext(CartContext);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setDeliveryAddress({ ...deliveryAddress, [name]: value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const addressPayload = {
      method_id: "GPQB",
      method_type: "cash",
      remarks: "",
      payment_method: "CASH_BY_RECIPIENT",
      order_time: 0,
      path: [
        {
          lat: 10.805882,
          lng: 106.684421,
          address:
            "304/50/16 Đường Nguyễn Thượng Hiền, Phường 05, Quận Phú Nhuận, Hồ Chí Minh, Việt Nam",
          short_address:
            "304/50/16 Đường Nguyễn Thượng Hiền, Phường 05, Quận Phú Nhuận, Hồ Chí Minh, Việt Nam",
          types: ["Feature"],
          name: "Ân",
          mobile: "0927183879",
          adr_source: "pelias",
        },
        {
          address: "",
          short_address: "",
          types: ["Feature"],
          name: "Ân",
          mobile: "0927183879",
          cod: 0,
          adr_source: "pelias",
          item_description: "Khác",
          item_descriptions: [
            { code: "other", keyword: "Khác", group: "other" },
          ],
          item_value: 0,
        },
      ],
      images: [],
      package_detail: [],
      services: [
        { _id: "SGN-BIKE", requests: [{ _id: "SGN-BIKE-INSURANCE" }] },
      ],
      token: "",
    };
    addressPayload.path[1].address = `${deliveryAddress.address}, ${deliveryAddress.ward}, ${deliveryAddress.district}, Hồ Chí Minh, Việt Nam`;
    addressPayload.token = import.meta.env.VITE_DELIVERY_ACCESS_TOKEN;
    try {
      const result = await axios.post(
        "https://api.ahamove.com/v2/order/estimated_fee",
        addressPayload
      );
      if (result.status == 200) {
        setDeliveryPrice(result.data[0].total_pay);
      }
    } catch (error) {
      setDeliveryAddress(-1);
    }
  };
  return (
    <div className="bg-mainGreen rounded-lg p-5">
      <p className="mb-5">
        Input delivery address to calculate delivery price (Within Hồ Chí Minh
        City)
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FloattingInput
          labelName="Address"
          inputOption={{
            type: "text",
            name: "address",
            required: true,
            onChange: handleChange,
            value: deliveryAddress.address,
          }}
        />
        <FloattingInput
          labelName="Ward"
          inputOption={{
            type: "text",
            name: "ward",
            required: true,
            onChange: handleChange,
            value: deliveryAddress.ward,
          }}
        />
        <FloattingInput
          labelName="District"
          inputOption={{
            type: "text",
            name: "district",
            required: true,
            onChange: handleChange,
            value: deliveryAddress.district,
          }}
        />
        <h3>
          Estimated Fee:{" "}
          {deliveryPrice == -1 ? "We ran into a problem, please try again later or contact the admin" : `${deliveryPrice.toLocaleString()} VNĐ`}
        </h3>
        <Button>Lookup</Button>
      </form>
    </div>
  );
};

export default EstimatedTransferFee;
