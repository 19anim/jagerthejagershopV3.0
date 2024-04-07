import { Outlet } from "react-router-dom";
import Logo from "../../assets/logo.png";

const AuthLayout = () => {
  const BACKGROUND_IMAGE =
    import.meta.env.VITE_AUTH_BACKGROUND_IMAGE || VITE_AUTH_BACKGROUND_IMAGE;

  return (
    <div className="lg:grid lg:grid-cols-[40%_60%] gap-3 bg-mainGreen rounded-3xl p-3">
      <div className=" drop-shadow-[0_0_10px_black]">
        <img
          className="rounded-3xl lg:min-h-[375px]"
          src={BACKGROUND_IMAGE}
          alt="Background_Image"
        />
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center w-full">
          <img className="h-[50px]" src={Logo} alt="" />
          <h2 className="lg:text-xl">
            Welcome to <strong>JAGERTHEJAGER SHOP</strong>
          </h2>
          <h3 className="text-sm">Ở đây iem bán thuốc ho con hươu shop</h3>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
