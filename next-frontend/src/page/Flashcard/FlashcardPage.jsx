'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Lightbulb, ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import Navbar from '@/components/global/Navbar';
import api from '@/services/api';
import { useToastStore } from '@/store/useToastStore';

export default function FlashcardPage() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [inputType, setInputType] = useState('file'); // 'file' or 'text'
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  // Viewer state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [deckTitle, setDeckTitle] = useState('My Flashcards');
  const [coverImage, setCoverImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fileInputRef = useRef(null);
  const { showToast } = useToastStore();

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        showToast('File must be smaller than 10MB', 'error');
        return;
      }
      setFile(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.size > 10 * 1024 * 1024) {
        showToast('File must be smaller than 10MB', 'error');
        return;
      }
      setFile(dropped);
    }
  };

  const handleGenerate = async () => {
    if (inputType === 'file' && !file && !prompt.trim()) {
      showToast('Please provide a file or some text to generate flashcards.', 'error');
      return;
    }
    if (inputType === 'text' && !prompt.trim()) {
      showToast('Please paste some text to generate flashcards.', 'error');
      return;
    }

    setLoading(true);
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (prompt.trim()) formData.append('prompt', prompt);

      // Defaulting to generate around 15 cards
      formData.append('numCards', '15');

      const data = await api.postForm('/api/ai/generate-flashcards', formData);

      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        showToast('Flashcards generated successfully!', 'success');
      } else {
        showToast('AI did not return any flashcards.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to generate flashcards.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeck = async () => {
    if (flashcards.length === 0) return;
    setIsSaving(true);
    try {
      await api.post('/api/flashcards', {
        title: deckTitle || 'Untitled Flashcard Deck',
        cover_image: coverImage || null,
        flashcards: flashcards.map((fc, index) => ({
          front: fc.front,
          back: fc.back,
          hint: fc.hint,
          order_index: index,
        })),
      });
      setSnackbarMessage('Flashcards saved to dashboard!');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to save flashcards.');
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
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

  return (
    <div className="min-h-screen bg-zk-bg flex flex-col font-['Outfit'] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.25] z-0" style={{ backgroundImage: `linear-gradient(to right, var(--zk-border) 1px, transparent 1px), linear-gradient(to bottom, var(--zk-border) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      {flashcards.length === 0 && (
        <div className="relative z-20"><Navbar /></div>
      )}

      <main className={`relative z-10 flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-8 mt-4 pb-16 flex flex-col gap-8 ${flashcards.length === 0 ? 'lg:flex-row' : ''}`}>

        {/* Left Sidebar */}
        {flashcards.length === 0 && (
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl gasoek-one-regular tracking-wider text-zk-text">Flash Card</h1>

            <div className="w-full flex flex-col gap-6 pt-4">
              
              {/* Tabs */}
              <div className="flex items-center gap-2 bg-zk-bg p-1.5 rounded-xl border-[3px] border-zk-border">
                <button
                  onClick={() => setInputType('file')}
                  className={`flex-1 py-2 font-black rounded-lg text-sm transition-colors ${inputType === 'file' ? 'bg-[#5D3FD3] text-white' : 'text-zk-text hover:bg-zk-panel-bg'}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-2 font-black rounded-lg text-sm transition-colors ${inputType === 'text' ? 'bg-[#5D3FD3] text-white' : 'text-zk-text hover:bg-zk-panel-bg'}`}
                >
                  Paste Text
                </button>
              </div>

              {inputType === 'file' ? (
                <>
                  {/* File Upload Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-[4px] border-dashed border-zk-border/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-zk-bg hover:border-zk-border ${file ? 'bg-zk-bg border-zk-border' : 'bg-zk-panel-bg'}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.txt,.docx,.doc"
                    />

                    {file ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-[#5D3FD3] text-white rounded-xl flex items-center justify-center border-[3px] border-zk-border">
                          <FileText size={32} />
                        </div>
                        <div>
                          <p className="font-black text-lg text-zk-text break-all">{file.name}</p>
                          <p className="text-sm font-bold text-zk-text/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-zk-bg border-[3px] border-zk-border rounded-full flex items-center justify-center mb-4">
                          <Upload size={28} className="text-zk-text" />
                        </div>
                        <h3 className="text-xl font-black text-zk-text mb-2">Upload your study material</h3>
                        <p className="text-zk-text/60 font-bold mb-4 text-sm">Supports PDF, DOCX, TXT (Max 10MB)</p>
                        <div className="px-6 py-2 rounded-xl border-[3px] border-zk-border bg-zk-panel-bg font-black text-sm pointer-events-none">
                          Browse files
                        </div>
                      </>
                    )}
                  </div>

                  {/* Optional Prompt */}
                  <div className="flex flex-col gap-2">
                    <label className="font-black text-zk-text text-sm">Additional Instructions (Optional)</label>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Focus only on Chapter 3..."
                      className="w-full border-[3px] border-zk-border rounded-xl px-4 py-3 font-bold text-zk-text bg-zk-bg focus:outline-none focus:ring-4 focus:ring-[#00C2FF]/20"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 flex-1 min-h-[300px]">
                  <label className="font-black text-zk-text text-sm">Paste your text below</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Paste Wikipedia articles, notes, or any text here to turn them into flashcards!"
                    className="w-full h-[300px] border-[3px] border-zk-border rounded-xl px-4 py-3 font-bold text-zk-text bg-zk-bg focus:outline-none focus:ring-4 focus:ring-[#00C2FF]/20 resize-none"
                  ></textarea>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || (inputType === 'file' ? (!file && !prompt.trim()) : !prompt.trim())}
                className="w-full mt-4 py-2 rounded-xl border-[4px] border-zk-border bg-[#5D3FD3] text-white font-bold font-['Amatic_SC'] text-4xl tracking-wider hover:translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? 'Analyzing...' : 'Generate Flashcards'}
              </button>
            </div>
          </div>
        )}

        {/* Right Main Area */}
        <div className={`w-full flex flex-col items-center justify-center min-h-[500px] ${flashcards.length === 0 ? 'lg:w-2/3' : ''}`}>
          {flashcards.length === 0 ? (
            <div className="relative w-full h-full min-h-[500px] flex flex-col items-center justify-center">
              <div className="relative w-full max-w-2xl h-80 flex items-center justify-center mt-[-40px]">

                {/* Floating Decorative Shapes */}
                <motion.div animate={{ y: [-10, 15, -10], rotate: [0, 90, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute left-[-5%] top-[10%] w-8 h-8 bg-[#3B68FF] rounded-lg border-2 border-zk-border shadow-sm z-0 opacity-70" />
                <motion.div animate={{ y: [15, -5, 15], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[0%] top-[-5%] w-6 h-6 bg-[#FFCD29] rounded-full border-2 border-zk-border shadow-sm z-0 opacity-80" />
                <motion.div animate={{ y: [-8, 12, -8], rotate: [45, 135, 45] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} className="absolute left-[20%] bottom-[0%] w-10 h-10 bg-[#FF6B4A] border-2 border-zk-border shadow-sm z-0 opacity-80" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                <motion.div animate={{ y: [10, -10, 10], rotate: [0, -45, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute right-[15%] bottom-[5%] w-12 h-6 bg-[#00C853] rounded-full border-2 border-zk-border shadow-sm z-0 opacity-70" />
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[45%] top-[-15%] w-4 h-4 bg-[#5D3FD3] rounded-full border border-zk-border z-0" />
                <motion.div animate={{ y: [-12, 8, -12], rotate: [15, -15, 15] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="absolute right-[30%] top-[15%] w-7 h-7 bg-[#FF5FA8] rounded-md border-2 border-zk-border shadow-sm z-0 opacity-75" />

                {/* Red Card - Left */}
                <motion.div
                  animate={{ y: [-15, 15, -15], rotate: [-8, -12, -8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-[5%] md:left-[10%] top-1/4 w-40 md:w-56 aspect-[3/4] bg-[#FF6B4A] border-[4px] border-zk-border rounded-2xl p-1.5 md:p-2 z-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-full h-full bg-zk-bg rounded-xl overflow-hidden border-[2px] border-zk-border relative">
                    <img src="/flashcard-red.png" alt="Science" className="w-full h-full object-cover" />
                  </div>
                </motion.div>

                {/* Green Card - Middle, higher up */}
                <motion.div
                  animate={{ y: [15, -15, 15], rotate: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute left-1/2 -translate-x-1/2 top-4 w-48 md:w-64 aspect-[3/4] bg-[#00C853] border-[4px] border-zk-border rounded-2xl p-1.5 md:p-2 z-30 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]"
                >
                  <div className="w-full h-full bg-zk-bg rounded-xl overflow-hidden border-[2px] border-zk-border relative flex items-center justify-center">
                    <img src="/flashcard-yeti.png" alt="Yeti" className="w-full h-full object-cover" />
                  </div>
                </motion.div>

                {/* Blue Card - Right */}
                <motion.div
                  animate={{ y: [-10, 20, -10], rotate: [12, 8, 12] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute right-[5%] md:right-[10%] top-1/4 w-40 md:w-56 aspect-[3/4] bg-[#3B68FF] border-[4px] border-zk-border rounded-2xl p-1.5 md:p-2 z-20 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
                >
                  <div className="w-full h-full bg-zk-bg rounded-xl overflow-hidden border-[2px] border-zk-border relative">
                    <img src="/flashcard-blue.png" alt="History" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              </div>

              <div className="mt-32 text-center z-40 relative bg-zk-bg/80 backdrop-blur-sm p-4 rounded-xl">
                <h2 className="text-3xl font-black text-zk-text mb-2">Ready to learn?</h2>
                <p className="text-zk-text/60">Upload a document on the left to generate your magical flashcards!</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">

              {/* Save Deck Section */}
              <div className="w-full mb-8 flex flex-col md:flex-row items-end justify-between gap-4">
                <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-black uppercase tracking-wider text-zk-text/60 mb-2 block">Deck Title</label>
                    <input 
                      type="text"
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      placeholder="e.g. Biology Chapter 4"
                      className="w-full bg-zk-panel-bg border-[3px] border-zk-border rounded-xl px-4 py-3 font-bold text-zk-text focus:outline-none focus:border-zk-purple"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-black uppercase tracking-wider text-zk-text/60 mb-2 block">Cover Image URL (Optional)</label>
                    <input 
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-zk-panel-bg border-[3px] border-zk-border rounded-xl px-4 py-3 font-bold text-zk-text focus:outline-none focus:border-zk-purple"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveDeck}
                  disabled={isSaving}
                  className="w-full md:w-auto mt-4 md:mt-0 whitespace-nowrap bg-zk-purple text-white border-[3px] border-zk-border px-6 py-2.5 rounded-xl font-bold font-['Amatic_SC'] text-2xl tracking-wider hover:bg-zk-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save to Dashboard'}
                </button>
              </div>

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
                      <div className="w-full h-full bg-zk-panel-bg border-[4px] border-zk-border rounded-3xl flex flex-col p-8 md:p-12 relative overflow-hidden group">

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
                                  className="bg-[#FFCD29] border-[3px] border-zk-border px-6 py-4 rounded-xl flex items-start gap-3 max-w-xl w-full"
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
                                  className="bg-zk-bg border-[3px] border-zk-border px-5 py-2.5 rounded-full font-black text-zk-text flex items-center gap-2 hover:bg-zk-panel-bg transition-colors"
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
                      <div className="w-full h-full bg-[#00C853] text-white border-[4px] border-zk-border rounded-3xl flex flex-col p-8 md:p-12 relative overflow-hidden group">

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
                  className="bg-zk-bg border-[3px] border-zk-border px-6 py-3 rounded-2xl font-black text-zk-text flex items-center gap-2 hover:bg-zk-panel-bg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft size={24} /> Prev
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className="bg-zk-bg border-[3px] border-zk-border px-6 py-3 rounded-2xl font-black text-zk-text flex items-center gap-2 hover:bg-zk-panel-bg transition-colors disabled:opacity-50"
                >
                  Next <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Shadowless Snackbar */}
      <AnimatePresence>
        {showSnackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-6 py-3 rounded-full border border-white/10 text-sm font-bold flex items-center gap-2 shadow-none"
          >
            <div className={`w-2 h-2 rounded-full ${snackbarMessage.includes('Failed') ? 'bg-red-500' : 'bg-zk-green'}`}></div>
            {snackbarMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
