import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../App";
import { motion } from "framer-motion";
import { User, Mail, Lock, LogIn, UserPlus } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(
          backendUrl + '/api/user/register',
          { name, email, password }
        );
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          backendUrl + '/api/user/login',
          { email, password }
        );
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-background p-8 md:p-10 border border-border shadow-vintage"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-serif font-bold text-primary tracking-tight">
            {currentState === "Login" ? "Welcome Back" : "Join the Archive"}
          </h2>
          <p className="mt-3 text-center text-sm text-secondary font-sans">
            {currentState === "Login" ? "Sign in to access your collection." : "Create an account to start curating."}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={onSubmitHandler}>
          <div className="space-y-4">
            {currentState !== "Login" && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                  <User size={18} strokeWidth={1.5} />
                </div>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3.5 pl-11 border border-border bg-white placeholder-gray-400 text-primary focus:outline-none focus:ring-0 focus:border-primary focus:z-10 sm:text-sm transition-colors rounded-none font-sans"
                  placeholder="Full Name"
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                <Mail size={18} strokeWidth={1.5} />
              </div>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3.5 pl-11 border border-border bg-white placeholder-gray-400 text-primary focus:outline-none focus:ring-0 focus:border-primary focus:z-10 sm:text-sm transition-colors rounded-none font-sans"
                placeholder="Email Address"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                <Lock size={18} strokeWidth={1.5} />
              </div>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3.5 pl-11 border border-border bg-white placeholder-gray-400 text-primary focus:outline-none focus:ring-0 focus:border-primary focus:z-10 sm:text-sm transition-colors rounded-none font-sans"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">
              {currentState === "Login" && (
                <span className="font-medium text-secondary hover:text-primary cursor-pointer transition-colors font-sans">
                  Forgot your password?
                </span>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold text-background bg-primary hover:bg-black focus:outline-none transition-all shadow-vintage active:scale-[0.98] uppercase tracking-wide"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {currentState === "Login" ? (
                  <LogIn className="h-5 w-5 text-background/70 group-hover:text-background transition-colors" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <UserPlus className="h-5 w-5 text-background/70 group-hover:text-background transition-colors" strokeWidth={1.5} aria-hidden="true" />
                )}
              </span>
              {currentState === "Login" ? "Sign In" : "Create Account"}
            </button>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-secondary font-sans">
              {currentState === "Login" ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => setCurrentState(currentState === "Login" ? "Sign Up" : "Login")}
                className="font-bold text-primary hover:underline cursor-pointer transition-colors"
              >
                {currentState === "Login" ? "Sign up now" : "Sign in instead"}
              </span>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
