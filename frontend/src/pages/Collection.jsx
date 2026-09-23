import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setCategory(prev => [...prev, e.target.value]);
    }
  };

  const toggleSubcategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    } else {
      setSubCategory(prev => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory)); 
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => (a.price - b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => (b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-6 sm:gap-10 pt-10 px-4 md:px-0'>
       {/* Filter Sidebar */}
       <div className='w-full sm:w-64 shrink-0'>
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className='w-full flex items-center justify-between sm:hidden bg-background vintage-border px-4 py-3 shadow-vintage text-primary font-medium'
        >
          <span className="flex items-center gap-2"><Filter size={18} strokeWidth={1.5}/> Filters</span>
          <ChevronDown size={18} className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>

        <div className={`sm:block ${showFilter ? 'block' : 'hidden'} mt-4 sm:mt-0`}>
          <div className='bg-background vintage-border p-6 shadow-vintage sticky top-24'>
            <div className="mb-8">
              <h3 className='text-xs font-bold tracking-[0.15em] text-primary mb-4 uppercase'>Genres & Eras</h3>
              <div className='flex flex-col gap-3'>
                {[
                  { value: 'Cooling Devices', label: '70s Rock' },
                  { value: 'Controllers', label: '80s Pop' },
                  { value: 'Gaming Accessories', label: '90s Indie' },
                  { value: 'Gaming Audio', label: 'Britpop' },
                  { value: 'Keyboards & Mice', label: 'Vintage Classics' },
                  { value: 'Gaming Gear', label: 'Modern Collectibles' }
                ].map((item) => (
                  <label key={item.value} className='flex items-center gap-3 cursor-pointer group'>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        value={item.value} 
                        onChange={toggleCategory}
                        className='peer w-4 h-4 appearance-none border border-border rounded-none checked:bg-primary checked:border-primary transition-colors' 
                      />
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-sans text-secondary group-hover:text-primary transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className='text-xs font-bold tracking-[0.15em] text-primary mb-4 uppercase'>Frame Types</h3>
              <div className='flex flex-col gap-3'>
                {[
                  { value: 'Mobile', label: 'Vinyl Size' },
                  { value: 'PC', label: 'CD Size' },
                  { value: 'PlayStation', label: 'Cassette Mount' },
                  { value: 'Xbox', label: 'Standard Poster' },
                  { value: 'Nintendo', label: 'Large Gallery' },
                  { value: 'Universal', label: 'Unframed Print' }
                ].map((item) => (
                  <label key={item.value} className='flex items-center gap-3 cursor-pointer group'>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        value={item.value} 
                        onChange={toggleSubcategory}
                        className='peer w-4 h-4 appearance-none border border-border rounded-none checked:bg-primary checked:border-primary transition-colors' 
                      />
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-sans text-secondary group-hover:text-primary transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
       </div>

       {/* Product Grid Area */}
       <div className='flex-1'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-background p-4 border-b border-border'>
          <h2 className='text-2xl sm:text-3xl font-serif text-primary flex items-center gap-2 tracking-tight'>
            ARCHIVE <span className='italic text-accent'>CATALOGUE</span>
          </h2>
          
          <div className="relative">
            <select 
              onChange={(e) => setSortType(e.target.value)} 
              className='appearance-none bg-background vintage-border text-primary text-sm px-4 py-2 pr-10 focus:outline-none focus:ring-0 cursor-pointer font-sans rounded-none'
            >
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" strokeWidth={1.5} />
          </div>
        </div>

        <motion.div 
          layout
          className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
        >
          <AnimatePresence>
            {filterProducts.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ProductItem name={item.name} id={item._id} price={item.price} image={item.image} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filterProducts.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center justify-center text-secondary">
            <Filter size={48} className="mb-4 opacity-20" />
            <p className="text-lg">No products found matching your criteria.</p>
          </div>
        )}
       </div>
    </div>
  );
};

export default Collection;