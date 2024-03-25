import { UserContext } from "../../context/user.context";
import { useContext, useState } from "react";
import FloattingInput from "../floatting-input/floatting-input.component";
import Button from "../button/button.component";

const UpdateUserInfor = () => {
  const { isLoggedIn, userInfor, updateUserInfor } = useContext(UserContext);
  const [newUserInfor, setNewUserInfor] = useState(userInfor);
  const { receipentName, address, phoneNumber } = newUserInfor;
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
        <FloattingInput
          labelName="Address"
          inputOption={{
            type: "text",
            name: "address",
            onChange: handleChange,
            value: address,
          }}
        />
        <FloattingInput
          labelName="Phone number"
          inputOption={{
            type: "text",
            name: "phoneNumber",
            onChange: handleChange,
            value: phoneNumber,
          }}
        />
        <Button type="submit">Update User Information</Button>
      </form>
    </div>
  );
};

export default UpdateUserInfor;
