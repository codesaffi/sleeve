import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Upload, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductImagePicker = ({ images, setImages }) => {
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  return (
    <section className="bg-white border border-primary p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/40 pb-3">
        <div>
          <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Product Images</p>
          <p className="mt-1 text-xs text-primary/70">Select up to 4 images. You can add more in another selection.</p>
        </div>
        <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 border border-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors ${images.length === 4 ? "cursor-not-allowed opacity-50" : "hover:bg-primary hover:text-white"}`}>
          <Upload size={16} />
          Choose Images
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={images.length === 4}
            onChange={(event) => {
              const selectedFiles = Array.from(event.target.files || []);
              event.target.value = "";
              if (selectedFiles.length === 0) return;
              if (images.length + selectedFiles.length > 4) {
                toast.error("You can upload a maximum of 4 product images.");
                return;
              }
              if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
                toast.error("Please select image files only.");
                return;
              }
              setImages((currentImages) => [...currentImages, ...selectedFiles]);
            }}
            className="sr-only"
          />
        </label>
      </div>
      <p className="mt-3 text-xs font-mono text-primary" aria-live="polite">Selected: {images.length} / 4</p>
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image.name}-${image.lastModified}-${index}`} className="relative aspect-square min-w-0 overflow-hidden border-2 border-primary shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
              <img className="h-full w-full object-cover grayscale-[0.2] contrast-125 sepia-[0.1]" src={previewUrls[index]} alt={`Product image ${index + 1} preview`} />
              <button
                type="button"
                onClick={() => setImages((currentImages) => currentImages.filter((_, imageIndex) => imageIndex !== index))}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center border border-primary bg-[#FAF9F6] text-primary hover:bg-primary hover:text-white"
                aria-label={`Remove product image ${index + 1}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const Add = ({token}) => {
  const [images, setImages] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [minimumPosterQuantity, setMinimumPosterQuantity] = useState("4");
  const [basePosterQuantity, setBasePosterQuantity] = useState("4");
  const [basePosterPrice, setBasePosterPrice] = useState("");
  const [singlePosterPrice, setSinglePosterPrice] = useState("");
  const [category, setCategory] = useState("Wall Posters");
  const [subCategory, setSubCategory] = useState("Premium");
  const [bestseller, setBestseller] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState("");

  // Dynamic specifications: array of { name, value } rows
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);

  // ── Specification helpers ──────────────────────────────────────
  const addSpecRow = () => {
    setSpecifications((prev) => [...prev, { name: '', value: '' }]);
  };

  const removeSpecRow = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecRow = (index, field, value) => {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
  };

  // ── Form submit ───────────────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (category === "Wall Posters") {
      const minimum = Number(minimumPosterQuantity);
      if (!Number.isInteger(minimum) || minimum < 1) {
        toast.error("Minimum poster quantity must be a positive whole number.");
        return;
      }
      if (Number(basePosterQuantity) !== minimum) {
        toast.error("Base quantity must match the minimum poster quantity.");
        return;
      }
      if ([basePosterPrice, singlePosterPrice].some((value) => !Number.isFinite(Number(value)) || Number(value) <= 0)) {
        toast.error("Base price and single poster price must be positive numbers.");
        return;
      }
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("minimumPosterQuantity", minimumPosterQuantity);
      formData.append("basePosterQuantity", basePosterQuantity);
      formData.append("basePosterPrice", basePosterPrice);
      formData.append("singlePosterPrice", singlePosterPrice);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("stock", stock);
      formData.append("comingSoon", comingSoon);

      // Filter empty spec rows before sending
      const filledSpecs = specifications.filter(
        (s) => s.name.trim() || s.value.trim()
      );
      formData.append("specifications", JSON.stringify(filledSpecs));

      images.forEach((image) => formData.append("images", image));

      const response = await axios.post(backendUrl + "/api/product/add", formData, {headers: {token}});

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImages([]);
        setPrice('');
        setMinimumPosterQuantity("4");
        setBasePosterQuantity("4");
        setBasePosterPrice("");
        setSinglePosterPrice("");
        setSizes([]);
        setStock("");
        setSpecifications([{ name: '', value: '' }]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl bg-[#FAF9F6] p-4 sm:p-8 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] font-sans relative"
    >
      <div className="absolute top-4 right-4 text-[10px] font-mono tracking-widest text-primary uppercase border border-primary px-2 py-1 bg-white">FORM 01-A</div>
      <h2 className="text-3xl font-serif font-bold text-primary mb-6 sm:mb-8 tracking-tighter uppercase border-b-2 border-primary pb-2">Catalog Entry <span className="italic">Form</span></h2>
      
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-8">
        {!comingSoon && (
          <ProductImagePicker images={images} setImages={setImages} />
        )}

        {/* Poster pricing */}
        {!comingSoon && category === "Wall Posters" && (
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <label className="min-w-0 text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
              Minimum Poster Quantity
              <input value={minimumPosterQuantity} onChange={(e) => setMinimumPosterQuantity(e.target.value)} type="number" min="1" step="1" required className="mt-2 w-full bg-transparent border-b-2 border-primary px-3 py-2 text-sm normal-case tracking-normal" />
            </label>
            <label className="min-w-0 text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
              Base Quantity (must match minimum)
              <input value={basePosterQuantity} onChange={(e) => setBasePosterQuantity(e.target.value)} type="number" min="1" step="1" required className="mt-2 w-full bg-transparent border-b-2 border-primary px-3 py-2 text-sm normal-case tracking-normal" />
            </label>
            <label className="min-w-0 text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
              Base Price (PKR, for base quantity)
              <input value={basePosterPrice} onChange={(e) => setBasePosterPrice(e.target.value)} type="number" min="0.01" step="0.01" required placeholder="1000" className="mt-2 w-full bg-transparent border-b-2 border-primary px-3 py-2 text-sm normal-case tracking-normal" />
            </label>
            <label className="min-w-0 text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
              Single Additional Poster Price (PKR)
              <input value={singlePosterPrice} onChange={(e) => setSinglePosterPrice(e.target.value)} type="number" min="0.01" step="0.01" required placeholder="250" className="mt-2 w-full bg-transparent border-b-2 border-primary px-3 py-2 text-sm normal-case tracking-normal" />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-primary p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          {/* Product Name */}
          <div className="md:col-span-2">
            <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Entry Title</p>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary font-serif text-lg placeholder:text-primary/30" 
              type="text" 
              placeholder="e.g. Abbey Road - The Beatles" 
              required
            />
          </div>

          {/* Product Description */}
          <div className="md:col-span-2 mt-4">
            <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Archival Description</p>
            <textarea 
              onChange={(e) => setDescription(e.target.value)} 
              value={description} 
              className="w-full h-32 bg-transparent border-2 border-primary p-3 outline-none focus:border-black focus:ring-0 transition-all text-primary resize-none font-sans text-sm" 
              placeholder="Detailed description of features, benefits, and use cases..." 
              required
            />
          </div>

          {/* Category */}
          <div className="mt-4">
            <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Primary Classification</p>
            <select 
              onChange={(e) => {
                  setCategory(e.target.value);
                  if(e.target.value === "Wall Posters") setSubCategory("Premium");
                  if(e.target.value === "Wall Frames") {
                      setComingSoon(true);
                      setSubCategory("Default");
                  } else {
                      setComingSoon(false);
                  }
              }} 
              value={category}
              className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary cursor-pointer font-sans text-sm uppercase"
            >
              <option value="Wall Posters">Wall Posters</option>
              <option value="Wall Frames">Wall Frames</option>
              <option value="Archives">Archives</option>
              <option value="Misc">Misc</option>
            </select>
          </div>

          {/* SubCategory */}
          {category === "Wall Posters" && (
              <div className="mt-4">
                <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Secondary Classification</p>
                <select 
                  onChange={(e) => setSubCategory(e.target.value)} 
                  value={subCategory}
                  className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary cursor-pointer font-sans text-sm uppercase"
                >
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
          )}

          {category === "Wall Frames" && (
              <div className="mt-4 flex items-center gap-3 border-2 border-primary p-3 bg-[#FAF9F6]">
                <input
                  type="checkbox"
                  id="comingSoon"
                  checked={comingSoon}
                  onChange={(e) => setComingSoon(e.target.checked)}
                  className="w-4 h-4 accent-primary border-primary rounded-none"
                />
                <label htmlFor="comingSoon" className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest cursor-pointer select-none">
                  Mark as Coming Soon
                </label>
              </div>
          )}

          {!comingSoon && (
            <>
              {/* Price */}
              {category !== "Wall Posters" && (
                <div className="mt-4">
                  <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Pricing (PKR)</p>
                  <input
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                    className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary font-mono text-lg"
                    type="number"
                    placeholder="0.00"
                    required
                  />
                </div>
              )}
              
              {/* Stock */}
              <div className="mt-4">
                <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Stock Level</p>
                <input
                  onChange={(e) => setStock(e.target.value)}
                  value={stock}
                  className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary font-mono text-lg"
                  type="number"
                  min="0"
                  placeholder="0"
                  required
                />
              </div>
            </>
          )}

          {/* Bestseller */}
          <div className="flex items-center gap-3 mt-6 border-2 border-primary p-3 bg-[#FAF9F6] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <input
              type="checkbox"
              id="bestseller"
              checked={bestseller}
              onChange={(e) => setBestseller(e.target.checked)}
              className="w-4 h-4 accent-primary border-primary rounded-none"
            />
            <label htmlFor="bestseller" className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest cursor-pointer select-none">
              Mark as Featured Archive
            </label>
          </div>
        </div>

        {/* ── Product Specifications ───────────────────────────────── */}
        {!comingSoon && (
            <div className="bg-white border border-primary p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest border-b border-primary/40 pb-1">Format Specifications</p>
                  <p className="text-xs text-primary/80 mt-1 font-serif italic">Include print format, framing details, year, etc.</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border-2 border-primary overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_1fr_44px] gap-0 px-4 py-2 border-b-2 border-primary bg-white">
                  <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Metadata Key</p>
                  <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Metadata Value</p>
                  <span></span>
                </div>

                {/* Spec rows */}
                <div className="flex flex-col divide-y-2 divide-primary">
                  {specifications.map((spec, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_44px] gap-0 px-2 py-2 items-center">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => updateSpecRow(index, 'name', e.target.value)}
                        placeholder="e.g. Dimensions"
                        className="bg-transparent border-none px-3 py-2 text-sm text-primary font-mono outline-none focus:bg-white transition-all mx-1 placeholder:text-primary/30"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
                        placeholder="e.g. 24x36 inch"
                        className="bg-transparent border-none px-3 py-2 text-sm text-primary font-mono outline-none focus:bg-white transition-all mx-1 placeholder:text-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(index)}
                        disabled={specifications.length === 1}
                        className="w-8 h-8 flex items-center justify-center border border-transparent text-primary hover:border-primary hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors mx-auto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add row button */}
                <div className="px-4 py-3 border-t-2 border-primary bg-white">
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-widest hover:pl-2 transition-all"
                  >
                    <Plus size={14} />
                    APPEND METADATA
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full sm:w-auto self-start flex items-center justify-center gap-3 bg-primary hover:bg-black text-white font-bold py-4 px-10 transition-transform shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none active:translate-y-1 hover:-translate-y-1 border border-primary mt-2 uppercase tracking-[0.2em] text-xs"
        >
          <Plus size={16} />
          FILE INTO ARCHIVE
        </button>
      </form>
    </motion.div>
  );
};

export default Add;