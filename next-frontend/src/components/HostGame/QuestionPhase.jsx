"use client";
import React from 'react';
import { motion } from 'framer-motion';
import CountdownRing from './CountdownRing';
import { displayAnswerText, isTrueFalseQuestion } from '@/lib/questionTypes';

const MC_ANSWER_COLORS = [
  { bg: "#5D3FD3", label: "A", text: "white" },
  { bg: "#FFCD29", label: "B", text: "#1a1a1a" },
  { bg: "#E74C3C", label: "C", text: "white" },
  { bg: "#27AE60", label: "D", text: "white" },
];

const TF_ANSWER_COLORS = {
  true: { bg: "#2ea84a", label: "T", text: "white" },
  false: { bg: "#FF4B4B", label: "F", text: "white" },
};

function getTrueFalseColor(answer) {
  const label = displayAnswerText(answer.text).toLowerCase();
  return TF_ANSWER_COLORS[label] || TF_ANSWER_COLORS.true;
}

function getAnswerColor(answer, index, isTrueFalse) {
  if (isTrueFalse) {
    return getTrueFalseColor(answer);
  }
  return MC_ANSWER_COLORS[index] || MC_ANSWER_COLORS[0];
}

export default function QuestionPhase({ question, timeLeft, totalTime, answered, total }) {
  const isTrueFalse = isTrueFalseQuestion(question?.questionType);

  return (
    <motion.div
      key="question"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative"
    >

      <div className="relative z-10 flex flex-col flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-zk-black border-[2px] border-black rounded-lg px-6 py-3 text-left">
            <span className="text-white/50 text-xs font-black uppercase tracking-widest leading-none mb-1 block">
              Round {question.round || 1}
            </span>
            <p className="text-white font-black leading-none" style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.2rem', letterSpacing: '1px', paddingTop: '4px' }}>
              Match {question.match || 1}
            </p>
          </div>

          <CountdownRing timeLeft={timeLeft} total={totalTime} />

          <div className="bg-zk-black border-[2px] border-black rounded-lg px-6 py-3 text-right">
            <span className="text-white/50 text-xs font-black uppercase tracking-widest leading-none mb-1 block">
              Answered
            </span>
            <p className="text-white font-black leading-none" style={{ fontFamily: 'var(--font-amatic-sc)', fontSize: '2.2rem', letterSpacing: '1px', paddingTop: '4px' }}>
              <motion.span key={answered}>{answered}</motion.span>
              <span className="text-white/40"> / {total || "—"}</span>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zk-panel-bg border-[2px] border-zk-border rounded-lg overflow-hidden mb-6 flex-1 flex flex-col items-center justify-center"
        >
          {question.imageUrl && (
            <div className="w-full bg-[#2C3E50] flex items-center justify-center p-4 border-b-[3px] border-zk-border">
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-h-48 rounded-xl object-cover"
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-2xl lg:text-4xl xl:text-5xl font-black text-zk-text text-center leading-tight uppercase">
              {question.questionText}
            </p>
          </div>
        </motion.div>

        <div className={`grid gap-4 w-full ${isTrueFalse ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {question.answers?.map((answer, i) => {
            const color = getAnswerColor(answer, i, isTrueFalse);
            const label = displayAnswerText(answer.text);

            return (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className={`flex items-center gap-4 rounded-lg px-5 py-4 border-[2px] border-zk-border ${isTrueFalse ? 'justify-center' : ''}`}
                style={{ backgroundColor: color.bg }}
              >
                {!isTrueFalse && (
                  <div className="w-10 h-10 bg-zk-panel-bg/30 rounded-lg flex items-center justify-center border-[2px] border-black/20 flex-shrink-0">
                    <span className="font-black text-lg" style={{ color: color.text }}>
                      {color.label}
                    </span>
                  </div>
                )}
                <span
                  className={`font-black flex-1 uppercase ${isTrueFalse ? 'text-2xl lg:text-3xl text-center' : 'text-lg lg:text-xl'}`}
                  style={{ color: color.text }}
                >
                  {label}
                </span>
                {!isTrueFalse && (
                  <div
                    className="w-8 h-8 rounded-full border-[3px] flex-shrink-0"
                    style={{ borderColor: color.text === "white" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}