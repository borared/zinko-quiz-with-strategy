"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Link2 } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import {
  addLineMatchingPair,
  answersToPairs,
  MAX_LINE_MATCH_PAIRS,
  MIN_LINE_MATCH_PAIRS,
  pairsToAnswers,
  removeLineMatchingPair,
  updatePairField,
} from '@/lib/lineMatchingUtils';
import { displayAnswerText } from '@/lib/questionTypes';

const ROW_SPRING = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 };
const DESKTOP_GRID = 'sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)_2.5rem]';

function MatchInput({ value, onChange, placeholder, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-[3px] border-zk-black ${color} text-white min-w-0 w-full`}>
      <input
        value={displayAnswerText(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent border-none outline-none font-bold text-sm text-white placeholder:text-white/50"
      />
    </div>
  );
}

function ColumnLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-zk-black/40 sm:hidden">
      {children}
    </p>
  );
}

export default function LineMatchingEditor() {
  const { questions, activeQuestionId, updateActiveQuestion } = useQuizStore();
  const activeQuestion = questions.find((question) => question.id === activeQuestionId);

  const pairs = useMemo(
    () => answersToPairs(activeQuestion?.answers || []),
    [activeQuestion?.answers]
  );

  if (!activeQuestion) return null;

  const syncPairs = (nextPairs) => {
    updateActiveQuestion({ answers: pairsToAnswers(nextPairs) });
  };

  const handleLeftChange = (index, text) => {
    syncPairs(updatePairField(pairs, index, 'leftText', text));
  };

  const handleRightChange = (index, text) => {
    syncPairs(updatePairField(pairs, index, 'rightText', text));
  };

  return (
    <div className="zk-panel p-5 lg:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zk-black/50">Answer widget</p>
          <h3 className="font-black text-lg text-zk-black uppercase">Line matching pairs</h3>
        </div>
        <button
          type="button"
          onClick={() => syncPairs(addLineMatchingPair(pairs))}
          disabled={pairs.length >= MAX_LINE_MATCH_PAIRS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[2px] border-zk-black bg-zk-green text-white font-black text-xs uppercase tracking-widest disabled:opacity-40"
        >
          <Plus size={14} strokeWidth={3} />
          Add pair
        </button>
      </div>

      <p className="text-sm font-bold text-zk-black/60">
        Create matching pairs — left prompts connect to the correct right answers in battle.
      </p>

      <div className={`hidden sm:grid ${DESKTOP_GRID} gap-x-3 gap-y-1 items-end`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-zk-black/40">Left</p>
        <span aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zk-black/40">Right</p>
        <span className="w-10" aria-hidden="true" />
      </div>

      <motion.div layout className="flex flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {pairs.map((pair, index) => (
            <motion.div
              key={pair.id}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, height: 0, marginBottom: 0 }}
              transition={ROW_SPRING}
              className={`grid grid-cols-1 ${DESKTOP_GRID} gap-x-3 gap-y-2 sm:gap-y-0 items-center`}
            >
              <div className="flex flex-col gap-1 min-w-0 sm:contents">
                <ColumnLabel>Left</ColumnLabel>
                <MatchInput
                  value={pair.leftText}
                  onChange={(text) => handleLeftChange(index, text)}
                  placeholder="Left term..."
                  color={pair.leftColor}
                />
              </div>

              <div className="hidden sm:flex items-center justify-center">
                <div className="flex items-center gap-1 text-zk-black/35">
                  <span className="w-6 h-[3px] bg-zk-black/20 rounded-full" />
                  <Link2 size={16} strokeWidth={3} />
                  <span className="w-6 h-[3px] bg-zk-black/20 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col gap-1 min-w-0 sm:contents">
                <ColumnLabel>Right</ColumnLabel>
                <MatchInput
                  value={pair.rightText}
                  onChange={(text) => handleRightChange(index, text)}
                  placeholder="Right match..."
                  color={pair.rightColor}
                />
              </div>

              <motion.button
                layout
                type="button"
                onClick={() => syncPairs(removeLineMatchingPair(pairs, index))}
                disabled={pairs.length <= MIN_LINE_MATCH_PAIRS}
                className="justify-self-end sm:justify-self-center shrink-0 w-10 h-10 rounded-lg border-[2px] border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white transition-colors disabled:opacity-30 flex items-center justify-center"
                aria-label={`Remove pair ${index + 1}`}
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}