import FloattingInput from "../floatting-input/floatting-input.component";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLocale } from "../../context/locale.context";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const { localize, t } = useLocale();
  const handleChange = (event) => {
    setEmail(event.target.value);
  };
  return (
    <div className="mt-7 flex w-full flex-col items-center gap-4">
      <h2 className="font-heading text-2xl font-bold uppercase text-mainOrange">{t("recoverPassword")}</h2>
      <form action="" className="w-full flex flex-col gap-3 items-center">
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
        <div className="w-full flex justify-between text-mainOrange">
          <Link to={localize("/authentication/sign-in")}>
            <p>{t("rememberAccount")}</p>
          </Link>
        </div>
        <button
          className="brand-button w-full"
          type="submit"
        >
          {t("recoveryEmail")}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
