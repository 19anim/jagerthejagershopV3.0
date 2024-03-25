import FloattingInput from "../floatting-input/floatting-input.component";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import ErrorMessage from "../errorMessage/errorMessage.component";
import { UserContext } from "../../context/user.context";

const defaultFormField = {
  userName: "",
  password: "",
};

const baseAPIURL = import.meta.env.VITE_BASE_API_URL;

const SignInForm = () => {
  const [formField, setFormField] = useState(defaultFormField);
  const { userName, password } = formField;
  const [isNotValidUser, setIsNotValidUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName, setEmail } = useContext(UserContext);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField({ ...formField, [name]: value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const result = await axios.post(`${baseAPIURL}/users/login`, formField, {
        withCredentials: true,
      });
      if (result.status == 200) {
        setIsLoggedIn(true);
        setUserName(result.data.userName);
        setEmail(result.data.email);
        navigate("/user/userInformation");
      }
    } catch (error) {
      setErrorMessage(error.response.data);
      setIsNotValidUser(true);
    }
  };
  return (
    <div className="mt-5 w-[40%] flex flex-col gap-3 items-center">
      <h2 className="text-2xl">
        <strong>Login</strong>
      </h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-3 items-center"
      >
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
        {isNotValidUser && <ErrorMessage errorMessage={errorMessage} />}
        <div className="w-full flex justify-between text-mainOrange">
          <Link to="/authentication/forgot-password">
            <p>Forgot your password?</p>
          </Link>
          <Link to="/authentication/sign-up">
            <p>New Meister?</p>
          </Link>
        </div>
        <button
          className="bg-[#769170] text-black w-full py-2 rounded-lg transition-all active:scale-95 hover:shadow-[0_0_10px_#6e9f65]"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default SignInForm;
