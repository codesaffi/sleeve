import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import axios from "axios";
import Title from "../components/Title";
import { motion } from "framer-motion";
import { ShopContext } from "../context/ShopContext";

const Gallery = () => {
    const { addGalleryToCart } = useContext(ShopContext);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedDesigns, setSelectedDesigns] = useState(() => new Set());
    const [addingToCart, setAddingToCart] = useState(false);
    
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(backendUrl + "/api/gallery/categories");
            if (response.data.success) {
                setCategories(response.data.categories);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCategory = async (category) => {
        setSelectedCategory(category);
        setLoading(true);
        try {
            const response = await axios.get(backendUrl + "/api/gallery/list", { params: { category } });
            if (response.data.success) {
                setImages(response.data.images);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const backToCategories = () => {
        setSelectedCategory("");
        setImages([]);
        fetchCategories();
    };

    const toggleDesignSelection = (designId) => {
        setSelectedDesigns((currentSelection) => {
            const nextSelection = new Set(currentSelection);
            if (nextSelection.has(designId)) {
                nextSelection.delete(designId);
            } else {
                nextSelection.add(designId);
            }
            return nextSelection;
        });
    };

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedDesigns(new Set());
    };

    const addSelectedDesignsToCart = async () => {
        if (selectedDesigns.size === 0 || addingToCart) return;
        setAddingToCart(true);
        try {
            for (const designId of selectedDesigns) {
                await addGalleryToCart(designId);
            }
            toast.success(`${selectedDesigns.size} ${selectedDesigns.size === 1 ? "design" : "designs"} added to cart`);
            cancelSelection();
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="pt-10 mb-20 font-sans">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-primary/20 pb-4">
                <div className="text-3xl">
                    <Title text1={"DESIGN"} text2={"GALLERY"} />
                </div>
                <div className="flex items-center gap-3">
                    {selectionMode && (
                        <span aria-live="polite" className="text-xs font-bold uppercase tracking-widest text-primary">
                            {selectedDesigns.size} {selectedDesigns.size === 1 ? "Design Selected" : "Designs Selected"}
                        </span>
                    )}
                    {!selectionMode ? (
                        <button
                            type="button"
                            onClick={() => setSelectionMode(true)}
                            className="archive-button border border-primary bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-primary"
                        >
                            Select
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={cancelSelection}
                                disabled={addingToCart}
                                className="archive-button border border-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={addSelectedDesignsToCart}
                                disabled={selectedDesigns.size === 0 || addingToCart}
                                className="archive-button border border-primary bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {addingToCart ? "Adding..." : "Add to Cart"}
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {selectedCategory ? (
                <div className="gallery-heading mb-8">
                    <button
                        type="button"
                        onClick={backToCategories}
                        className="archive-back mb-5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                    >
                        &larr; Back to Gallery
                    </button>
                    <h2 className="text-center font-serif text-2xl font-bold text-primary">{selectedCategory}</h2>
                    <p className="mt-2 text-center text-secondary">
                        {selectionMode ? "Tap artwork to select or deselect it. Your selections stay with you as you browse categories." : "Browse the archive, then select designs to add them to your cart."}
                    </p>
                </div>
            ) : (
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <p className="text-secondary leading-relaxed">
                        Browse our curated archive by category. Selected designs remain selected as you explore.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="w-full py-20 flex justify-center text-primary font-mono text-sm tracking-widest uppercase">
                    {selectedCategory ? "Loading Archives..." : "Loading Gallery..."}
                </div>
            ) : !selectedCategory && categories.length === 0 ? (
                <div className="w-full py-20 flex justify-center text-primary font-serif italic text-lg">
                    No inspirations found in the archive.
                </div>
            ) : !selectedCategory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, index) => (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.04 }}
                            key={category}
                            onClick={() => openCategory(category)}
                            className="archive-category relative min-h-32 flex items-center justify-between gap-4 border border-primary bg-white px-5 py-4 text-left shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 transition-transform overflow-hidden"
                        >
                            <span className="archive-category-title relative z-10 font-serif text-lg font-bold text-primary">{category}</span>
                            <span aria-hidden="true" className="archive-category-arrow relative z-10 text-xl text-primary">&rarr;</span>
                            <span className="archive-category-caption" aria-hidden="true">MUSIC ARCHIVE · SIDE A</span>
                        </motion.button>
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="w-full py-20 flex justify-center text-primary font-serif italic text-lg">
                    No designs found in this category.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {images.map((item, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            key={item._id} 
                            className={`gallery-print group overflow-hidden flex flex-col transition-shadow ${selectedDesigns.has(item._id) ? "border-2 border-primary shadow-[5px_5px_0px_0px_rgba(26,26,26,1)]" : "border border-primary/50 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"}`}
                        >
                            <button
                                type="button"
                                disabled={!selectionMode || addingToCart}
                                aria-pressed={selectionMode ? selectedDesigns.has(item._id) : undefined}
                                aria-label={`${selectedDesigns.has(item._id) ? "Deselect" : "Select"} ${item.title || "Untitled Archive"}`}
                                onClick={() => toggleDesignSelection(item._id)}
                                className={`relative block w-full aspect-[3/4] overflow-hidden bg-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary ${selectionMode ? "cursor-pointer" : "cursor-default"}`}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title || "Gallery artwork"}
                                    className="h-full w-full object-contain p-1 grayscale-[0.1] contrast-110 sepia-[0.1] transition-transform duration-500 group-hover:scale-[1.02]"
                                />
                                {selectionMode && (
                                    <span
                                        aria-hidden="true"
                                        className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm transition-colors ${selectedDesigns.has(item._id) ? "border-primary bg-primary text-white" : "border-primary/70 bg-[#FAF9F6]/90 text-transparent"}`}
                                    >
                                        {selectedDesigns.has(item._id) ? "✓" : ""}
                                    </span>
                                )}
                            </button>
                            <div className="px-3 py-2.5">
                                <h3 className="truncate font-serif text-sm font-bold text-primary sm:text-base" title={item.title}>
                                    {item.title || "Untitled Archive"}
                                </h3>
                                {item.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-secondary">{item.description}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
