import FloattingInput from "../floatting-input/floatting-input.component";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { useLocale } from "../../context/locale.context";
import ErrorMessage from "../errorMessage/errorMessage.component";

const defaultFormField = {
  email: "",
  userName: "",
  password: "",
  confirmPassword: "",
};

const SignUpForm = () => {
  const REGISTER_API_URL = apiUrl("/api/users/addNewUser");
  const [formField, setFormField] = useState(defaultFormField);
  const { email, userName, password, confirmPassword } = formField;
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();
  const { localize, t } = useLocale();
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormField({ ...formField, [name]: value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await axios.post(REGISTER_API_URL, formField);
      if (result.status == 200) {
        navigate(localize("/authentication/sign-in"));
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || error.response?.data || t("registerFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="mt-7 flex w-full flex-col items-center gap-4">
      <h2 className="font-heading text-2xl font-bold uppercase text-mainOrange">{t("register")}</h2>
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
            type: visiblePasswords.password ? "text" : "password",
            name: "password",
            required: true,
            onChange: handleChange,
            value: password,
          }}
          rightAction={
            <button
              aria-label={visiblePasswords.password ? t("hidePassword") : t("showPassword")}
              className="grid size-7 place-items-center text-cream/55 transition hover:text-mainOrange"
              onClick={() => setVisiblePasswords((current) => ({ ...current, password: !current.password }))}
              type="button"
            >
              <ion-icon name={visiblePasswords.password ? "eye-off-outline" : "eye-outline"}></ion-icon>
            </button>
          }
        />
        <FloattingInput
          labelName={t("confirmPassword")}
          inputOption={{
            type: visiblePasswords.confirmPassword ? "text" : "password",
            name: "confirmPassword",
            required: true,
            onChange: handleChange,
            value: confirmPassword,
          }}
          rightAction={
            <button
              aria-label={visiblePasswords.confirmPassword ? t("hidePassword") : t("showPassword")}
              className="grid size-7 place-items-center text-cream/55 transition hover:text-mainOrange"
              onClick={() => setVisiblePasswords((current) => ({ ...current, confirmPassword: !current.confirmPassword }))}
              type="button"
            >
              <ion-icon name={visiblePasswords.confirmPassword ? "eye-off-outline" : "eye-outline"}></ion-icon>
            </button>
          }
        />
        <p className="w-full text-xs leading-5 text-cream/55">{t("ageRegisterNote")}</p>
        {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
        <div className="w-full flex justify-between text-mainOrange">
          <Link to={localize("/authentication/sign-in")}>
            <p>{t("existingAccount")}</p>
          </Link>
        </div>
        <button
          className="brand-button w-full"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? t("registering") : t("register")}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
