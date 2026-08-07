"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import CountdownRing from './CountdownRing';
import { displayAnswerText } from '@/lib/questionTypes';
import { hasLayerOrdering, sortAnswersByLayer } from '@/lib/dragLayersUtils';

export default function DragLayersPhase({ question, timeLeft, totalTime, answered, total }) {
  const steps = useMemo(() => {
    const answers = question?.answers || [];
    if (hasLayerOrdering(answers)) {
      return sortAnswersByLayer(answers);
    }
    return answers;
  }, [question?.answers]);

  const layerCount = question?.layerCount ?? steps.length;
  const showOrderedKey = hasLayerOrdering(steps);

  return (
    <motion.div
      key="drag-layers"
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
            {showOrderedKey
              ? 'Correct step order (answer key)'
              : `Players order ${layerCount} steps`}
          </p>
        </motion.div>

        {showOrderedKey ? (
          <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full">
            {steps.map((answer, index) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-xl border-[3px] border-zk-border bg-zk-bg flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-black uppercase text-zk-text/50">Step</span>
                  <span className="font-black text-lg text-zk-text">{index + 1}</span>
                </div>
                <div
                  className={`flex-1 rounded-xl border-[3px] border-zk-border px-4 py-3 font-black text-white ${answer.color}`}
                >
                  {displayAnswerText(answer.text) || `Step ${index + 1}`}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full rounded-xl border-[3px] border-zk-border bg-zk-panel-bg/90 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zk-text/50 mb-3">
              Steps in play
            </p>
            <div className="flex flex-wrap gap-2">
              {steps.map((answer) => (
                <div
                  key={answer.id}
                  className={`rounded-xl border-[3px] border-zk-border px-4 py-2 font-black text-white ${answer.color}`}
                >
                  {displayAnswerText(answer.text) || 'Step'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}