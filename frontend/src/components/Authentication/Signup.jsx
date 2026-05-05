import React from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="flex-1 w-full bg-[#FF6B4A] flex items-center justify-center relative overflow-hidden font-sans p-4 py-16">
      
      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [-10, 10, -10], rotate: 360 }}
        transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 15, repeat: Infinity, ease: "linear" } }}
        className="absolute top-12 left-12 md:top-32 md:left-48 w-24 h-24 rounded-full border-[4px] border-zk-black bg-[#6E5CF2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-none"
      />
      <motion.div 
        animate={{ y: [10, -10, 10], rotate: -360 }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
        className="absolute bottom-12 right-12 md:bottom-24 md:right-48 w-28 h-28 rounded-2xl border-[4px] border-zk-black bg-[#6E5CF2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-none"
      />
      
      {/* Additional small floating shapes */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/4 right-[10%] w-8 h-8 rounded-full border-[3px] border-zk-black bg-[#FFD12B] pointer-events-none hidden md:block"
      />
      <motion.div 
        animate={{ y: [8, -8, 8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-1/4 left-[15%] w-6 h-6 border-[3px] border-zk-black bg-white pointer-events-none hidden md:block rotate-45"
      />

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-zk-black mb-2 tracking-tight">Join the Fun!</h2>
          <p className="text-zk-black/70 font-bold text-sm">Ready to battle and learn? Create your Zinko account now!</p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5">
          
          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Hero Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 text-zk-black/50" size={20} />
              <input 
                type="text" 
                placeholder="Enter your full name" 
                className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 text-zk-black/50" size={20} />
              <input 
                type="email" 
                placeholder="you@awesome.com" 
                className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Secret Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 text-zk-black/50" size={20} />
              <input 
                type="password" 
                placeholder="Shhh... make it strong!" 
                className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all"
              />
            </div>
          </div>

          {/* Create Button */}
          <button 
            type="button"
            className="w-full bg-[#5D3FD3] text-white border-[3px] border-zk-black py-4 font-black text-lg mt-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            CREATE ACCOUNT
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[2px] bg-gray-200"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Or Join With</span>
          <div className="flex-1 h-[2px] bg-gray-200"></div>
        </div>

        {/* Google Button */}
        <button 
          type="button"
          className="w-full bg-white text-zk-black border-[3px] border-zk-black py-3 font-black text-sm flex items-center justify-center gap-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          GOOGLE
        </button>

        {/* Footer Link */}
        <div className="text-center mt-8 text-sm font-bold text-zk-black/80">
          Already a player? <Link to="/signin" className="text-[#5D3FD3] hover:underline decoration-2 underline-offset-4">Sign In here</Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
