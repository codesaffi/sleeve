import { useContext, useMemo, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Collection = () => {
  const { products, search, showSearch, productsLoading } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
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

  const categories = useMemo(() => [...new Map(products
    .map((product) => product.category)
    .filter(Boolean)
    .map((value) => [value.trim().toLocaleLowerCase(), value])).values()], [products]);
  const availableSubcategories = useMemo(() => {
    const filtered = category.length ? products.filter((product) => category.includes(product.category)) : products;
    return [...new Map(filtered
      .map((product) => product.subCategory)
      .filter(Boolean)
      .map((value) => [value.trim().toLocaleLowerCase(), value])).values()];
  }, [products, category]);
  const filterProducts = useMemo(() => {
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

    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => (a.price - b.price));
        break;
      case 'high-low':
        productsCopy.sort((a, b) => (b.price - a.price));
        break;
      default: break;
    }
    return productsCopy;
  }, [category, subCategory, search, showSearch, products, sortType]);

  return (
    <div className='flex flex-col lg:flex-row gap-6 lg:gap-10 pt-10 px-4 md:px-0'>
       {/* Filter Sidebar */}
       <div className='w-full lg:w-64 shrink-0'>
        <button 
          onClick={() => setShowFilter(!showFilter)} 
          className='w-full flex items-center justify-between lg:hidden bg-background vintage-border px-4 py-3 shadow-vintage text-primary font-medium'
        >
          <span className="flex items-center gap-2"><Filter size={18} strokeWidth={1.5}/> Filters</span>
          <ChevronDown size={18} className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>

        <div className={`${showFilter ? 'block' : 'hidden'} mt-4 lg:mt-0 lg:block`}>
          <div className='bg-background vintage-border p-6 shadow-vintage sticky top-24'>
            <div className="mb-8">
              <h3 className='text-xs font-bold tracking-[0.15em] text-primary mb-4 uppercase'>Categories</h3>
              <div className='flex flex-col gap-3'>
                {categories.map((value) => (
                  <label key={value} className='flex items-center gap-3 cursor-pointer group'>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        value={value}
                        onChange={toggleCategory}
                        className='peer w-4 h-4 appearance-none border border-border rounded-none checked:bg-primary checked:border-primary transition-colors' 
                      />
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-sans text-secondary group-hover:text-primary transition-colors">{value}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h3 className='text-xs font-bold tracking-[0.15em] text-primary mb-4 uppercase'>Subcategories</h3>
              <div className='flex flex-col gap-3'>
                {availableSubcategories.map((value) => (
                  <label key={value} className='flex items-center gap-3 cursor-pointer group'>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        value={value}
                        onChange={toggleSubcategory}
                        className='peer w-4 h-4 appearance-none border border-border rounded-none checked:bg-primary checked:border-primary transition-colors' 
                      />
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-sans text-secondary group-hover:text-primary transition-colors">{value}</span>
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
            {filterProducts.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ProductItem name={item.name} id={item._id} price={item.price} image={item.image} category={item.category} subCategory={item.subCategory} minimumPosterQuantity={item.minimumPosterQuantity} basePosterQuantity={item.basePosterQuantity} basePosterPrice={item.basePosterPrice} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {productsLoading ? (
          <div className="w-full py-20 text-center text-secondary" role="status">Loading collection…</div>
        ) : filterProducts.length === 0 && (
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