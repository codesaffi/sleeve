import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { adminUrl } from "../App";
import { Search, User, ShoppingCart, Menu, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { setShowSearch, getCartCount, token, setToken, setCartItems } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b-2 border-primary ${scrolled ? "bg-background/95 backdrop-blur-md" : "bg-background"}`}>
      
      {/* Editorial Top Bar */}
      <div className="border-b border-primary/20 py-1 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] sm:text-xs font-mono text-primary uppercase tracking-widest">
          <span>VOL. 02 <span className="mx-2">★</span> EST. 1978</span>
          <span>THE MUSIC COLLECTION</span>
          <span className="hidden sm:inline-block">CAT. NO. 014 <span className="mx-2">✦</span> ISSUE 04</span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to={"/"} className="flex items-center gap-2 group">
            <span className="font-serif font-bold text-3xl tracking-tighter text-primary group-hover:italic transition-all">Sleeve<span className="text-primary italic font-normal">.</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-[0.2em] uppercase font-sans">
            {["HOME", "COLLECTION", "GALLERY", "ABOUT", "CONTACT"].map((item) => (
              <NavLink 
                key={item} 
                to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                className={({isActive}) => `relative group text-primary transition-colors hover:text-black ${isActive ? "font-bold" : ""}`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full"></span>
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setShowSearch(true)} 
              className="text-primary hover:scale-110 transition-transform"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <div className="group relative">
              <button 
                onClick={() => navigate("/profile")}
                className="text-primary hover:scale-110 transition-transform"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              
              {token && (
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50">
                  <div className="bg-white rounded-none shadow-vintage border border-primary p-2 flex flex-col overflow-hidden font-sans">
                    <p onClick={() => navigate("/profile")} className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-primary hover:bg-black hover:text-white cursor-pointer transition-colors">My Profile</p>
                    <p onClick={() => navigate("/orders")} className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-primary hover:bg-black hover:text-white cursor-pointer transition-colors">My Orders</p>
                    <div className="h-px bg-primary my-1 mx-2"></div>
                    <p onClick={logout} className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-primary hover:bg-black hover:text-white cursor-pointer transition-colors">Sign Out</p>
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative text-primary hover:scale-110 transition-transform">
              <ShoppingCart size={20} strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-none border border-primary">
                {getCartCount()}
              </span>
            </Link>

            <button 
              onClick={() => setVisible(true)} 
              className="md:hidden text-primary hover:scale-110 transition-transform ml-2"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {visible && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-background texture-overlay flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-primary bg-white">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-2xl tracking-tighter text-primary">Sleeve<span className="italic">.</span></span>
              </div>
              <button onClick={() => setVisible(false)} className="text-primary hover:scale-110 transition-transform p-2">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex flex-col p-6 gap-2 text-sm font-semibold tracking-widest uppercase font-sans">
              <div className="text-[10px] font-mono text-secondary mb-4 border-b border-primary/20 pb-2">VOL. 02 ★ EST. 1978</div>
              {["HOME", "COLLECTION", "GALLERY", "ABOUT", "CONTACT"].map((item) => (
                <NavLink
                  key={item}
                  onClick={() => setVisible(false)}
                  to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
                  className={({isActive}) => `py-4 border-b border-border transition-colors hover:text-black hover:pl-2 ${isActive ? "text-primary italic" : "text-primary"}`}
                >
                  {item}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
