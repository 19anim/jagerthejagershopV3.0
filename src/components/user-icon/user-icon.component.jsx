import { UserContext } from "../../context/user.context";
import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../../context/cart.context";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";
import { apiUrl } from "../../utils/api.utils";

const UserIcon = () => {
  const LOGOUT_API_URL = apiUrl("/api/users/logout");
  const { setIsLoggedIn, setIsAdmin, isAdmin, email, userInfor, setUserInfor, defaultUserInfor } =
    useContext(UserContext);
  const { userName } = userInfor;
  const { setDeliveryPrice } = useContext(CartContext);
  const navigate = useNavigate();
  const { localize, t } = useLocale();
  const handleLogOut = () => {
    axios.get(LOGOUT_API_URL, {
      withCredentials: true,
    });
    navigate(localize("/"));
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserInfor(defaultUserInfor);
    setDeliveryPrice(0);
    localStorage.removeItem("isAdmin");
  };
  return (
    <div className="group relative">
      <p className="cursor-pointer">
        {t("greeting")} <span className="text-mainOrange">{userName}</span>
      </p>
      <div className="absolute right-0 top-6 hidden min-w-[250px] group-hover:block transition-all duration-200 z-50">
        <div className="flex flex-col items-center border border-warmGold/30 bg-mainGreen px-3 pt-2 text-cream shadow-2xl">
          <img src={Logo} alt="" className="w-[80px]" />
          <div className="mb-[10px] text-center">
            <p>{t("userName")}: {userName}</p>
            <p>Email: {email}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 border-x border-b border-warmGold/30 bg-[#14231d] px-3 text-cream">
          <Link to={localize("/user/userInformation")}>
            <div className="mt-[10px] cursor-pointer">{t("manageAccount")}</div>
          </Link>
          {!isAdmin && (
            <>
              <hr className="w-full" />
              <Link to={localize("/user/orders")}>
                <div className="cursor-pointer">{t("myOrders")}</div>
              </Link>
            </>
          )}
          <hr className="w-full" />
          <div className="mb-[10px] cursor-pointer" onClick={handleLogOut}>
            {t("logout")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIcon;
