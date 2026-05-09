import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TransitionContext = createContext(null);

export const TransitionProvider = ({ children }) => {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'closing' | 'opening'
  const navigate = useNavigate();
  const targetRef = useRef(null);

  // Call this to trigger the blink and navigate
  const blinkTo = useCallback((path) => {
    targetRef.current = path;
    setPhase('closing');
  }, []);

  // Called when the "close" animation finishes — navigate then start opening
  const onCloseDone = useCallback(() => {
    navigate(targetRef.current);
    setPhase('opening');
  }, [navigate]);

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
