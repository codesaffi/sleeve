import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2, KeyRound, CheckCircle, RefreshCw, ChevronRight, Mail } from "lucide-react";

const OrderVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCartItems, token } = useContext(ShopContext);

  const orderRef = searchParams.get("ref");
  const emailParam = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);
  const submitLockRef = useRef(false);

  // Start the 60-second resend countdown on mount
  useEffect(() => {
    if (!orderRef || !emailParam) {
      toast.error("Invalid verification session. Please start your order again.");
      navigate("/place-order");
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || loading || otp.length < 6) return;
    submitLockRef.current = true;
    setLoading(true);

    try {
      const res = await axios.post(backendUrl + "/api/order/verify-otp", { orderRef, otp: otp.trim() });

      if (res.data.success) {
        setConfirmedOrderId(res.data.orderId);
        setConfirmed(true);
        if (res.data.emailToken) {
          localStorage.setItem("emailToken", res.data.emailToken);
        }
        // Clear cart if logged-in user placed the order
        if (token) setCartItems({});
        toast.success("Order confirmed!");
      } else {
        toast.error(res.data.message);
        // Don't stay locked — allow retry
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      submitLockRef.current = false;
    }
  };

  const handleResend = async () => {
    if (resending || countdown > 0) return;
    setResending(true);
    setOtp("");

    try {
      const res = await axios.post(backendUrl + "/api/order/resend-otp", { orderRef });
      if (res.data.success) {
        // Reset countdown
        clearInterval(timerRef.current);
        setCountdown(60);
        timerRef.current = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) { clearInterval(timerRef.current); return 0; }
            return c - 1;
          });
        }, 1000);
        toast.success("New verification code sent.");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // ── Success State ──────────────────────────────────────────────
  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex items-center justify-center px-4 py-12"
      >
        <div className="max-w-md w-full bg-background vintage-border shadow-vintage p-10 text-center">
          <div className="w-20 h-20 rounded-full border border-primary flex items-center justify-center mx-auto mb-6 bg-white">
            <CheckCircle size={36} className="text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-serif text-primary mb-2">Order Confirmed</h2>
          <p className="text-secondary mb-1 font-sans">Your collection piece has been secured.</p>
          {confirmedOrderId && (
            <p className="text-sm text-secondary mb-6 font-sans">
              Order ID: <span className="font-mono font-bold text-primary">
                #{confirmedOrderId.slice(-8).toUpperCase()}
              </span>
            </p>
          )}
          <p className="text-sm text-secondary mb-8 font-sans">
            A confirmation scroll has been dispatched to <span className="font-semibold text-primary">{emailParam}</span>.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-full bg-primary hover:bg-black text-background font-medium py-3.5 flex items-center justify-center gap-2 transition-all tracking-wide uppercase text-sm"
            >
              View Archive <ChevronRight size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-primary text-primary font-medium py-3 hover:bg-black/5 transition-all tracking-wide uppercase text-sm"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── OTP Entry Form ─────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[80vh] flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-md w-full bg-background vintage-border shadow-vintage p-8 md:p-10">

        {/* Header */}
        <div className="flex items-center justify-center w-16 h-16 border border-primary bg-white mx-auto mb-6">
          <KeyRound size={28} className="text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-serif text-primary text-center mb-2">Verify Your Order</h2>
        <p className="text-sm text-secondary text-center mb-1 font-sans">
          Enter the 6-digit seal sent to
        </p>
        <div className="flex items-center justify-center gap-2 mb-8">
          <Mail size={15} className="text-primary" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-primary font-sans">{emailParam}</p>
        </div>

        {/* OTP Input */}
        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <div>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              autoFocus
              required
              className="w-full bg-white border border-border px-4 py-5 outline-none focus:border-primary focus:ring-0 transition-all text-4xl font-mono text-center tracking-[0.5em] text-primary placeholder:text-gray-200 placeholder:tracking-normal placeholder:text-xl rounded-none"
            />
            <p className="text-xs text-secondary text-center mt-3 font-sans">
              Code expires in 10 minutes · Single use only
            </p>
          </div>

          <button
            type="submit"
            id="confirm-order-btn"
            disabled={loading || otp.length < 6}
            className="w-full bg-primary hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-background font-medium py-4 flex items-center justify-center gap-3 transition-all tracking-wide uppercase active:scale-[0.98] text-sm"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Verifying Seal...</>
            ) : (
              <>Confirm Order <ChevronRight size={18} strokeWidth={1.5} /></>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-secondary font-sans">
              Request new seal in <span className="font-bold text-primary tabular-nums">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-primary hover:text-black flex items-center justify-center gap-2 mx-auto transition-colors font-sans uppercase tracking-wide"
            >
              {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} strokeWidth={1.5} />}
              Resend Verification Code
            </button>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-xs text-secondary text-center leading-relaxed font-sans">
            Lost the seal? Check your spam folder, or{" "}
            <button onClick={() => navigate("/place-order")} className="text-primary hover:underline font-medium">
              go back and re-enter
            </button>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderVerify;
