import React from 'react';
import { LogOut, Menu } from 'lucide-react';

const Navbar = ({setToken, setShowSidebar}) => {
  return (
    <div className='flex items-center justify-between py-4 px-4 sm:px-6 md:px-10 bg-[#FAF9F6] border-b-2 border-primary sticky top-0 z-50 shadow-[0px_4px_0px_0px_rgba(26,26,26,1)]'>
        <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(true)} className="md:hidden text-primary p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-primary">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tighter text-primary leading-none">Sleeve<span className="italic font-normal">.</span></span>
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase mt-1">ARCHIVE CONTROL</span>
            </div>
        </div>
        
        <button 
          onClick={() => setToken('')} 
          className='flex items-center gap-2 bg-primary hover:bg-black text-white px-4 py-2 sm:px-5 sm:py-2 border border-primary text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]'
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">DISCONNECT</span>
        </button>
    </div>
  );
};

export default Navbar;