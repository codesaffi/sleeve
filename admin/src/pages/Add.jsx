import React, { useState } from 'react';
import { assets } from '../assets/admin_assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Upload, Plus, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Add = ({token}) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Cooling Devices");
  const [subCategory, setSubCategory] = useState("Mobile");
  const [bestseller, setBestseller] = useState(false);
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
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("stock", stock);

      // Filter empty spec rows before sending
      const filledSpecs = specifications.filter(
        (s) => s.name.trim() || s.value.trim()
      );
      formData.append("specifications", JSON.stringify(filledSpecs));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(backendUrl + "/api/product/add", formData, {headers: {token}});

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice('');
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

  const ImageUploader = ({ image, setImage, id }) => (
    <label htmlFor={id} className="cursor-pointer group">
      <div className={`w-24 h-24 border-2 flex items-center justify-center overflow-hidden transition-all ${!image ? 'border-dashed border-primary/40 bg-white group-hover:border-primary group-hover:bg-black/5' : 'border-solid border-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'}`}>
        {!image ? (
          <div className="flex flex-col items-center text-primary/40 group-hover:text-primary transition-colors">
            <Upload size={24} />
          </div>
        ) : (
          <img className="w-full h-full object-cover grayscale-[0.2] contrast-125 sepia-[0.1]" src={URL.createObjectURL(image)} alt="preview" />
        )}
      </div>
      <input onChange={(e) => setImage(e.target.files[0])} type="file" id={id} hidden />
    </label>
  );

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
        {/* Images */}
        <div className="bg-white border border-primary p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <p className="text-[10px] font-mono font-bold text-primary mb-3 uppercase tracking-[0.2em] border-b border-primary/40 pb-2">Artwork Uploads</p>
          <div className="flex flex-wrap gap-4">
            <ImageUploader image={image1} setImage={setImage1} id="image1" />
            <ImageUploader image={image2} setImage={setImage2} id="image2" />
            <ImageUploader image={image3} setImage={setImage3} id="image3" />
            <ImageUploader image={image4} setImage={setImage4} id="image4" />
          </div>
        </div>

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
              onChange={(e) => setCategory(e.target.value)} 
              value={category}
              className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary cursor-pointer font-sans text-sm uppercase"
            >
              <option value="Posters">Posters</option>
              <option value="Framed Prints">Framed Prints</option>
              <option value="Vinyl Covers">Vinyl Covers</option>
              <option value="Canvas">Canvas</option>
              <option value="Archives">Archives</option>
              <option value="Misc">Misc</option>
            </select>
          </div>

          {/* Platform */}
          <div className="mt-4">
            <p className="text-[10px] font-mono font-bold text-primary mb-1 uppercase tracking-widest">Secondary Classification</p>
            <select 
              onChange={(e) => setSubCategory(e.target.value)} 
              value={subCategory}
              className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-0 py-2 outline-none focus:border-black focus:ring-0 transition-all text-primary cursor-pointer font-sans text-sm uppercase"
            >
              <option value="Rock">Rock</option>
              <option value="Pop">Pop</option>
              <option value="Jazz">Jazz</option>
              <option value="Indie">Indie</option>
              <option value="Classic">Classic</option>
              <option value="Electronic">Electronic</option>
            </select>
          </div>

          {/* Price */}
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