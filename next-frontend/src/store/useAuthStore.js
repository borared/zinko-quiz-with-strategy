import { create } from 'zustand';

const AUTH_CACHE_KEY = 'zinko_nav_auth';

export function getNavAuthCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(AUTH_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearNavAuthCache() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(AUTH_CACHE_KEY);
}

export function setNavAuthCache(isSignedIn, user) {
  if (typeof window === 'undefined') return;
  if (!isSignedIn) {
    clearNavAuthCache();
    return;
  }
  sessionStorage.setItem(
    AUTH_CACHE_KEY,
    JSON.stringify({
      isSignedIn: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress ?? null,
      },
    })
  );
}

export const useAuthStore = create((set) => ({
  isJwtReady: false,
  setJwtReady: (ready) => set({ isJwtReady: ready }),
}));