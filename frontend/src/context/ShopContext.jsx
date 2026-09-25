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
  const GALLERY_CART_KEY = "__galleryItems";

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

  const addMultipleToCart = async (itemId, size, customVals = []) => {
    const product = products.find((p) => p._id === itemId);
    if (product && product.sizes && product.sizes.length > 0 && !size) {
      toast.error("Select Product Option");
      return;
    }

    let cartData = structuredClone(cartItems);

    for (const customVal of customVals) {
        let optionKey = size || "Default";
        if (customVal) {
            optionKey = `${optionKey}|${customVal}`;
        }
        
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
    }
    setCartItems(cartData);

    if (token) {
      try {
          // Sending multiple items to the backend would require an endpoint change
          // For now, we can loop requests or just call the add endpoint multiple times
          // Using Promise.all to add them concurrently
          await Promise.all(customVals.map(customVal => {
              let optionKey = size || "Default";
              if (customVal) optionKey = `${optionKey}|${customVal}`;
              return axios.post(
                  backendUrl + '/api/cart/add',
                  { itemId, size: optionKey },
                  { headers: { Authorization: `Bearer ${token}` } }
              );
          }));
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const addGalleryToCart = async (galleryDesignId) => {
    const cartData = structuredClone(cartItems);
    const galleryItems = Array.isArray(cartData[GALLERY_CART_KEY]) ? cartData[GALLERY_CART_KEY] : [];
    const existingItem = galleryItems.find((item) => item.galleryDesignId === galleryDesignId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      galleryItems.push({ galleryDesignId, productId: null, quantity: 1 });
    }
    cartData[GALLERY_CART_KEY] = galleryItems;
    setCartItems(cartData);
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { galleryDesignId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const updateGalleryItem = async (galleryDesignId, productId, quantity) => {
    const product = products.find((item) => item._id === productId);
    if (productId && (!product || product.comingSoon)) {
      toast.error("That product is not currently available.");
      return;
    }

    const cartData = structuredClone(cartItems);
    const galleryItems = Array.isArray(cartData[GALLERY_CART_KEY]) ? cartData[GALLERY_CART_KEY] : [];
    const item = galleryItems.find((entry) => entry.galleryDesignId === galleryDesignId);
    if (!item) return;

    item.productId = productId || null;
    item.quantity = quantity;
    cartData[GALLERY_CART_KEY] = galleryItems.filter((entry) => entry.quantity > 0);
    setCartItems(cartData);
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { galleryDesignId, productId: productId || null, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (items === GALLERY_CART_KEY) {
        for (const galleryItem of cartItems[items] || []) {
          totalCount += galleryItem.quantity > 0 ? galleryItem.quantity : 0;
        }
        continue;
      }
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
      if (items === GALLERY_CART_KEY) {
        for (const galleryItem of cartItems[items] || []) {
          const product = products.find((item) => item._id === galleryItem.productId);
          if (product && galleryItem.quantity > 0) {
            totalAmount += product.price * galleryItem.quantity;
          }
        }
        continue;
      }
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
        localStorage.setItem("cartItems", JSON.stringify(repsonse.data.cartData));
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
    } else if (!token) {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch {
          localStorage.removeItem("cartItems");
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems, token]);

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
    addMultipleToCart,
    addGalleryToCart,
    updateGalleryItem,
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
