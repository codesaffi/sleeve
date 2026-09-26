import React, { useContext, useState, useRef } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App.jsx";
import { CreditCard, Truck, ShieldCheck, Wallet, Loader2, Info } from "lucide-react";

const InputField = React.memo(({ name, type = "text", placeholder, required = true, value, onChange }) => (
  <input
    required={required}
    onChange={onChange}
    name={name}
    value={value}
    type={type}
    placeholder={placeholder}
    className="w-full bg-white border border-border px-4 py-3.5 outline-none focus:border-primary focus:ring-0 transition-all text-sm text-primary placeholder:text-gray-400 font-sans"
  />
));

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  // Discount States
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const {
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [marketingConsent, setMarketingConsent] = useState(false);

  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const applyDiscount = async () => {
    if (!discountInput.trim()) {
      toast.error("Please enter a discount code.");
      return;
    }
    setValidatingDiscount(true);
    try {
      const response = await axios.post(backendUrl + '/api/discount/validate', { code: discountInput });
      if (response.data.success) {
        toast.success(`Discount code applied — ${response.data.discountPercentage}% off.`);
        setAppliedDiscountCode(response.data.code);
        setDiscountPercentage(response.data.discountPercentage);
        
        // Calculate amount
        const amount = getCartAmount();
        const discountAmt = Math.round((amount * response.data.discountPercentage) / 100);
        setDiscountAmount(discountAmt);
      } else {
        toast.error(response.data.message);
        removeDiscount();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setDiscountInput("");
    setAppliedDiscountCode("");
    setDiscountPercentage(0);
    setDiscountAmount(0);
  };

  const buildOrderItems = () => {
    const orderItems = [];
    for (const galleryItem of cartItems.__galleryItems || []) {
      const product = products.find((entry) => entry._id === galleryItem.productId);
      if (product && galleryItem.productId) {
        orderItems.push({
          ...structuredClone(product),
          productId: product._id,
          galleryDesignId: galleryItem.galleryDesignId,
          designSource: "Gallery",
          quantity: galleryItem.quantity
        });
      }
    }
    for (const items in cartItems) {
      if (items === "__galleryItems") continue;
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          const itemInfo = structuredClone(products.find((product) => product._id === items));
          if (itemInfo) {
            const parts = item.split('|');
            itemInfo.size = parts[0];
            if (parts.length > 1) {
                const customParts = parts[1].split('::');
                const customType = customParts[0];
                if (customType === 'gallery') {
                    itemInfo.designSource = 'Gallery';
                    itemInfo.galleryImageId = customParts[1];
                    itemInfo.customImageUrl = customParts.slice(2).join('::');
                } else if (customType === 'custom') {
                    itemInfo.designSource = 'Customer Upload';
                    itemInfo.customImageUrl = customParts.slice(1).join('::');
                }
            }
            itemInfo.quantity = cartItems[items][item];
            orderItems.push(itemInfo);
          }
        }
      }
    }
    return orderItems;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const orderItems = buildOrderItems();

      if (orderItems.length === 0) {
        toast.error("Your cart is empty.");
        return;
      }

      if ((cartItems.__galleryItems || []).some((item) => !item.productId)) {
        toast.error("Please select a product for all your selected designs before continuing.");
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee, // The backend will recalculate discount on this base amount
        discountCode: appliedDiscountCode,
        paymentMethod: method === "cod" ? "COD" : "Online",
        marketingConsent,
      };

      // If user is logged in, also send userId so cart can be cleared on backend
      if (token) {
        orderData.userId = undefined; // will be injected by auth middleware on the logged-in route
      }

      switch (method) {
        case "cod": {
          if (token) {
            // Logged-in user: use existing protected route (no change)
            const response = await axios.post(
              backendUrl + "/api/order/place",
              orderData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
              toast.success(response.data.message);
              setCartItems({});
              navigate("/orders");
            } else {
              toast.error(response.data.message);
            }
          } else {
            // Guest user: OTP verification flow
            const response = await axios.post(
              backendUrl + "/api/order/request-verification",
              orderData
            );
            if (response.data.success) {
              toast.success(response.data.message);
              const params = new URLSearchParams({
                ref: response.data.orderRef,
                email: formData.email
              });
              navigate(`/verify-order?${params.toString()}`);
            } else {
              toast.error(response.data.message);
            }
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="pt-10 px-4 md:px-0 min-h-[80vh]">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Left Side - Delivery Information */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="mb-8">
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>

          <div className="bg-background p-6 md:p-8 vintage-border shadow-vintage flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-5">
              <InputField name="firstName" placeholder="First Name" value={formData.firstName} onChange={onChangeHandler} />
              <InputField name="lastName" placeholder="Last Name" value={formData.lastName} onChange={onChangeHandler} />
            </div>

            <div>
              <InputField name="email" type="email" placeholder="Email Address" value={formData.email} onChange={onChangeHandler} />
              {/* Email helper notice */}
              <div className="flex items-start gap-2 mt-2 px-1">
                <Info size={14} className="text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs text-secondary leading-relaxed font-sans">
                  Enter a valid email address. We'll send a <span className="font-semibold text-primary">verification code</span> to confirm your order.
                </p>
              </div>
            </div>

            <InputField name="street" placeholder="Street Address" value={formData.street} onChange={onChangeHandler} />

            <div className="flex flex-col sm:flex-row gap-5">
              <InputField name="city" placeholder="City" value={formData.city} onChange={onChangeHandler} />
              <InputField name="state" placeholder="State / Province" value={formData.state} onChange={onChangeHandler} />
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <InputField name="zipcode" type="number" placeholder="ZIP / Postal Code" value={formData.zipcode} onChange={onChangeHandler} />
              <InputField name="country" placeholder="Country" value={formData.country} onChange={onChangeHandler} />
            </div>

            <InputField name="phone" type="number" placeholder="Phone Number" value={formData.phone} onChange={onChangeHandler} />

            {/* Marketing consent — unchecked by default */}
            <label className="flex items-start gap-3 cursor-pointer group mt-2">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border border-border bg-white peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center group-hover:border-primary rounded-none">
                  {marketingConsent && (
                    <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-secondary leading-relaxed font-sans">
                Send me archival updates and special poster drops from Sleeve. (optional)
              </span>
            </label>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 bg-background p-4 vintage-border shadow-vintage">
              <ShieldCheck className="text-primary shrink-0" size={20} strokeWidth={1.5} />
              <p className="text-[11px] uppercase tracking-wide font-semibold text-primary leading-tight">Secure Checkout</p>
            </div>
            <div className="flex items-center gap-3 bg-background p-4 vintage-border shadow-vintage">
              <Truck className="text-primary shrink-0" size={20} strokeWidth={1.5} />
              <p className="text-[11px] uppercase tracking-wide font-semibold text-primary leading-tight">Insured Shipping</p>
            </div>
          </div>
        </div>

        {/* Right Side - Cart Total & Payment */}
        <div className="w-full lg:w-[420px] shrink-0">
          <CartTotal discountPercentage={discountPercentage} discountAmount={discountAmount} />

          {/* Discount Section */}
          <div className="coupon-ticket mt-8 bg-background p-6 vintage-border shadow-vintage">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Discount Code</h3>
            {appliedDiscountCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-green-700 bg-green-100 px-2 py-1 rounded-sm text-xs">
                    {appliedDiscountCode}
                  </span>
                  <span className="text-xs text-green-700 font-medium">Applied</span>
                </div>
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-widest transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 bg-white border border-border px-4 py-3 outline-none focus:border-primary transition-all text-sm font-sans uppercase"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={validatingDiscount}
                  className={`archive-button bg-primary text-background px-6 font-bold tracking-widest text-xs uppercase transition-all flex items-center justify-center ${validatingDiscount ? "opacity-80" : "hover:bg-black active:scale-[0.98]"}`}
                >
                  {validatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-10">
            <div className="mb-6">
              <Title text1={"PAYMENT"} text2={"METHOD"} />
            </div>

            <div className="bg-background p-6 vintage-border shadow-vintage">
              <div className="flex flex-col gap-4">
                {/* COD Option */}
                <div
                  onClick={() => setMethod("cod")}
                  className={`relative flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                    method === "cod" ? "border-primary bg-black/5" : "border-border hover:border-primary"
                  }`}
                >
                  <div className={`w-4 h-4 border flex items-center justify-center shrink-0 rounded-full ${method === "cod" ? "border-primary" : "border-gray-300"}`}>
                    {method === "cod" && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-white flex items-center justify-center text-primary shrink-0 vintage-border">
                      <Wallet size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm font-sans">Cash on Delivery</p>
                      <p className="text-xs text-secondary mt-0.5 font-sans">Pay when you receive</p>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Options (Disabled) */}
                <div className="relative flex items-center gap-4 p-4 border border-border/50 bg-white opacity-60">
                  <div className="w-4 h-4 border border-border shrink-0 rounded-full"></div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-white flex items-center justify-center text-gray-400 shrink-0 border border-border">
                      <CreditCard size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-500 text-sm font-sans">Credit Card</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-sans">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                id="place-order-btn"
                disabled={loading}
                className={`archive-button w-full bg-primary hover:bg-black text-background font-medium tracking-wide py-4 mt-8 transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${loading ? "opacity-80 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="uppercase text-sm">Sending Code...</span>
                  </>
                ) : (
                  <span className="uppercase">
                    {token ? "Place Order Now" : "Place Order"}
                  </span>
                )}
              </button>

              {!token && (
                <p className="text-xs text-secondary text-center mt-3 leading-relaxed">
                  A verification code will be sent to your email to confirm the order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
