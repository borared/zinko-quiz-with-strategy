"use client";
import React from 'react';
import { motion } from 'framer-motion';
import CountdownRing from './CountdownRing';

const ANSWER_COLORS = [
  { bg: "#5D3FD3", label: "A", text: "white" },   // Purple
  { bg: "#FFCD29", label: "B", text: "#1a1a1a" },  // Yellow
  { bg: "#E74C3C", label: "C", text: "white" },    // Red
  { bg: "#27AE60", label: "D", text: "white" },     // Green
];

export default function QuestionPhase({ question, timeLeft, totalTime, answered, total }) {
  return (
    <motion.div
      key="question"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url('/background_battle/city.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#C4962C",
      }}
    >
      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 p-6 lg:p-8">

        {/* Top bar: Question counter | Timer | Answered */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl px-5 py-2 text-center">
            <span className="text-zk-black/50 text-xs font-black uppercase tracking-widest">
              Round {question.round || 1}
            </span>
            <p className="text-zk-black font-black text-xl whitespace-nowrap">
              Match {question.match || 1}
            </p>
          </div>

          <CountdownRing timeLeft={timeLeft} total={totalTime} />

          <div className="bg-white border-[3px] border-zk-black shadow-[4px_4px_0_#000] rounded-xl px-5 py-2 text-right">
            <span className="text-zk-black/50 text-xs font-black uppercase tracking-widest">
              Answered
            </span>
            <p className="text-zk-black font-black text-xl">
              <motion.span key={answered}>{answered}</motion.span>
              <span className="text-zk-black/30"> / {total || "—"}</span>
            </p>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0_#000] rounded-2xl overflow-hidden mb-6 flex-1 flex flex-col items-center justify-center"
        >
          {question.imageUrl && (
            <div className="w-full bg-[#2C3E50] flex items-center justify-center p-4 border-b-[3px] border-zk-black">
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-h-48 rounded-xl object-cover"
              />
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-2xl lg:text-4xl xl:text-5xl font-black text-zk-black text-center leading-tight uppercase">
              {question.questionText}
            </p>
          </div>
        </motion.div>

        {/* Answer tiles */}
        <div className="grid grid-cols-2 gap-4">
          {question.answers?.map((answer, i) => {
            const color = ANSWER_COLORS[i] || ANSWER_COLORS[0];
            return (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-4 rounded-2xl px-5 py-4 border-[3px] border-zk-black shadow-[4px_4px_0_#000]"
                style={{ backgroundColor: color.bg }}
              >
                <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center border-[2px] border-black/20 flex-shrink-0">
                  <span className="font-black text-lg" style={{ color: color.text }}>
                    {color.label}
                  </span>
                </div>
                <span
                  className="font-black text-lg lg:text-xl flex-1"
                  style={{ color: color.text }}
                >
                  {answer.text}
                </span>
                <div
                  className="w-8 h-8 rounded-full border-[3px] flex-shrink-0"
                  style={{ borderColor: color.text === "white" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
