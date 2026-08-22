"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkspaceShell from '@/components/layout/WorkspaceShell';
import ImageManipulator from '@/components/CreatePictureRace/ImageManipulator';
import FunLoadingScreen from '@/components/global/FunLoadingScreen';
import { Upload, Save, ArrowLeft, Trash2, Plus, Check, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { usePictureRaceStore } from '@/store/usePictureRaceStore';
import { useToastStore } from '@/store/useToastStore';

export default function CreatePictureRacePage() {
  const router = useRouter();
  const { id: raceId } = useParams();
  const { showToast } = useToastStore();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const {
    raceTitle,
    setRaceTitle,
    coverImage,
    setCoverImage,
    questions,
    activeQuestionId,
    setActiveQuestionId,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    initialize,
    fetchRace,
    resetRace,
    handleSaveRace,
    isSaving,
    loading,
  } = usePictureRaceStore();

  useEffect(() => {
    if (raceId) {
      fetchRace(raceId, showToast);
    } else {
      resetRace();
      initialize();
    }
  }, [initialize, fetchRace, resetRace, raceId, showToast]);

  const activeQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
         updateQuestion(activeQuestion.id, { imageSrc: reader.result, croppedImageSrc: null, savedCrop: null, savedZoom: null, needsCrop: true });
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels, zoom) => {
    updateQuestion(activeQuestion.id, { crop: { croppedArea, zoom }, zoom });
  };

  const handleSave = () => {
    handleSaveRace(raceId, router, showToast);
  };

  if (loading) {
    return <FunLoadingScreen text="Loading Picture Race..." subText="Gathering your images..." />;
  }

  if (!activeQuestion) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] w-full overflow-hidden relative">
      {/* Secondary Navbar */}
      <div className="w-full bg-transparent border-b-[2px] border-zk-border px-4 md:px-8 py-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4 text-white">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <input
            type="text"
            value={raceTitle}
            onChange={(e) => setRaceTitle(e.target.value)}
            placeholder="Enter title"
            className="bg-transparent border-0 border-b-[2px] border-white/50 pb-1 text-xl md:text-2xl font-['Outfit'] font-normal text-white focus:outline-none focus:border-white placeholder:text-white/50 w-full max-w-[400px]"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-1">
          <button 
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="flex items-center gap-2 bg-zk-bg text-zk-text px-4 py-2.5 rounded-xl font-bold border-[2px] border-zk-border hover:bg-white hover:text-zk-black transition-colors"
          >
            <ImageIcon size={18} strokeWidth={2.5} />
            {coverImage ? 'Change Cover' : 'Add Cover'}
          </button>
          <button 
            onClick={handleSave}
            disabled={questions.length === 0 || isSaving}
            className="flex items-center gap-2 bg-zk-purple text-white px-6 py-2.5 rounded-xl font-bold border-[2px] border-zk-border hover:bg-zk-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={18} strokeWidth={2.5} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 w-full">
        {/* Sidebar */}
        <aside className="w-64 md:w-80 border-r border-zk-border bg-[#181B21] flex flex-col shrink-0 h-full relative text-white">
          {/* Header */}
          <div className="h-[60px] px-6 border-b border-zk-border flex items-center justify-between shrink-0">
             <h2 className="font-black tracking-widest uppercase text-sm">QUESTIONS</h2>
          </div>

          <div className="p-4 flex flex-col flex-1 overflow-y-auto gap-3" data-lenis-prevent="true">
            {questions.length === 0 ? (
              <p className="text-center text-sm font-bold text-white/50 mt-4">No slides yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.map((q, index) => (
                  <div 
                    key={q.id} 
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`p-3 rounded-xl border border-zk-border cursor-pointer transition-all flex items-center justify-between group ${activeQuestionId === q.id ? 'border-zk-blue bg-zk-blue text-white' : 'border-zk-border/20 bg-zk-bg hover:border-zk-border/50'}`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-xs uppercase opacity-70">Q {index + 1}</span>
                      <span className="font-black truncate">{q.title || 'Untitled'}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-colors shrink-0"
                      aria-label="Delete Question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addQuestion}
              className="w-full py-3 mt-2 bg-[#00D06C] border border-zk-border rounded-xl font-black text-white transition-transform flex items-center justify-center gap-2 active:translate-y-1 shrink-0"
            >
              <Plus size={20} strokeWidth={3} />
              Add Slide
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[url('/images/yeti.png')] bg-cover bg-center bg-no-repeat bg-fixed" data-lenis-prevent="true">
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 lg:gap-10">
            {/* Top Section: Image Studio */}
            <div className="flex flex-col gap-6">
              <div className="p-6 bg-zk-bg rounded-2xl border-[2px] border-zk-border/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-3xl font-['Amatic_SC'] text-zk-text tracking-wider">Image Studio</h3>
                  {activeQuestion.imageSrc && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuestion(activeQuestion.id, { needsCrop: !activeQuestion.needsCrop })}
                        className="text-xs font-bold bg-zk-bg px-3 py-1 rounded-md border-[2px] border-zk-border/50 cursor-pointer hover:bg-white hover:text-zk-black text-zk-text transition-colors"
                      >
                        {activeQuestion.needsCrop ? "Cancel Edit" : "Edit Crop"}
                      </button>
                      <label className="text-xs font-bold bg-zk-bg px-3 py-1 rounded-md border-[2px] border-zk-border/50 cursor-pointer hover:bg-white hover:text-zk-black text-zk-text transition-colors">
                        Change
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                      <button 
                        onClick={() => updateQuestion(activeQuestion.id, { imageSrc: null, croppedImageSrc: null, savedCrop: null, savedZoom: null, needsCrop: false })}
                        className="text-xs font-bold bg-zk-red/20 px-3 py-1 rounded-md border-[2px] border-zk-red/50 cursor-pointer hover:bg-zk-red hover:text-white text-zk-red transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {!activeQuestion.imageSrc ? (
                  <label className="w-full aspect-[21/9] md:aspect-[3/1] border-[2px] border-dashed border-zk-border/40 hover:border-zk-border/80 rounded-xl flex flex-col items-center justify-center gap-4 bg-zk-bg/50 cursor-pointer transition-colors group">
                    <div className="w-16 h-16 rounded-full bg-zk-purple text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-lg text-zk-text">Upload Image</p>
                      <p className="text-sm font-bold text-zk-text/40">PNG, JPG up to 5MB</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                ) : activeQuestion.needsCrop ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-zk-text/60">Drag to pan, use slider to zoom. Click Accept when done!</p>
                    <ImageManipulator 
                      key={activeQuestion.id}
                      imageSrc={activeQuestion.imageSrc}
                      initialCrop={activeQuestion.savedCrop || { x: 0, y: 0 }}
                      initialZoom={activeQuestion.savedZoom || 1}
                      onCropComplete={handleCropComplete} 
                      onAccept={(croppedDataUrl, crop, zoom) => {
                        updateQuestion(activeQuestion.id, { 
                          croppedImageSrc: croppedDataUrl, 
                          savedCrop: crop, 
                          savedZoom: zoom, 
                          needsCrop: false 
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => updateQuestion(activeQuestion.id, { needsCrop: true })}
                    className="w-full aspect-[21/9] md:aspect-[3/1] rounded-xl border-[2px] border-zk-border overflow-hidden relative group cursor-pointer"
                  >
                    <img 
                      src={activeQuestion.croppedImageSrc || activeQuestion.imageSrc} 
                      alt="Question preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-white font-bold text-lg">Click to Edit Crop</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Details */}
            <div className="flex flex-col gap-6">
              
              {/* Details Section */}
              <div className="p-6 bg-zk-bg rounded-2xl border-[2px] border-zk-border/20">
                <h3 className="font-bold text-3xl font-['Amatic_SC'] text-zk-text tracking-wider mb-4">Race Details</h3>
                
                <div className="flex flex-col gap-4 mb-6">
                  <h4 className="font-bold text-sm text-zk-text/70">Race Title</h4>
                  <input
                    type="text"
                    value={activeQuestion.title}
                    onChange={(e) => updateQuestion(activeQuestion.id, { title: e.target.value })}
                    placeholder="e.g. Guess the Animal" 
                    className="w-full bg-transparent border-b-[2px] border-zk-border/20 py-3 text-xl font-black text-zk-text focus:outline-none focus:border-zk-purple transition-colors placeholder:text-zk-text/30"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-sm text-zk-text/70">Correct Answer</h4>
                  <input
                    type="text"
                    value={activeQuestion.answer}
                    onChange={(e) => updateQuestion(activeQuestion.id, { answer: e.target.value })}
                    placeholder="e.g. Elephant" 
                    className="w-full bg-transparent border-b-[2px] border-zk-border/20 py-3 text-xl font-black text-zk-text focus:outline-none focus:border-zk-purple transition-colors placeholder:text-zk-text/30"
                  />
                  <p className="text-xs font-bold text-zk-text/50">Players must type this word exactly to win points.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div 
            key="cover-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          >
            <div
              onClick={() => setIsImageModalOpen(false)}
              className="absolute inset-0 bg-zk-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="zk-panel w-full max-w-md relative z-10 p-6 lg:p-8 bg-zk-panel-bg"
            >
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zk-black/5 rounded-full transition-colors text-zk-text"
              >
                <X size={20} />
              </button>

              <h2 className="font-['Outfit'] text-4xl font-black text-zk-text tracking-tight mb-1">Race Cover</h2>
              <p className="text-zk-text/60 font-bold text-sm mb-6 tracking-wide">
                Choose a visual for your race
              </p>

              <div className="flex flex-col gap-5">
                <div
                  role="button"
                  tabIndex={0}
                  className="aspect-video bg-zk-black/5 border-[3px] border-dashed border-zk-border rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zk-purple/5 transition-all group"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && document.getElementById('cover-upload')?.click()
                  }
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload
                        size={36}
                        className="text-zk-text/30 group-hover:text-zk-purple transition-colors"
                      />
                      <span className="font-bold text-sm uppercase tracking-wider text-zk-text/40">
                        Upload image
                      </span>
                    </>
                  )}
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCoverImage(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <LinkIcon size={16} className="text-zk-text/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    value={
                      typeof coverImage === 'string' && coverImage.startsWith('http')
                        ? coverImage
                        : ''
                    }
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full bg-zk-bg text-zk-text border-[3px] border-zk-border p-3 pl-11 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-zk-purple/20 rounded-xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsImageModalOpen(false);
                    if (coverImage) showToast('Cover applied successfully!', 'success');
                  }}
                  className="w-full border-[3px] border-zk-border bg-zk-black text-white py-3 font-black uppercase tracking-widest rounded-xl transition-colors hover:bg-zk-black/90"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
