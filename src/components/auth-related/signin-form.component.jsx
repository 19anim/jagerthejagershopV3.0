import FloattingInput from "../floatting-input/floatting-input.component";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import ErrorMessage from "../errorMessage/errorMessage.component";
import { UserContext } from "../../context/user.context";
import { CartContext } from "../../context/cart.context";
import { apiUrl } from "../../utils/api.utils";
import { useLocale } from "../../context/locale.context";

const defaultFormField = {
  userName: "",
  password: "",
};

const LOGIN_API_URL = apiUrl("/api/users/login");

const SignInForm = () => {
  const [formField, setFormField] = useState(defaultFormField);
  const { userName, password } = formField;
  const [isNotValidUser, setIsNotValidUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserInfor, userInfor, setEmail } =
    useContext(UserContext);
  const { setDeliveryPrice } = useContext(CartContext);
  const { localize, t } = useLocale();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField({ ...formField, [name]: value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setIsNotValidUser(false);
    setErrorMessage("");

    try {
      const result = await axios.post(LOGIN_API_URL, formField, {
        withCredentials: true,
      });
      if (result.status == 200) {
        setIsLoggedIn(true);
        setUserInfor({ ...userInfor, userName: result.data.userName });
        setEmail(result.data.email);
        setDeliveryPrice(0);
        navigate(localize("/user/userInformation"));
      }
    } catch (error) {
      setErrorMessage(error.response?.data || t("unauthorized"));
      setIsNotValidUser(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="mt-7 flex w-full flex-col items-center gap-4">
      <h2 className="font-heading text-2xl font-bold uppercase text-mainOrange">{t("login")}</h2>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-3 items-center"
      >
        <FloattingInput
          labelName={t("userName")}
          inputOption={{
            type: "text",
            name: "userName",
            required: true,
            onChange: handleChange,
            value: userName,
          }}
        />
        <FloattingInput
          labelName={t("password")}
          inputOption={{
            type: showPassword ? "text" : "password",
            name: "password",
            required: true,
            onChange: handleChange,
            value: password,
          }}
          rightAction={
            <button
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="grid size-7 place-items-center text-cream/55 transition hover:text-mainOrange"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              <ion-icon name={showPassword ? "eye-off-outline" : "eye-outline"}></ion-icon>
            </button>
          }
        />
        {isNotValidUser && <ErrorMessage errorMessage={errorMessage} />}
        <div className="flex w-full flex-wrap justify-between gap-2 text-xs text-mainOrange">
          <Link to={localize("/authentication/forgot-password")}>
            <p>{t("forgotPassword")}</p>
          </Link>
          <Link to={localize("/authentication/sign-up")}>
            <p>{t("newAccount")}</p>
          </Link>
        </div>
        <button
          className="brand-button w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t("loggingIn") : t("login")}
        </button>
      </form>
    </div>
  );
};

export default SignInForm;
