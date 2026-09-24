import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "Rs.";
  const delivery_fee = 0;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");

  const formatPrice = (price) => new Intl.NumberFormat('en-PK').format(price);

  const addToCart = async (itemId, size, customVal = null) => {
    const product = products.find((p) => p._id === itemId);
    // require option only if product provides options
    if (product && product.sizes && product.sizes.length > 0 && !size) {
      toast.error("Select Product Option");
      return;
    }

    let optionKey = size || "Default";
    if (customVal) {
        optionKey = `${optionKey}|${customVal}`;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][optionKey]) {
        cartData[itemId][optionKey] += 1;
      } else {
        cartData[itemId][optionKey] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][optionKey] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + '/api/cart/add',
          { itemId, size: optionKey },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + '/api/cart/update',
          { itemId, size, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const repsonse = await axios.get(
        backendUrl + '/api/product/list',
      );

      if (repsonse.data.success) {
        setProducts(repsonse.data.products);
      } else {
        toast.error(repsonse.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getUserCart = async (tokenParam) => {
    try {
      const repsonse = await axios.post( 
        backendUrl + '/api/cart/get',
        {},
        { headers: { Authorization: `Bearer ${tokenParam || token}` } }
      );
      if (repsonse.data.success) {
        setCartItems(repsonse.data.cartData);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
  }, []);

  // Global interceptor to catch auth errors and log out automatically
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        if (
          response.data &&
          response.data.success === false &&
          (response.data.message === "invalid signature" ||
           response.data.message === "jwt expired" ||
           response.data.message === "jwt malformed" ||
           response.data.message === "invalid token" ||
           response.data.message?.toLowerCase().includes("not authorized"))
        ) {
          // If we encounter a JWT error, clear the local token
          localStorage.removeItem("token");
          setToken("");
        }
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          setToken("");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    token,
    setToken,
    formatPrice,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider
