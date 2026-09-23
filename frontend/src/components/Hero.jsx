import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { assets } from '../assets/frontend_assets/assets';

const Hero = () => {
  return (
    <div className='relative w-full overflow-hidden bg-background min-h-[600px] flex items-center border-b-2 border-primary'>
      {/* Decorative Vintage Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
        <div className="w-[800px] h-[800px] rounded-full border-[40px] border-primary"></div>
        <div className="absolute w-[300px] h-[300px] rounded-full border-[20px] border-primary"></div>
      </div>
      <div className="absolute top-10 right-10 text-[10rem] font-serif font-bold text-primary opacity-[0.02] pointer-events-none leading-none select-none">
        VINYL
      </div>

      <div className='relative z-10 container mx-auto px-6 sm:px-12 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12'>
        
        {/* Text Content */}
        <div className='w-full md:w-1/2 flex flex-col items-start'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] border border-primary px-3 py-1 bg-white">ISSUE 04</span>
            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em]">★ THE MUSIC ARCHIVE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-6xl sm:text-7xl lg:text-8xl font-serif text-primary leading-[0.9] tracking-tighter mb-8 uppercase'
          >
            FRAME<br/>THE MUSIC<br/><span className="italic">YOU LOVE.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-primary text-sm md:text-base max-w-md mb-10 leading-relaxed font-sans font-medium border-l-2 border-primary pl-4'
          >
            Iconic albums. Timeless artwork. Made to live on your wall. A curated collection of vintage and modern music posters, archived for the true collector.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto'
          >
            <Link to='/collection' className='w-full sm:w-auto bg-primary hover:bg-black text-white px-8 py-4 font-bold transition-transform hover:-translate-y-1 flex items-center justify-center gap-3 tracking-[0.2em] text-xs uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-y-1 active:shadow-none border border-primary'>
              SHOP THE COLLECTION →
            </Link>
          </motion.div>
        </div>

        {/* Image Area */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='flex w-full md:w-1/2 justify-center md:justify-end relative'
        >
            {/* <div className="absolute -top-4 -left-4 text-primary text-xs font-mono tracking-widest bg-white border border-primary px-2 py-1 z-20">FIG. 1</div> */}
            <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-square bg-[#ECE2D1] border-2 border-primary p-3 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] group overflow-hidden halftone-bg">
                <div className="w-full h-full overflow-hidden transform transition-transform duration-700 group-hover:scale-[1.02] border border-primary/40 bg-white p-2">
                    <img src={assets.banner} alt="Banner" className="w-full h-full object-cover grayscale-[0.2] contrast-125 sepia-[0.1]" />
                </div>
            </div>
            <div className="absolute -bottom-6 -right-2 text-primary">
              <svg width="40" height="40" viewBox="0 0 100 100" className="animate-spin-slow">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
              </svg>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;