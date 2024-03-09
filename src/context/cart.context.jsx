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

export const CartContext = createContext({
  isCartOpen: false,
  toggleIsCartOpen: () => {},
  cartItems: [],
  addItemToCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const toggleIsCartOpen = (cartDropdownRef) => {
    if (cartDropdownRef.current !== null){
      const classList = cartDropdownRef.current.classList;
      classList.toggle("inset-[0_0_0_auto]");
      classList.toggle("inset-[0_-415px_0_auto]");
    }
  };

  const addItemToCart = (productToAdd, quantity) => {
    setCartItems(addCartItem(cartItems, productToAdd, quantity));
  };
  const value = {
    isCartOpen,
    toggleIsCartOpen,
    cartItems,
    addItemToCart,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
