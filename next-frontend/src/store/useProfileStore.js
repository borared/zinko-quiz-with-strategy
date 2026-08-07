import { create } from 'zustand';

export const useProfileStore = create((set, get) => ({
  profiles: {}, // { [username]: profileData }
  setProfile: (username, data) => set((state) => ({
    profiles: { ...state.profiles, [username]: data }
  })),
  getProfile: (username) => get().profiles[username]
}));
