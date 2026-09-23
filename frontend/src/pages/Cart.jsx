import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, formatPrice } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
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

  return (
    <div className="pt-10 px-4 md:px-0 min-h-[70vh]">
      <div className="text-2xl mb-8">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-secondary bg-background vintage-border shadow-vintage">
          <ShoppingBag size={64} className="mb-4 opacity-20" strokeWidth={1} />
          <h2 className="text-2xl font-serif text-primary mb-2">Your collection is empty</h2>
          <p className="mb-8 text-sm font-sans">Looks like you haven't added any artwork yet.</p>
          <button 
            onClick={() => navigate('/collection')}
            className="bg-primary hover:bg-black text-background px-8 py-4 font-medium transition-colors"
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
                  {cartData.map((item, index) => {
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
                        className="p-4 sm:p-6 grid grid-cols-[1fr_auto] sm:grid-cols-[4fr_1fr_1fr] items-center gap-4 sm:gap-6 hover:bg-black/5 transition-colors"
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
                                <span className="px-2 py-0.5 text-xs bg-background border border-border text-secondary">
                                  {item.size}
                                </span>
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
              onClick={() => handleNavigation("/place-order")}
              className="w-full bg-primary hover:bg-black text-background font-medium tracking-wide text-sm py-4 px-8 transition-all mt-6 active:scale-[0.98]"
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
