"use client";
import React from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
  RED: "#EF4444",
  BLUE: "#3B82F6",
  GREEN: "#22C55E",
  YELLOW: "#EAB308",
};

export default function VaultBreakerPlayer({ assignedColors, onHold, onRelease }) {
  const [pressedKeys, setPressedKeys] = React.useState(new Set());

  // Prevent context menu or selecting text while holding
  const preventDefault = (e) => {
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!assignedColors || assignedColors.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      let colorMatch = null;
      if (key === 'R') colorMatch = 'RED';
      if (key === 'B') colorMatch = 'BLUE';
      if (key === 'G') colorMatch = 'GREEN';
      if (key === 'Y') colorMatch = 'YELLOW';

      if (colorMatch && assignedColors.includes(colorMatch) && !pressedKeys.has(key)) {
        setPressedKeys(prev => new Set(prev).add(key));
        onHold(colorMatch);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase();
      let colorMatch = null;
      if (key === 'R') colorMatch = 'RED';
      if (key === 'B') colorMatch = 'BLUE';
      if (key === 'G') colorMatch = 'GREEN';
      if (key === 'Y') colorMatch = 'YELLOW';

      if (colorMatch && pressedKeys.has(key)) {
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        onRelease(colorMatch);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [assignedColors, onHold, onRelease, pressedKeys]);

  if (!assignedColors || assignedColors.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-zk-bold text-white text-2xl text-center px-4">
          Waiting for assigned buttons...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 bg-slate-900 relative">
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      <div className="relative z-10 text-center mb-4">
         <h2 className="gasoek-one-regular text-4xl text-zk-yellow drop-shadow-md">
           HOLD YOUR COLORS!
         </h2>
         <p className="font-zk-bold text-white/80 mt-2 text-lg">
           Communicate with your team to crack the vault.
         </p>
         <p className="font-zk-bold text-white/50 mt-1 text-sm">
           On desktop, press and hold the matching keys!
         </p>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-6 w-full max-w-sm">
        {assignedColors.map((color) => {
          const isPressedViaKey = pressedKeys.has(color[0]);
          return (
            <motion.button
              key={color}
              whileTap={{ scale: 0.9, y: 8 }}
              animate={isPressedViaKey ? { scale: 0.9, y: 8 } : { scale: 1, y: 0 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-black shadow-[0_12px_0_0_#000] focus:outline-none flex flex-col items-center justify-center"
              style={{ backgroundColor: COLOR_MAP[color] }}
              onPointerDown={(e) => {
                 if (isPressedViaKey) return;
                 e.currentTarget.setPointerCapture(e.pointerId);
                 onHold(color);
              }}
              onPointerUp={(e) => {
                 if (isPressedViaKey) return;
                 e.currentTarget.releasePointerCapture(e.pointerId);
                 onRelease(color);
              }}
              onPointerCancel={() => {
                 if (!isPressedViaKey) onRelease(color);
              }}
              onContextMenu={preventDefault}
            >
               <span className="font-zk-bold text-black/40 text-2xl drop-shadow-sm uppercase flex flex-col items-center">
                 {color}
                 <span className="text-sm mt-1 bg-black/20 text-black/80 px-2 py-1 rounded">Key: {color[0]}</span>
               </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
