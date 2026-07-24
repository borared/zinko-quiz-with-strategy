"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { displayAnswerText } from '@/lib/questionTypes';

const MC_ANSWER_COLORS = [
  { bg: "#5D3FD3", label: "A", text: "white" },
  { bg: "#FFCD29", label: "B", text: "#1a1a1a" },
  { bg: "#E74C3C", label: "C", text: "white" },
  { bg: "#27AE60", label: "D", text: "white" },
];

const TF_COLOR_MAP = {
  true: { bg: "#2ea84a", label: "T", text: "white" },
  false: { bg: "#FF4B4B", label: "F", text: "white" },
};

function resolveBarColor(stat, index, isTrueFalse) {
  if (stat.color) {
    const hex = stat.color.replace('bg-[', '').replace(']', '');
    return { bg: hex.startsWith('#') ? hex : `#${hex}`, label: stat.id, text: "white" };
  }

  if (isTrueFalse) {
    const label = displayAnswerText(stat.text).toLowerCase();
    return TF_COLOR_MAP[label] || TF_COLOR_MAP.true;
  }

  return MC_ANSWER_COLORS[index] || MC_ANSWER_COLORS[0];
}

export default function AnswerBarChart({ stats, revealed, questionType }) {
  if (!stats || stats.length === 0) return null;

  const isTrueFalse = questionType === 'true_false';
  const isDragLayers = questionType === 'drag_layers';
  const isLineMatching = questionType === 'line_matching';
  const maxCount = Math.max(1, ...stats.map((s) => s.count));

  return (
    <div className={`flex items-end justify-center gap-6 min-h-[220px] ${isTrueFalse || isDragLayers || isLineMatching ? 'max-w-4xl mx-auto' : ''}`}>
      {stats.map((s, i) => {
        const color = resolveBarColor(s, i, isTrueFalse);
        const pct = (s.count / maxCount) * 100;
        const answerLabel = isDragLayers
          ? (s.layerLabel || displayAnswerText(s.text))
          : isLineMatching
            ? (s.pairLabel || `Pair ${i + 1}`)
            : isTrueFalse
              ? displayAnswerText(s.text)
              : color.label;

        return (
          <div key={s.id || i} className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
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
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#27AE60] text-white w-8 h-8 rounded-lg flex items-center justify-center border-[2px] border-zk-black shadow-[2px_2px_0_#000]">
                    <Check size={20} strokeWidth={4} />
                  </div>
                )}
              </motion.div>
            </div>
            {!isTrueFalse && !isDragLayers && !isLineMatching && (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center border-[3px] border-black font-black text-lg"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {color.label}
              </div>
            )}
            <p className="text-black/60 text-xs text-center w-full px-1 font-bold uppercase leading-tight">
              {isLineMatching ? (
                <>
                  {answerLabel}
                  {s.matchText ? (
                    <span className="block text-[10px] normal-case text-black/45 mt-0.5 truncate">
                      {displayAnswerText(s.text)} → {displayAnswerText(s.matchText)}
                    </span>
                  ) : null}
                </>
              ) : (
                s.layerLabel || answerLabel
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}