"use client";
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function AuthSync() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        try {
          const clerkToken = await getToken();
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/auth/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${clerkToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              localStorage.setItem('zinko_jwt', data.token);
              console.log('[AuthSync] Token synced successfully');
            }
          } else {
            console.error('[AuthSync] Failed to sync token:', response.statusText);
          }
        } catch (error) {
          console.error('[AuthSync] Error syncing token:', error);
        }
      } else if (isSignedIn === false) {
        localStorage.removeItem('zinko_jwt');
        console.log('[AuthSync] Token removed due to sign out');
      }
    };

    syncToken();
  }, [isSignedIn, getToken]);

  return null;
}
