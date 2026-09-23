import React from "react";
import { NavLink, Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          <div className="md:col-span-4 lg:col-span-5">
            <Link to={"/"} className="flex items-center gap-2 mb-6">
              <span className="font-serif font-bold text-2xl tracking-tighter text-primary">Sleeve<span className="text-accent">.</span></span>
            </Link>
            <p className="text-secondary text-sm md:text-base leading-relaxed max-w-md">
              Sleeve is the ultimate destination for premium music album frames and vintage posters. 
              We curate high-quality prints and frames that celebrate the art of music.
            </p>
          </div>

          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="text-xs font-bold tracking-[0.15em] text-primary mb-6 uppercase">Company</h3>
            <ul className="flex flex-col gap-3 text-sm text-secondary">
              <li><NavLink to='/' className="hover:text-primary transition-colors">Home</NavLink></li>
              <li><NavLink to='/about' className="hover:text-primary transition-colors">About Us</NavLink></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Delivery</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-4">
            <h3 className="text-xs font-bold tracking-[0.15em] text-primary mb-6 uppercase">Get In Touch</h3>
            <ul className="flex flex-col gap-3 text-sm text-secondary">
              <li className="flex items-center gap-2">
                <span className="text-primary font-medium">Support:</span> sleevepk@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-medium">Phone:</span> 0308-8305329
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-secondary text-center md:text-left">
            © {new Date().getFullYear()} Sleeve Music Archive. All Rights Reserved.
          </p>
          <div className="flex gap-4 text-secondary">
            <span className="text-xs hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-xs hover:text-primary cursor-pointer transition-colors">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
