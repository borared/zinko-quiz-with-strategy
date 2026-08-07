'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@clerk/nextjs';

const Lottie = dynamic(() => import('lottie-react').then((mod) => mod.default), { ssr: false });
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Sparkles,
  LogOut,
  ExternalLink,
  Loader2,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import Navbar from '@/components/global/Navbar';
import ManageAccountPanel from '@/components/Settings/ManageAccountPanel';
import CreatorSelectPicker from '@/components/GameCreator/CreatorSelectPicker';
import { useAuthStore } from '@/store/useAuthStore';
import { clearNavAuthCache } from '@/store/useAuthStore';
import { useUserSettingsStore } from '@/store/useUserSettingsStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useDashboardQuizStore } from '@/store/useDashboardQuizStore';
import { useDiscoveryQuizStore } from '@/store/useDiscoveryQuizStore';
import { useShopStore } from '@/store/useShopStore';
import { useToastStore } from '@/store/useToastStore';
import api from '@/services/api';
import { PLAN_COPY, VISIBILITY_OPTIONS } from '@/lib/userSettings';
import profileLottieData from '@/lib/settings-profile-lottie.json';

const FLOATING_OBJECTS = [
  { className: 'top-[8%] left-[4%] w-14 h-14 rounded-full border-[3px] border-zk-border bg-[#FF6B4A]', animate: { y: [-12, 12, -12], rotate: [0, 180, 360] }, transition: { y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 18, repeat: Infinity, ease: 'linear' } } },
  { className: 'top-[18%] right-[6%] w-10 h-10 rounded-xl border-[3px] border-zk-border bg-zk-bg rotate-12', animate: { y: [8, -8, 8], rotate: [12, 32, 12] }, transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } },
  { className: 'top-[55%] right-[3%] w-20 h-20 rounded-2xl border-[3px] border-zk-border bg-[#00C2FF] hidden md:block', animate: { y: [10, -10, 10], rotate: [-8, 8, -8] }, transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } },
  { className: 'bottom-[28%] left-[8%] w-12 h-12 border-[3px] border-zk-border bg-zk-panel-bg rotate-45 rounded-lg hidden md:block', animate: { y: [6, -6, 6], rotate: [45, 65, 45] }, transition: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 } },
  { className: 'bottom-[18%] right-[10%] w-16 h-16 rounded-full border-[3px] border-zk-border bg-[#00C853] hidden sm:block', animate: { y: [-10, 10, -10] }, transition: { duration: 4.6, repeat: Infinity, ease: 'easeInOut' } },
];
function SettingsFloatingDecor() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {FLOATING_OBJECTS.map((obj, index) => (
        <motion.div key={index} animate={obj.animate} transition={obj.transition} className={`absolute ${obj.className}`} />
      ))}
    </div>
  );
}
function ProfileLottie({ className = '' }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden w-[200px] h-[200px] shrink-0 ${className}`}
      aria-hidden
    >
      {mounted ? (
        <Lottie
          animationData={profileLottieData}
          loop
          style={{ width: 180, height: 180 }}
        />
      ) : (
        <div className="w-[160px] h-[160px] rounded-full border-[3px] border-dashed border-zk-border/20 animate-pulse" />
      )}
    </div>
  );
}

function SettingSection({ icon: Icon, title, description, children, className = '' }) {
  return (
    <section className={`zk-panel !shadow-none p-5 sm:p-6 flex flex-col gap-4 h-full ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl border-[3px] border-zk-border bg-zk-bg flex items-center justify-center shrink-0">
          <Icon size={20} className="text-zk-text" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black tracking-tight text-zk-text">{title}</h2>
          </div>
          {description && (
            <p className="text-sm font-bold text-zk-text/55 mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

const ALERT_SPRING = { type: 'spring', stiffness: 380, damping: 18, mass: 0.9 };

function SettingsAlertModal({ open, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[200] p-4"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 48 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 24 }}
            transition={ALERT_SPRING}
            className="bg-zk-panel-bg border-[4px] border-zk-border rounded-2xl p-6 max-w-md w-full shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SettingToggle({ label, description, checked, onChange, disabled = false }) {
  return (
    <label className={`flex items-start justify-between gap-4 p-4 rounded-xl border-[2px] border-zk-border/15 bg-zk-panel-bg/70 ${disabled ? 'opacity-60' : 'cursor-pointer hover:bg-zk-bg/10'}`}>
      <span className="min-w-0">
        <span className="block font-black text-sm text-zk-text">{label}</span>
        {description && (
          <span className="block text-xs font-bold text-zk-text/50 mt-1">{description}</span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-12 h-7 rounded-full border-[2px] border-zk-border transition-colors ${
          checked ? 'bg-[#5D3FD3]' : 'bg-zk-black/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full border-[2px] border-zk-border bg-zk-panel-bg transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsPanel() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);

  const [clientReady, setClientReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const initializedForUserRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState('clarify');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const DELETE_ACCOUNT_CONFIRM_PHRASE = 'Delete account';
  const isDeleteConfirmPhraseMatch =
    deleteConfirmText.trim() === DELETE_ACCOUNT_CONFIRM_PHRASE;
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [manageAccountOpen, setManageAccountOpen] = useState(false);
  const { showToast } = useToastStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const settings = useUserSettingsStore((s) => s.settings);
  const usage = useUserSettingsStore((s) => s.usage);
  const setSettingsCache = useUserSettingsStore((s) => s.setCache);
  const updateSettingsCache = useUserSettingsStore((s) => s.updateSettings);
  const updateUsernameCache = useUserSettingsStore((s) => s.updateUsername);
  const updateCoverUrlCache = useUserSettingsStore((s) => s.updateCoverUrl);
  const invalidateSettingsCache = useUserSettingsStore((s) => s.invalidate);
  const isSettingsCachedForUser = useUserSettingsStore((s) => s.isCachedForUser);
  const hasPersistedSettings = useUserSettingsStore((s) => s.hasPersistedSettings);
  const updateDiscoveryCreatorUsername = useDiscoveryQuizStore((s) => s.updateCreatorUsername);

  const [usernameDraft, setUsernameDraft] = useState('');
  
  const coverUrl = useUserSettingsStore((s) => s.coverUrl);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [coverDraft, setCoverDraft] = useState('');
  const [coverSaving, setCoverSaving] = useState(false);

  const loadSettings = useCallback(async ({ silent = false, userId } = {}) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      const data = await api.get('/api/user/settings');
      setSettingsCache({
        userId,
        settings: data.settings,
        usage: data.usage,
        username: data.user?.username || '',
        coverUrl: data.user?.coverUrl || '',
      });
      setUsernameDraft(data.user?.username || '');
      setCoverDraft(data.user?.coverUrl || '');
    } catch (error) {
      console.error('Failed to load settings:', error);
      if (!silent) {
        showToast('Could not load all settings. Some values may be unavailable.', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [setSettingsCache, showToast]);

  useEffect(() => {
    useUserSettingsStore.getState().hydrateFromSession();
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/signin');
      return;
    }
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
  }, [isLoaded, isSignedIn, user, router]);

  useEffect(() => {
    if (!user?.id) return;

    const state = useUserSettingsStore.getState();
    if (state.isHydrated && state.userId && state.userId !== user.id) {
      invalidateSettingsCache();
      initializedForUserRef.current = null;
    }
  }, [user?.id, invalidateSettingsCache]);

  useEffect(() => {
    if (!clientReady || !isSignedIn || !isJwtReady || !user?.id) return;
    if (initializedForUserRef.current === user.id) return;
    initializedForUserRef.current = user.id;

    const cached = isSettingsCachedForUser(user.id);
    if (cached) {
      setUsernameDraft(useUserSettingsStore.getState().username);
      setLoading(false);
      loadSettings({ silent: true, userId: user.id });
      return;
    }

    loadSettings({ userId: user.id });
  }, [
    clientReady,
    isSignedIn,
    isJwtReady,
    user?.id,
    isSettingsCachedForUser,
    loadSettings,
  ]);

  const saveSettings = async (patch) => {
    setSaving(true);
    try {
      const data = await api.patch('/api/user/settings', { settings: patch });
      updateSettingsCache(data.settings);
      showToast('Settings Saved.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updater) => {
    const next = typeof updater === 'function' ? updater(settings) : updater;
    updateSettingsCache(next);
    saveSettings(next);
  };

  const saveProfileNames = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      showToast('Profile updated.', 'success');
    } catch (error) {
      showToast(error?.errors?.[0]?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveUsername = async () => {
    setUsernameSaving(true);
    try {
      const data = await api.patch('/api/user/username', { username: usernameDraft });
      const savedUsername = data.user?.username || usernameDraft;
      updateUsernameCache(savedUsername);
      setUsernameDraft(savedUsername);
      if (user?.id) {
        updateDiscoveryCreatorUsername(user.id, savedUsername);
      }
      showToast('Username saved. Your public quizzes will show this on Discovery.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save username.', 'error');
    } finally {
      setUsernameSaving(false);
    }
  };

  const saveCover = async () => {
    setCoverSaving(true);
    try {
      const data = await api.patch('/api/user/cover', { coverUrl: coverDraft });
      const savedCover = data.user?.coverUrl || '';
      updateCoverUrlCache(savedCover);
      setCoverDraft(savedCover);
      setIsCoverModalOpen(false);
      showToast('Cover photo updated.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to save cover photo.', 'error');
    } finally {
      setCoverSaving(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteStep('clarify');
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setDeleteStep('clarify');
    setDeleteConfirmText('');
    setDeleting(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      clearNavAuthCache();
      invalidateSettingsCache();
      useNotificationStore.getState().invalidate();
      useDashboardQuizStore.getState().invalidate();
      useShopStore.getState().invalidate();
      useDiscoveryQuizStore.getState().invalidate();
      await signOut();
      setSignOutOpen(false);
    } catch (error) {
      showToast(error.message || 'Failed to sign out.', 'error');
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/api/user/account');
      closeDeleteModal();
      clearNavAuthCache();
      invalidateSettingsCache();
      useNotificationStore.getState().invalidate();
      useDashboardQuizStore.getState().invalidate();
      useDiscoveryQuizStore.getState().invalidate();
      useShopStore.getState().invalidate();
      await signOut();
      router.push('/');
    } catch (error) {
      showToast(error.message || 'Failed to delete account.', 'error');
      setDeleting(false);
    }
  };

  const plan = PLAN_COPY[usage.plan] || PLAN_COPY.basic;
  const settingsCached = isSettingsCachedForUser(user?.id);

  if (!clientReady || !isLoaded || (loading && !settingsCached && !hasPersistedSettings())) {
    return (
      <div className="min-h-screen bg-zk-light-bg flex items-center justify-center relative overflow-hidden">
        <SettingsFloatingDecor />
        <Loader2 className="animate-spin w-12 h-12 text-zk-text relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zk-light-bg flex flex-col font-['Outfit'] relative overflow-hidden">
      <SettingsFloatingDecor />
      <div className="relative z-10"><Navbar /></div>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 mt-4 pb-16">
        <div className="zk-panel !shadow-none p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl border-[3px] border-zk-border bg-[#5D3FD3] text-white flex items-center justify-center">
            <Settings size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zk-text tracking-tight">Settings</h1>
            <p className="text-sm font-bold text-zk-text/55">Manage your account and game preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          <SettingSection icon={User} title="Profile" description="Your name and account details." className="md:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_240px] gap-5 items-stretch min-h-0">
              <div className="flex flex-col gap-4 min-w-0">
                <div className="flex items-center gap-4">
                  <img src={user?.imageUrl} alt={user?.fullName || 'Profile'} className="w-16 h-16 rounded-xl border-[3px] border-zk-border object-cover" />
                  <div className="min-w-0">
                    <p className="font-black text-zk-text truncate">{user?.fullName}</p>
                    <p className="text-sm font-bold text-zk-text/50 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1"><span className="text-xs font-black uppercase tracking-wider text-zk-text/60">First name</span><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border-[2px] border-zk-border rounded-lg px-3 py-2 font-bold text-zk-text bg-zk-panel-bg" /></label>
                  <label className="flex flex-col gap-1"><span className="text-xs font-black uppercase tracking-wider text-zk-text/60">Last name</span><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="border-[2px] border-zk-border rounded-lg px-3 py-2 font-bold text-zk-text bg-zk-panel-bg" /></label>
                </div>
                
                <label className="flex flex-col gap-1 mt-1">
                  <span className="text-xs font-black uppercase tracking-wider text-zk-text/60">Username</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={usernameDraft}
                      onChange={(e) => setUsernameDraft(e.target.value)}
                      placeholder="your_username"
                      className="flex-1 border-[2px] border-zk-border rounded-lg px-3 py-2 font-bold text-zk-text bg-zk-panel-bg lowercase"
                    />
                    <button
                      type="button"
                      onClick={saveUsername}
                      disabled={usernameSaving}
                      className="px-5 py-2.5 rounded-xl border-[3px] border-zk-border bg-[#5D3FD3] text-white font-black text-sm tracking-widest disabled:opacity-60 hover:translate-y-0.5 transition-transform"
                    >
                      {usernameSaving ? 'Saving…' : 'Save username'}
                    </button>
                  </div>
                </label>

                <div className="flex flex-wrap gap-3 mt-2">
                  <button type="button" onClick={saveProfileNames} disabled={saving} className="px-5 py-2.5 rounded-xl border-[3px] border-zk-border bg-[#5D3FD3] text-white font-black text-sm tracking-widest hover:translate-y-0.5 disabled:opacity-60">Save profile</button>
                  <button type="button" onClick={() => setManageAccountOpen((open) => !open)} className={`px-5 py-2.5 rounded-xl border-[3px] border-zk-border font-black text-sm tracking-widest inline-flex items-center gap-2 ${manageAccountOpen ? 'bg-zk-bg text-zk-text' : 'bg-zk-panel-bg text-zk-text hover:bg-zk-bg/20'}`}>Manage account</button>
                  <button type="button" onClick={() => setIsCoverModalOpen(true)} className="px-5 py-2.5 rounded-xl border-[3px] border-zk-border font-black text-sm tracking-widest bg-zk-panel-bg text-zk-text hover:bg-zk-bg/20 inline-flex items-center gap-2"><ImageIcon size={16} /> Edit Cover</button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center h-full min-h-[200px] lg:min-h-0 mx-auto lg:mx-0 lg:-translate-y-12">
                <ProfileLottie />
              </div>
            </div>
            {manageAccountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
                className="overflow-hidden"
              >
                <ManageAccountPanel onClose={() => setManageAccountOpen(false)} onToast={showToast} />
              </motion.div>
            )}
          </SettingSection>

          <SettingSection
            icon={CreditCard}
            title="Plan & billing"
            description="Your current plan and usage."
          >
            <div className="rounded-xl border-[3px] border-zk-border bg-zk-panel-bg p-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-zk-text/50">Current plan</p>
                  <p className="text-3xl font-black text-[#5D3FD3] leading-none">{plan.price}</p>
                </div>
                <p className="mt-1 text-2xl font-black text-zk-text">{plan.title}</p>
                <p className="text-sm font-bold text-zk-text/55">{plan.subtitle}</p>
              </div>
              <p className="mt-4 text-sm font-bold text-zk-text/60">
                {usage.quizzesCreated} quiz{usage.quizzesCreated === 1 ? '' : 'zes'} created
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-zk-border bg-zk-bg text-zk-text font-black text-sm tracking-widest hover:translate-y-0.5 w-fit"
            >
              View plans
            </Link>
          </SettingSection>

          <SettingSection
            icon={Bell}
            title="Notifications"
            description="Choose what you want to hear about."
           
          >
            <div className="flex flex-col gap-3">
              <SettingToggle
                label="Scenery gifts"
                description="Alerts when you receive new background scenery."
                checked={settings.notifications.sceneryGifts}
                onChange={(value) => updateSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, sceneryGifts: value },
                }))}
                disabled={saving}
              />
              <SettingToggle
                label="Quiz activity"
                description="Updates when someone interacts with your quizzes."
                checked={settings.notifications.quizActivity}
                onChange={(value) => updateSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, quizActivity: value },
                }))}
                disabled={saving}
              />
              <SettingToggle
                label="Email digest"
                description="A weekly summary of your quiz activity."
                checked={settings.notifications.emailDigest}
                onChange={(value) => updateSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, emailDigest: value },
                }))}
                disabled={saving}
              />
            </div>
          </SettingSection>

          <SettingSection
            icon={Shield}
            title="Privacy & content"
            description="Control how your quizzes appear to others."
           
          >
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-wider text-zk-text/60">Default quiz visibility</span>
                <CreatorSelectPicker
                  fullWidth
                  placement="top"
                  value={settings.privacy.defaultQuizVisibility}
                  onChange={(value) => updateSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, defaultQuizVisibility: value },
                  }))}
                  options={VISIBILITY_OPTIONS}
                />
              </label>
              <SettingToggle
                label="Show on Discovery"
                description="Let others find your public quizzes in Discovery."
                checked={settings.privacy.showOnDiscovery}
                onChange={(value) => updateSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, showOnDiscovery: value },
                }))}
                disabled={saving}
              />
              <SettingToggle
                label="Allow quiz cloning"
                description="Let others duplicate your public quizzes as a template."
                checked={settings.privacy.allowQuizCloning}
                onChange={(value) => updateSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, allowQuizCloning: value },
                }))}
                disabled={saving}
              />
            </div>
          </SettingSection>

          <SettingSection
            icon={Sparkles}
            title="Advanced options"
            description="Discovery and advanced account preferences."
          >
            <SettingToggle
              label="Discovery opt-in"
              description="Appear in creator discovery when you publish public quizzes."
              checked={settings.discoveryOptIn}
              onChange={(value) => updateSettings((prev) => ({
                ...prev,
                discoveryOptIn: value,
              }))}
              disabled={saving}
            />

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-zk-border bg-zk-panel-bg text-zk-text font-black text-sm tracking-widest hover:bg-zk-bg/20 w-fit"
            >
              Billing & upgrades
              <ExternalLink size={14} />
            </Link>

          </SettingSection>

          <SettingSection
            icon={LogOut}
            title="Account & legal"
            description="Policies and session controls."
           
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-zk-border bg-zk-panel-bg text-zk-text font-black text-sm tracking-widest hover:bg-zk-bg/20 w-fit"
              >
                <Shield size={16} />
                Privacy policy
              </Link>
              <button
                type="button"
                onClick={() => setSignOutOpen(true)}
                className="px-5 py-2.5 rounded-xl border-[3px] border-zk-border bg-[#FF4B4B] text-white font-black text-sm tracking-widest inline-flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign out
              </button>
              <button
                type="button"
                onClick={openDeleteModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-[#E74C3C] text-[#E74C3C] font-black text-sm tracking-widest hover:bg-red-50 w-fit"
              >
                <Trash2 size={16} />
                Delete account
              </button>
            </div>
          </SettingSection>
        </div>
      </main>

      <SettingsAlertModal open={signOutOpen}>
        <h3 className="text-2xl font-black uppercase text-zk-text mb-2">Sign out?</h3>
        <p className="text-sm font-bold text-zk-text/65 mb-3">
          You will be signed out of your Zinko account on this device.
        </p>
        <p className="text-sm font-bold text-zk-text/65 mb-6">
          Your quizzes and settings are saved to your account. You can sign back in anytime to pick up where you left off.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setSignOutOpen(false);
              setSigningOut(false);
            }}
            disabled={signingOut}
            className="flex-1 px-4 py-2.5 rounded-xl border-[3px] border-zk-border font-black text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex-1 px-4 py-2.5 rounded-xl border-[3px] border-zk-border bg-[#FF4B4B] text-white font-black text-sm disabled:opacity-60"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </SettingsAlertModal>

      <SettingsAlertModal open={deleteOpen}>
        <AnimatePresence mode="wait">
          {deleteStep === 'clarify' ? (
            <motion.div
              key="clarify"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            >
              <h3 className="text-2xl font-black uppercase text-zk-text mb-2">Before you delete</h3>
              <p className="text-sm font-bold text-zk-text/65 mb-3">
                Deleting your account is permanent and cannot be undone.
              </p>
              <p className="text-sm font-bold text-zk-text/65 mb-6">
                {usage.quizzesCreated > 0 ? (
                  <>
                    You have created{' '}
                    <span className="text-zk-text">
                      {usage.quizzesCreated} quiz{usage.quizzesCreated === 1 ? '' : 'zes'}
                    </span>
                    . All quizzes you have created will be deleted as well, along with your profile and settings.
                  </>
                ) : (
                  'All quizzes you create are tied to your account. If you delete your account, every quiz you have created will be deleted as well.'
                )}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border-[3px] border-zk-border font-black text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteStep('confirm');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border-[3px] border-zk-border bg-zk-bg text-zk-text font-black text-sm"
                >
                  I understand
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            >
              <h3 className="text-2xl font-black uppercase text-zk-text mb-2">Confirm deletion</h3>
              <p className="text-sm font-bold text-zk-text/65 mb-3">
                This will permanently delete your account
                {usage.quizzesCreated > 0
                  ? ` and all ${usage.quizzesCreated} quiz${usage.quizzesCreated === 1 ? '' : 'zes'} you created`
                  : ' and every quiz you created'}
                . This action cannot be undone.
              </p>
              <p className="text-sm font-bold text-zk-text/65 mb-3">
                Type{' '}
                <span className="font-black text-zk-text">{DELETE_ACCOUNT_CONFIRM_PHRASE}</span>{' '}
                below to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder={DELETE_ACCOUNT_CONFIRM_PHRASE}
                autoComplete="off"
                autoFocus
                disabled={deleting}
                className="w-full border-[3px] border-zk-border rounded-xl px-4 py-2.5 font-bold text-zk-text mb-6 focus:outline-none focus:ring-4 focus:ring-[#FF4B4B]/20 disabled:opacity-60"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteStep('clarify');
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl border-[3px] border-zk-border font-black text-sm disabled:opacity-60"
                >
                  Go back
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting || !isDeleteConfirmPhraseMatch}
                  className="flex-1 px-4 py-2.5 rounded-xl border-[3px] border-zk-border bg-[#FF4B4B] text-white font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting…' : 'Delete account'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SettingsAlertModal>

      <AnimatePresence>
        {isCoverModalOpen && (
          <motion.div 
            key="cover-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div
              onClick={() => setIsCoverModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-zk-panel-bg border-[4px] border-zk-border rounded-2xl w-full max-w-md relative z-10 p-6 sm:p-8 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zk-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-black uppercase text-zk-text mb-1">Profile Cover</h2>
              <p className="text-sm font-bold text-zk-text/60 mb-6">
                Choose a banner image for your public profile.
              </p>

              <div className="flex flex-col gap-5">
                <div
                  role="button"
                  tabIndex={0}
                  className="aspect-[3/1] bg-zk-black/5 border-[3px] border-dashed border-zk-border rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zk-purple/5 transition-all group relative"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && document.getElementById('cover-upload')?.click()
                  }
                >
                  {coverDraft ? (
                    <img src={coverDraft} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload
                        size={28}
                        className="text-zk-text/30 group-hover:text-[#5D3FD3] transition-colors"
                      />
                      <span className="font-bold text-sm uppercase tracking-wider text-zk-text/40 group-hover:text-[#5D3FD3]">
                        Upload image
                      </span>
                    </>
                  )}
                  {coverDraft && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="font-bold text-sm uppercase tracking-wider text-white">
                        Change image
                      </span>
                    </div>
                  )}
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          showToast('File must be smaller than 5MB', 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => setCoverDraft(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <LinkIcon size={16} className="text-zk-text/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={
                      typeof coverDraft === 'string' && coverDraft.startsWith('http')
                        ? coverDraft
                        : ''
                    }
                    onChange={(e) => setCoverDraft(e.target.value)}
                    className="w-full border-[3px] border-zk-border p-3 pl-11 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#5D3FD3]/20 rounded-xl bg-zk-bg text-zk-text"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCoverDraft('');
                      updateCoverUrlCache('');
                      api.patch('/api/user/cover', { coverUrl: '' })
                         .then(() => showToast('Cover removed.', 'success'))
                         .catch(() => showToast('Failed to remove.', 'error'));
                      setIsCoverModalOpen(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border-[3px] border-zk-border font-black text-sm hover:bg-red-50 text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={saveCover}
                    disabled={coverSaving}
                    className="flex-1 px-4 py-3 rounded-xl border-[3px] border-zk-border bg-[#5D3FD3] text-white font-black text-sm transition-colors hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {coverSaving ? 'Saving...' : 'Save Cover'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}