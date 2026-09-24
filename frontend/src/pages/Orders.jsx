import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { backendUrl } from "../App";
import { Package, Clock, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Orders = () => {
  const { token, currency, formatPrice } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrderData([...response.data.orders].reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="pt-10 px-4 md:px-0 min-h-[70vh]">
      <div className="text-2xl mb-8">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {orderData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-secondary bg-background vintage-border shadow-vintage">
          <Package
            size={64}
            className="mb-4 opacity-20"
            strokeWidth={1}
          />

          <h2 className="text-2xl font-serif text-primary mb-2">
            No archive finds yet
          </h2>

          <p className="font-sans">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orderData.map((order, index) => {
            const totalQty = order.items.reduce(
              (acc, item) => acc + item.quantity,
              0
            );

            const firstItem = order.items[0];

            return (
              <motion.div
                key={order._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className="bg-background border border-border p-4 sm:p-6 shadow-vintage flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                {/* Product Information */}
                <div className="flex items-start sm:items-center gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-border p-1 shrink-0 relative">
                    {firstItem && firstItem.image?.[0] && (
                      <img
                        className="w-full h-full object-cover"
                        src={firstItem.image[0]}
                        alt="Order image"
                      />
                    )}

                    {totalQty > 1 && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {totalQty}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <p className="sm:text-lg font-serif font-bold text-primary mb-2 tracking-wide">
                      Order #{order._id?.slice(-6).toUpperCase()}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-secondary mb-3 font-sans">
                      <span className="font-semibold text-primary text-base">
                        {currency} {formatPrice(order.amount)}
                      </span>

                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 border border-border font-medium">
                        Total Items: x{totalQty}
                      </span>

                      {firstItem && (
                        <span className="flex items-center gap-1 bg-black/5 px-2 py-0.5 border border-primary/20 text-xs text-primary/80">
                          {firstItem.name}
                          {order.items.length > 1 ? " & more" : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-secondary font-sans">
                      <span className="flex items-center gap-1.5 uppercase tracking-wide">
                        <Clock
                          size={14}
                          className="text-gray-400"
                          strokeWidth={1.5}
                        />
                        {order.date
                          ? new Date(order.date).toDateString()
                          : "Date unavailable"}
                      </span>

                      <span className="flex items-center gap-1.5 uppercase tracking-wide">
                        <CreditCard
                          size={14}
                          className="text-gray-400"
                          strokeWidth={1.5}
                        />
                        {order.paymentMethod || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Status / Tracking */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row justify-between md:justify-center items-center gap-4 sm:w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-border">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 border border-border sm:mr-auto md:mr-0 rounded-none shadow-vintage">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-500"
                          : "bg-primary animate-pulse"
                      }`}
                    />

                    <p className="text-sm font-medium text-primary font-sans uppercase tracking-wide">
                      {order.status || "Processing"}
                    </p>
                  </div>

                  <button
                    onClick={loadOrderData}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-background font-medium px-6 py-2 transition-all hover:bg-black font-sans uppercase tracking-wide text-sm"
                  >
                    Track Parcel
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;