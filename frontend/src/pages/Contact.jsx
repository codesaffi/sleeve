import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import { NavLink } from "react-router-dom";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="pt-10 px-4 md:px-0">
      <div className="text-center text-2xl mb-12">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20 mb-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2 flex justify-center"
        >
          <div className="bg-background overflow-hidden border border-border p-2 max-w-md w-full shadow-vintage">
            <img
              className="w-full h-auto object-cover grayscale opacity-90"
              src={assets.contact_img}
              alt="Contact Sleeve"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-start w-full lg:w-1/2"
        >
          <div className="bg-background p-8 md:p-10 border border-border shadow-vintage w-full">
            <h3 className="font-serif font-bold text-3xl text-primary mb-8 tracking-tight">
              Our Gallery
            </h3>

            <div className="space-y-6 mb-8 font-sans">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-primary bg-white flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-primary mb-1 uppercase tracking-wide text-sm">
                    Archive Location
                  </p>
                  <p className="text-secondary text-sm">
                   Lalamusa, Gujrat, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-primary bg-white flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-primary mb-1 uppercase tracking-wide text-sm">
                    Curator Hotline
                  </p>
                  <p className="text-secondary text-sm">0308-8305329
</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-primary bg-white flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-primary mb-1 uppercase tracking-wide text-sm">Email Inquiries</p>
                  <p className="text-secondary text-sm">
                   sleevepk@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-border mb-8" />

            <h3 className="font-serif font-bold text-xl text-primary mb-4 tracking-tight">
              Connect With Us
            </h3>
            <div className="flex gap-4 mb-8">
              <NavLink
                to="#"
                className="w-12 h-12 bg-white border border-border flex items-center justify-center text-primary hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <FaInstagram size={20} />
              </NavLink>
              <NavLink
                to="#"
                className="w-12 h-12 bg-white border border-border flex items-center justify-center text-primary hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <MessageCircle size={20} strokeWidth={1.5} />
              </NavLink>
              <NavLink
                to="#"
                className="w-12 h-12 bg-white border border-border flex items-center justify-center text-primary hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <FaFacebookF size={20} />
              </NavLink>
            </div>

            <div className="bg-white p-6 border border-border font-sans">
              <h4 className="font-semibold text-primary mb-2 uppercase tracking-wide text-sm">Join the Archive</h4>
              <p className="text-sm text-secondary mb-4">
                We're always looking for passionate curators to join our gallery team.
              </p>
              <button className="bg-primary hover:bg-black text-white px-6 py-3 text-sm font-medium transition-colors w-full sm:w-auto uppercase tracking-wide">
                Explore Careers
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
