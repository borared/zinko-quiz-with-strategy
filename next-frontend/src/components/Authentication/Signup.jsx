"use client";
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Loader2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignUp, useAuth, useSignIn, useClerk, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import FunLoadingScreen from '@/components/global/FunLoadingScreen';

const Signup = () => {
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const router = useRouter();

  const [form, setForm] = useState({ firstName: '', email: '', password: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) router.push('/');
  }, [isSignedIn, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    setError('');

    try {
      // Split Hero Name into First and Last Name in case Clerk requires Last Name
      const nameParts = form.firstName.trim().split(' ');
      const fName = nameParts[0] || 'Player';
      const lName = nameParts.slice(1).join(' ') || 'Zinko';

      const result = await signUp.create({
        firstName:    fName,
        lastName:     lName,
        emailAddress: form.email,
        password:     form.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else if (result.status === 'missing_requirements' && result.unverifiedFields?.includes('email_address')) {
        // Prepare email verification
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else {
        console.log('Additional steps needed. Result:', JSON.stringify(result, null, 2));
        setError(`Missing requirements: ${result.missingFields?.join(', ') || 'Check console'}`);
      }
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.message || 'Sign up failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: form.code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.message || 'Verification failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      // Clerk v7: use clerk.client.signIn (full resource) for OAuth
      const clerkSignIn = clerk.client?.signIn;
      if (!clerkSignIn) {
        setGoogleLoading(false);
        setError('Clerk not ready yet. Please refresh and try again.');
        return;
      }
      await clerkSignIn.authenticateWithRedirect({
        strategy:            'oauth_google',
        redirectUrl:         window.location.origin + '/sso-callback',
        redirectUrlComplete: window.location.origin,
      });
    } catch (err) {
      setGoogleLoading(false);
      const msg = err.errors?.[0]?.longMessage || err.message || 'Failed to start Google sign up.';
      setError(msg);
    }
  };

  return (
    <>
      <ClerkLoading>
        <FunLoadingScreen fullScreen={true} />
      </ClerkLoading>
      <ClerkLoaded>
        <div className="flex-1 w-full bg-[#FF6B4A] flex items-center justify-center relative overflow-hidden font-sans p-4 py-16">
          
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [-10, 10, -10], rotate: 360 }}
            transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 15, repeat: Infinity, ease: "linear" } }}
            className="absolute top-12 left-12 md:top-32 md:left-48 w-24 h-24 rounded-full border-[4px] border-zk-border bg-[#6E5CF2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-none"
          />
          <motion.div 
            animate={{ y: [10, -10, 10], rotate: -360 }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
            className="absolute bottom-12 right-12 md:bottom-24 md:right-48 w-28 h-28 rounded-2xl border-[4px] border-zk-border bg-[#6E5CF2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-none"
          />
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/4 right-[10%] w-8 h-8 rounded-full border-[3px] border-zk-border bg-[#FFD12B] pointer-events-none hidden md:block"
          />
          <motion.div 
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-1/4 left-[15%] w-6 h-6 border-[3px] border-zk-border bg-zk-panel-bg pointer-events-none hidden md:block rotate-45 rounded-xl"
          />

          {/* Main Card Container */}
          <div className="relative z-10 w-full max-w-md bg-zk-panel-bg border-[4px] border-zk-border p-8 md:p-10 rounded-xl">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-zk-text mb-2 tracking-tight">
                {pendingVerification ? 'Verify Email' : 'Join the Fun!'}
              </h2>
              <p className="text-zk-text/70 font-bold text-sm">
                {pendingVerification 
                  ? 'We sent a secret code to your email.' 
                  : 'Ready to battle and learn? Create your Zinko account now!'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 border-[2px] border-red-400 bg-red-50 text-red-600 text-sm font-bold px-4 py-3">
                {error}
              </div>
            )}

            {!pendingVerification ? (
              <>
                {/* Form */}
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              
              {/* Name Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zk-text uppercase tracking-wider">Hero Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-zk-text/50" size={20} />
                  <input 
                    name="firstName"
                    type="text" 
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter your full name" 
                    className="w-full border-[3px] border-zk-border pl-10 pr-4 py-3 font-bold text-zk-text placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zk-text uppercase tracking-wider">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-zk-text/50" size={20} />
                  <input 
                    name="email"
                    type="email" 
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@awesome.com" 
                    className="w-full border-[3px] border-zk-border pl-10 pr-4 py-3 font-bold text-zk-text placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zk-text uppercase tracking-wider">Secret Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-zk-text/50" size={20} />
                  <input 
                    name="password"
                    type="password" 
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Shhh... make it strong!" 
                    className="w-full border-[3px] border-zk-border pl-10 pr-4 py-3 font-bold text-zk-text placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Create Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#5D3FD3] text-white border-[3px] border-zk-border py-4 font-black text-lg mt-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Creating...</> : 'CREATE ACCOUNT'}
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
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full bg-zk-panel-bg text-zk-text border-[3px] border-zk-border py-3 font-black text-sm flex items-center justify-center gap-3 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              )}
              {googleLoading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}
            </button>
          </>
          ) : (
            /* Verification Form */
            <form className="flex flex-col gap-5" onSubmit={handleVerifySubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zk-text uppercase tracking-wider">Verification Code</label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 text-zk-text/50" size={20} />
                  <input 
                    name="code"
                    type="text" 
                    value={form.code}
                    onChange={handleChange}
                    placeholder="123456" 
                    className="w-full border-[3px] border-zk-border pl-10 pr-4 py-3 font-bold text-zk-text placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all rounded-xl tracking-widest text-center text-xl"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#FFD12B] text-zk-text border-[3px] border-zk-border py-4 font-black text-lg mt-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Verifying...</> : 'VERIFY EMAIL'}
              </button>
            </form>
          )}

            {/* Footer Link */}
            <div className="text-center mt-8 text-sm font-bold text-zk-text/80">
              Already a player? <Link href="/signin" className="text-[#5D3FD3] hover:underline decoration-2 underline-offset-4">Sign In here</Link>
            </div>

          </div>
        </div>
      </ClerkLoaded>
    </>
  );
};

export default Signup;
