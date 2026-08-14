import { create } from 'zustand';

export const useSocialStore = create((set) => ({
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  isLoadedOnce: false,

  setFriends: (friends) => set({ friends }),
  setRequests: (incoming, outgoing) => set({ incomingRequests: incoming, outgoingRequests: outgoing }),
  setLoadedOnce: (isLoadedOnce) => set({ isLoadedOnce }),
  clearCache: () => set({ friends: [], incomingRequests: [], outgoingRequests: [], isLoadedOnce: false }),
}));
