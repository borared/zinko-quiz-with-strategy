import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/GameCreator/Sidebar';
import QuestionEditor from '../../components/GameCreator/QuestionEditor';
import AnswerGrid from '../../components/GameCreator/AnswerGrid';
import AiSidebar from '../../components/GameCreator/AiSidebar';
import { Wand2, Image, Upload, Link as LinkIcon, X, AlertCircle } from 'lucide-react';
import { QuizProvider, useQuiz } from '../../context/QuizContext';

const GameCreatorContent = () => {
  const {
    quizTitle, setQuizTitle,
    coverImage, setCoverImage,
    activeRound, setActiveRound,
    questions, handleSaveQuiz,
    isSaving, loading
  } = useQuiz();

  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-zk-yellow flex items-center justify-center font-black text-2xl uppercase italic tracking-tighter">
        Loading Quiz Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-[#5D3FD3] selection:text-white relative">
      {/* Cinematic Background Layer */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: 'url("https://res.cloudinary.com/dicrvjstp/image/upload/v1778512239/Gemini_Generated_Image_o8qfs4o8qfs4o8qf_kqpgha.png")',
          filter: 'brightness(0.8) contrast(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-zk-black/40 via-transparent to-zk-black/60"></div>
      </div>

      <div className="relative z-10">
        {/* Header / Navbar */}
        <nav className="ml-80 bg-white/80 backdrop-blur-md border-b-[3px] border-zk-black px-6 h-[80px] flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-[#5D3FD3] text-white p-1.5 border-[2px] border-zk-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg transition-transform hover:scale-110">
                <Wand2 size={24} strokeWidth={3} />
              </div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase text-zk-black">ZINKO CREATOR</h1>
            </div>

            <div className="h-8 w-[3px] bg-zk-black/10 rounded-full"></div>

            <div className="flex items-center gap-4">
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter Quiz Title..."
                className="bg-transparent border-none text-xl font-black uppercase tracking-tight text-zk-black placeholder-zk-black/30 focus:outline-none w-64 rounded px-2"
              />

              <button
                onClick={() => setIsImageModalOpen(true)}
                className={`flex items-center gap-2 border-[3px] border-zk-black px-3 py-1.5 font-bold text-sm rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${coverImage ? 'bg-zk-blue text-white' : 'bg-white text-zk-black'
                  }`}
              >
                <Image size={18} />
                {coverImage ? 'CHANGE COVER' : 'ADD COVER'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="bg-[#00C853] text-white border-[3px] border-zk-black px-6 py-2 font-black text-sm uppercase tracking-wider rounded-xl transition-all hover:translate-y-[2px] hover:translate-x-[2px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              {isSaving ? 'SAVING...' : 'SAVE QUIZ'}
            </button>
          </div>
        </nav>

        <main className="p-8 max-w-[1600px] mx-auto">
          <div className="flex gap-8 items-start">
            {/* Fixed Sidebar — stays locked on scroll */}
            <aside className="fixed top-[76px] left-0 w-80 h-[calc(100vh-76px)] z-30">
              <Sidebar />
            </aside>
            {/* Spacer to push content right past the fixed sidebar */}
            <div className="w-80 shrink-0"></div>

            {/* Scrollable Editor Workspace */}
            <div className="flex-1 flex flex-col gap-8 pb-32">
              {/* Round Switcher */}
              <div className="grid grid-cols-3 gap-6 bg-white/30 backdrop-blur-md p-4 border-[3px] border-zk-black rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                {[
                  { id: 1, label: 'Round 1', difficulty: 'Easy', color: 'bg-[#00C853]' },
                  { id: 2, label: 'Round 2', difficulty: 'Medium', color: 'bg-[#FFB300]' },
                  { id: 3, label: 'Round 3', difficulty: 'Hard', color: 'bg-[#D32F2F]' },
                ].map((round) => {
                  const count = questions.filter(q => q.round === round.id).length;
                  const isActive = activeRound === round.id;

                  return (
                    <button
                      key={round.id}
                      onClick={() => setActiveRound(round.id)}
                      className={`relative border-[3px] border-zk-black p-4 transition-all rounded-xl ${isActive
                        ? `${round.color} text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1`
                        : 'bg-white/90 text-zk-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-zk-black/50'}`}>
                            {round.difficulty}
                          </p>
                          <h3 className="text-xl font-black uppercase leading-tight">{round.label}</h3>
                        </div>
                        <div className={`w-10 h-10 border-[3px] border-zk-black flex items-center justify-center font-black text-lg rounded-lg ${count >= 6 ? 'bg-zk-blue text-white' : count > 0 ? 'bg-white text-zk-black' : 'bg-gray-100 text-gray-400'
                          }`}>
                          {count}/8
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <QuestionEditor />
              <AnswerGrid />
            </div>

            {/* Sticky AI Assistant Toggle */}
            <aside className="sticky top-28 shrink-0">
              <button
                onClick={() => setIsAiSidebarOpen(true)}
                className="bg-[#5D3FD3] text-white border-[3px] border-zk-black p-4 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center gap-2 group"
              >
                <Wand2 size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                <span className="font-black text-[10px] uppercase vertical-text">AI ASSISTANT</span>
              </button>
            </aside>
          </div>
        </main>
      </div>

      <AiSidebar isOpen={isAiSidebarOpen} onClose={() => setIsAiSidebarOpen(false)} />

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsImageModalOpen(false)}
              className="absolute inset-0 bg-zk-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-[4px] border-zk-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md relative z-10 p-8 rounded-2xl"
            >
              <button onClick={() => setIsImageModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>

              <h2 className="text-3xl font-black uppercase tracking-tight italic mb-2">Quiz Cover</h2>
              <p className="text-zk-black/60 font-bold text-sm mb-8 uppercase tracking-wide">Select a visual for your battle</p>

              <div className="flex flex-col gap-6">
                <div
                  className="aspect-video bg-gray-100 border-[3px] border-dashed border-zk-black rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zk-blue/5 transition-all group"
                  onClick={() => document.getElementById('cover-upload').click()}
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={40} className="text-zk-black/30 group-hover:text-zk-blue transition-colors" />
                      <span className="font-black text-sm uppercase tracking-wider text-zk-black/40">Upload Image File</span>
                    </>
                  )}
                  <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCoverImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <LinkIcon size={18} className="text-zk-black/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="PASTE IMAGE URL..."
                    value={typeof coverImage === 'string' && coverImage.startsWith('http') ? coverImage : ''}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full border-[3px] border-zk-black p-4 pl-12 font-black uppercase tracking-widest text-sm focus:outline-none focus:ring-4 focus:ring-zk-blue/20 transition-all rounded-xl"
                  />
                </div>

                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="w-full bg-zk-black text-white py-4 font-black uppercase tracking-widest text-lg rounded-xl hover:bg-zk-black/90 transition-all"
                >
                  Confirm Image
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GameCreator = () => (
  <QuizProvider>
    <GameCreatorContent />
  </QuizProvider>
);

export default GameCreator;
