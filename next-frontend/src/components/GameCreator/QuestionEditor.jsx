"use client";
import React, { useEffect, useState } from 'react';
import { Image, Settings, Trash2 } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import { QUESTION_TYPES } from '@/lib/questionTypes';
import { DEFAULT_TIME_LIMIT, TIME_LIMIT_OPTIONS, normalizeTimeLimit } from '@/lib/timeLimit';
import QuestionTypePicker from './QuestionTypePicker';
import CreatorSelectPicker from './CreatorSelectPicker';

const POINTS_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'double', label: 'Double' },
  { value: 'none', label: 'No Points' },
];

const QuestionEditor = () => {
  const {
    questions,
    activeQuestionId,
    activeRound,
    updateActiveQuestion,
    deleteQuestion,
    setActiveQuestionType,
  } = useQuizStore();
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
  const timeLimit = normalizeTimeLimit(activeQuestion.time_limit ?? DEFAULT_TIME_LIMIT);
  const [pointsMode, setPointsMode] = useState('standard');

  useEffect(() => {
    setPointsMode('standard');
  }, [activeQuestionId]);

  return (
    <div className="flex flex-col gap-6 p-6 zk-panel">
      {/* Question Title */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center gap-3">
          <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Question {questionNumber}</label>
          <div className="flex items-center gap-2">
            <QuestionTypePicker
              value={activeQuestion.questionType || QUESTION_TYPES.MULTIPLE_CHOICE}
              onChange={setActiveQuestionType}
            />
            <button
              onClick={() => deleteQuestion(activeQuestion.id)}
              className="flex items-center gap-1.5 text-[#E74C3C] border-[2px] border-[#E74C3C] hover:bg-[#E74C3C] hover:text-white px-3 py-1.5 rounded-lg transition-all font-black text-sm uppercase tracking-widest"
            >
              <Trash2 size={18} strokeWidth={3} />
              Delete
            </button>
          </div>
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
        <div className="border-[3px] border-zk-black p-6 bg-white/40 backdrop-blur-md flex flex-col gap-4 rounded-lg overflow-visible">
          <div className="flex gap-4 overflow-visible">
            <div className="flex-1 flex flex-col gap-1 relative z-20">
              <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Time Limit</label>
              <CreatorSelectPicker
                fullWidth
                placement="top"
                value={timeLimit}
                onChange={(value) => updateActiveQuestion({ time_limit: Number(value) })}
                options={TIME_LIMIT_OPTIONS}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1 relative z-20">
              <label className="text-xs font-bold text-zk-black uppercase tracking-wider">Points</label>
              <CreatorSelectPicker
                fullWidth
                placement="top"
                value={pointsMode}
                onChange={setPointsMode}
                options={POINTS_OPTIONS}
              />
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
