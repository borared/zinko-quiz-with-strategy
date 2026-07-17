"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { LayoutDashboard, Bell, Settings, LogOut, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useDashboardQuizStore } from '@/store/useDashboardQuizStore';
import { useShopStore } from '@/store/useShopStore';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';
import { useAuthStore, getNavAuthCache, setNavAuthCache, clearNavAuthCache } from '@/store/useAuthStore';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);

  const { unreadCount, fetchNotifications } = useNotificationStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const cartAlertCount = useLibraryCartStore((s) => s.cartAlertCount);
  const cartAlertPending = useLibraryCartStore((s) => s.cartAlertPending);
  const showLibraryCartAlert = cartAlertPending && cartAlertCount > 0;
  const hydrateCart = useLibraryCartStore((s) => s.hydrateCart);

  const [cachedAuth, setCachedAuth] = useState(null);

  useEffect(() => {
    setCachedAuth(getNavAuthCache());
    hydrateCart();
  }, [hydrateCart]);

  useEffect(() => {
    if (isLoaded) {
      setNavAuthCache(isSignedIn, user);
      setCachedAuth(getNavAuthCache());
    }
  }, [isLoaded, isSignedIn, user]);

  const displayIsSignedIn = isLoaded ? isSignedIn : (cachedAuth?.isSignedIn ?? false);
  const displayUser = isLoaded ? user : cachedAuth?.user;
  const showAuthSkeleton = !isLoaded && !cachedAuth;

  useEffect(() => {
    const userId = displayUser?.id;
    if (displayIsSignedIn && userId && isJwtReady) {
      fetchNotifications(userId);
    }
  }, [displayIsSignedIn, displayUser?.id, isJwtReady, fetchNotifications]);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleScroll = () => {
      setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuOpen]);

  const getLinkClass = (path) => {
    // Basic active check based on pathname
    const isActive = pathname?.startsWith(path) && path !== '/';

    // For exact matching (like pricing)
    const isExact = pathname === path;

    if (isActive || isExact) {
      return "bg-[#5D3FD3] text-white border-[2px] border-zk-black px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg font-['Amatic_SC'] text-3xl font-bold cursor-pointer transition-colors leading-none pt-2 animate-float-nav inline-block";
    }
    return "text-zk-black hover:underline decoration-[2px] underline-offset-4 cursor-pointer font-bold font-['Amatic_SC'] text-3xl px-4 py-1 transition-colors leading-none pt-2 inline-block";
  };

  const handleSignOut = () => {
    setShowModal(true);
  };

  // Don't block the whole navbar, just the auth buttons
  const renderAuthButtons = () => {
    if (showAuthSkeleton) {
      return <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-lg" />;
    }

    if (displayIsSignedIn) {
      return (
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/create-game')}
            className="bg-[#5D3FD3] text-white border-[3px] border-zk-black px-6 py-2 transition-colors hover:bg-[#4b33b3] font-['Amatic_SC'] font-bold text-3xl rounded-lg leading-none"
          >
            Create New Quiz
          </button>

          {/* Profile Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-12 h-12 border-[3px] border-zk-black overflow-hidden bg-white cursor-pointer rounded-xl transition-opacity hover:opacity-90"
            >
              <img src={displayUser?.imageUrl} alt={displayUser?.firstName} className="w-full h-full object-cover" />
            </div>
            {/* Unread Badge on Avatar */}
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-[2px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-64 bg-white border-[3px] border-zk-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-50 rounded-xl overflow-hidden"
                >
                  {/* Default Profile Menu */}
                  <>
                    <div className="px-4 py-3 border-b-[2px] border-zk-black bg-zk-yellow/40">
                      <p className="font-bold text-zk-black text-sm truncate">{displayUser?.firstName} {displayUser?.lastName}</p>
                      <p className="text-xs text-zk-black/60 truncate">{displayUser?.email}</p>
                    </div>

                    <button
                      onClick={() => { setMenuOpen(false); router.push('/dashboard'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-yellow/30 border-b-[1px] border-zk-black/10 font-bold text-zk-black text-sm transition-colors"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); router.push('/shop'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-yellow/30 border-b-[1px] border-zk-black/10 font-bold text-zk-black text-sm transition-colors"
                    >
                      <ShoppingBag size={16} /> Shop
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); router.push('/notifications'); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-zk-yellow/30 border-b-[1px] border-zk-black/10 font-bold text-zk-black text-sm transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Bell size={16} /> Notification
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-[1px] border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); router.push('/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-yellow/30 border-b-[2px] border-zk-black font-bold text-zk-black text-sm transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 font-bold text-red-500 text-sm transition-colors"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    return (
      <>
        <button
          onClick={() => router.push('/join')}
          className="bg-zk-blue text-zk-white border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-lg"
        >
          JOIN
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="bg-zk-white text-zk-black border-[3px] border-zk-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none rounded-lg"
        >
          SIGN UP
        </button>
      </>
    );
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b-[4px] border-zk-black bg-zk-yellow px-6 py-4 flex items-center justify-between font-sans">

      {/* Left: Logo */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="bg-zk-white border-[3px] border-zk-black px-4 py-1 flex items-center justify-center transform transition-colors rounded-lg hover:bg-zk-white/90"
        >
          <span className="font-bold text-2xl tracking-tighter italic permanent-marker-regular">Zinko</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-bold text-sm">
          <a
            onClick={() => router.push('/blog')}
            className={getLinkClass('/blog')}
          >
            BLOG
          </a>
          <a
            onClick={() => router.push('/pricing')}
            className={getLinkClass('/pricing')}
          >
            PRICING
          </a>
          <a
            onClick={() => router.push('/classpin')}
            className={getLinkClass('/classpin')}
          >
            CLASSPIN
          </a>
          <a
            onClick={() => router.push('/discovery')}
            className={getLinkClass('/discovery')}
          >
            DISCOVERY
          </a>
          <a
            onClick={() => router.push('/shop')}
            className={getLinkClass('/shop')}
          >
            SHOP
          </a>
          <span className="relative inline-block">
            <a
              onClick={() => router.push('/library')}
              className={getLinkClass('/library')}
            >
              LIBRARY
            </a>
            {showLibraryCartAlert && (
              <span className="absolute -top-1.5 -right-1.5 z-10 bg-red-500 text-white text-[10px] font-black min-w-[1.25rem] h-5 px-1.5 rounded-full border-[2px] border-zk-black !shadow-none flex items-center justify-center pointer-events-none">
                {cartAlertCount > 99 ? '99+' : cartAlertCount}
              </span>
            )}
          </span>
          <a
            onClick={() => router.push('/dashboard')}
            className={getLinkClass('/dashboard')}
          >
            DASHBOARD
          </a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 font-bold text-sm">
        {renderAuthButtons()}
      </div>
      {/* Sign Out Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="bg-zk-white border-[4px] border-zk-black p-8 max-w-sm w-full mx-4 flex flex-col items-center rounded-xl"
          >
            <h3 className="font-['Outfit'] text-2xl font-black uppercase tracking-tight mb-2 text-zk-black">Sign out?</h3>
            <p className="text-zk-black/70 mb-6 text-center font-bold">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-zk-white text-zk-black border-[3px] border-zk-black px-4 py-2 font-black text-2xl rounded-lg transition-colors hover:bg-zk-yellow/20"
                style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  clearNavAuthCache();
                  setCachedAuth(null);
                  useNotificationStore.getState().invalidate();
                  useDashboardQuizStore.getState().invalidate();
                  useShopStore.getState().invalidate();
                  signOut();
                }}
                className="flex-1 bg-[#FF4B4B] text-zk-white border-[3px] border-zk-black px-4 py-2 font-black text-2xl rounded-lg transition-colors hover:bg-[#e63e3e]"
                style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
              >
                SURE!
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
