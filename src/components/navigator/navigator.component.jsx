import { Fragment, useContext, useEffect, useRef, useState } from "react";
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
      adminItem: false,
    },
    {
      iconClassName: "wine-outline",
      title: "Products",
      href: "/products",
      adminItem: false,
    },
    {
      iconClassName: "add-circle-outline",
      title: "Add new products",
      href: "/admin/createProduct",
      adminItem: true,
    },
    {
      iconClassName: "documents-outline",
      title: "Orders to handle",
      href: "/admin/orders",
      adminItem: true,
    },
  ];
  const ADMIN_ROLE = "ADMIN";
  const { isLoggedIn, userInfor } = useContext(UserContext);
  const { roles } = userInfor;
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (roles) {
      roles.forEach((role) => {
        if (role.role === ADMIN_ROLE) {
          setIsAdmin(true);
        }
      });
    } else {
      setIsAdmin(false);
    }
  }, [isLoggedIn, userInfor]);
  const cartDropdownRef = useRef(null);
  return (
    <Fragment>
      <div className="flex justify-between items-center pb-[20px]">
        <Link to="/">
          <img src={Logo} alt="logo" className="w-[90px] md:w-[180px]" />
        </Link>
        <div className="flex gap-1 md:gap-8">
          {navigatorItems.map((navigatorItem) => {
            const { iconClassName, title, href, adminItem } = navigatorItem;
            if (!adminItem || (adminItem && isAdmin)) {
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
            }
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
