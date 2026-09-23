import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { motion } from "framer-motion";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    <div className="py-16 md:py-24 bg-background border-t border-border mt-10">
      <div className="text-center mb-12">
        <Title text1={"NEW"} text2={"ARRIVALS"} />
        <p className="w-full md:w-3/4 m-auto text-secondary text-sm md:text-base max-w-2xl leading-relaxed">
          Discover our newest acquisitions. Authentic prints and rare album artworks freshly added to the archive.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default LatestCollection;
