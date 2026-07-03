"use client";
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function AuthSync() {
  const { isSignedIn, getToken } = useAuth();
  const setJwtReady = useAuthStore((s) => s.setJwtReady);

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        const hasExistingToken = !!localStorage.getItem('zinko_jwt');
        if (!hasExistingToken) {
          setJwtReady(false);
        }

        try {
          const clerkToken = await getToken();
          if (!clerkToken) {
            console.error('[AuthSync] No Clerk session token available');
            if (!hasExistingToken) setJwtReady(false);
            return;
          }

          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/auth/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${clerkToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              localStorage.setItem('zinko_jwt', data.token);
              setJwtReady(true);
              console.log('[AuthSync] Token synced successfully');
            }
          } else {
            console.error('[AuthSync] Failed to sync token:', response.statusText);
            if (hasExistingToken) {
              setJwtReady(true);
            } else {
              setJwtReady(false);
            }
          }
        } catch (error) {
          console.error('[AuthSync] Error syncing token:', error);
          if (hasExistingToken) {
            setJwtReady(true);
          } else {
            setJwtReady(false);
          }
        }
      } else if (isSignedIn === false) {
        localStorage.removeItem('zinko_jwt');
        setJwtReady(false);
        useNotificationStore.getState().invalidate();
        console.log('[AuthSync] Token removed due to sign out');
      }
    };

    syncToken();
  }, [isSignedIn, getToken, setJwtReady]);

  return null;
}
