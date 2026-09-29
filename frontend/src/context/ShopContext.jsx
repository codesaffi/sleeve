import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";
import { getPosterMinimum, getPosterPrice, getPosterQuantityFromKey, isPosterProduct } from "../utils/posterPricing";
import { DELIVERY_CHARGE } from "../utils/orderPricing";
import { trackAddToCart } from "../utils/metaPixel";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "Rs.";
  const delivery_fee = DELIVERY_CHARGE;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [token, setToken] = useState("");
  const GALLERY_CART_KEY = "__galleryItems";
  const POSTER_BATCHES_KEY = "__posterBatches";

  const formatPrice = (price) => new Intl.NumberFormat('en-PK').format(price);

  const addToCart = async (itemId, size, customVal = null, posterQuantity = null) => {
    const product = products.find((p) => p._id === itemId);
    // require option only if product provides options
    if (product && product.sizes && product.sizes.length > 0 && !size) {
      toast.error("Select Product Option");
      return false;
    }

    let optionKey = size || "Default";
    if (customVal) {
        optionKey = `${optionKey}|${customVal}`;
    }
    if (isPosterProduct(product)) {
      if (!Number.isInteger(Number(posterQuantity)) || Number(posterQuantity) < getPosterMinimum(product)) {
        toast.error(`Minimum order quantity is ${getPosterMinimum(product)} posters.`);
        return false;
      }
      optionKey = `${optionKey}|poster::${Number(posterQuantity)}`;
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
        const response = await axios.post(
          backendUrl + '/api/cart/add',
          { itemId, size: optionKey, posterQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to add item to cart.");
          await getUserCart(token);
          return false;
        }
      } catch (error) {
        toast.error(error.message);
        return false;
      }
    }
    if (product) {
      const value = isPosterProduct(product)
        ? getPosterPrice(product, posterQuantity) ?? product.price
        : product.price;
      trackAddToCart([{
        id: product._id,
        name: product.name,
        category: product.category,
        value,
        quantity: isPosterProduct(product) ? Number(posterQuantity) : 1,
      }]);
    }
    return true;
  };

  const addPosterBatch = async ({ batchId, productId, size, posterQuantity, designs }) => {
    const product = products.find((entry) => entry._id === productId);
    const minimum = getPosterMinimum(product);
    if (!isPosterProduct(product) || product.comingSoon) {
      toast.error("The selected poster product is not currently available.");
      return false;
    }
    if (!Number.isInteger(Number(posterQuantity)) || Number(posterQuantity) < minimum) {
      toast.error(`Minimum order quantity is ${minimum} posters.`);
      return false;
    }
    if (!Array.isArray(designs) || designs.length !== Number(posterQuantity)) {
      toast.error(`You selected ${posterQuantity} posters. Please provide exactly ${posterQuantity} designs.`);
      return false;
    }

    const posterBatch = {
      batchId: batchId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      productId,
      size: size || "Default",
      posterQuantity: Number(posterQuantity),
      designCount: designs.length,
      designs,
    };

    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/add",
          { posterBatch },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to add poster batch to cart.");
          return false;
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        return false;
      }
    }

    setCartItems((currentCartItems) => ({
      ...currentCartItems,
      [POSTER_BATCHES_KEY]: [...(currentCartItems[POSTER_BATCHES_KEY] || []), posterBatch],
    }));
    trackAddToCart([{
      id: product._id,
      name: product.name,
      category: product.category,
      value: getPosterPrice(product, posterBatch.posterQuantity) ?? product.price,
      quantity: posterBatch.posterQuantity,
    }]);
    return true;
  };

  const addPosterBatches = async (batches) => {
    if (!Array.isArray(batches) || batches.length === 0) return false;
    const posterBatches = [];
    try {
      for (const batch of batches) {
        const product = products.find((entry) => entry._id === batch.productId);
        const minimum = getPosterMinimum(product);
        if (!isPosterProduct(product) || product.comingSoon) {
          throw new Error("The selected poster product is not currently available.");
        }
        if (!Number.isInteger(Number(batch.posterQuantity)) || Number(batch.posterQuantity) < minimum) {
          throw new Error(`Minimum order quantity for ${product.name} is ${minimum} posters.`);
        }
        if (!Array.isArray(batch.designs) || batch.designs.length !== Number(batch.posterQuantity)) {
          throw new Error(`You selected ${batch.posterQuantity} posters. Please provide exactly ${batch.posterQuantity} designs.`);
        }
        posterBatches.push({
          batchId: batch.batchId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
          productId: batch.productId,
          size: batch.size || "Default",
          posterQuantity: Number(batch.posterQuantity),
          designCount: batch.designs.length,
          designs: batch.designs,
        });
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }

    const galleryDesignIds = posterBatches.flatMap((batch) => batch.designs)
      .filter((design) => design.type === "gallery")
      .map((design) => design.galleryDesignId);
    if (new Set(galleryDesignIds).size !== galleryDesignIds.length) {
      toast.error("Each selected Gallery design can only be assigned to one poster group.");
      return false;
    }

    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/add",
          { posterBatches },
          { headers: { Authorization: "Bearer " + token } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to add poster batches to cart.");
          return false;
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        return false;
      }
    }

    setCartItems((currentCartItems) => ({
      ...currentCartItems,
      [POSTER_BATCHES_KEY]: [...(currentCartItems[POSTER_BATCHES_KEY] || []), ...posterBatches],
    }));
    trackAddToCart(posterBatches.map((batch) => {
      const product = products.find((entry) => entry._id === batch.productId);
      return {
        id: product?._id,
        name: product?.name,
        category: product?.category,
        value: getPosterPrice(product, batch.posterQuantity) ?? product?.price ?? 0,
        quantity: batch.posterQuantity,
      };
    }));
    return true;
  };

  const removePosterBatch = async (batchId) => {
    const currentBatches = cartItems[POSTER_BATCHES_KEY] || [];
    const remainingBatches = currentBatches.filter((batch) => batch.batchId !== batchId);
    if (remainingBatches.length === currentBatches.length) return;

    setCartItems((currentCartItems) => ({
      ...currentCartItems,
      [POSTER_BATCHES_KEY]: (currentCartItems[POSTER_BATCHES_KEY] || []).filter((batch) => batch.batchId !== batchId),
    }));
    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/update",
          { posterBatchId: batchId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to remove poster batch.");
          await getUserCart(token);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        await getUserCart(token);
      }
    }
  };

  const addMultipleToCart = async (itemId, size, customVals = [], posterQuantity = null) => {
    const product = products.find((p) => p._id === itemId);
    if (product && product.sizes && product.sizes.length > 0 && !size) {
      toast.error("Select Product Option");
      return false;
    }
    if (isPosterProduct(product) && (!Number.isInteger(Number(posterQuantity)) || Number(posterQuantity) < getPosterMinimum(product))) {
      toast.error(`Minimum order quantity is ${getPosterMinimum(product)} posters.`);
      return false;
    }
    if (!customVals.length) return false;

    let cartData = structuredClone(cartItems);

    for (const customVal of customVals) {
        let optionKey = size || "Default";
        if (customVal) {
            optionKey = `${optionKey}|${customVal}`;
        }
        if (isPosterProduct(product)) optionKey = `${optionKey}|poster::${Number(posterQuantity)}`;
        
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
          const responses = await Promise.all(customVals.map(customVal => {
              let optionKey = size || "Default";
              if (customVal) optionKey = `${optionKey}|${customVal}`;
              return axios.post(
                  backendUrl + '/api/cart/add',
                  { itemId, size: optionKey, posterQuantity },
                  { headers: { Authorization: `Bearer ${token}` } }
              );
          }));
          const failedResponse = responses.find((response) => !response.data.success);
          if (failedResponse) {
            toast.error(failedResponse.data.message || "Unable to add item to cart.");
            await getUserCart(token);
            return false;
          }
      } catch (error) {
        toast.error(error.message);
        return false;
      }
    }
    if (product) {
      const value = isPosterProduct(product)
        ? (getPosterPrice(product, posterQuantity) ?? product.price) * customVals.length
        : product.price * customVals.length;
      trackAddToCart([{
        id: product._id,
        name: product.name,
        category: product.category,
        value,
        quantity: isPosterProduct(product) ? Number(posterQuantity) * customVals.length : customVals.length,
      }]);
    }
    return true;
  };

  const addGalleryToCart = async (galleryDesignId) => {
    setCartItems((currentCartItems) => {
      const cartData = structuredClone(currentCartItems);
      const galleryItems = Array.isArray(cartData[GALLERY_CART_KEY]) ? cartData[GALLERY_CART_KEY] : [];
      const existingItem = galleryItems.find((item) => item.galleryDesignId === galleryDesignId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        galleryItems.push({ galleryDesignId, productId: null, quantity: 1 });
      }
      cartData[GALLERY_CART_KEY] = galleryItems;
      return cartData;
    });

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
    if (productId && isPosterProduct(product)) {
      const minimum = getPosterMinimum(product);
      if (!Number.isInteger(Number(quantity)) || Number(quantity) < minimum) {
        toast.error(`Minimum order quantity is ${minimum} posters.`);
        return;
      }
    }

    const cartData = structuredClone(cartItems);
    const galleryItems = Array.isArray(cartData[GALLERY_CART_KEY]) ? cartData[GALLERY_CART_KEY] : [];
    const item = galleryItems.find((entry) => entry.galleryDesignId === galleryDesignId);
    if (!item) return;

    const addingProduct = !item.productId && !!productId;
    item.productId = productId || null;
    item.quantity = quantity;
    cartData[GALLERY_CART_KEY] = galleryItems.filter((entry) => entry.quantity > 0);
    setCartItems(cartData);
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    let updateSucceeded = true;
    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/update",
          { galleryDesignId, productId: productId || null, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to update cart.");
          await getUserCart(token);
          updateSucceeded = false;
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        updateSucceeded = false;
      }
    }

    if (addingProduct && product && updateSucceeded) {
      const value = isPosterProduct(product)
        ? getPosterPrice(product, quantity) ?? product.price
        : product.price * quantity;
      trackAddToCart([{
        id: product._id,
        name: product.name,
        category: product.category,
        value,
        quantity,
      }]);
    }
  };

  const getCartCount = () => {
    let totalCount = (cartItems[POSTER_BATCHES_KEY] || []).length;
    for (const items in cartItems) {
      if (items === POSTER_BATCHES_KEY) continue;
      if (items === GALLERY_CART_KEY) {
        for (const galleryItem of cartItems[items] || []) {
          totalCount += galleryItem.quantity > 0 ? galleryItem.quantity : 0;
        }
        continue;
      }
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) totalCount += cartItems[items][item];
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
        const response = await axios.post(
          backendUrl + '/api/cart/update',
          { itemId, size, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to update cart.");
          await getUserCart(token);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updatePosterQuantity = async (itemId, size, posterQuantity) => {
    const product = products.find((entry) => entry._id === itemId);
    const price = getPosterPrice(product, posterQuantity);
    if (price === null) {
      toast.error(`Minimum order quantity is ${getPosterMinimum(product)} posters.`);
      return;
    }
    const itemCount = cartItems[itemId]?.[size] || 0;
    const cartData = structuredClone(cartItems);
    delete cartData[itemId][size];
    const nextSize = size.replace(/\|poster::\d+/, `|poster::${posterQuantity}`);
    cartData[itemId][nextSize] = (cartData[itemId][nextSize] || 0) + itemCount;
    setCartItems(cartData);
    if (token) {
      try {
        const response = await axios.post(backendUrl + "/api/cart/update", {
          itemId, size, quantity: itemCount, posterQuantity,
        }, { headers: { Authorization: 'Bearer ' + token } });
        if (!response.data.success) {
          toast.error(response.data.message || "Unable to update poster quantity.");
          await getUserCart(token);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        await getUserCart(token);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const batch of cartItems[POSTER_BATCHES_KEY] || []) {
      const product = products.find((item) => item._id === batch.productId);
      if (product) totalAmount += getPosterPrice(product, batch.posterQuantity) || 0;
    }
    for (const items in cartItems) {
      if (items === POSTER_BATCHES_KEY) continue;
      if (items === GALLERY_CART_KEY) {
        for (const galleryItem of cartItems[items] || []) {
          const product = products.find((item) => item._id === galleryItem.productId);
          if (product && galleryItem.quantity > 0) {
            totalAmount += isPosterProduct(product)
              ? (getPosterPrice(product, galleryItem.quantity) || 0)
              : product.price * galleryItem.quantity;
          }
        }
        continue;
      }
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        const itemQuantity = cartItems[items][item];
        if (!itemInfo || itemQuantity <= 0) continue;
        const posterQuantity = getPosterQuantityFromKey(item);
        totalAmount += posterQuantity === null
          ? itemInfo.price * itemQuantity
          : (getPosterPrice(itemInfo, posterQuantity) || 0) * itemQuantity;
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
        toast.error(repsonse.data.message || "Unable to load products. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load products. Please try again.");
    } finally {
      setProductsLoading(false);
    }
  };

  const getGalleryData = useCallback(async () => {
    if (galleryImages.length > 0) return galleryImages;
    try {
      const response = await axios.get(backendUrl + "/api/gallery/list");
      if (!response.data.success) throw new Error(response.data.message || "Unable to load gallery.");
      setGalleryImages(response.data.images);
      return response.data.images;
    } catch (error) {
      throw error;
    }
  }, [galleryImages]);

  const getUserCart = useCallback(async (tokenParam) => {
    try {
      const authToken = tokenParam || localStorage.getItem("token");
      const repsonse = await axios.post( 
        backendUrl + '/api/cart/get',
        {},
        { headers: { Authorization: 'Bearer ' + authToken } }
      );
      if (repsonse.data.success) {
        setCartItems(repsonse.data.cartData);
        localStorage.setItem("cartItems", JSON.stringify(repsonse.data.cartData));
      } else {
        toast.error(repsonse.data.message || "Unable to load cart.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, []);

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
  }, [getUserCart]);

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
    productsLoading,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    addMultipleToCart,
    addPosterBatch,
    addPosterBatches,
    removePosterBatch,
    addGalleryToCart,
    updateGalleryItem,
    setCartItems,
    getCartCount,
    updateQuantity,
    updatePosterQuantity,
    getCartAmount,
    token,
    setToken,
    formatPrice,
    galleryImages,
    getGalleryData,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider
