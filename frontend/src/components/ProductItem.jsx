import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductItem = ({ id, image, name, price, subCategory, category }) => {
    const { currency, formatPrice } = useContext(ShopContext);

    return (
        <motion.div 
            className='group flex flex-col h-full bg-white border border-primary p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 transition-transform'
        >
            <Link className='cursor-pointer flex-1 flex flex-col' to={`/product/${id}`}>
                <div className='overflow-hidden bg-[#ECE2D1] aspect-square relative border border-primary/40 mb-4 p-2 halftone-bg'>
                    <div className="w-full h-full overflow-hidden bg-gray-100 border border-primary/30">
                        <img 
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 sepia-[0.1] contrast-105' 
                            src={image[0]} 
                            alt={name} 
                        />
                    </div>
                </div>
                <div className='flex-1 flex flex-col font-sans uppercase tracking-widest text-[10px]'>
                    <div className="flex justify-between border-b border-primary/40 pb-1 mb-2 text-primary/80">
                        <span>{category || "MUSIC"}</span>
                        <span>{subCategory || "ARCHIVE"}</span>
                    </div>
                    <h3 className='text-sm font-serif font-bold text-primary leading-snug mb-1 truncate'>{name}</h3>
                    <p className='text-primary/80 mb-2 text-xs truncate'>CATALOGUE ENTRY</p>
                    <div className='mt-auto flex items-center justify-between border-t border-primary/40 pt-2'>
                        <p className='font-bold text-primary text-xs'>{currency} {formatPrice(price)}</p>
                        <span className="bg-primary text-white px-2 py-0.5">VIEW ✦</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductItem;