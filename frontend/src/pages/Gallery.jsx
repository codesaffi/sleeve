import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import axios from "axios";
import Title from "../components/Title";
import { motion } from "framer-motion";
import { ShopContext } from "../context/ShopContext";
import { cloudinaryImageUrl } from "../utils/imageUrl";
import { getPosterMinimum, getPosterPrice, isPosterProduct } from "../utils/posterPricing";

const Gallery = () => {
    const { products, currency, formatPrice, addPosterBatch, addPosterBatches } = useContext(ShopContext);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedDesigns, setSelectedDesigns] = useState(() => new Set());
    const [addingToCart, setAddingToCart] = useState(false);
    const [showProductChooser, setShowProductChooser] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedDesignRecords, setSelectedDesignRecords] = useState({});
    const [chooserMode, setChooserMode] = useState("single");
    const [splitStep, setSplitStep] = useState("quantities");
    const [premiumQuantityDraft, setPremiumQuantityDraft] = useState("");
    const [standardQuantityDraft, setStandardQuantityDraft] = useState("");
    const [activeAssignmentProductId, setActiveAssignmentProductId] = useState("");
    const [designAssignments, setDesignAssignments] = useState({});

    const posterProducts = products.filter((product) => isPosterProduct(product) && !product.comingSoon);
    const selectedProduct = posterProducts.find((product) => product._id === selectedProductId);
    const selectedDesignCount = selectedDesigns.size;
    const premiumProduct = posterProducts.find((product) => /premium/i.test(product.name));
    const standardProduct = posterProducts.find((product) => /standard/i.test(product.name));
    const premiumMinimum = getPosterMinimum(premiumProduct);
    const standardMinimum = getPosterMinimum(standardProduct);
    const mixedMinimum = premiumMinimum + standardMinimum;
    const premiumQuantity = Number(premiumQuantityDraft);
    const standardQuantity = Number(standardQuantityDraft);
    const premiumDesignIds = Object.entries(designAssignments).filter(([, productId]) => productId === premiumProduct?._id).map(([designId]) => designId);
    const standardDesignIds = Object.entries(designAssignments).filter(([, productId]) => productId === standardProduct?._id).map(([designId]) => designId);
    const unassignedDesignCount = selectedDesignCount - premiumDesignIds.length - standardDesignIds.length;
    const splitQuantityError = !Number.isInteger(premiumQuantity) || !Number.isInteger(standardQuantity)
        ? "Enter a whole-number quantity for both poster groups."
        : premiumQuantity < premiumMinimum
            ? `Minimum quantity for ${premiumProduct?.name || "Premium Posters"} is ${premiumMinimum} designs.`
            : standardQuantity < standardMinimum
                ? `Minimum quantity for ${standardProduct?.name || "Standard Posters"} is ${standardMinimum} designs.`
                : premiumQuantity + standardQuantity !== selectedDesignCount
                    ? `Premium and Standard quantities must add up to ${selectedDesignCount} designs.`
                    : "";
    const splitAssignmentComplete = !splitQuantityError
        && premiumDesignIds.length === premiumQuantity
        && standardDesignIds.length === standardQuantity
        && unassignedDesignCount === 0;
    
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

    const toggleDesignSelection = (design) => {
        const wasSelected = selectedDesigns.has(design._id);
        setSelectedDesigns((currentSelection) => {
            const nextSelection = new Set(currentSelection);
            if (wasSelected) {
                nextSelection.delete(design._id);
            } else {
                nextSelection.add(design._id);
            }
            return nextSelection;
        });
        setSelectedDesignRecords((records) => {
            if (!wasSelected) return { ...records, [design._id]: design };
            const nextRecords = { ...records };
            delete nextRecords[design._id];
            return nextRecords;
        });
        if (wasSelected) {
            setDesignAssignments((assignments) => {
                const nextAssignments = { ...assignments };
                delete nextAssignments[design._id];
                return nextAssignments;
            });
        }
    };

    const cancelSelection = () => {
        setSelectionMode(false);
        setSelectedDesigns(new Set());
        setSelectedDesignRecords({});
        setShowProductChooser(false);
        setSelectedProductId("");
        setChooserMode("single");
        setSplitStep("quantities");
        setDesignAssignments({});
    };

    const addSelectedDesignsToCart = async () => {
        if (addingToCart) return;
        if (chooserMode === "split") {
            if (!splitAssignmentComplete) return;
            setAddingToCart(true);
            try {
                const batches = [
                    {
                        productId: premiumProduct._id,
                        posterQuantity: premiumQuantity,
                        designs: premiumDesignIds.map((galleryDesignId) => ({ type: "gallery", galleryDesignId })),
                    },
                    {
                        productId: standardProduct._id,
                        posterQuantity: standardQuantity,
                        designs: standardDesignIds.map((galleryDesignId) => ({ type: "gallery", galleryDesignId })),
                    },
                ];
                const added = await addPosterBatches(batches);
                if (added) {
                    toast.success(`${premiumQuantity} Premium and ${standardQuantity} Standard designs added as two poster batches.`);
                    cancelSelection();
                }
            } finally {
                setAddingToCart(false);
            }
            return;
        }
        if (!selectedProduct) return;
        const minimum = getPosterMinimum(selectedProduct);
        if (selectedDesignCount < minimum) {
            toast.error(`Minimum quantity for ${selectedProduct.name} is ${minimum} designs/posters.`);
            return;
        }
        setAddingToCart(true);
        try {
            const added = await addPosterBatch({
                productId: selectedProduct._id,
                posterQuantity: selectedDesignCount,
                designs: [...selectedDesigns].map((galleryDesignId) => ({ type: "gallery", galleryDesignId })),
            });
            if (added) {
                toast.success(`${selectedProduct.name} batch with ${selectedDesignCount} designs added to cart.`);
                cancelSelection();
            }
        } finally {
            setAddingToCart(false);
        }
    };

    const assignDesign = (designId) => {
        const currentProductId = designAssignments[designId];
        if (currentProductId === activeAssignmentProductId) {
            setDesignAssignments((currentAssignments) => ({ ...currentAssignments, [designId]: null }));
            return;
        }
        const targetProduct = activeAssignmentProductId === premiumProduct?._id ? premiumProduct : standardProduct;
        const targetCount = activeAssignmentProductId === premiumProduct?._id ? premiumDesignIds.length : standardDesignIds.length;
        const targetQuantity = activeAssignmentProductId === premiumProduct?._id ? premiumQuantity : standardQuantity;
        if (targetCount >= targetQuantity) {
            toast.error(`You already assigned ${targetQuantity} designs to ${targetProduct.name}.`);
            return;
        }
        setDesignAssignments((currentAssignments) => ({ ...currentAssignments, [designId]: activeAssignmentProductId }));
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
                                onClick={() => {
                                    if (selectedDesigns.size === 0 || addingToCart) return;
                                    setShowProductChooser(true);
                                    setSelectedProductId("");
                                    setChooserMode("single");
                                }}
                                disabled={selectedDesigns.size === 0 || addingToCart}
                                className="archive-button border border-primary bg-primary px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {addingToCart ? "Adding..." : "Add to Cart"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showProductChooser && (
                <section className="mb-8 border-2 border-primary bg-[#FAF9F6] p-4 shadow-vintage sm:p-6" aria-label="Choose poster product">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-primary/30 pb-3">
                        <div>
                            <h2 className="font-serif text-xl font-bold text-primary">
                                {chooserMode === "split" ? "Split your Gallery designs" : "What would you like to print these as?"}
                            </h2>
                            <p className="mt-1 text-sm text-secondary">{selectedDesignCount} designs selected</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (chooserMode === "split" && splitStep === "assign") setSplitStep("quantities");
                                else {
                                    setShowProductChooser(false);
                                    setChooserMode("single");
                                }
                            }}
                            className="border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-white"
                        >
                            Back
                        </button>
                    </div>
                    {chooserMode === "single" ? (
                        <>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {posterProducts.map((product) => {
                                    const minimum = getPosterMinimum(product);
                                    const available = selectedDesignCount >= minimum;
                                    const isSelected = selectedProductId === product._id;
                                    return (
                                        <button
                                            type="button"
                                            key={product._id}
                                            disabled={!available}
                                            onClick={() => setSelectedProductId(product._id)}
                                            className={`border-2 p-4 text-left transition-colors ${isSelected ? "border-primary bg-primary text-white" : "border-primary/50 bg-white text-primary hover:border-primary"} ${!available ? "cursor-not-allowed opacity-60" : ""}`}
                                        >
                                            <span className="block font-serif text-lg font-bold uppercase">{product.name}</span>
                                            <span className={`mt-1 block text-xs ${isSelected ? "text-white/80" : "text-secondary"}`}>Minimum {minimum} posters</span>
                                            {available ? (
                                                <>
                                                    <span className={`mt-1 block text-xs ${isSelected ? "text-white/80" : "text-secondary"}`}>Suitable for {selectedDesignCount} designs</span>
                                                    <span className="mt-3 block text-sm font-bold">{currency} {formatPrice(getPosterPrice(product, selectedDesignCount) ?? product.price)}</span>
                                                </>
                                            ) : (
                                                <span className="mt-2 block text-xs font-semibold text-accent">Not available — select at least {minimum} designs</span>
                                            )}
                                        </button>
                                    );
                                })}
                                {premiumProduct && standardProduct && selectedDesignCount >= mixedMinimum && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setChooserMode("split");
                                            setSplitStep("quantities");
                                            setPremiumQuantityDraft(String(premiumMinimum));
                                            setStandardQuantityDraft(String(selectedDesignCount - premiumMinimum));
                                            setDesignAssignments({});
                                            setActiveAssignmentProductId(premiumProduct._id);
                                        }}
                                        className="border-2 border-dashed border-primary bg-white p-4 text-left text-primary transition-colors hover:bg-primary hover:text-white sm:col-span-2"
                                    >
                                        <span className="block font-serif text-lg font-bold uppercase">Split Between Premium &amp; Standard</span>
                                        <span className="mt-1 block text-xs">At least {premiumMinimum} Premium + {standardMinimum} Standard designs</span>
                                    </button>
                                )}
                            </div>
                            {posterProducts.length === 0 && <p className="mt-4 text-sm text-secondary">No poster products are currently available.</p>}
                            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => setShowProductChooser(false)} className="min-h-10 border border-primary px-5 py-2 text-xs font-bold uppercase text-primary">Cancel</button>
                                <button type="button" onClick={addSelectedDesignsToCart} disabled={!selectedProduct || addingToCart} className="min-h-10 border border-primary bg-primary px-5 py-2 text-xs font-bold uppercase text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40">
                                    {addingToCart ? "Adding Batch..." : `Add ${selectedDesignCount} PCS to Cart`}
                                </button>
                            </div>
                        </>
                    ) : splitStep === "quantities" ? (
                        <div className="mt-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {[
                                    { product: premiumProduct, quantity: premiumQuantityDraft, setQuantity: setPremiumQuantityDraft, minimum: premiumMinimum },
                                    { product: standardProduct, quantity: standardQuantityDraft, setQuantity: setStandardQuantityDraft, minimum: standardMinimum },
                                ].map(({ product, quantity, setQuantity, minimum }) => (
                                    <label key={product._id} className="border border-primary bg-white p-4">
                                        <span className="block font-serif text-lg font-bold uppercase text-primary">{product.name}</span>
                                        <span className="mt-1 block text-xs text-secondary">Minimum {minimum} designs · {currency} {formatPrice(getPosterPrice(product, Number(quantity)) ?? product.price)}</span>
                                        <span className="mt-3 flex items-center gap-2">
                                            <button
                                                type="button"
                                                aria-label={`Decrease ${product.name} quantity`}
                                                onClick={() => {
                                                    const next = Number(quantity) - 1;
                                                    if (product._id === premiumProduct._id) {
                                                        setPremiumQuantityDraft(String(next));
                                                        setStandardQuantityDraft(String(selectedDesignCount - next));
                                                    } else {
                                                        setStandardQuantityDraft(String(next));
                                                        setPremiumQuantityDraft(String(selectedDesignCount - next));
                                                    }
                                                }}
                                                disabled={Number(quantity) <= minimum}
                                                className="h-10 w-10 shrink-0 border border-primary text-lg font-bold text-primary disabled:opacity-40"
                                            >−</button>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min={minimum}
                                                max={selectedDesignCount - (product._id === premiumProduct._id ? standardMinimum : premiumMinimum)}
                                                step="1"
                                                value={quantity}
                                                onChange={(event) => {
                                                    const value = event.target.value;
                                                    setQuantity(value);
                                                    if (value === "") return;
                                                    const numeric = Number(value);
                                                    if (Number.isInteger(numeric)) {
                                                        if (product._id === premiumProduct._id) setStandardQuantityDraft(String(selectedDesignCount - numeric));
                                                        else setPremiumQuantityDraft(String(selectedDesignCount - numeric));
                                                    }
                                                }}
                                                aria-label={`${product.name} quantity`}
                                                className="h-10 w-full min-w-0 border border-border bg-white px-3 text-center font-bold text-primary"
                                            />
                                            <button
                                                type="button"
                                                aria-label={`Increase ${product.name} quantity`}
                                                onClick={() => {
                                                    const next = Number(quantity) + 1;
                                                    if (product._id === premiumProduct._id) {
                                                        setPremiumQuantityDraft(String(next));
                                                        setStandardQuantityDraft(String(selectedDesignCount - next));
                                                    } else {
                                                        setStandardQuantityDraft(String(next));
                                                        setPremiumQuantityDraft(String(selectedDesignCount - next));
                                                    }
                                                }}
                                                disabled={Number(quantity) >= selectedDesignCount - (product._id === premiumProduct._id ? standardMinimum : premiumMinimum)}
                                                className="h-10 w-10 shrink-0 border border-primary text-lg font-bold text-primary disabled:opacity-40"
                                            >+</button>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 border-t border-primary/30 pt-3 text-sm text-primary">
                                <p>Total designs: {selectedDesignCount}</p>
                                <p>Assigned by quantity: {Number.isInteger(premiumQuantity) && Number.isInteger(standardQuantity) ? premiumQuantity + standardQuantity : 0} / {selectedDesignCount}</p>
                                {splitQuantityError && <p className="mt-2 font-semibold text-accent" role="alert">{splitQuantityError}</p>}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (splitQuantityError) return;
                                        setDesignAssignments({});
                                        setActiveAssignmentProductId(premiumProduct._id);
                                        setSplitStep("assign");
                                    }}
                                    disabled={Boolean(splitQuantityError)}
                                    className="min-h-10 border border-primary bg-primary px-5 py-2 text-xs font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >Assign Designs</button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {[
                                    { product: premiumProduct, count: premiumDesignIds.length, quantity: premiumQuantity },
                                    { product: standardProduct, count: standardDesignIds.length, quantity: standardQuantity },
                                ].map(({ product, count, quantity }) => {
                                    const active = activeAssignmentProductId === product._id;
                                    return (
                                        <button
                                            type="button"
                                            key={product._id}
                                            onClick={() => setActiveAssignmentProductId(product._id)}
                                            aria-pressed={active}
                                            className={`border-2 p-3 text-left ${active ? "border-primary bg-primary text-white" : "border-primary/50 bg-white text-primary"}`}
                                        >
                                            <span className="block font-serif font-bold uppercase">{product.name}</span>
                                            <span className={`mt-1 block text-xs ${active ? "text-white/80" : "text-secondary"}`}>Assigned {count} / {quantity}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-primary" aria-live="polite">
                                <span>Premium: {premiumDesignIds.length} / {premiumQuantity}</span>
                                <span>Standard: {standardDesignIds.length} / {standardQuantity}</span>
                                <span>Unassigned: {unassignedDesignCount}</span>
                            </div>
                            <p className="mt-2 text-xs text-secondary">Choose a product group, then tap designs to assign or move them. Tap an assigned design in the active group to unassign it.</p>
                            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                                {[...selectedDesigns].map((designId, index) => {
                                    const design = selectedDesignRecords[designId];
                                    const assignedProductId = designAssignments[designId];
                                    const assignedProduct = posterProducts.find((product) => product._id === assignedProductId);
                                    const active = assignedProductId === activeAssignmentProductId;
                                    return (
                                        <button
                                            type="button"
                                            key={designId}
                                            onClick={() => assignDesign(designId)}
                                            aria-pressed={Boolean(assignedProductId)}
                                            className={`relative min-w-0 overflow-hidden border-2 bg-white text-left ${active ? "border-primary ring-2 ring-primary/30" : assignedProductId ? "border-secondary" : "border-border"}`}
                                        >
                                            <img src={cloudinaryImageUrl(design?.image, 240)} alt={design?.title || `Selected design ${index + 1}`} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover" />
                                            <span className="block truncate px-1 py-1 text-[10px] font-bold text-primary">
                                                {assignedProduct?.name || "Unassigned"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-secondary">Premium {currency} {formatPrice(getPosterPrice(premiumProduct, premiumQuantity) ?? premiumProduct.price)} + Standard {currency} {formatPrice(getPosterPrice(standardProduct, standardQuantity) ?? standardProduct.price)}</p>
                                <button
                                    type="button"
                                    onClick={addSelectedDesignsToCart}
                                    disabled={!splitAssignmentComplete || addingToCart}
                                    className="min-h-10 border border-primary bg-primary px-5 py-2 text-xs font-bold uppercase text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >{addingToCart ? "Adding Batches..." : "Add Both Batches to Cart"}</button>
                            </div>
                        </div>
                    )}
                </section>
            )}
            
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
                                onClick={() => toggleDesignSelection(item)}
                                className={`relative block w-full aspect-[3/4] overflow-hidden bg-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary ${selectionMode ? "cursor-pointer" : "cursor-default"}`}
                            >
                                <img
                                    src={cloudinaryImageUrl(item.image, 640)}
                                    alt={item.title || "Gallery artwork"}
                                    className="h-full w-full object-contain p-1 grayscale-[0.1] contrast-110 sepia-[0.1] transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(event) => {
                                        if (!event.currentTarget.dataset.fallback) {
                                            event.currentTarget.dataset.fallback = "true";
                                            event.currentTarget.src = item.image;
                                        } else {
                                            event.currentTarget.onerror = null;
                                        }
                                    }}
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
