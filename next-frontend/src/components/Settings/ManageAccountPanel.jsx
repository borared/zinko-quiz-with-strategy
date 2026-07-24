'use client';

import React, { useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Camera, Loader2, Lock, Mail, X } from 'lucide-react';

const inputClass =
  'w-full border-[2px] border-zk-black rounded-lg px-3 py-2 font-bold text-zk-black bg-white disabled:bg-zk-black/5 disabled:text-zk-black/50';

const labelClass = 'text-xs font-black uppercase tracking-wider text-zk-black/60';

const btnPrimary =
  'px-5 py-2.5 rounded-xl border-[3px] border-zk-black bg-[#5D3FD3] text-white font-black text-sm uppercase tracking-widest hover:translate-y-0.5 disabled:opacity-60';

const btnSecondary =
  'px-5 py-2.5 rounded-xl border-[3px] border-zk-black bg-white text-zk-black font-black text-sm uppercase tracking-widest hover:bg-zk-yellow/20';

export default function ManageAccountPanel({ onClose, onToast }) {
  const { user } = useUser();
  const fileInputRef = useRef(null);

  const [photoLoading, setPhotoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress || '';
  const hasPassword = user.passwordEnabled;
  const connectedAccounts = user.externalAccounts || [];

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    try {
      await user.setProfileImage({ file });
      onToast?.('Profile photo updated.', 'success');
    } catch (error) {
      onToast?.(error?.errors?.[0]?.message || 'Failed to update profile photo.', 'error');
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword.length < 8) {
      onToast?.('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onToast?.('New passwords do not match.', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: false,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onToast?.('Password updated.', 'success');
    } catch (error) {
      onToast?.(error?.errors?.[0]?.message || 'Failed to update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="rounded-xl border-[3px] border-zk-black bg-[#FDF9F1] p-4 sm:p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black tracking-tight text-zk-black">Manage account</h3>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-lg border-[2px] border-zk-black bg-white flex items-center justify-center hover:bg-zk-yellow/30"
          aria-label="Close manage account"
        >
          <X size={18} />
        </button>
      </div>

      <div className="rounded-xl border-[2px] border-zk-black/15 bg-white p-4 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
        <div className="relative shrink-0">
          <img
            src={user.imageUrl}
            alt={user.fullName || 'Profile'}
            className="w-20 h-20 rounded-xl border-[3px] border-zk-black object-cover"
          />
          {photoLoading && (
            <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={24} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-zk-black truncate">{user.fullName}</p>
          <p className="text-sm font-bold text-zk-black/50 truncate">{email}</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoLoading}
            className={`${btnSecondary} inline-flex items-center gap-2`}
          >
            <Camera size={16} />
            Change photo
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>
          <span className="inline-flex items-center gap-1.5">
            <Mail size={14} />
            Email
          </span>
        </label>
        <input value={email} disabled className={inputClass} />
        <p className="text-xs font-bold text-zk-black/45 mt-1">
          Email is managed through your sign-in provider. Contact support to change it.
        </p>
      </div>

      {connectedAccounts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Connected accounts</span>
          <div className="flex flex-col gap-2">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border-[2px] border-zk-black/15 bg-white"
              >
                <span className="font-black text-sm text-zk-black capitalize">
                  {account.provider.replace('oauth_', '').replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-zk-black/50 truncate">
                  {account.emailAddress || account.username || 'Connected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPassword ? (
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          <span className={`${labelClass} inline-flex items-center gap-1.5`}>
            <Lock size={14} />
            Change password
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Current password"
              className={inputClass}
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="New password"
              className={inputClass}
              required
              minLength={8}
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              className={inputClass}
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={passwordLoading} className={`${btnPrimary} w-fit`}>
            {passwordLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border-[2px] border-zk-black/15 bg-white/70 p-4">
          <p className="text-sm font-bold text-zk-black/55">
            You signed in with a connected account. Password is managed by that provider.
          </p>
        </div>
      )}
    </div>
  );
}