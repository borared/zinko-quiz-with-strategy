import { create } from 'zustand';

export const useTransitionStore = create((set, get) => ({
  phase: 'idle', // 'idle' | 'closing' | 'opening'
  targetPath: null,
  
  blinkTo: (path) => {
    set({ targetPath: path, phase: 'closing' });
  },
  
  onCloseDone: (router) => {
    const { targetPath } = get();
    if (targetPath && router) {
      router.push(targetPath);
    }
    set({ phase: 'opening' });
  },
  
  onOpenDone: () => {
    set({ phase: 'idle' });
  }
}));
