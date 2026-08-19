"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { LayoutDashboard, Bell, Settings, LogOut, ShoppingBag, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useDashboardQuizStore } from '@/store/useDashboardQuizStore';
import { useShopStore } from '@/store/useShopStore';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';
import { useAuthStore, getNavAuthCache, setNavAuthCache, clearNavAuthCache } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import ThemeToggle from './ThemeToggle';
import NotificationSidebar from './NotificationSidebar';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isDashboardView = mounted && pathname && ['/dashboard', '/discovery', '/library', '/create-game', '/create-picture-race', '/flashcard', '/classpin', '/reports'].some(p => pathname.startsWith(p));
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fetchProfileIfNotCached = useProfileStore((s) => s.fetchProfileIfNotCached);

  const { unreadCount, fetchNotifications } = useNotificationStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const cartAlertCount = useLibraryCartStore((s) => s.cartAlertCount);
  const cartAlertPending = useLibraryCartStore((s) => s.cartAlertPending);
  const showLibraryCartAlert = cartAlertPending && cartAlertCount > 0;
  const hydrateCart = useLibraryCartStore((s) => s.hydrateCart);

  const [cachedAuth, setCachedAuth] = useState(null);

  useEffect(() => {
    setMounted(true);
    const cached = getNavAuthCache();
    setCachedAuth(cached);
    hydrateCart();
    if (cached?.isSignedIn && cached?.user?.username) {
      fetchProfileIfNotCached(cached.user.username);
    }
  }, [hydrateCart, fetchProfileIfNotCached]);

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


  useEffect(() => {
    if (displayIsSignedIn && displayUser?.username) {
      fetchProfileIfNotCached(displayUser.username);
    }
  }, [displayIsSignedIn, displayUser?.username, fetchProfileIfNotCached]);

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
    if (!mounted || !pathname) {
      return "text-zk-text underline decoration-transparent hover:decoration-current decoration-[2px] underline-offset-4 cursor-pointer font-bold font-['Amatic_SC'] text-2xl px-4 py-1 transition-colors leading-none pt-2 inline-block";
    }
    // Basic active check based on pathname
    const isActive = pathname?.startsWith(path) && path !== '/';

    // For exact matching (like pricing)
    const isExact = pathname === path;

    if (isActive || isExact) {
      return "bg-[#5D3FD3] text-white border-[2px] border-zk-border px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg font-['Amatic_SC'] text-2xl font-bold cursor-pointer transition-colors leading-none pt-2 animate-float-nav inline-block";
    }
    return "text-zk-text underline decoration-transparent hover:decoration-current decoration-[2px] underline-offset-4 cursor-pointer font-bold font-['Amatic_SC'] text-2xl px-4 py-1 transition-colors leading-none pt-2 inline-block";
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
            onClick={() => router.push('/join')}
            className="bg-[#5D3FD3] text-white border-2 border-zk-border px-8 py-2 transition-colors hover:bg-[#4b33b3] font-['Amatic_SC'] font-bold text-2xl rounded-lg leading-none tracking-wider"
          >
            Join
          </button>

          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 rounded-xl border-2 border-zk-border bg-zk-panel-bg text-zk-text hover:opacity-90 transition-all h-12 w-12 flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-[2px] border-black z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </button>

          {/* Profile Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              onMouseEnter={() => displayUser?.username && fetchProfileIfNotCached(displayUser.username)}
              className="relative w-12 h-12 border-2 border-zk-border overflow-hidden bg-zk-panel-bg cursor-pointer rounded-xl transition-opacity hover:opacity-90"
            >
              <img src={displayUser?.imageUrl} alt={displayUser?.firstName} className="w-full h-full object-cover" />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-64 bg-zk-panel-bg border-2 border-zk-border z-50 rounded-xl overflow-hidden"
                >
                  {/* Default Profile Menu */}
                  <>
                    <div className="px-4 py-3 border-b-[2px] border-zk-border bg-zk-bg/40">
                      <p className="font-bold text-zk-text text-sm truncate">{displayUser?.firstName} {displayUser?.lastName}</p>
                      <p className="text-xs text-zk-text/60 truncate">{displayUser?.email}</p>
                    </div>

                    <button
                      onClick={() => { setMenuOpen(false); router.push(`/u/${displayUser?.username || displayUser?.id}`); }}
                      onMouseEnter={() => (displayUser?.username || displayUser?.id) && fetchProfileIfNotCached(displayUser.username || displayUser.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-bg/30 border-b-[1px] border-zk-border/10 font-bold text-zk-text text-sm transition-colors"
                    >
                      <User size={16} /> Profile
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); router.push('/dashboard'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-bg/30 border-b-[1px] border-zk-border/10 font-bold text-zk-text text-sm transition-colors"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>

                    <button
                      onClick={() => { setMenuOpen(false); router.push('/shop'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-bg/30 border-b-[1px] border-zk-border/10 font-bold text-zk-text text-sm transition-colors"
                    >
                      <ShoppingBag size={16} /> Shop
                    </button>


                    <button
                      onClick={() => { setMenuOpen(false); router.push('/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zk-bg/30 border-b-[1px] border-zk-border/10 font-bold text-zk-text text-sm transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>

                    <ThemeToggle variant="menuItem" onClick={() => setMenuOpen(false)} />

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
        <ThemeToggle />
        <button
          onClick={() => router.push('/join')}
          className="bg-zk-blue text-zk-white border-2 border-zk-border px-6 py-2 transition-opacity hover:opacity-90 rounded-lg font-['Amatic_SC'] font-bold text-2xl leading-none pt-2"
        >
          Join
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="bg-zk-panel-bg text-zk-text border-2 border-zk-border px-6 py-2 transition-opacity hover:opacity-90 rounded-lg font-['Amatic_SC'] font-bold text-2xl leading-none pt-2"
        >
          Sign up
        </button>
      </>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full border-b-2 border-zk-border bg-zk-bg py-3 font-sans transition-all duration-300 ease-in-out ${isDashboardView ? 'px-6' : 'px-4 sm:px-6 lg:px-8'}`}>
      <div className={`mx-auto flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDashboardView ? 'max-w-full' : 'max-w-7xl'}`}>
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transform transition-all hover:opacity-90"
          >
            <img 
              src="/Zinkofavicon.png" 
              alt="Zinko Logo" 
              className="w-8 h-8 object-contain rounded-md border-2 border-black contrast-[1.1] brightness-[1.02] dark:contrast-100 dark:brightness-100" 
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
            <span className="font-bold text-2xl tracking-tighter italic permanent-marker-regular text-zk-text">Zinko</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 font-bold text-sm">
            {/* Info Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setInfoOpen(true)} 
              onMouseLeave={() => setInfoOpen(false)}
            >
              <div 
                className={
                  mounted && pathname && ['/blog', '/tutorial'].some(p => pathname.startsWith(p))
                    ? "bg-[#5D3FD3] text-white border-[2px] border-zk-border px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg font-['Amatic_SC'] text-2xl font-bold cursor-default transition-colors leading-none pt-2 animate-float-nav inline-flex items-center gap-1 uppercase"
                    : "text-zk-text underline decoration-transparent hover:decoration-current decoration-[2px] underline-offset-4 cursor-default font-bold font-['Amatic_SC'] text-2xl px-4 py-1 transition-colors leading-none pt-2 inline-flex items-center gap-1 uppercase"
                }
              >
                {pathname?.startsWith('/blog') ? 'BLOG' : pathname?.startsWith('/tutorial') ? 'TUTORIAL' : 'INFO'} <ChevronDown size={20} className={`transition-transform ${infoOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {infoOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-zk-panel-bg border-2 border-zk-border z-50 rounded-xl overflow-hidden py-2"
                  >
                    <button
                      onClick={() => { setInfoOpen(false); router.push('/blog'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Blog
                    </button>
                    <button
                      onClick={() => { setInfoOpen(false); router.push('/tutorial'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Tutorial
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              onClick={() => router.push('/pricing')}
              className={getLinkClass('/pricing')}
            >
              PRICING
            </a>

            {/* Manage & Create Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setManageOpen(true)} 
              onMouseLeave={() => setManageOpen(false)}
            >
              <div 
                className={
                  mounted && pathname && ['/dashboard', '/discovery', '/classpin', '/flashcard', '/create-picture-race'].some(p => pathname.startsWith(p)) && !pathname.startsWith('/dashboard/social')
                    ? "bg-[#5D3FD3] text-white border-[2px] border-zk-border px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg font-['Amatic_SC'] text-2xl font-bold cursor-default transition-colors leading-none pt-2 animate-float-nav inline-flex items-center gap-1"
                    : "text-zk-text underline decoration-transparent hover:decoration-current decoration-[2px] underline-offset-4 cursor-default font-bold font-['Amatic_SC'] text-2xl px-4 py-1 transition-colors leading-none pt-2 inline-flex items-center gap-1"
                }
              >
                MANAGE & CREATE <ChevronDown size={20} className={`transition-transform ${manageOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {manageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-zk-panel-bg border-2 border-zk-border z-50 rounded-xl overflow-hidden py-2"
                  >
                    <button
                      onClick={() => { setManageOpen(false); router.push('/dashboard'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setManageOpen(false); router.push('/discovery'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Discovery
                    </button>
                    <button
                      onClick={() => { setManageOpen(false); router.push('/flashcard'); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Flash card
                      <span className="bg-[#00C2FF] text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-black leading-none pt-1">
                        New
                      </span>
                    </button>
                    <button
                      onClick={() => { setManageOpen(false); router.push('/create-picture-race'); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Guess Picture
                      <span className="bg-[#00C2FF] text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-black leading-none pt-1">
                        New
                      </span>
                    </button>
                    <button
                      onClick={() => { setManageOpen(false); router.push('/classpin'); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Classpin
                      <span className="bg-[#FFCD29] text-black text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-black leading-none pt-1">
                        Soon
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Social Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setSocialOpen(true)} 
              onMouseLeave={() => setSocialOpen(false)}
            >
              <div 
                className={
                  mounted && pathname && pathname.startsWith('/dashboard/social')
                    ? "bg-[#5D3FD3] text-white border-[2px] border-zk-border px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg font-['Amatic_SC'] text-2xl font-bold cursor-default transition-colors leading-none pt-2 animate-float-nav inline-flex items-center gap-1 capitalize"
                    : "text-zk-text underline decoration-transparent hover:decoration-current decoration-[2px] underline-offset-4 cursor-default font-bold font-['Amatic_SC'] text-2xl px-4 py-1 transition-colors leading-none pt-2 inline-flex items-center gap-1 capitalize"
                }
              >
                Social <ChevronDown size={20} className={`transition-transform ${socialOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {socialOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-zk-panel-bg border-2 border-zk-border z-50 rounded-xl overflow-hidden py-2"
                  >
                    <button
                      onClick={() => { setSocialOpen(false); router.push('/dashboard/social?tab=friends'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Friends
                    </button>
                    <button
                      onClick={() => { setSocialOpen(false); router.push('/dashboard/social?tab=requests'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Requests
                    </button>
                    <button
                      onClick={() => { setSocialOpen(false); router.push('/dashboard/social?tab=add'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Add Friend
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Library Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setLibraryOpen(true)} 
              onMouseLeave={() => setLibraryOpen(false)}
            >
              <div 
                className={
                  mounted && pathname && pathname.startsWith('/library')
                    ? "bg-[#5D3FD3] text-white border-[2px] border-zk-border px-4 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg font-['Amatic_SC'] text-2xl font-bold cursor-default transition-colors leading-none pt-2 animate-float-nav inline-flex items-center gap-1 capitalize"
                    : "text-zk-text underline decoration-transparent hover:decoration-current decoration-[2px] underline-offset-4 cursor-default font-bold font-['Amatic_SC'] text-2xl px-4 py-1 transition-colors leading-none pt-2 inline-flex items-center gap-1 capitalize"
                }
              >
                Library 
                {showLibraryCartAlert && (
                  <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-[10px] font-black min-w-[1.25rem] h-5 px-1.5 rounded-full border-[2px] border-zk-border !shadow-none flex items-center justify-center pointer-events-none">
                    {cartAlertCount > 99 ? '99+' : cartAlertCount}
                  </span>
                )}
                <ChevronDown size={20} className={`transition-transform ${libraryOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {libraryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-zk-panel-bg border-2 border-zk-border z-50 rounded-xl overflow-hidden py-2"
                  >
                    <button
                      onClick={() => { setLibraryOpen(false); router.push('/library'); }}
                      className="w-full text-left px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Collection
                    </button>
                    <button
                      onClick={() => { setLibraryOpen(false); router.push('/library/cart'); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-zk-bg/50 font-['Outfit'] font-bold text-zk-text text-base transition-colors"
                    >
                      Cart
                      {showLibraryCartAlert && (
                        <span className="bg-red-500 text-white text-[10px] font-black min-w-[1.25rem] h-5 px-1.5 rounded-full border-[2px] border-zk-border flex items-center justify-center">
                          {cartAlertCount > 99 ? '99+' : cartAlertCount}
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              onClick={() => router.push('/shop')}
              className={getLinkClass('/shop')}
            >
              SHOP
            </a>

          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 font-bold text-sm">
          {renderAuthButtons()}
        </div>
      </div>
      {/* Sign Out Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="bg-zk-panel-bg border-2 border-zk-border p-8 max-w-sm w-full mx-4 flex flex-col items-center rounded-xl"
          >
            <h3 className="font-['Outfit'] text-2xl font-black uppercase tracking-tight mb-2 text-zk-text">Sign out?</h3>
            <p className="text-zk-text/70 mb-6 text-center font-bold">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-zk-panel-bg text-zk-text border-2 border-zk-border px-4 py-2 font-black text-2xl rounded-lg transition-colors hover:bg-zk-bg/20"
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
                className="flex-1 bg-[#FF4B4B] text-zk-white border-2 border-zk-border px-4 py-2 font-black text-2xl rounded-lg transition-colors hover:bg-[#e63e3e]"
                style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
              >
                SURE!
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <NotificationSidebar isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </nav>
  );
};

export default Navbar;
