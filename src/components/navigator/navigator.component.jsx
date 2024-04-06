import { Fragment, useContext, useRef } from "react";
import { Link, Outlet } from "react-router-dom";
import CartDropdown from "../cart-dropdown/cart-dropdown.component";
import { UserContext } from "../../context/user.context";
import CartIcon from "../cart-icon/cart-icon.component";
import SignInIcon from "../signin-icon/signin-icon.component";
import UserIcon from "../user-icon/user-icon.component";
import Logo from "../../assets/logo.png";

const Navigator = () => {
  const navigatorItems = [
    {
      iconClassName: "home-outline",
      title: "Home",
      href: "/",
    },
    {
      iconClassName: "wine-outline",
      title: "Products",
      href: "/products",
    },
    {
      iconClassName: "add-circle-outline",
      title: "Add new products - admin",
      href: "/products/create",
    },
  ];

  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);
  const cartDropdownRef = useRef(null);
  return (
    <Fragment>
      <div className="flex justify-between items-center pb-[20px]">
        <img src={Logo} alt="logo" className="w-[90px] md:w-[180px]" />
        <div className="flex gap-1 md:gap-8">
          {navigatorItems.map((navigatorItem) => {
            const { iconClassName, title, href } = navigatorItem;

            return (
              <Link
                to={href}
                key={iconClassName}
                className="group flex items-center gap-x-1 hover:cursor-pointer hover:px-5 hover:py-[5px] hover:text-black hover:rounded-[30px] hover:bg-mainOrange transition-all"
              >
                <ion-icon name={iconClassName} class="text-2xl"></ion-icon>
                <span className="md:group-hover:block hidden">{title}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex gap-1 md:gap-4">
          {isLoggedIn ? <UserIcon /> : <SignInIcon />}
          <CartIcon cartDropdownRef={cartDropdownRef} />
        </div>
        <CartDropdown ref={cartDropdownRef} />
      </div>
      <Outlet />
    </Fragment>
  );
};

export default Navigator;
