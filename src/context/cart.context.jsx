import { createContext, useEffect, useState, useRef } from "react";

const addCartItem = (cartItems, productToAdd, quantity) => {
  const isProductExist = cartItems.find((cartItem) => {
    return cartItem._id === productToAdd._id;
  });
  if (isProductExist) {
    return cartItems.map((cartItem) => {
      if (cartItem._id === productToAdd._id) {
        return { ...cartItem, quantity: cartItem.quantity + quantity };
      } else {
        return cartItem;
      }
    });
  }
  return [...cartItems, { ...productToAdd, quantity }];
};

const modifyCartItem = (cartItems, productToModify, typeOfModify) => {
  if (typeOfModify === "INCREASE_BUTTON") {
    return cartItems.map((cartItem) => {
      if (cartItem._id === productToModify._id) {
        return { ...cartItem, quantity: cartItem.quantity + 1 };
      } else {
        return cartItem;
      }
    });
  } else if (typeOfModify === "DECREASE_BUTTON") {
    if (productToModify.quantity > 1) {
      return cartItems.map((cartItem) => {
        if (cartItem._id === productToModify._id) {
          return { ...cartItem, quantity: cartItem.quantity - 1 };
        } else {
          return cartItem;
        }
      });
    }
  }
};

export const CartContext = createContext({
  isCartOpen: false,
  toggleIsCartOpen: () => {},
  cartItems: [],
  addItemToCart: () => {},
  modifyCartItemInCartDropdown: () => {},
});

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const toggleIsCartOpen = (cartDropdownRef) => {
    if (cartDropdownRef.current !== null) {
      const classList = cartDropdownRef.current.classList;
      classList.toggle("inset-[0_0_0_auto]");
      classList.toggle("inset-[0_-415px_0_auto]");
    }
  };

  const addItemToCart = (productToAdd, quantity) => {
    setCartItems(addCartItem(cartItems, productToAdd, quantity));
  };

  const modifyCartItemInCartDropdown = (productToModify, typeOfModify) => {
    setCartItems(modifyCartItem(cartItems, productToModify, typeOfModify));
  };
  const value = {
    isCartOpen,
    toggleIsCartOpen,
    cartItems,
    addItemToCart,
    modifyCartItemInCartDropdown
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
