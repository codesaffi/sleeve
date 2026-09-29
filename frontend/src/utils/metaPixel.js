const pixelId = import.meta.env.VITE_META_PIXEL_ID?.trim();
const purchaseStoragePrefix = "meta-pixel-purchase:";
let initialized = false;
let lastPageView = null;

export const initializeMetaPixel = () => {
  if (initialized || !pixelId || typeof window === "undefined") return;

  try {
    if (typeof window.fbq !== "function") {
      const fbq = (...args) => {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;
      window._fbq = fbq;

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.onerror = () => console.warn("Meta Pixel script failed to load.");
      document.head.appendChild(script);
    }

    window.fbq("init", pixelId);
    initialized = true;
  } catch (error) {
    console.warn("Meta Pixel initialization failed.", error);
  }
};

const track = (eventName, parameters) => {
  initializeMetaPixel();
  if (!pixelId || typeof window === "undefined" || typeof window.fbq !== "function") return false;

  try {
    window.fbq("track", eventName, parameters);
    return true;
  } catch (error) {
    console.warn(`Meta Pixel ${eventName} tracking failed.`, error);
    return false;
  }
};

export const trackPageView = (location) => {
  if (!location || location === lastPageView) return;
  if (track("PageView")) lastPageView = location;
};

export const trackViewContent = ({ id, name, category, value }) => {
  if (!id) return;
  track("ViewContent", {
    content_ids: [id],
    content_name: name,
    content_type: "product",
    content_category: category,
    value,
    currency: "PKR",
  });
};

export const trackAddToCart = (items) => {
  const validItems = items.filter((item) => item.id);
  if (validItems.length === 0) return;

  const value = validItems.reduce((total, item) => total + item.value, 0);
  const parameters = {
    content_ids: validItems.map((item) => item.id),
    contents: validItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.quantity > 0 ? item.value / item.quantity : item.value,
    })),
    content_type: "product",
    value,
    currency: "PKR",
  };
  if (validItems.length === 1) {
    parameters.content_name = validItems[0].name;
    parameters.content_category = validItems[0].category;
  }
  track("AddToCart", parameters);
};

export const getCartProductIds = (cartItems = {}) => {
  const productIds = new Set();
  for (const [productId, items] of Object.entries(cartItems)) {
    if (productId === "__galleryItems" || productId === "__posterBatches") continue;
    if (items && Object.values(items).some((quantity) => quantity > 0)) productIds.add(productId);
  }
  for (const item of cartItems.__galleryItems || []) {
    if (item.productId && item.quantity > 0) productIds.add(item.productId);
  }
  for (const batch of cartItems.__posterBatches || []) {
    if (batch.productId) productIds.add(batch.productId);
  }
  return [...productIds];
};

export const trackInitiateCheckout = ({ contentIds, numItems, value }) => {
  if (numItems <= 0) return;
  track("InitiateCheckout", {
    content_ids: contentIds,
    content_type: "product",
    num_items: numItems,
    value,
    currency: "PKR",
  });
};

export const trackPurchase = ({ orderId, fallbackId, contentIds, numItems, value }) => {
  if (!pixelId || typeof window === "undefined") return;
  const deduplicationId = orderId || fallbackId;
  if (!deduplicationId) {
    console.error("Meta Pixel Purchase was not tracked because no order identifier was available.");
    return;
  }

  const storageKey = `${purchaseStoragePrefix}${deduplicationId}`;
  try {
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
  } catch (error) {
    console.warn("Meta Pixel Purchase deduplication storage is unavailable.", error);
  }

  track("Purchase", {
    content_ids: contentIds,
    content_type: "product",
    num_items: numItems,
    value,
    currency: "PKR",
  });
};

export const trackSearch = (searchString) => {
  if (!searchString) return;
  track("Search", { search_string: searchString });
};
