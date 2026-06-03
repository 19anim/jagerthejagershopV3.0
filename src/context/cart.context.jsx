import { createContext, useEffect, useState } from "react";
import { clampQuantityToStock, getProductStock } from "../utils/product.utils";

const addCartItem = (cartItems, productToAdd, quantity) => {
  const stock = getProductStock(productToAdd);
  const safeQuantity = clampQuantityToStock(quantity, stock);
  if (safeQuantity === 0) return cartItems;
  const isProductExist = cartItems.find((cartItem) => {
    return cartItem._id === productToAdd._id;
  });
  if (isProductExist) {
    return cartItems.map((cartItem) => {
      if (cartItem._id === productToAdd._id) {
        return { ...cartItem, ...productToAdd, quantity: clampQuantityToStock(cartItem.quantity + safeQuantity, stock) };
      } else {
        return cartItem;
      }
    });
  }
  return [...cartItems, { ...productToAdd, quantity: safeQuantity }];
};

const modifyCartItem = (cartItems, productToModify, typeOfModify) => {
  const stock = getProductStock(productToModify);
  if (typeOfModify === "INCREASE_BUTTON") {
    if (stock <= 0 || productToModify.quantity >= stock) return cartItems;
    return cartItems.map((cartItem) => {
      if (cartItem._id === productToModify._id) {
        return { ...cartItem, quantity: clampQuantityToStock(cartItem.quantity + 1, stock) };
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
    } else {
      return cartItems.filter((cartItem) => {
        if (cartItem._id !== productToModify._id) return cartItem;
      });
    }
  }
};

const normalizeCartItemsWithStock = (cartItems) =>
  cartItems
    .map((cartItem) => ({ ...cartItem, quantity: clampQuantityToStock(cartItem.quantity, cartItem.stock) }))
    .filter((cartItem) => cartItem.quantity > 0);

export const CartContext = createContext({
  isCartOpen: false,
  toggleIsCartOpen: () => {},
  cartItems: [],
  addItemToCart: () => {},
  setCartItems: () => {},
  modifyCartItemInCartDropdown: () => {},
  deliveryPrice: 0,
  subtotal: 0,
  cartValidationMessage: "",
  refreshCartItemsWithProducts: () => {},
});

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    setSubtotal(
      cartItems.reduce((acc, cartItem) => {
        return acc + cartItem.quantity * cartItem.priceInInteger;
      }, 0)
    );
  }, [cartItems]);

  const toggleIsCartOpen = () => setIsCartOpen((currentValue) => !currentValue);

  const addItemToCart = (productToAdd, quantity) => {
    setCartItems(addCartItem(cartItems, productToAdd, quantity));
  };

  const modifyCartItemInCartDropdown = (productToModify, typeOfModify) => {
    setCartItems(modifyCartItem(cartItems, productToModify, typeOfModify));
  };

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart_items"));
    if (cartData) {
      setCartItems(normalizeCartItemsWithStock(cartData));
    }
  }, []);

  const refreshCartItemsWithProducts = (products) => {
    const productsById = new Map(products.map((product) => [product._id, product]));
    let changedItemsCount = 0;
    setCartItems((currentItems) =>
      currentItems
        .map((cartItem) => {
          const freshProduct = productsById.get(cartItem._id);
          if (!freshProduct) {
            changedItemsCount += 1;
            return null;
          }
          const nextQuantity = clampQuantityToStock(cartItem.quantity, freshProduct.stock);
          if (nextQuantity !== cartItem.quantity) changedItemsCount += 1;
          if (nextQuantity === 0) return null;
          return { ...cartItem, ...freshProduct, quantity: nextQuantity };
        })
        .filter(Boolean)
    );
    return changedItemsCount;
  };

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  const value = {
    isCartOpen,
    toggleIsCartOpen,
    cartItems,
    setCartItems,
    addItemToCart,
    modifyCartItemInCartDropdown,
    deliveryPrice,
    setDeliveryPrice,
    subtotal,
    refreshCartItemsWithProducts,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
