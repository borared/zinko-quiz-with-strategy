"use client";
import { useState, useEffect } from 'react';
import { User, Lock, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignIn, useAuth, useClerk, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';

const Signin = () => {
  const { signIn, setActive } = useSignIn();
  const { isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '', code: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetStep, setResetStep] = useState('none'); // 'none' or 'verification'

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const completeSignIn = async (createdSessionId) => {
    await setActive({ session: createdSessionId });
    try {
      const clerkToken = await getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const { token } = await response.json();
        if (token) {
          localStorage.setItem('zinko_jwt', token);
          useAuthStore.getState().setJwtReady(true);
        }
      }
    } catch (backendErr) {
      console.error('Failed to fetch custom JWT:', backendErr);
    }
    router.push('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signIn) {
      setError("Sign in not ready yet. Please wait a moment and try again.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: form.email,
        password:   form.password,
      });

      if (result.status === 'complete') {
        await completeSignIn(result.createdSessionId);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: form.email,
      });
      setResetStep('verification');
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: form.code,
        password: form.newPassword,
      });

      if (result.status === 'complete') {
        await completeSignIn(result.createdSessionId);
      } else {
        setError('Password reset could not be completed. Please try again.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const clerkSignIn = clerk.client?.signIn;
      if (!clerkSignIn) {
        setError('Clerk not ready yet. Please refresh and try again.');
        return;
      }
      await clerkSignIn.authenticateWithRedirect({
        strategy:            'oauth_google',
        redirectUrl:         window.location.origin + '/sso-callback',
        redirectUrlComplete: window.location.origin,
      });
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Google sign in failed');
    }
  };

  return (
    <>
      <ClerkLoading>
        <div className="flex-1 w-full bg-zk-yellow flex items-center justify-center relative overflow-hidden font-sans p-4 py-16">
          <Loader2 className="animate-spin text-[#5D3FD3]" size={48} />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <div className="flex-1 w-full bg-zk-yellow flex items-center justify-center relative overflow-hidden font-sans p-4 py-16">
          
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: 360 }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 15, repeat: Infinity, ease: "linear" } }}
            className="absolute -top-16 -left-16 md:top-0 md:left-0 w-32 h-32 rounded-full border-[4px] border-zk-black bg-[#FF6B4A] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] pointer-events-none hidden md:block"
          />
          <motion.div 
            animate={{ y: [10, -10, 10], rotate: -360 }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
            className="absolute -bottom-16 -right-16 md:bottom-0 md:right-0 w-40 h-40 rounded-2xl border-[4px] border-zk-black bg-[#00C2FF] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] pointer-events-none hidden md:block"
          />
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/4 right-[10%] w-8 h-8 rounded-full border-[3px] border-zk-black bg-[#FFD12B] pointer-events-none hidden md:block"
          />
          <motion.div 
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-1/4 left-[10%] w-6 h-6 border-[3px] border-zk-black bg-white pointer-events-none hidden md:block rotate-45 rounded-xl"
          />

          {/* Main Card Container */}
          <div className="relative z-10 w-full max-w-md bg-white border-[4px] border-zk-black p-8 md:p-10 rounded-xl">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-zk-black mb-2 tracking-tight">
                {resetStep === 'verification' ? 'Check your email' : 'Welcome Back!'}
              </h2>
              <p className="text-zk-black/70 font-bold text-sm">
                {resetStep === 'verification' ? `We sent a code to ${form.email}` : 'Ready for another battle?'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 border-[2px] border-red-400 bg-red-50 text-red-600 text-sm font-bold px-4 py-3">
                {error}
              </div>
            )}

            {resetStep === 'none' ? (
              <>
                {/* Form */}
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  
                  {/* Email Field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Email Address</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 text-zk-black/50" size={20} />
                      <input 
                        name="email"
                        type="email" 
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@awesome.com" 
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
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-xs font-bold text-[#5D3FD3] hover:underline decoration-2 underline-offset-4 disabled:opacity-60"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Log In Button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] text-white border-[3px] border-zk-black py-4 font-black text-lg mt-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
                  >
                    {loading ? <><Loader2 className="animate-spin" size={20} /> Loading...</> : 'LOG IN'}
                  </button>

                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-[2px] bg-gray-200"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Or</span>
                  <div className="flex-1 h-[2px] bg-gray-200"></div>
                </div>

                {/* Google Button */}
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-zk-black border-[3px] border-zk-black py-3 font-black text-sm flex items-center justify-center gap-3 transition-opacity hover:opacity-90 rounded-lg"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  CONTINUE WITH GOOGLE
                </button>

                {/* Footer Link */}
                <div className="text-center mt-8 text-sm font-bold text-zk-black/80">
                  New hero? <Link href="/signup" className="text-[#5D3FD3] hover:underline decoration-2 underline-offset-4">Create an account</Link>
                </div>
              </>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Verification Code</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 text-zk-black/50" size={20} />
                    <input 
                      name="code"
                      type="text" 
                      value={form.code}
                      onChange={handleChange}
                      placeholder="6-digit code" 
                      className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-zk-black uppercase tracking-wider">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 text-zk-black/50" size={20} />
                    <input 
                      name="newPassword"
                      type="password" 
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      className="w-full border-[3px] border-zk-black pl-10 pr-4 py-3 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] text-white border-[3px] border-zk-black py-4 font-black text-lg mt-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
                >
                  {loading ? <><Loader2 className="animate-spin" size={20} /> Loading...</> : 'RESET PASSWORD'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetStep('none');
                    setForm(f => ({ ...f, code: '', newPassword: '' }));
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full text-sm font-bold text-zk-black/70 hover:text-zk-black hover:underline mt-2"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      </ClerkLoaded>
    </>
  );
};

export default Signin;