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
        <p
          className="font-bold text-white/90 mt-2 text-3xl"
          style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
        >
          Talk with your friend to hold the correct 3 color at the same time.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-6 w-full max-w-sm">
        {assignedColors.map((color) => {
          const isPressedViaKey = pressedKeys.has(color[0]);
          return (
            <motion.button
              key={color}
              initial={{ scale: 1, x: 0, y: 0, boxShadow: "10px 10px 0px 0px rgba(0,0,0,1)" }}
              animate={isPressedViaKey
                ? { scale: 0.95, x: 8, y: 8, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }
                : { scale: 1, x: 0, y: 0, boxShadow: "10px 10px 0px 0px rgba(0,0,0,1)" }}
              whileHover={isPressedViaKey
                ? { scale: 0.95, x: 8, y: 8, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }
                : { scale: 1.05, x: -2, y: -2, boxShadow: "14px 14px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ scale: 0.95, x: 8, y: 8, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-[6px] border-zk-black focus:outline-none flex flex-col items-center justify-center transition-colors"
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
              {/* Empty button, just color and border */}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Right Instruction */}
      <div
        className="absolute bottom-6 right-6 z-20 text-right text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        style={{ fontFamily: 'var(--font-amatic-sc)', letterSpacing: '2px' }}
      >
        <p className="text-3xl font-bold mb-2">Desktop Keys:</p>
        <div className="flex flex-col items-end gap-2">
          {assignedColors.map(c => (
            <span key={c} className="text-2xl bg-zk-black text-white border-2 border-white px-3 py-1 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
              Hold <strong className="text-zk-yellow">{c[0]}</strong> for {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
