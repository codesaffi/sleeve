import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import axios from "axios";
import Title from "../components/Title";
import { motion } from "framer-motion";
import { ShopContext } from "../context/ShopContext";

const Gallery = () => {
    const { addGalleryToCart } = useContext(ShopContext);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchGallery = async () => {
        try {
            const response = await axios.get(backendUrl + "/api/gallery/list");
            if (response.data.success) {
                setImages(response.data.images);
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
        fetchGallery();
    }, []);

    const handleSelectImage = async (image) => {
        await addGalleryToCart(image._id);
        toast.success("Design added to cart");
    };

    return (
        <div className="pt-10 mb-20 font-sans">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4 border-b border-primary/20 pb-4">
                <div className="text-3xl">
                    <Title text1={"DESIGN"} text2={"GALLERY"} />
                </div>
                
            </div>
            
            <div className="mb-8 text-center max-w-2xl mx-auto">
                <p className="text-secondary leading-relaxed">
                    Browse our curated archive of vintage inspirations. 
                    {" Select a design below to save it to your cart. You can choose the product later."}
                </p>
            </div>

            {loading ? (
                <div className="w-full py-20 flex justify-center text-primary font-mono text-sm tracking-widest uppercase">
                    Loading Archives...
                </div>
            ) : images.length === 0 ? (
                <div className="w-full py-20 flex justify-center text-primary font-serif italic text-lg">
                    No inspirations found in the archive.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((item, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            key={item._id} 
                            className=" border border-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] group overflow-hidden flex flex-col"
                        >
                            <div className="relative w-full aspect-[3/4] overflow-hidden border-b border-primary">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover grayscale-[0.1] contrast-110 sepia-[0.1] group-hover:scale-105 transition-transform duration-700" 
                                />
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="mb-4">
                                    <h3 className="font-serif font-bold text-lg text-primary truncate" title={item.title}>{item.title || "Untitled Archive"}</h3>
                                    {item.description && (
                                        <p className="text-xs text-secondary line-clamp-2 mt-1">{item.description}</p>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => handleSelectImage(item)}
                                    className="w-full bg-black border border-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black hover:border-black transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;
