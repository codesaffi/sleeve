import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Title from "../components/Title";
import {
  User, Mail, Package, Clock, CreditCard, ShieldCheck,
  LogOut, ChevronRight, Loader2, KeyRound, Eye
} from "lucide-react";

// ────────────────────────────────────────────
// Logged-in user profile section
// ────────────────────────────────────────────
const LoggedInProfile = ({ token, currency, formatPrice }) => {
  const navigate = useNavigate();
  const { setToken, setCartItems } = useContext(ShopContext);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          axios.get(backendUrl + "/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.post(backendUrl + "/api/order/userorders", {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (profileRes.data.success) setProfile(profileRes.data.user);
        if (ordersRes.data.success) setOrders(ordersRes.data.orders.slice().reverse());
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="pt-10 px-4 md:px-0 min-h-[80vh]">
      <div className="mb-8"><Title text1="MY" text2="PROFILE" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-background border border-border shadow-vintage p-8 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-white border border-primary flex items-center justify-center mb-4">
            <User size={32} className="text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-serif font-bold text-primary mb-1">{profile?.name || "Collector"}</h2>
          <p className="text-sm text-secondary mb-6 flex items-center gap-1.5 font-sans">
            <Mail size={14} /> {profile?.email}
          </p>
          <div className="w-full border-t border-border pt-4 mt-auto font-sans">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-secondary uppercase tracking-wide">Total Orders</span>
              <span className="font-bold text-primary">{orders.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary uppercase tracking-wide">Status</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <ShieldCheck size={14} strokeWidth={1.5} /> Verified
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-black hover:text-white border border-primary py-2.5 transition-all uppercase tracking-wide font-sans"
          >
            <LogOut size={16} strokeWidth={1.5} /> Sign Out
          </button>
        </motion.div>

        {/* Orders Section */}
        <div className="lg:col-span-2">
          <div className="mb-5"><Title text1="ORDER" text2="HISTORY" /></div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-background border border-border shadow-vintage text-secondary">
              <Package size={56} className="opacity-20 mb-4" strokeWidth={1} />
              <p className="text-lg font-serif font-bold text-primary mb-1">No collections yet</p>
              <p className="text-sm font-sans">Orders you place will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-background border border-border p-5 shadow-vintage hover:shadow-md transition-shadow font-sans"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-xs text-secondary uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-mono text-sm font-bold text-primary">
                        #{order._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-medium text-primary flex items-center gap-1">
                        <Clock size={13} className="text-primary" strokeWidth={1.5} />
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-sm font-bold text-primary">{currency} {formatPrice(order.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-border shadow-sm">
                      <div className={`w-2 h-2 ${order.status === "Delivered" ? "bg-green-500 rounded-full" : "bg-primary animate-pulse"}`} />
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">{order.status}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="flex flex-col gap-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-14 h-14 border border-border bg-white p-1 shrink-0">
                          <img src={item.image?.[0]} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-serif font-bold text-primary truncate tracking-wide">{item.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-secondary mt-1 uppercase tracking-wide">
                            <span className="font-medium text-primary">{currency} {formatPrice(item.price)}</span>
                            <span>Qty: {item.quantity}</span>
                            {item.size && item.size !== "Default" && <span>Frame: {item.size}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 border font-medium uppercase tracking-wide ${
                            order.payment ? "bg-white text-primary border-primary" : "bg-gray-100 text-secondary border-border"
                          }`}>
                            <CreditCard size={11} strokeWidth={1.5} /> {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment status */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-secondary uppercase tracking-wide">
                    <span>Payment: <span className={`font-semibold ${order.payment ? "text-primary" : "text-secondary"}`}>
                      {order.payment ? "Paid" : "Pending (COD)"}
                    </span></span>
                    <span className="text-primary font-semibold">Total: {currency} {formatPrice(order.amount)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Guest profile — email OTP verification flow
// ────────────────────────────────────────────
const GuestProfile = ({ currency, formatPrice }) => {
  const { setToken } = useContext(ShopContext);
  const [step, setStep] = useState("email"); // "email" | "otp" | "orders" | "create-password"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const storedEmailToken = localStorage.getItem("emailToken");
    if (storedEmailToken) {
      const checkStatus = async () => {
        try {
          const res = await axios.get(backendUrl + "/api/user/check-status", {
            headers: { "x-email-token": storedEmailToken }
          });
          if (res.data.success) {
            setEmail(res.data.email);
            setEmailToken(storedEmailToken);
            if (!res.data.hasPassword) {
              setStep("create-password");
            } else {
              localStorage.removeItem("emailToken");
            }
          } else {
            localStorage.removeItem("emailToken");
          }
        } catch (error) {
          localStorage.removeItem("emailToken");
        }
      };
      checkStatus();
    }
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/user/request-email-otp", { email });
      if (res.data.success) {
        setOrderRef(res.data.orderRef);
        setStep("otp");
        startCountdown();
        toast.success("Verification code sent to your email.");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/user/verify-email-otp", { orderRef, otp });
      if (res.data.success) {
        setEmailToken(res.data.emailToken);
        
        // Check if they need to create a password
        const statusRes = await axios.get(backendUrl + "/api/user/check-status", {
          headers: { "x-email-token": res.data.emailToken }
        });
        
        if (statusRes.data.success && !statusRes.data.hasPassword) {
          setStep("create-password");
        } else {
          // Fetch orders (fallback just in case)
          const ordersRes = await axios.get(backendUrl + "/api/order/orders-by-email", {
            headers: { "x-email-token": res.data.emailToken }
          });
          if (ordersRes.data.success) {
            setOrders(ordersRes.data.orders);
            setStep("orders");
          } else {
            toast.error(ordersRes.data.message);
          }
        }
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/user/request-email-otp", { email });
      if (res.data.success) {
        setOrderRef(res.data.orderRef);
        setOtp("");
        startCountdown();
        toast.success("New verification code sent.");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/user/create-password", { password }, {
        headers: { "x-email-token": emailToken }
      });
      if (res.data.success) {
        toast.success("Account created successfully");
        localStorage.removeItem("emailToken");
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-10 px-4 md:px-0 min-h-[80vh]">
      <div className="mb-8"><Title text1="MY" text2="PROFILE" /></div>

      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto bg-background border border-border shadow-vintage p-8"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-white border border-primary mx-auto mb-5">
              <Eye size={24} className="text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-serif font-bold text-primary text-center mb-2">View Your Archive</h2>
            <p className="text-sm text-secondary text-center mb-6 leading-relaxed font-sans">
              Enter the email used during checkout. We'll send a verification code to confirm it's you.
            </p>
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full bg-white border border-border px-4 py-3.5 outline-none focus:border-primary focus:ring-0 transition-all text-sm text-primary font-sans placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-black text-background font-medium py-3.5 flex items-center justify-center gap-2 transition-all shadow-vintage active:scale-[0.98] disabled:opacity-70 uppercase tracking-wide text-sm font-sans"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Request Code <ChevronRight size={18} strokeWidth={1.5} /></>}
              </button>
            </form>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto bg-background border border-border shadow-vintage p-8"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-white border border-primary mx-auto mb-5">
              <KeyRound size={24} className="text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-serif font-bold text-primary text-center mb-2">Enter Seal</h2>
            <p className="text-sm text-secondary text-center mb-1 font-sans">We sent a 6-digit code to</p>
            <p className="text-sm font-semibold text-primary text-center mb-6 font-sans">{email}</p>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full bg-white border border-border px-4 py-4 outline-none focus:border-primary focus:ring-0 transition-all text-3xl font-mono text-center tracking-[0.4em] text-primary placeholder:text-gray-300 placeholder:tracking-normal placeholder:text-base font-sans"
              />
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-primary hover:bg-black text-background font-medium py-3.5 flex items-center justify-center gap-2 transition-all shadow-vintage active:scale-[0.98] disabled:opacity-70 uppercase tracking-wide text-sm font-sans"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "View My Archive"}
              </button>
            </form>

            <div className="mt-4 text-center font-sans">
              {countdown > 0 ? (
                <p className="text-sm text-secondary">Resend code in <span className="font-bold text-primary">{countdown}s</span></p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm font-medium text-primary hover:underline transition-colors uppercase tracking-wide"
                >
                  Resend Code
                </button>
              )}
            </div>
            <button onClick={() => setStep("email")} className="mt-3 w-full text-xs text-secondary hover:text-primary text-center transition-colors font-sans">
              ← Use a different email
            </button>
          </motion.div>
        )}

        {step === "create-password" && (
          <motion.div
            key="create-password-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto bg-background border border-border shadow-vintage p-8 font-sans"
          >
            <div className="flex items-center justify-center w-14 h-14 bg-white border border-primary mx-auto mb-5">
              <ShieldCheck size={24} className="text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-serif font-bold text-primary text-center mb-2">Create Your Archive</h2>
            <p className="text-sm text-secondary text-center mb-6 leading-relaxed">
              Your email <span className="font-semibold text-primary">{email}</span> has already been verified. Create a password to access your profile.
            </p>
            <form onSubmit={handleCreatePassword} className="flex flex-col gap-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 characters)"
                required
                minLength={8}
                className="w-full bg-white border border-border px-4 py-3.5 outline-none focus:border-primary focus:ring-0 transition-all text-sm text-primary"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                minLength={8}
                className="w-full bg-white border border-border px-4 py-3.5 outline-none focus:border-primary focus:ring-0 transition-all text-sm text-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-black text-background font-medium py-3.5 flex items-center justify-center gap-2 transition-all shadow-vintage active:scale-[0.98] disabled:opacity-70 mt-2 uppercase tracking-wide text-sm"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Create Account"}
              </button>
            </form>
          </motion.div>
        )}

        {step === "orders" && (
          <motion.div
            key="orders-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5 flex items-center justify-between font-sans">
              <div><Title text1="ORDER" text2="HISTORY" /></div>
              <p className="text-sm text-secondary">Showing orders for <span className="font-semibold text-primary">{email}</span></p>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-background border border-border shadow-vintage text-secondary font-sans">
                <Package size={56} className="opacity-20 mb-4" strokeWidth={1} />
                <p className="text-lg font-serif font-bold text-primary mb-1">No collections found</p>
                <p className="text-sm">No orders are associated with this email.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 font-sans">
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="bg-background border border-border p-5 shadow-vintage hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs text-secondary uppercase tracking-wider mb-1">Order ID</p>
                        <p className="font-mono text-sm font-bold text-primary">#{order._id?.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary uppercase tracking-wider mb-1">Date</p>
                        <p className="text-sm font-medium text-primary flex items-center gap-1">
                          <Clock size={13} className="text-primary" strokeWidth={1.5} />
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary uppercase tracking-wider mb-1">Amount</p>
                        <p className="text-sm font-bold text-primary">{currency} {formatPrice(order.amount)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-border shadow-sm">
                        <div className={`w-2 h-2 ${order.status === "Delivered" ? "bg-green-500 rounded-full" : "bg-primary animate-pulse"}`} />
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">{order.status}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-14 h-14 border border-border bg-white p-1 shrink-0">
                            <img src={item.image?.[0]} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-serif font-bold text-primary truncate tracking-wide">{item.name}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-secondary mt-1 uppercase tracking-wide">
                              <span className="font-medium text-primary">{currency} {formatPrice(item.price)}</span>
                              <span>Qty: {item.quantity}</span>
                              {item.size && item.size !== "Default" && <span>Frame: {item.size}</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-medium text-secondary uppercase tracking-wide">{order.paymentMethod}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-secondary uppercase tracking-wide">
                      <span>Payment: <span className={`font-semibold ${order.payment ? "text-primary" : "text-secondary"}`}>
                        {order.payment ? "Paid" : "Pending (COD)"}
                      </span></span>
                      <span className="text-primary font-semibold">Total: {currency} {formatPrice(order.amount)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ────────────────────────────────────────────
// Main Profile page — switches on login state
// ────────────────────────────────────────────
const Profile = () => {
  const { token, currency, formatPrice } = useContext(ShopContext);

  return token
    ? <LoggedInProfile token={token} currency={currency} formatPrice={formatPrice} />
    : <GuestProfile currency={currency} formatPrice={formatPrice} />;
};

export default Profile;
