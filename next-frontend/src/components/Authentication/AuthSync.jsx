"use client";
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useDashboardQuizStore } from '@/store/useDashboardQuizStore';
import { useDiscoveryQuizStore } from '@/store/useDiscoveryQuizStore';
import { useShopStore } from '@/store/useShopStore';

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

          const getDynamicApiUrl = () => {
            if (typeof window !== 'undefined') {
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'http://localhost:5000';
              }
              return `http://${window.location.hostname}:5000`;
            }
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          };
          const API_URL = getDynamicApiUrl();
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
            let errorMessage = response.statusText;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || response.statusText;
            } catch (e) {
              // Not JSON
            }
            console.error('[AuthSync] Failed to sync token:', errorMessage);
            if (hasExistingToken) {
              setJwtReady(true);
            } else {
              setJwtReady(false);
            }
          }
        } catch (error) {
          const isNetworkError =
            error?.message === 'Failed to fetch' || error?.name === 'TypeError';
          console.error(
            isNetworkError
              ? '[AuthSync] Network error while syncing token. Clerk or the Zinko API may be unreachable.'
              : '[AuthSync] Error syncing token:',
            error
          );
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
        useDashboardQuizStore.getState().invalidate();
        useDiscoveryQuizStore.getState().invalidate();
        useShopStore.getState().invalidate();
        console.log('[AuthSync] Token removed due to sign out');
      }
    };

    syncToken();
  }, [isSignedIn, getToken, setJwtReady]);

  return null;
}
