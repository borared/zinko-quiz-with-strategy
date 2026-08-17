"use client";
import React from 'react';
import { motion } from 'framer-motion';
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
  const totalVotes = stats.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
      {stats.map((s, i) => {
        const color = resolveBarColor(s, i, isTrueFalse);
        const votePct = Math.round((s.count / totalVotes) * 100);
        const answerLabel = isDragLayers
          ? (s.layerLabel || displayAnswerText(s.text))
          : isLineMatching
            ? (s.pairLabel || `Pair ${i + 1}`)
            : isTrueFalse
              ? displayAnswerText(s.text)
              : color.label;

        const isChoiceCorrect = s.isCorrect && revealed;

        return (
          <div 
            key={s.id || i}
            className={`relative flex items-center justify-between p-3 border-[2px] rounded-lg overflow-hidden transition-all ${
              isChoiceCorrect 
                ? 'border-[#27AE60] bg-[#27AE60]' 
                : 'border-zk-border bg-zk-panel-bg'
            }`}
          >
            {/* Background progress slide-in */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${votePct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
              className="absolute top-0 left-0 bottom-0 pointer-events-none opacity-[0.15]"
              style={{ backgroundColor: isChoiceCorrect ? '#000000' : color.bg }}
            />

            {/* Left Content: Letter Badge + Answer Text */}
            <div className="flex items-center gap-4 z-10 pr-4 truncate">
              {/* Option Letter/Label Badge */}
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-[2px] shrink-0 ${
                  isChoiceCorrect 
                    ? 'border-black bg-black text-white' 
                    : 'border-black/10'
                }`}
                style={isChoiceCorrect ? {} : { color: color.text, backgroundColor: color.bg }}
              >
                {isChoiceCorrect ? (
                  <Check size={16} strokeWidth={4} />
                ) : (
                  answerLabel
                )}
              </div>

              {/* Answer Text */}
              <span className={`font-black text-sm truncate ${isChoiceCorrect ? 'text-black' : 'text-zk-text'}`}>
                {isLineMatching && s.matchText ? (
                  <span>
                    {displayAnswerText(s.text)} → {displayAnswerText(s.matchText)}
                  </span>
                ) : (
                  displayAnswerText(s.text) || answerLabel
                )}
              </span>
            </div>

            {/* Right Content: Stats (Pct / Count) */}
            <div className="flex items-center gap-4 z-10 shrink-0">
              {/* Progress bar inline */}
              <div className={`hidden sm:block w-24 h-2 rounded-full overflow-hidden ${isChoiceCorrect ? 'bg-black/20' : 'bg-zk-text/10'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${votePct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: isChoiceCorrect ? '#000000' : color.bg }}
                />
              </div>

              {/* Vote Count & % */}
              <div className="text-right min-w-[70px]">
                <span className={`font-black text-sm block leading-none ${isChoiceCorrect ? 'text-black' : 'text-zk-text'}`}>
                  {s.count} {s.count === 1 ? 'vote' : 'votes'}
                </span>
                <span className={`text-xs font-bold ${isChoiceCorrect ? 'text-black/70' : 'text-zk-text/60'}`}>
                  {votePct}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}