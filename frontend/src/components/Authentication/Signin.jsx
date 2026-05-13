import { useState } from 'react';
import { User, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn, useAuth } from '@clerk/clerk-react';

const Signin = () => {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already signed in
  if (isSignedIn) navigate('/');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: form.email,
        password:   form.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.message || 'Sign in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy:            'oauth_google',
      redirectUrl:         '/sso-callback',
      redirectUrlComplete: '/',
    });
  };

  return (
    <div className="flex-1 w-full bg-zk-yellow flex items-center justify-center relative overflow-hidden font-sans p-4 py-16">
      
      {/* Floating Elements */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -left-16 md:top-0 md:left-0 w-48 h-48 md:w-64 md:h-64 rounded-full border-[4px] border-black/10 bg-[#e5bc27] pointer-events-none -translate-x-1/4 -translate-y-1/4"
      />
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-24 -right-24 md:bottom-0 md:right-0 w-64 h-64 md:w-80 md:h-80 rounded-full border-[4px] border-black/10 bg-[#f7a22c] pointer-events-none translate-x-1/4 translate-y-1/4"
      />
      <motion.div 
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-[10%] w-6 h-6 rounded-full border-[3px] border-zk-black bg-white pointer-events-none hidden md:block"
      />
      <motion.div 
        animate={{ y: [10, -10, 10], rotate: 360 }}
        transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }, rotate: { duration: 15, repeat: Infinity, ease: "linear" } }}
        className="absolute top-[20%] right-[15%] w-8 h-8 border-[3px] border-zk-black bg-[#6E5CF2] pointer-events-none hidden md:block rotate-12 rounded-xl"
      />

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10 rounded-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-zk-black mb-2 tracking-tight">Welcome Back!</h2>
          <p className="text-zk-black/70 font-bold text-sm">Ready for another battle?</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 border-[2px] border-red-400 bg-red-50 text-red-600 text-sm font-bold px-4 py-3">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          
          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Email</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 text-zk-black/50" size={20} />
              <input 
                name="email"
                type="email" 
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email..." 
                className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 text-zk-black/50" size={20} />
              <input 
                name="password"
                type="password" 
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                required
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right -mt-2">
            <a href="#" className="text-xs font-bold text-[#5D3FD3] hover:underline decoration-2 underline-offset-4">
              Forgot Password?
            </a>
          </div>

          {/* Log In Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] text-white border-[3px] border-zk-black py-4 font-black text-lg mt-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> Signing in...</> : 'LOG IN'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[2px] bg-gray-200"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Or</span>
          <div className="flex-1 h-[2px] bg-gray-200"></div>
        </div>

        {/* Google Sign In */}
        <button 
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-zk-black border-[3px] border-zk-black py-3 font-black text-sm flex items-center justify-center gap-3 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none rounded-lg"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          CONTINUE WITH GOOGLE
        </button>

        {/* Footer Link */}
        <div className="text-center mt-8 text-sm font-bold text-zk-black/80">
          New to Zinko? <Link to="/signup" className="text-[#FF6B4A] hover:underline decoration-2 underline-offset-4">Sign Up</Link>
        </div>

      </div>
    </div>
  );
};

export default Signin;

