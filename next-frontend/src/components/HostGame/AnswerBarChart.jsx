"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANSWER_COLORS = [
  { bg: "#5D3FD3", label: "A", text: "white" },   // Purple
  { bg: "#FFCD29", label: "B", text: "#1a1a1a" },  // Yellow
  { bg: "#E74C3C", label: "C", text: "white" },    // Red
  { bg: "#27AE60", label: "D", text: "white" },     // Green
];

export default function AnswerBarChart({ stats, revealed }) {
  if (!stats || stats.length === 0) return null;
  const maxCount = Math.max(1, ...stats.map((s) => s.count));

  return (
    <div className="flex items-end justify-center gap-6 h-40">
      {stats.map((s, i) => {
        const color = ANSWER_COLORS[i] || ANSWER_COLORS[0];
        const pct = (s.count / maxCount) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
            <AnimatePresence>
              {revealed && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-black"
                  style={{ color: s.isCorrect ? "#27AE60" : "#E74C3C" }}
                >
                  {s.count}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="w-full bg-black/10 rounded-t-xl overflow-hidden h-32 flex items-end relative">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                className="w-full rounded-t-xl relative"
                style={{
                  backgroundColor: color.bg,
                  boxShadow: s.isCorrect && revealed ? "0 0 20px rgba(39,174,96,0.6)" : "none",
                  border: s.isCorrect && revealed ? "3px solid #27AE60" : "none",
                }}
              >
                {s.isCorrect && revealed && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl">✅</div>
                )}
              </motion.div>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center border-[3px] border-black font-black text-lg"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {color.label}
            </div>
            <p className="text-black/60 text-xs text-center truncate w-full px-1 font-bold">
              {s.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
