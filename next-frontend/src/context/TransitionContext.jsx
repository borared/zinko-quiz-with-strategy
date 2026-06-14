"use client";
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TransitionContext = createContext(null);

export const TransitionProvider = ({ children }) => {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'closing' | 'opening'
  const router = useRouter();
  const targetRef = useRef(null);

  // Call this to trigger the blink and router
  const blinkTo = useCallback((path) => {
    targetRef.current = path;
    setPhase('closing');
  }, []);

  // Called when the "close" animation finishes — router then start opening
  const onCloseDone = useCallback(() => {
    if (targetRef.current) {
      router.push(targetRef.current);
    }
    setPhase('opening');
  }, [router]);

  // Called when the "open" animation finishes
  const onOpenDone = useCallback(() => {
    setPhase('idle');
  }, []);

  return (
    <TransitionContext.Provider value={{ phase, blinkTo, onCloseDone, onOpenDone }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const usePageTransition = () => useContext(TransitionContext);

