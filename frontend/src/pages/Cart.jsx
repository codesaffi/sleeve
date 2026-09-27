import { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { cloudinaryImageUrl } from "../utils/imageUrl";
import { getPosterMinimum, getPosterPrice, getPosterQuantityFromKey, isPosterProduct } from "../utils/posterPricing";

const Cart = () => {
  const { products, productsLoading, currency, cartItems, updateQuantity, updatePosterQuantity, updateGalleryItem, removePosterBatch, formatPrice, galleryImages, getGalleryData } = useContext(ShopContext);
  const [posterQuantityDrafts, setPosterQuantityDrafts] = useState({});
  const [missingProduct, setMissingProduct] = useState(false);
  const navigate = useNavigate();

  const cartData = useMemo(() => {
    const items = [];
    for (const productId in cartItems) {
      if (productId === "__galleryItems") continue;
      for (const size in cartItems[productId]) {
        if (cartItems[productId][size] > 0) {
          items.push({
            _id: productId,
            size,
            quantity: cartItems[productId][size],
            posterQuantity: getPosterQuantityFromKey(size),
          });
        }
      }
    }
    return items;
  }, [cartItems]);

  const galleryDesignIds = (cartItems.__galleryItems || []).map((item) => item.galleryDesignId).join(",");
  const batchGalleryIds = (cartItems.__posterBatches || []).flatMap((batch) => batch.designs || [])
    .filter((design) => design.type === "gallery")
    .map((design) => design.galleryDesignId)
    .join(",");
  const galleryIdsToLoad = [galleryDesignIds, batchGalleryIds].filter(Boolean).join(",");
  useEffect(() => {
    if (!galleryIdsToLoad || galleryImages.length > 0) return;
    getGalleryData().catch((error) => {
      toast.error(error.response?.data?.message || error.message);
    });
  }, [galleryIdsToLoad, galleryImages.length, getGalleryData]);

  const posterBatches = cartItems.__posterBatches || [];
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

      {productsLoading ? (
        <div className="py-20 text-center text-secondary" role="status">Loading cart…</div>
      ) : cartData.length === 0 && galleryItems.length === 0 && posterBatches.length === 0 ? (
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
                  {posterBatches.map((batch) => {
                    const product = products.find((entry) => entry._id === batch.productId);
                    if (!product) return null;
                    const designs = batch.designs || [];
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={`poster-batch-${batch.batchId}`}
                        className="cart-print-row grid grid-cols-[1fr_auto] items-center gap-4 p-4 sm:grid-cols-[4fr_1fr_1fr] sm:gap-6 sm:p-6"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden border border-primary bg-white p-1 sm:h-24 sm:w-24">
                            <img className="h-full w-full object-cover" loading="lazy" decoding="async" src={cloudinaryImageUrl(product.image?.[0], 240)} alt={product.name} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif text-sm font-bold text-primary sm:text-base">{product.name}</p>
                            <p className="mt-1 text-xs font-medium text-primary">{batch.posterQuantity} PCS · {designs.length} Designs</p>
                            <p className="mt-1 text-xs text-secondary">{currency} {formatPrice(getPosterPrice(product, batch.posterQuantity) ?? product.price)}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`${designs.length} attached designs`}>
                              {designs.slice(0, 4).map((design, index) => {
                                const galleryDesign = design.type === "gallery" ? getGallery(design.galleryDesignId) : null;
                                const src = galleryDesign?.image || design.imageUrl;
                                return src ? (
                                  <img
                                    key={`${design.type}-${design.galleryDesignId || index}`}
                                    src={cloudinaryImageUrl(src, 96)}
                                    alt={`Design ${index + 1}`}
                                    title={design.title || `Design ${index + 1}`}
                                    className="h-10 w-10 border border-border object-cover"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : null;
                              })}
                              {designs.length > 4 && <span className="flex h-10 items-center border border-border px-2 text-[10px] text-secondary">+{designs.length - 4}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-center text-xs font-medium text-primary">
                          {batch.posterQuantity} PCS
                        </div>
                        <div className="col-start-2 row-start-2 flex justify-end sm:col-start-auto sm:row-start-auto">
                          <button
                            type="button"
                            onClick={() => removePosterBatch(batch.batchId)}
                            className="flex items-center gap-2 p-2 text-secondary transition-colors hover:text-accent"
                            aria-label={`Remove ${product.name} batch`}
                          >
                            <Trash2 size={18} strokeWidth={1.5} />
                            <span className="text-sm font-medium sm:hidden">Remove batch</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
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
                          <img className="w-full h-full object-cover" loading="lazy" decoding="async" src={cloudinaryImageUrl(gallery?.image, 240)} alt={gallery?.title || "Gallery design"} />
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
                                onClick={() => updateGalleryItem(item.galleryDesignId, product._id, isPosterProduct(product) ? getPosterMinimum(product) : item.quantity)}
                                className={`border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${selectedProduct?._id === product._id ? "bg-primary text-background border-primary" : "border-border text-primary hover:border-primary"} ${product.comingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {product.name}{product.comingSoon ? " — COMING SOON" : ""}
                              </button>
                            ))}
                          </div>
                          {selectedProduct && <p className="text-xs text-primary mt-2 font-medium">Selected: {selectedProduct.name} · {currency} {formatPrice(isPosterProduct(selectedProduct) ? (getPosterPrice(selectedProduct, Number(posterQuantityDrafts[`gallery-${item.galleryDesignId}`] ?? item.quantity)) ?? selectedProduct.price) : selectedProduct.price)}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            onChange={(event) => setPosterQuantityDrafts((drafts) => ({ ...drafts, [`gallery-${item.galleryDesignId}`]: event.target.value }))}
                            onBlur={(event) => {
                              const quantity = Number(event.target.value);
                              if (!event.target.value || !Number.isInteger(quantity)) {
                                setPosterQuantityDrafts((drafts) => ({ ...drafts, [`gallery-${item.galleryDesignId}`]: String(item.quantity) }));
                                return;
                              }
                              updateGalleryItem(item.galleryDesignId, item.productId, quantity);
                              setPosterQuantityDrafts((drafts) => {
                                const next = { ...drafts };
                                delete next[`gallery-${item.galleryDesignId}`];
                                return next;
                              });
                            }}
                            className="w-20 h-10 min-w-0 text-center border border-border bg-background outline-none text-sm"
                            type="number"
                            min={selectedProduct && isPosterProduct(selectedProduct) ? getPosterMinimum(selectedProduct) : 1}
                            value={posterQuantityDrafts[`gallery-${item.galleryDesignId}`] ?? item.quantity}
                            aria-label={selectedProduct && isPosterProduct(selectedProduct) ? "Poster quantity" : "Item quantity"}
                          />
                          {selectedProduct && isPosterProduct(selectedProduct) && <span className="text-xs font-medium text-primary">PCS</span>}
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
                    const activePosterQuantity = item.posterQuantity === null
                      ? null
                      : Number(posterQuantityDrafts[`${item._id}-${item.size}`] ?? item.posterQuantity);

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
                            <img className="w-full h-full object-cover" loading="lazy" decoding="async" src={cloudinaryImageUrl(productData.image[0], 240)} alt={productData.name} />
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-sm sm:text-base font-serif font-bold text-primary mb-1 line-clamp-2">
                              {productData.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="font-medium text-primary text-sm">
                                {currency} {formatPrice(activePosterQuantity === null ? productData.price : (getPosterPrice(productData, activePosterQuantity) ?? productData.price))}
                              </p>
                              {item.size && (
                                <div className="flex flex-col gap-1 items-start mt-1">
                                  {item.posterQuantity !== null && (
                                    <span className="px-2 py-0.5 text-[10px] bg-background border border-border text-secondary font-mono uppercase tracking-widest">
                                      Poster Quantity: {activePosterQuantity} PCS
                                    </span>
                                  )}
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
                            onChange={(event) => {
                              if (item.posterQuantity !== null) {
                                setPosterQuantityDrafts((drafts) => ({ ...drafts, [`${item._id}-${item.size}`]: event.target.value }));
                                return;
                              }
                              const quantity = Number(event.target.value);
                              if (event.target.value && Number.isInteger(quantity) && quantity > 0) updateQuantity(item._id, item.size, quantity);
                            }}
                            onBlur={(event) => {
                              if (item.posterQuantity === null) return;
                              const quantity = Number(event.target.value);
                              if (!event.target.value || !Number.isInteger(quantity)) return;
                              updatePosterQuantity(item._id, item.size, quantity);
                              setPosterQuantityDrafts((drafts) => {
                                const next = { ...drafts };
                                delete next[`${item._id}-${item.size}`];
                                return next;
                              });
                            }}
                            className="w-20 h-10 min-w-0 text-center border border-border bg-background outline-none focus:border-primary focus:ring-0 transition-all text-sm font-medium rounded-none"
                            type="number"
                            min={item.posterQuantity === null ? 1 : getPosterMinimum(productData)}
                            value={posterQuantityDrafts[`${item._id}-${item.size}`] ?? item.posterQuantity ?? item.quantity}
                            aria-label={item.posterQuantity === null ? "Item quantity" : "Poster quantity"}
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
