import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { backendUrl } from "../App";
import RelatedProducts from "../components/RelatedProducts";
import Description from "../components/Description";
import Reviews from "../components/Reviews";
import SizeChart from "../components/SizeChart";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Truck, RefreshCcw, ShoppingCart, X } from "lucide-react";
import axios from "axios";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart, addMultipleToCart, formatPrice } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [showDescription, setShowDescription] = useState("description");

  // Customization states
  const [customImages, setCustomImages] = useState([]);
  const [gallerySelections, setGallerySelections] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Gallery modal states
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImagesList, setGalleryImagesList] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Check URL params for pre-selected gallery design
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get("galleryId");
    const gurl = params.get("galleryUrl");
    if (gid && gurl) {
        setGallerySelections([{ id: gid, url: gurl }]);
    }
  }, []);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  const fetchGallery = async () => {
    if (galleryImagesList.length > 0) return;
    setGalleryLoading(true);
    try {
        const response = await axios.get(backendUrl + "/api/gallery/list");
        if (response.data.success) {
            setGalleryImagesList(response.data.images);
        }
    } catch (error) {
        console.error("Error fetching gallery:", error);
    } finally {
        setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const handleOrder = async (redirect = false) => {
    let customVals = [];
    if (productData.category === "Wall Posters") {
        if (customImages.length === 0 && gallerySelections.length === 0) {
            alert("Please upload at least one image or select from the gallery.");
            return;
        }
        if (productData.sizes && productData.sizes.length > 0 && !size) {
            alert("Please select a frame size.");
            return;
        }

        setUploadingImage(true);
        
        try {
            if (customImages.length > 0) {
                const uploadPromises = customImages.map(async (img) => {
                    const formData = new FormData();
                    formData.append("image", img);
                    const res = await fetch(`${backendUrl}/api/upload/custom`, {
                        method: "POST",
                        body: formData
                    }).then(r => r.json());
                    if (res.success) {
                        return `custom::${res.imageUrl}`;
                    } else {
                        throw new Error("Image upload failed");
                    }
                });
                const uploadedVals = await Promise.all(uploadPromises);
                customVals.push(...uploadedVals);
            }
            
            if (gallerySelections.length > 0) {
                gallerySelections.forEach(sel => {
                    customVals.push(`gallery::${sel.id}::${sel.url}`);
                });
            }
        } catch (e) {
            alert("Upload error");
            setUploadingImage(false);
            return;
        }
        
        setUploadingImage(false);
    } else {
        if (productData.sizes && productData.sizes.length > 0 && !size) {
            alert("Please select a size.");
            return;
        }
    }
    
    if (productData.category === "Wall Posters") {
        await addMultipleToCart(
            productData._id,
            productData.sizes && productData.sizes.length > 0 ? size : undefined,
            customVals
        );
    } else {
        await addToCart(
            productData._id,
            productData.sizes && productData.sizes.length > 0 ? size : undefined,
            null
        );
    }

    if (redirect) {
        navigate('/cart');
    }
  };

  return productData ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-10"
    >
      <div className="flex gap-12 flex-col lg:flex-row bg-background p-6 md:p-10 border-b border-border mb-12">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-4">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto justify-start gap-3 sm:w-[120px] w-full hide-scrollbar">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className={`w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] object-cover flex-shrink-0 cursor-pointer border transition-all ${image === item ? 'border-primary p-0.5' : 'border-transparent hover:border-border'}`}
                alt="thumbnail"
              />
            ))}
          </div>
          <div className="w-full flex-1 vintage-border bg-white p-4 flex items-center justify-center relative group shadow-vintage overflow-hidden">
            <img className="w-full h-auto max-h-[600px] object-contain group-hover:scale-105 transition-transform duration-700" src={image} alt="product" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <div className="mb-2">
            <span className="inline-block border border-primary px-3 py-1 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              {productData.category}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-primary leading-[1.1] tracking-tight">{productData.name}</h1>
          </div>
          
          <div className="flex items-center gap-2 mt-4 pb-6 border-b border-border">
            <div className="flex text-primary">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" strokeWidth={1} />)}
            </div>
            <p className="text-xs text-secondary font-medium ml-2 tracking-wide uppercase">Archived Collection</p>
          </div>
          
          {productData.comingSoon ? (
              <p className="mt-8 text-2xl font-bold text-primary tracking-widest uppercase">COMING SOON</p>
          ) : (
              <p className="mt-8 text-3xl font-medium text-primary">
                {currency} {formatPrice(productData.price)}
              </p>
          )}
          
          <p className="mt-6 text-secondary text-base leading-relaxed font-sans max-w-lg">
            {productData.description}
          </p>
          
          <div className="flex flex-col gap-4 my-8">
            {!productData.comingSoon && productData.sizes && productData.sizes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-primary mb-3 uppercase tracking-[0.1em]">Select Frame Size</p>
                  <div className="flex flex-wrap gap-2">
                    {productData.sizes.map((item, index) => (
                      <button
                        onClick={() => setSize(item)}
                        className={`border px-6 py-2 text-sm font-medium transition-all rounded-none ${
                          item === size ? "border-primary bg-primary text-background" : "border-border text-primary hover:border-primary"
                        }`}
                        key={index}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
          
          {/* Customization Options */}
          {!productData.comingSoon && productData.category === "Wall Posters" && (
            <div className="mb-8 p-6 bg-[#FAF9F6] border-2 border-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4 border-b-2 border-primary/40 pb-2">Poster Design Source</h3>
                
                {/* Premium can upload */}
                {productData.subCategory === "Premium" && (
                    <div className="mb-4">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Upload Your Images (Multiple Allowed)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                setCustomImages([...customImages, ...Array.from(e.target.files)]);
                            }}
                            className="block w-full text-sm text-primary file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-black cursor-pointer border border-primary p-1 bg-white"
                        />
                        {customImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {customImages.map((img, idx) => (
                                    <div key={idx} className="relative border border-primary p-1 bg-white flex items-center pr-6">
                                        <p className="text-xs truncate w-20 px-1">{img.name}</p>
                                        <button onClick={() => setCustomImages(customImages.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Premium & Standard can choose from gallery */}
                <div className="mt-4">
                    <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">
                        Choose From Gallery (Multiple Allowed)
                    </label>
                    <button 
                        onClick={() => {
                            fetchGallery();
                            setShowGalleryModal(!showGalleryModal);
                        }}
                        className="w-full border-2 border-dashed border-primary/50 text-primary hover:border-primary hover:bg-black/5 p-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 bg-white mb-2"
                    >
                        {showGalleryModal ? "Close Gallery" : "Browse Gallery Inspirations"}
                    </button>
                    
                    {showGalleryModal && (
                        <div className="border border-primary p-4 bg-white mb-4 max-h-64 overflow-y-auto">
                            {galleryLoading ? <p className="text-xs text-primary font-bold">Loading gallery...</p> : (
                                <div className="grid grid-cols-3 gap-2">
                                    {galleryImagesList.map(gImg => {
                                        const isSelected = gallerySelections.find(s => s.id === gImg._id);
                                        return (
                                            <div 
                                                key={gImg._id} 
                                                className={`cursor-pointer border-2 transition-all ${isSelected ? 'border-primary opacity-50 scale-95' : 'border-transparent hover:border-primary/50'}`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setGallerySelections(gallerySelections.filter(s => s.id !== gImg._id));
                                                    } else {
                                                        setGallerySelections([...gallerySelections, { id: gImg._id, url: gImg.image }]);
                                                    }
                                                }}
                                            >
                                                <img src={gImg.image} alt={gImg.title} className="w-full h-24 object-cover" />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {gallerySelections.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {gallerySelections.map((sel, idx) => (
                                <div key={idx} className="relative border border-primary p-1 bg-white flex items-center pr-2">
                                    <img src={sel.url} alt="selected" className="w-10 h-10 object-cover border border-primary/20" />
                                    <button onClick={() => setGallerySelections(gallerySelections.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          )}

          <div className="flex gap-4 flex-col sm:flex-row w-full mt-4">
            {productData.comingSoon ? (
                <div className="bg-primary text-background px-8 py-4 font-bold transition-all flex items-center justify-center gap-2 shadow-vintage w-full tracking-[0.2em] uppercase cursor-not-allowed">
                  COMING SOON
                </div>
            ) : (
              <>
                <button
                  onClick={() => handleOrder(false)}
                  disabled={uploadingImage}
                  className="bg-transparent border border-primary text-primary hover:bg-black/5 px-8 py-4 font-medium transition-all flex items-center justify-center gap-2 active:scale-[0.98] w-full sm:flex-1 tracking-wide"
                >
                  <ShoppingCart size={18} strokeWidth={1.5} />
                  {uploadingImage ? "Uploading..." : "Add to Collection"}
                </button>
                <button
                  onClick={() => handleOrder(true)}
                  disabled={uploadingImage}
                  className="bg-primary hover:bg-black text-background px-8 py-4 font-medium transition-all flex items-center justify-center gap-2 shadow-vintage active:scale-[0.98] w-full sm:flex-1 tracking-wide disabled:opacity-70"
                >
                  {uploadingImage ? "Processing..." : "Order Print"}
                </button>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
            <div className="flex flex-col items-center text-center gap-2 text-primary">
              <ShieldCheck size={20} strokeWidth={1.5} />
              <p className="text-xs font-medium tracking-wide uppercase">Original Quality</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 text-primary">
              <Truck size={20} strokeWidth={1.5} />
              <p className="text-xs font-medium tracking-wide uppercase">Secure Shipping</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2 text-primary">
              <RefreshCcw size={20} strokeWidth={1.5} />
              <p className="text-xs font-medium tracking-wide uppercase">14-Day Returns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-background border-b border-border">
        <div className="flex border-b border-border mb-8 max-w-lg mx-auto justify-center">
          <button
            onClick={() => setShowDescription("description")}
            className={`px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-colors relative ${
              showDescription === "description" ? "text-primary" : "text-secondary hover:text-primary"
            }`}
          >
            Artist Notes
            {showDescription === "description" && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-[1px] bg-primary" />
            )}
          </button>

          <button
            onClick={() => setShowDescription("size chart")}
            className={`px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-colors relative ${
              showDescription === "size chart" ? "text-primary" : "text-secondary hover:text-primary"
            }`}
          >
            Frame Specs
            {showDescription === "size chart" && (
              <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-[1px] bg-primary" />
            )}
          </button>
        </div>

        <div className="text-secondary leading-relaxed max-w-4xl mx-auto px-4 pb-16 text-center">
          {showDescription === "description" && <Description productData={productData} />}
          {showDescription === "size chart" && <SizeChart productData={productData} />}
        </div>
      </div>

      <div className="mt-16 bg-background max-w-5xl mx-auto">
        <Reviews productId={productId} />
      </div>

      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </motion.div>
  ) : (
    <div className="min-h-screen"></div>
  );
};

export default Product;
