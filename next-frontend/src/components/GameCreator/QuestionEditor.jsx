"use client";
import React from 'react';
import { Image, Clock, Star, Settings, Trash2 } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';

const QuestionEditor = () => {
  const { questions, activeQuestionId, activeRound, updateActiveQuestion, deleteQuestion } = useQuizStore();
  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  if (!activeQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-white/40 backdrop-blur-md border-[3px] border-dashed border-zk-black rounded-xl">
        <p className="font-black text-2xl text-zk-black/30 uppercase tracking-tighter">Select or Add a question to get started</p>
      </div>
    );
  }

  const roundQuestions = questions.filter(q => q.round === activeRound);
  const questionNumber = roundQuestions.findIndex(q => q.id === activeQuestion.id) + 1;

  return (
    <div className="flex flex-col gap-6 p-6 zk-panel">
      {/* Question Title */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Question {questionNumber}</label>
          <button 
            onClick={() => deleteQuestion(activeQuestion.id)}
            className="flex items-center gap-1.5 text-[#E74C3C] border-[2px] border-[#E74C3C] hover:bg-[#E74C3C] hover:text-white px-3 py-1.5 rounded-lg transition-all font-black text-sm uppercase tracking-widest"
          >
            <Trash2 size={18} strokeWidth={3} />
            Delete
          </button>
        </div>
        <textarea 
          value={activeQuestion.text || ''}
          onChange={(e) => updateActiveQuestion({ text: e.target.value })}
          placeholder="Start typing your question here..."
          className="w-full border-[3px] border-zk-black p-4 font-bold text-zk-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-zk-blue/30 transition-all text-xl h-24 resize-none rounded-lg bg-white/50"
        />
      </div>

      {/* Media and Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Media Upload */}
        <div 
          className="border-[3px] border-dashed border-zk-black p-4 flex flex-col items-center justify-center gap-4 bg-white/40 cursor-pointer hover:bg-zk-yellow/10 transition-colors h-48 relative rounded-lg"
          onClick={() => document.getElementById('image-upload').click()}
        >
          {activeQuestion.image ? (
            <img src={activeQuestion.image} alt="Uploaded" className="h-full object-contain" />
          ) : (
            <>
              <Image size={48} className="text-zk-black/50" />
              <p className="font-bold text-zk-black/70 text-sm">Drag & drop or click to upload</p>
            </>
          )}
          <input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  updateActiveQuestion({ image: reader.result });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {/* Question Settings */}
        <div className="border-[3px] border-zk-black p-6 bg-white/40 backdrop-blur-md flex flex-col gap-4 rounded-lg">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Time Limit</label>
              <div className="relative">
                <select className="w-full border-[2px] border-zk-black p-2 font-bold text-zk-black focus:outline-none bg-white/80 appearance-none rounded-lg">
                  <option>30 Seconds</option>
                  <option>20 Seconds</option>
                  <option>60 Seconds</option>
                </select>
                <Clock size={16} className="absolute right-3 top-3 text-zk-black/50 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Points</label>
              <div className="relative">
                <select className="w-full border-[2px] border-zk-black p-2 font-bold text-zk-black focus:outline-none bg-white/80 appearance-none rounded-lg">
                  <option>Standard</option>
                  <option>Double</option>
                  <option>No Points</option>
                </select>
                <Star size={16} className="absolute right-3 top-3 text-zk-black/50 pointer-events-none" />
              </div>
            </div>
          </div>

          <button className="w-full bg-white text-zk-black border-[2px] border-zk-black py-2 font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 rounded-lg mt-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Settings size={16} />
            Advanced Question Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
