import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, updateGalleryItem, formatPrice } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [missingProduct, setMissingProduct] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        if (items === "__galleryItems") continue;
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  useEffect(() => {
    if ((cartItems.__galleryItems || []).length === 0) return;
    axios.get(backendUrl + "/api/gallery/list")
      .then((response) => {
        if (response.data.success) setGalleryImages(response.data.images);
      })
      .catch((error) => toast.error(error.response?.data?.message || error.message));
  }, [cartItems.__galleryItems]);

  const galleryItems = cartItems.__galleryItems || [];
  const getGallery = (id) => galleryImages.find((image) => image._id === id);
  const proceedToCheckout = () => {
    if (galleryItems.some((item) => !item.productId)) {
      setMissingProduct(true);
      toast.error("Please select a product for all your selected designs before continuing.");
      return;
    }
    navigate("/place-order");
  };

  return (
    <div className="pt-10 px-4 md:px-0 min-h-[70vh]">
      <div className="text-2xl mb-8">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartData.length === 0 && galleryItems.length === 0 ? (
        <div className="empty-archive flex flex-col items-center justify-center py-24 text-secondary bg-background vintage-border shadow-vintage">
          <ShoppingBag size={64} className="mb-4 opacity-20" strokeWidth={1} />
          <h2 className="text-2xl font-serif text-primary mb-2">Your collection is empty</h2>
          <p className="mb-8 text-sm font-sans">Looks like you haven't added any artwork yet.</p>
          <button 
            onClick={() => navigate('/collection')}
            className="archive-button bg-primary hover:bg-black text-background px-8 py-4 font-medium transition-colors"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="flex-1">
            <div className="bg-background vintage-border shadow-vintage overflow-hidden">
              <div className="hidden sm:grid grid-cols-[4fr_1fr_1fr] bg-background py-4 px-6 border-b border-border text-xs font-semibold text-primary uppercase tracking-[0.15em]">
                <p>Print</p>
                <p className="text-center">Qty</p>
                <p className="text-right">Action</p>
              </div>

              <div className="divide-y divide-border">
                <AnimatePresence>
                  {galleryItems.map((item) => {
                    const gallery = getGallery(item.galleryDesignId);
                    const selectedProduct = products.find((product) => product._id === item.productId);
                    return (
                      <motion.div
                        layout
                        key={`gallery-${item.galleryDesignId}`}
                        className={`cart-print-row p-4 sm:p-6 flex flex-col md:flex-row items-start gap-5 hover:bg-black/5 transition-colors ${missingProduct && !item.productId ? "bg-red-50 border-l-4 border-red-500" : ""}`}
                      >
                        <div className="w-24 h-24 overflow-hidden bg-white shrink-0 vintage-border p-1">
                          <img className="w-full h-full object-cover" src={gallery?.image} alt={gallery?.title || "Gallery design"} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-serif font-bold text-primary">{gallery?.title || "Selected Gallery Design"}</p>
                          <p className="text-xs text-secondary mt-1">Which product would you like this design printed on?</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {products.map((product) => (
                              <button
                                key={product._id}
                                type="button"
                                disabled={product.comingSoon}
                                onClick={() => updateGalleryItem(item.galleryDesignId, product._id, item.quantity)}
                                className={`border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${selectedProduct?._id === product._id ? "bg-primary text-background border-primary" : "border-border text-primary hover:border-primary"} ${product.comingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {product.name}{product.comingSoon ? " — COMING SOON" : ""}
                              </button>
                            ))}
                          </div>
                          {selectedProduct && <p className="text-xs text-primary mt-2 font-medium">Selected: {selectedProduct.name} · {currency} {formatPrice(selectedProduct.price)}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            onChange={(event) => updateGalleryItem(item.galleryDesignId, item.productId, Math.max(1, Number(event.target.value) || 1))}
                            className="w-16 h-10 text-center border border-border bg-background outline-none text-sm"
                            type="number"
                            min={1}
                            value={item.quantity}
                          />
                          <button onClick={() => updateGalleryItem(item.galleryDesignId, item.productId, 0)} className="p-2 text-secondary hover:text-accent" title="Remove item">
                            <Trash2 size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {cartData.map((item) => {
                    const productData = products.find((product) => product._id === item._id);
                    if (!productData) return null;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={`${item._id}-${item.size}`}
                        className="cart-print-row p-4 sm:p-6 grid grid-cols-[1fr_auto] sm:grid-cols-[4fr_1fr_1fr] items-center gap-4 sm:gap-6 hover:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden bg-white shrink-0 vintage-border p-1">
                            <img className="w-full h-full object-cover" src={productData.image[0]} alt={productData.name} />
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-sm sm:text-base font-serif font-bold text-primary mb-1 line-clamp-2">
                              {productData.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="font-medium text-primary text-sm">
                                {currency} {formatPrice(productData.price)}
                              </p>
                              {item.size && (
                                <div className="flex flex-col gap-1 items-start mt-1">
                                  {item.size.split('|')[0] !== "Default" && (
                                      <span className="px-2 py-0.5 text-[10px] bg-background border border-border text-secondary font-mono uppercase tracking-widest">
                                        Frame: {item.size.split('|')[0]}
                                      </span>
                                  )}
                                  {item.size.split('|').length > 1 && (
                                      <span className="px-2 py-0.5 text-[10px] bg-black/5 border border-primary/20 text-primary font-mono uppercase tracking-widest">
                                        Design: {item.size.split('|')[1].split('::')[0] === 'gallery' ? 'Gallery Archive' : 'Customer Upload'}
                                      </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-start sm:justify-center">
                          <input
                            onChange={(e) =>
                              e.target.value === "" || e.target.value === "0"
                                ? null
                                : updateQuantity(item._id, item.size, Number(e.target.value))
                            }
                            className="w-16 h-10 text-center border border-border bg-background outline-none focus:border-primary focus:ring-0 transition-all text-sm font-medium rounded-none"
                            type="number"
                            min={1}
                            value={item.quantity}
                          />
                        </div>

                        <div className="flex justify-end sm:col-start-auto col-start-2 row-start-2 sm:row-start-auto">
                          <button
                            onClick={() => updateQuantity(item._id, item.size, 0)}
                            className="p-2 text-secondary hover:text-accent transition-colors flex items-center justify-center gap-2"
                            title="Remove item"
                          >
                            <Trash2 size={18} strokeWidth={1.5} />
                            <span className="sm:hidden text-sm font-medium">Remove</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="w-full lg:w-[380px] shrink-0">
            <CartTotal />
            <button
              onClick={proceedToCheckout}
              className="archive-button w-full bg-primary hover:bg-black text-background font-medium tracking-wide text-sm py-4 px-8 transition-all mt-6 active:scale-[0.98]"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
