import { UserContext } from "../../context/user.context";
import { useContext, useState } from "react";
import FloattingInput from "../floatting-input/floatting-input.component";
import FloattingInputHalfWidth from "../floatting-input/floatting-input-half-width.component";
import Button from "../button/button.component";

const UpdateUserInfor = () => {
  const { isLoggedIn, userInfor, updateUserInfor } = useContext(UserContext);
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
    <div className="mt-5 w-[80%] flex flex-col gap-3 items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-3 items-center"
      >
        <FloattingInput
          labelName="Receipent name"
          inputOption={{
            type: "text",
            name: "receipentName",
            onChange: handleChange,
            value: receipentName,
          }}
        />
        <div className="w-full flex gap-5">
          <FloattingInputHalfWidth
            labelName="Address"
            inputOption={{
              type: "text",
              name: "address",
              onChange: handleChange,
              value: address,
            }}
          />
          <FloattingInputHalfWidth
            labelName="Ward"
            inputOption={{
              type: "text",
              name: "ward",
              onChange: handleChange,
              value: ward,
            }}
          />
        </div>
        <div className="w-full flex gap-5">
          <FloattingInputHalfWidth
            labelName="District"
            inputOption={{
              type: "text",
              name: "district",
              onChange: handleChange,
              value: district,
            }}
          />
          <FloattingInputHalfWidth
            labelName="City"
            inputOption={{
              type: "text",
              name: "city",
              onChange: handleChange,
              value: city,
            }}
          />
        </div>
        <div className="w-full flex gap-5">
          <FloattingInputHalfWidth
            labelName="Phone number"
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
        <Button type="submit">Update User Information</Button>
      </form>
    </div>
  );
};

export default UpdateUserInfor;
