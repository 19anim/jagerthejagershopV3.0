import { UserContext } from "../../context/user.context";
import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../../context/cart.context";
import Logo from "../../assets/logo.png";

const UserIcon = () => {
  const LOGOUT_API_URL =
    import.meta.env.VITE_API_URL_LOGOUT || VITE_API_URL_LOGOUT;
  const { setIsLoggedIn, userName, setUserName, email, setUserInfor, defaultUserInfor } =
    useContext(UserContext);
  const { setDeliveryPrice } = useContext(CartContext);
  const navigate = useNavigate();
  const handleLogOut = () => {
    axios.get(LOGOUT_API_URL, {
      withCredentials: true,
    });
    navigate("/");
    setIsLoggedIn(false);
    setUserInfor(defaultUserInfor);
    setUserName("");
    setDeliveryPrice(0);
  };
  return (
    <div className="group relative">
      <p className="cursor-pointer">
        Hi Meister <span className="text-mainOrange">{userName}</span>
      </p>
      <div className="absolute right-0 top-6 hidden min-w-[250px] group-hover:block transition-all duration-200 z-50">
        <div className="bg-[#c1c7c6] px-2 rounded-[10px_10px_0px_0px] flex flex-col items-center text-black">
          <img src={Logo} alt="" className="w-[80px]" />
          <div className="mb-[10px] text-center">
            <p>Username: {userName}</p>
            <p>Email: {email}</p>
          </div>
        </div>
        <div className="bg-white px-2 rounded-[0px_0px_10px_10px] text-black flex flex-col items-center gap-2">
          <Link to="/user/userInformation">
            <div className="mt-[10px] cursor-pointer">Manage account</div>
          </Link>
          <hr className="w-full" />
          <Link to="/user/orders">
            <div className="cursor-pointer">My Orders</div>
          </Link>
          <hr className="w-full" />
          <div className="mb-[10px] cursor-pointer" onClick={handleLogOut}>
            Log out
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIcon;
