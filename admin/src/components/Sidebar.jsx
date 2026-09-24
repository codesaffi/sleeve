import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { PlusCircle, ListTodo, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const location = useLocation();

  useEffect(() => {
    setShowSidebar(false);
  }, [location, setShowSidebar]);

  const SidebarContent = () => (
    <div className='flex flex-col gap-2 pt-6 md:pt-8 px-4 font-sans'>
        <div className="flex justify-end md:hidden mb-2">
            <button onClick={() => setShowSidebar(false)} className="p-2 text-primary hover:bg-black hover:text-white transition-colors border border-transparent hover:border-primary">
                <X size={20} />
            </button>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-secondary uppercase px-4 mb-2 border-b border-primary/40 pb-2">Index</div>
        <NavLink 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 border border-transparent transition-all uppercase tracking-widest text-xs font-bold ${isActive ? 'bg-primary text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]' : 'text-primary hover:border-primary'}`} 
            to="/add"
        >
            <PlusCircle size={16} className="shrink-0" />
            <p className='block'>Add Items</p>
        </NavLink>
        
        <NavLink 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 border border-transparent transition-all uppercase tracking-widest text-xs font-bold ${isActive ? 'bg-primary text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]' : 'text-primary hover:border-primary'}`} 
            to="/list"
        >
            <ListTodo size={16} className="shrink-0" />
            <p className='block'>List Items</p>
        </NavLink>
        
        <NavLink 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 border border-transparent transition-all uppercase tracking-widest text-xs font-bold ${isActive ? 'bg-primary text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]' : 'text-primary hover:border-primary'}`} 
            to="/orders"
        >
            <ShoppingBag size={16} className="shrink-0" />
            <p className='block'>Orders</p>
        </NavLink>

        <NavLink 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 border border-transparent transition-all uppercase tracking-widest text-xs font-bold ${isActive ? 'bg-primary text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]' : 'text-primary hover:border-primary'}`} 
            to="/discounts"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42l-8.704-8.704z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
            <p className='block'>Discounts</p>
        </NavLink>

        <NavLink 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 border border-transparent transition-all uppercase tracking-widest text-xs font-bold ${isActive ? 'bg-primary text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]' : 'text-primary hover:border-primary'}`} 
            to="/gallery"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <p className='block'>Gallery</p>
        </NavLink>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className='hidden md:block w-[240px] min-h-[calc(100vh-73px)] border-r-2 border-primary bg-[#FAF9F6] shrink-0 sticky top-[73px] self-start'>
          <SidebarContent />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-[#FAF9F6] z-[70] md:hidden shadow-2xl border-r-2 border-primary overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-primary flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-2xl tracking-tighter text-primary leading-none">Sleeve<span className="italic font-normal">.</span></span>
                    <span className="text-[10px] font-mono tracking-widest text-primary uppercase mt-1">ARCHIVE CONTROL</span>
                  </div>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;