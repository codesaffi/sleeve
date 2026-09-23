import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [location]);

    return (
        <AnimatePresence>
            {showSearch && visible && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-border bg-white overflow-hidden"
                >
                    <div className="container mx-auto px-4 py-6 flex items-center justify-center relative bg-background">
                        <div className="flex items-center w-full max-w-2xl bg-white rounded-none px-6 py-3 border border-border shadow-vintage focus-within:border-primary transition-all">
                            <Search className="text-secondary mr-3" size={20} strokeWidth={1.5} />
                            <input 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="flex-1 bg-transparent outline-none text-primary placeholder:text-secondary text-base font-sans" 
                                type="text" 
                                placeholder="Search artists, albums..." 
                                autoFocus
                            />
                        </div>
                        <button 
                            onClick={() => setShowSearch(false)} 
                            className="absolute right-4 sm:right-8 p-2 text-secondary hover:text-primary transition-colors bg-white border border-border"
                        >
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchBar;