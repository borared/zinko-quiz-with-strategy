'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/global/Navbar';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

export default function FlashcardViewerPage({ deckId }) {
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewer state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/flashcards/${deckId}`);
        setDeck(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load flashcard deck. It might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeck();
  }, [deckId]);

  const handleNext = () => {
    if (deck?.flashcards && currentIndex < deck.flashcards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentIndex(c => c - 1), 150);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zk-bg flex flex-col font-['Outfit'] relative overflow-hidden">
        <div className="relative z-20"><Navbar /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-zk-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-zk-bg flex flex-col font-['Outfit'] relative overflow-hidden">
        <div className="relative z-20"><Navbar /></div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-zk-text tracking-tight uppercase">404</h1>
          <h2 className="text-2xl font-bold text-zk-text/80 uppercase tracking-widest">{error || 'Deck not found'}</h2>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl border-2 border-zk-border bg-zk-panel-bg font-black uppercase text-sm mt-4 hover:bg-zk-bg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const flashcards = deck.flashcards || [];

  return (
    <div className="min-h-screen bg-zk-bg flex flex-col font-['Outfit'] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.25] z-0" style={{ backgroundImage: `linear-gradient(to right, var(--zk-border) 1px, transparent 1px), linear-gradient(to bottom, var(--zk-border) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      {/* Floating Decorative Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ y: [-10, 15, -10], rotate: [0, 90, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute left-[10%] top-[20%] w-12 h-12 bg-[#3B68FF] rounded-lg border-2 border-zk-border shadow-sm opacity-50" />
        <motion.div animate={{ y: [15, -5, 15], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[15%] top-[15%] w-10 h-10 bg-[#FFCD29] rounded-full border-2 border-zk-border shadow-sm opacity-60" />
        <motion.div animate={{ y: [-8, 12, -8], rotate: [45, 135, 45] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} className="absolute left-[20%] bottom-[15%] w-14 h-14 bg-[#FF6B4A] border-2 border-zk-border shadow-sm opacity-60" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <motion.div animate={{ y: [10, -10, 10], rotate: [0, -45, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute right-[20%] bottom-[20%] w-16 h-8 bg-[#00C853] rounded-full border-2 border-zk-border shadow-sm opacity-50" />
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[50%] top-[10%] w-6 h-6 bg-[#5D3FD3] rounded-full border border-zk-border" />
        <motion.div animate={{ y: [-12, 8, -12], rotate: [15, -15, 15] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[40%] top-[25%] w-8 h-8 bg-[#FF5FA8] rounded-md border-2 border-zk-border shadow-sm opacity-50" />
      </div>
      
      <main className="relative z-10 flex-1 max-w-[1000px] w-full mx-auto p-4 sm:p-8 mt-4 pb-16 flex flex-col items-center justify-center min-h-[500px]">
        
        <div className="w-full flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl border-2 border-zk-border bg-zk-panel-bg font-black text-sm flex items-center gap-2 hover:bg-zk-bg transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <h1 className="text-2xl md:text-3xl font-black text-zk-text tracking-tight max-w-[50%] truncate text-right">
            {deck.title}
          </h1>
        </div>

        {flashcards.length > 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
            
            {/* Progress indicator */}
            <div className="w-full mb-6 flex items-center justify-between">
              <span className="font-black text-zk-text text-xl">Card {currentIndex + 1} of {flashcards.length}</span>
              <div className="flex gap-2 flex-wrap max-w-[50%] justify-end">
                {flashcards.map((_, i) => (
                  <div key={i} className={`h-2.5 w-6 rounded-full border-[2px] border-zk-border ${i === currentIndex ? 'bg-[#5D3FD3]' : 'bg-zk-panel-bg'}`} />
                ))}
              </div>
            </div>

            {/* Flashcard 3D Container */}
            <div className="w-full aspect-[5/3] relative perspective-1000">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex + (isFlipped ? '-back' : '-front')}
                  initial={{ rotateX: isFlipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: isFlipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full h-full absolute inset-0 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* FRONT OF CARD */}
                  {!isFlipped ? (
                    <div className="w-full h-full bg-zk-panel-bg border-2 border-zk-border rounded-3xl flex flex-col p-8 md:p-12 relative overflow-hidden group">
                      
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                        <h2 className="text-3xl md:text-5xl font-black text-zk-text leading-tight">{flashcards[currentIndex].front}</h2>
                      </div>
                      
                      {/* NotebookLM Style Hint */}
                      {flashcards[currentIndex].hint && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-8 flex flex-col items-center">
                          <AnimatePresence>
                            {showHint ? (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="bg-[#FFCD29] border-2 border-zk-border px-6 py-4 rounded-xl flex items-start gap-3 max-w-xl w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Lightbulb size={24} className="shrink-0 mt-0.5 text-zk-black fill-white" />
                                <p className="font-bold text-zk-black text-left flex-1">{flashcards[currentIndex].hint}</p>
                              </motion.div>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                                className="bg-zk-bg border-2 border-zk-border px-5 py-2.5 rounded-full font-black text-zk-text flex items-center gap-2 hover:bg-zk-panel-bg transition-colors"
                              >
                                <Lightbulb size={18} /> Need a hint?
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-black text-sm uppercase tracking-widest text-zk-text/40 bg-zk-bg px-3 py-1 border-[2px] border-zk-border rounded-lg">Click to flip</span>
                      </div>
                    </div>
                  ) : (
                    /* BACK OF CARD */
                    <div className="w-full h-full bg-[#00C853] text-white border-2 border-zk-border rounded-3xl flex flex-col p-8 md:p-12 relative overflow-hidden group">
                      
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <p className="text-xl md:text-3xl font-bold leading-relaxed">{flashcards[currentIndex].back}</p>
                      </div>
                      
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-black text-sm uppercase tracking-widest text-white/50 bg-black/20 px-3 py-1 border-[2px] border-transparent rounded-lg">Click to flip back</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-10 w-full">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="bg-zk-bg border-2 border-zk-border px-6 py-3 rounded-2xl font-black text-zk-text flex items-center gap-2 hover:bg-zk-panel-bg transition-colors disabled:opacity-50"
              >
                <ChevronLeft size={24} /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="bg-zk-bg border-2 border-zk-border px-6 py-3 rounded-2xl font-black text-zk-text flex items-center gap-2 hover:bg-zk-panel-bg transition-colors disabled:opacity-50"
              >
                Next <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <h2 className="text-2xl font-bold text-zk-text/50">This deck is empty!</h2>
          </div>
        )}
      </main>
    </div>
  );
}
