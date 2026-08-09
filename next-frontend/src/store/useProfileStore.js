import { create } from 'zustand';
import api from '@/services/api';

export const useProfileStore = create((set, get) => ({
  profiles: {}, // { [username]: profileData }
  setProfile: (username, data) => set((state) => ({
    profiles: { ...state.profiles, [username]: data }
  })),
  getProfile: (username) => get().profiles[username],
  fetchProfileIfNotCached: async (username) => {
    if (!username) return null;
    const currentProfile = get().profiles[username];
    if (currentProfile) return currentProfile;
    
    try {
      const data = await api.get(`/api/user/profile/${username}`);
      set((state) => ({ profiles: { ...state.profiles, [username]: data } }));
      return data;
    } catch (err) {
      console.error('Failed to pre-fetch profile', err);
      return null;
    }
  }
}));
