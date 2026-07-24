"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useTransitionStore } from '@/store/useTransitionStore';
import { useRouter } from 'next/navigation';

const lidEase = [0.76, 0, 0.24, 1];

const EyeBlinkOverlay = () => {
  const router = useRouter();
  const { phase, onCloseDone, onOpenDone } = useTransitionStore();

  const isVisible = phase === 'closing' || phase === 'opening';
  const isClosing = phase === 'closing';

  // Top eyelid: slides DOWN from -100% to 0% on close, back to -100% on open
  // Bottom eyelid: slides UP from 100% to 0% on close, back to 100% on open
  const topVariants    = { hidden: { y: '-100%' }, visible: { y: '0%' } };
  const bottomVariants = { hidden: { y:  '100%' }, visible: { y: '0%' } };

  const transition = { duration: 0.38, ease: lidEase };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Top eyelid */}
          <motion.div
            key="top-lid"
            className="fixed inset-x-0 top-0 z-[9999] flex flex-col items-center justify-end"
            style={{ height: '50vh', backgroundColor: '#FFD12B' }}
            variants={topVariants}
            initial="hidden"
            animate={isClosing ? 'visible' : 'hidden'}
            transition={transition}
            onAnimationComplete={(definition) => {
              // When the top lid finishes CLOSING (reached 'visible' = center)
              if (definition === 'visible') {
                onCloseDone(router);
              }
            }}
          >
            <div className="w-full h-[6px] bg-zk-black" />
          </motion.div>

          {/* Bottom eyelid */}
          <motion.div
            key="bottom-lid"
            className="fixed inset-x-0 bottom-0 z-[9999] flex flex-col items-center justify-start"
            style={{ height: '50vh', backgroundColor: '#FFD12B' }}
            variants={bottomVariants}
            initial="hidden"
            animate={isClosing ? 'visible' : 'hidden'}
            transition={transition}
            onAnimationComplete={(definition) => {
              // When the bottom lid finishes OPENING (slid back to 'hidden' = off screen)
              if (definition === 'hidden') {
                onOpenDone();
              }
            }}
          >
            <div className="w-full h-[6px] bg-zk-black" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EyeBlinkOverlay;

