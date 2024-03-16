import FloattingInput from "../floatting-input/floatting-input.component";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const defaultFormField = {
  email: "",
  userName: "",
  password: "",
  confirmPassword: "",
};

const SignUpForm = () => {
  const [formField, setFormField] = useState(defaultFormField);
  const { email, userName, password, confirmPassword } = formField;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField({ ...formField, [name]: value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Confirm password must be the same!");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/users/addNewUser", formField);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <h2 className="text-2xl">
        <strong>Login</strong>
      </h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-3 items-center"
      >
        <FloattingInput
          labelName="Email"
          inputOption={{
            type: "text",
            name: "email",
            required: true,
            onChange: handleChange,
            value: email,
          }}
        />
        <FloattingInput
          labelName="Username"
          inputOption={{
            type: "text",
            name: "userName",
            required: true,
            onChange: handleChange,
            value: userName,
          }}
        />
        <FloattingInput
          labelName="Password"
          inputOption={{
            type: "password",
            name: "password",
            required: true,
            onChange: handleChange,
            value: password,
          }}
        />
        <FloattingInput
          labelName="Confirm Password"
          inputOption={{
            type: "password",
            name: "confirmPassword",
            required: true,
            onChange: handleChange,
            value: confirmPassword,
          }}
        />
        <div className="w-full flex justify-between text-mainOrange">
          <Link to="/user/sign-in">
            <p>Already a Meister? Here to login</p>
          </Link>
        </div>
        <button
          className="bg-[#769170] text-black w-full py-2 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_10px_#6e9f65]"
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
