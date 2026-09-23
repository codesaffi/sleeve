import axios from 'axios';
import React, { useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({setToken}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(backendUrl + '/api/user/admin', {email, password});

            if (response.data.success) {
                setToken(response.data.token);
            }  else{
                toast.error(response.data.message);
            }   
        } catch (error) {
            toast.error(error.message);
        }
    };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full bg-background halftone-bg p-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-10 left-10 text-[12rem] font-serif font-bold text-primary opacity-[0.03] pointer-events-none select-none uppercase">
            ADMIN
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="flex flex-col items-center">
                    <span className="font-serif font-bold text-5xl tracking-tighter text-primary leading-none">Sleeve<span className="italic font-normal">.</span></span>
                    <span className="text-[10px] font-mono tracking-widest text-primary uppercase mt-2 border-b-2 border-primary pb-1">ARCHIVE CONTROL SYSTEM</span>
                </div>
                <p className="text-primary mt-6 flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest">
                    <ShieldAlert size={14} className="text-primary" />
                    Authorized Personnel Only
                </p>
            </div>

            <div className="bg-[#FAF9F6] border-2 border-primary shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-8 md:p-10 font-sans">
                <form onSubmit={onSubmitHandler} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                                <Mail size={16} />
                            </div>
                            <input 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-3 py-3 pl-10 outline-none focus:border-black focus:ring-0 transition-all text-primary placeholder:text-gray-400 font-mono text-sm" 
                                type="email" 
                                placeholder="admin@sleeve.com" 
                                required 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                                <Lock size={16} />
                            </div>
                            <input 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                className="w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 border-primary px-3 py-3 pl-10 outline-none focus:border-black focus:ring-0 transition-all text-primary placeholder:text-gray-400 font-mono text-sm" 
                                type="password" 
                                placeholder="Enter Access Code" 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-xs tracking-[0.2em] uppercase font-bold text-white bg-primary hover:bg-black transition-transform hover:-translate-y-1 active:translate-y-1 border border-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none mt-8" 
                        type="submit"
                    >
                        <LogIn size={16} className="text-white" />
                        ACCESS DASHBOARD
                    </button>
                </form>
                <div className="mt-8 text-center text-[10px] font-mono text-primary uppercase tracking-widest opacity-50">
                    Sleeve. Admin Portal v2.0
                </div>
            </div>
        </motion.div>
    </div>
  );
};

export default Login;