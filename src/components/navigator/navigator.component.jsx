import { Fragment, useContext, useEffect, useState, useRef } from "react";
import { Link, Outlet } from "react-router-dom";
import CartDropdown from "../cart-dropdown/cart-dropdown.component";
import { CartContext } from "../../context/cart.context";
import CartIcon from "../cart-icon/cart-icon.component";
import SignInIcon from "../signin-icon/signin-icon.component";

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

  const { isCartOpen } = useContext(CartContext);
  const cartDropdownRef = useRef(null);
  return (
    <Fragment>
      <div className="flex justify-between items-center pb-[20px]">
        <img
          src="../src/assets/logo.png"
          alt="logo"
          className="w-[180px] h-[180px]"
        />
        <div className="flex gap-8">
          {navigatorItems.map((navigatorItem) => {
            const { iconClassName, title, href } = navigatorItem;

            return (
              <Link
                to={href}
                key={iconClassName}
                className="group flex items-center gap-x-1 hover:cursor-pointer hover:px-5 hover:py-[5px] hover:text-black hover:rounded-[30px] hover:bg-mainOrange transition-all"
              >
                <ion-icon name={iconClassName} class="text-2xl"></ion-icon>
                <span className="group-hover:block hidden">{title}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex gap-4">
          <SignInIcon />
          <CartIcon cartDropdownRef={cartDropdownRef}/>
        </div>
        <CartDropdown ref={cartDropdownRef}/>
      </div>
      <Outlet />
    </Fragment>
  );
};

export default Navigator;
