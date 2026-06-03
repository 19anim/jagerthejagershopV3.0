import { UserContext } from "../../context/user.context";
import { useContext, useState } from "react";
import FloattingInput from "../floatting-input/floatting-input.component";
import FloattingInputHalfWidth from "../floatting-input/floatting-input-half-width.component";
import Button from "../button/button.component";
import { useLocale } from "../../context/locale.context";

const UpdateUserInfor = () => {
  const { userInfor, updateUserInfor } = useContext(UserContext);
  const { t } = useLocale();
  const [newUserInfor, setNewUserInfor] = useState(userInfor);
  const { receipentName, address, ward, district, city, email, phoneNumber } =
    newUserInfor;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewUserInfor({ ...newUserInfor, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateUserInfor(newUserInfor);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="mb-4 self-start font-heading text-2xl font-extrabold uppercase text-cream">{t("updateInformation")}</h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-3 items-center"
      >
        <FloattingInput
          labelName={t("recipientName")}
          inputOption={{
            type: "text",
            name: "receipentName",
            onChange: handleChange,
            value: receipentName,
          }}
        />
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5">
          <FloattingInputHalfWidth
            labelName={t("address")}
            inputOption={{
              type: "text",
              name: "address",
              onChange: handleChange,
              value: address,
            }}
          />
          <FloattingInputHalfWidth
            labelName={t("ward")}
            inputOption={{
              type: "text",
              name: "ward",
              onChange: handleChange,
              value: ward,
            }}
          />
        </div>
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5">
          <FloattingInputHalfWidth
            labelName={t("district")}
            inputOption={{
              type: "text",
              name: "district",
              onChange: handleChange,
              value: district,
            }}
          />
          <FloattingInputHalfWidth
            labelName={t("city")}
            inputOption={{
              type: "text",
              name: "city",
              onChange: handleChange,
              value: city,
            }}
          />
        </div>
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-5">
          <FloattingInputHalfWidth
            labelName={t("phoneNumber")}
            inputOption={{
              type: "text",
              name: "phoneNumber",
              onChange: handleChange,
              value: phoneNumber,
            }}
          />
          <FloattingInputHalfWidth
            labelName="Email"
            inputOption={{
              type: "text",
              name: "email",
              onChange: handleChange,
              value: email,
            }}
          />
        </div>
        <Button type="submit">{t("saveInformation")}</Button>
      </form>
    </div>
  );
};

export default UpdateUserInfor;
