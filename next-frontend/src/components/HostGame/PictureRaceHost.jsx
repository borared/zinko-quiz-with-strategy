import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Users } from 'lucide-react';
import { DEFAULT_TIME_LIMIT } from '@/lib/timeLimit';

const PictureRaceHost = ({ question, timeLeft, totalTime = DEFAULT_TIME_LIMIT, answered, total }) => {
  const percentage = Math.max(0, (timeLeft / totalTime) * 100);
  
  let timerColor = 'bg-zk-green';
  if (timeLeft <= 5) timerColor = 'bg-red-500 animate-pulse';
  else if (timeLeft <= 10) timerColor = 'bg-orange-400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto"
    >
      <div className="w-full flex justify-between items-center mb-6">
        <div className="zk-panel !shadow-none bg-zk-panel-bg flex items-center gap-3 px-5 py-3 rounded-2xl border-[3px] border-zk-border">
          <div className="w-10 h-10 rounded-full bg-zk-purple text-white flex items-center justify-center font-black text-xl">
            {timeLeft}
          </div>
          <div className="flex-1 min-w-[200px] h-3 bg-zk-bg rounded-full overflow-hidden border-[2px] border-zk-border">
            <motion.div
              className={`h-full ${timerColor}`}
              initial={{ width: '100%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          <Timer className="text-zk-text/50 ml-2" size={24} />
        </div>

        <div className="zk-panel !shadow-none bg-zk-panel-bg flex items-center gap-3 px-6 py-3 rounded-2xl border-[3px] border-zk-border">
          <Users className="text-zk-purple" size={28} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-zk-text/50 leading-none">Answers</span>
            <span className="text-3xl font-black font-['Outfit'] leading-none mt-1">
              {answered} <span className="text-zk-text/40 text-xl">/ {total}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-full max-w-4xl max-h-[60vh] h-full zk-panel bg-white p-4 rounded-3xl border-[4px] border-zk-border !shadow-none flex items-center justify-center overflow-hidden">
          {question?.imageUrl ? (
            <motion.img 
              src={question.imageUrl} 
              alt="Guess this picture" 
              className="max-w-full max-h-full object-contain rounded-xl"
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: totalTime, ease: "linear" }}
            />
          ) : (
            <div className="text-2xl font-bold text-zk-text/50 uppercase tracking-widest amatic-sc-regular">
              Missing Image
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PictureRaceHost;
