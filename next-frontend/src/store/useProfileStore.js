import { create } from 'zustand';
import api from '@/services/api';

export const useProfileStore = create((set, get) => ({
  profiles: {}, // { [username/id/clerkId]: profileData }
  fetchingPromises: {}, // { [username]: Promise }
  setProfile: (username, data) => set((state) => {
    const nextProfiles = { ...state.profiles };
    if (username) nextProfiles[username] = data;
    const user = data?.user;
    if (user) {
      if (user.username) nextProfiles[user.username] = data;
      if (user.clerkId) nextProfiles[user.clerkId] = data;
      if (user.id) nextProfiles[user.id] = data;
    }
    return { profiles: nextProfiles };
  }),
  getProfile: (username) => get().profiles[username],
  fetchProfileIfNotCached: (username) => {
    if (!username) return Promise.resolve(null);
    const currentProfile = get().profiles[username];
    if (currentProfile) return Promise.resolve(currentProfile);

    const pendingPromise = get().fetchingPromises[username];
    if (pendingPromise) return pendingPromise;

    const promise = api.get(`/api/user/profile/${username}`)
      .then((data) => {
        const user = data?.user;
        set((state) => {
          const nextProfiles = { ...state.profiles };
          nextProfiles[username] = data;
          if (user) {
            if (user.username) nextProfiles[user.username] = data;
            if (user.clerkId) nextProfiles[user.clerkId] = data;
            if (user.id) nextProfiles[user.id] = data;
          }
          const nextPromises = { ...state.fetchingPromises };
          delete nextPromises[username];
          if (user) {
            if (user.username) delete nextPromises[user.username];
            if (user.clerkId) delete nextPromises[user.clerkId];
            if (user.id) delete nextPromises[user.id];
          }
          return { profiles: nextProfiles, fetchingPromises: nextPromises };
        });
        return data;
      })
      .catch((err) => {
        console.error('Failed to pre-fetch profile', err);
        set((state) => {
          const nextPromises = { ...state.fetchingPromises };
          delete nextPromises[username];
          return { fetchingPromises: nextPromises };
        });
        throw err;
      });

    set((state) => ({
      fetchingPromises: { ...state.fetchingPromises, [username]: promise }
    }));

    return promise;
  }
}));
