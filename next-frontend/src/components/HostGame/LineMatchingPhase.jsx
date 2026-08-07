"use client";
import React from 'react';
import { motion } from 'framer-motion';
import CountdownRing from './CountdownRing';
import { displayAnswerText } from '@/lib/questionTypes';

function ItemChip({ item }) {
  return (
    <div
      className={`rounded-xl border-[3px] border-zk-border px-4 py-3 font-black text-white ${item.color}`}
    >
      {displayAnswerText(item.text) || '—'}
    </div>
  );
}

export default function LineMatchingPhase({ question, timeLeft, totalTime, answered, total }) {
  const leftItems = question?.leftItems || [];
  const rightItems = question?.rightItems || [];

  return (
    <motion.div
      key="line-matching"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative"
    >
      <div className="relative z-10 flex flex-col flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-zk-black border-[3px] border-black rounded-xl px-6 py-3 text-left">
            <span className="text-white/50 text-xs font-black uppercase tracking-widest leading-none mb-1 block">
              Round {question.round || 1}
            </span>
            <p
              className="text-white font-black leading-none"
              style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.2rem', letterSpacing: '1px', paddingTop: '4px' }}
            >
              Match {question.match || 1}
            </p>
          </div>

          <CountdownRing timeLeft={timeLeft} total={totalTime} />

          <div className="bg-zk-black border-[3px] border-black rounded-xl px-6 py-3 text-right">
            <span className="text-white/50 text-xs font-black uppercase tracking-widest leading-none mb-1 block">
              Answered
            </span>
            <p
              className="text-white font-black leading-none"
              style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.2rem', letterSpacing: '1px', paddingTop: '4px' }}
            >
              <motion.span key={answered}>{answered}</motion.span>
              <span className="text-white/40"> / {total || '—'}</span>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-zk-panel-bg border-[4px] border-zk-border rounded-2xl overflow-hidden mb-6 p-8"
        >
          <p className="text-2xl lg:text-4xl font-black text-zk-text text-center leading-tight uppercase">
            {question.questionText}
          </p>
          <p className="text-center text-zk-text/50 font-bold text-sm mt-3 uppercase tracking-widest">
            Players connect {question.pairCount || leftItems.length} matching pairs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          <div className="rounded-xl border-[3px] border-zk-border bg-zk-panel-bg/90 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zk-text/50 mb-3">Left prompts</p>
            <div className="flex flex-col gap-2">
              {leftItems.map((item) => (
                <ItemChip key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border-[3px] border-zk-border bg-zk-panel-bg/90 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zk-text/50 mb-3">Right matches (shuffled)</p>
            <div className="flex flex-col gap-2">
              {rightItems.map((item) => (
                <ItemChip key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}