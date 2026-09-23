import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/frontend_assets/assets";
import { ShieldCheck, Zap, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="pt-10 px-4 md:px-0">
      <div className="text-2xl text-center mb-12">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center mb-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2"
        >
          <div className="bg-background overflow-hidden border border-border p-2 shadow-vintage">
            <img
              className="w-full h-auto object-cover grayscale opacity-90"
              src={assets.banner}
              alt="About Sleeve"
            />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center gap-6 lg:w-1/2"
        >
          <h3 className="text-3xl font-serif text-primary tracking-tight">
            Curating the <span className="text-primary italic">Classics.</span>
          </h3>
          <div className="text-secondary leading-relaxed space-y-4 font-sans">
            <p>
              Sleeve is more than just a poster shop - it's a dedicated archive for music enthusiasts.
              We're on a mission to preserve the visual legacy of iconic albums and artists, delivering premium framed artwork that transforms any space into a gallery. 
              Our selections blend authentic vintage aesthetics with museum-quality materials, resulting in pieces that honor the original releases.
            </p>
            <p>
              Since our inception, we've worked tirelessly to source and restore a strict selection of high-fidelity prints 
              that cater to true collectors. From obscure indie imports to timeless rock anthems, we offer the ultimate 
              collection curated for those who appreciate the art of sound.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="text-2xl text-center mb-12">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {[
          {
            icon: <ShieldCheck size={24} className="text-primary" strokeWidth={1.5} />,
            title: "Archival Quality",
            desc: "We meticulously inspect and frame each print to ensure it meets gallery standards for long-lasting display."
          },
          {
            icon: <Zap size={24} className="text-primary" strokeWidth={1.5} />,
            title: "Timeless Curation",
            desc: "Every piece we offer is selected to represent defining moments in music history and culture."
          },
          {
            icon: <HeadphonesIcon size={24} className="text-primary" strokeWidth={1.5} />,
            title: "Collector Support",
            desc: "Our dedicated curation team is available to help you find specific eras, artists, or custom frames."
          }
        ].map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-background border border-border p-8 shadow-vintage hover:shadow-md transition-all duration-300"
          >
            <div className="w-12 h-12 border border-primary bg-white flex items-center justify-center mb-6">
              {item.icon}
            </div>
            <h4 className="text-lg font-serif font-bold text-primary mb-3 tracking-wide">{item.title}</h4>
            <p className="text-sm text-secondary leading-relaxed font-sans">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default About;
