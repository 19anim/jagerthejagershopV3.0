import { useLocation } from "react-router-dom";
import SignInForm from "../components/user-related/signin-form.component";
import SignUpForm from "../components/user-related/signup-form.component";
import ForgotPasswordForm from "../components/user-related/forgot-password-form.component";

const UserPage = () => {
  const DEFINED_PATH = {
    LOGIN: "/user/sign-in",
    REGISTER: "/user/sign-up",
    FORGOT_PASSWORD: "/user/forgot-password",
  };
  const BACKGROUND_IMAGE =
    "https://images.ctfassets.net/86v07ri6w8tx/2MwCifMF5eEmkiUGYUI4S2/079f5123b150a37c839c62d2208176fd/teaser_history.jpg?&w=1366&q=66&fl=progressive";
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-[40%_60%] gap-3 bg-mainGreen rounded-3xl p-3">
      <div className=" drop-shadow-[0_0_10px_black]">
        <img className=" rounded-3xl" src={BACKGROUND_IMAGE} alt="a" />
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <img
            className="w-[50px] h-[50px]"
            src="../src/assets/logo.png"
            alt=""
          />
          <h2 className="text-xl">
            Welcome to <strong>JAGERTHEJAGER SHOP</strong>
          </h2>
          <h3 className="text-sm">Ở đây iem bán thuốc ho con hươu shop</h3>
          {pathname == DEFINED_PATH.LOGIN && <SignInForm />}
          {pathname == DEFINED_PATH.REGISTER && <SignUpForm />}
          {pathname == DEFINED_PATH.FORGOT_PASSWORD && <ForgotPasswordForm />}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
