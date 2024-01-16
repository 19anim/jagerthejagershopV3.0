import { Fragment } from "react";
import { Link, Outlet } from "react-router-dom";
import CartDropdown from "../cart-dropdown/cart-dropdown.component";

const Navigator = () => {
  const navigatorItems = [
    {
      iconClassName: "home-outline",
      title: "Home",
    },
    {
      iconClassName: "search-outline",
      title: "Search",
    },
    {
      iconClassName: "notifications-outline",
      title: "Notifications",
    },
  ];

  const toggleCart = () => {
    var a = document.getElementById("cart-dropdown");
    var isHidden = a.className.indexOf("hidden");
    if (isHidden == -1) {
      a.className = a.className + " hidden";
    } else {
      a.className = a.className.replace("hidden", "");
    }
  };

  return (
    <Fragment>
      <div className="flex justify-between items-center pb-[80px]">
        <img src="../src/assets/logo.png" alt="logo" className="max-w-20" />
        <div className="flex gap-8">
          {navigatorItems.map((navigatorItem) => {
            const { iconClassName, title } = navigatorItem;

            return (
              <div
                key={iconClassName}
                className="group flex items-center gap-x-1 hover:cursor-pointer hover:px-5 hover:py-[5px] hover:text-black hover:rounded-[30px] hover:bg-mainOrgane transition-all"
              >
                <ion-icon name={iconClassName} class="text-2xl"></ion-icon>
                <span className="group-hover:block hidden">{title}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4">
          <div onClick={toggleCart}>
            <ion-icon
              name="cart-outline"
              class="relative peer text-2xl cursor-pointer"
            ></ion-icon>
          </div>
          <CartDropdown />

          <ion-icon name="person-circle-outline" class="text-2xl"></ion-icon>
        </div>
      </div>
      <Outlet />
    </Fragment>
  );
};

export default Navigator;
