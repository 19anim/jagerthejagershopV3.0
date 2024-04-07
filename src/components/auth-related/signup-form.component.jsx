import FloattingInput from "../floatting-input/floatting-input.component";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import errorMessage from "../errorMessage/errorMessage.component";

const defaultFormField = {
  email: "",
  userName: "",
  password: "",
  confirmPassword: "",
};

const SignUpForm = () => {
  const REGISTER_API_URL =
    import.meta.env.VITE_API_URL_REGISTER || VITE_API_URL_REGISTER;
  const [formField, setFormField] = useState(defaultFormField);
  const { email, userName, password, confirmPassword } = formField;
  const navigate = useNavigate();
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
      const result = await axios.post(REGISTER_API_URL, formField);
      if (result.status == 200) {
        navigate("/authentication/sign-in");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="lg:w-[60%] 2xl:w-[40%] w-[80%] mt-5 flex flex-col gap-3 items-center">
      <h2 className="text-2xl">
        <strong>Register</strong>
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
          <Link to="/authentication/sign-in">
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
