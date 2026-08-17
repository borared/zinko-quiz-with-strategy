"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Check } from 'lucide-react';
import { getSceneryByImage } from '@/lib/lobbyScenery';
import { isSceneryNew } from '@/lib/newSceneryNotice';

export default function LobbySceneryPicker({
  currentImage,
  ownedScenery = [],
  newScenerySlugs = [],
  onSelect,
  onAcknowledgeNew,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const activeScenery = getSceneryByImage(currentImage, ownedScenery) ?? ownedScenery[0];
  const hasNewScenery = newScenerySlugs.length > 0;
  const newSceneryNames = ownedScenery
    .filter((scenery) => isSceneryNew(scenery.slug || scenery.id, newScenerySlugs))
    .map((scenery) => scenery.name);

  const handleSelect = useCallback((scenery) => {
    const slug = scenery.slug || scenery.id;
    if (isSceneryNew(slug, newScenerySlugs)) {
      onAcknowledgeNew?.(slug);
    }

    if (disabled || scenery.image === currentImage) {
      setOpen(false);
      return;
    }
    onSelect?.(scenery.image);
    setOpen(false);
  }, [currentImage, disabled, onSelect, onAcknowledgeNew, newScenerySlugs]);

  const handleToggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next && hasNewScenery) {
      newScenerySlugs.forEach((slug) => onAcknowledgeNew?.(slug));
    }
  }, [open, hasNewScenery, newScenerySlugs, onAcknowledgeNew]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!ownedScenery.length || !activeScenery) return null;

  const buttonLabel = hasNewScenery
    ? (newSceneryNames.length === 1
      ? `New: ${newSceneryNames[0]}!`
      : 'New scenery!')
    : activeScenery.name;

  return (
    <div className="relative z-30">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={hasNewScenery ? 'New scenery available' : `Change scenery. Current: ${activeScenery.name}`}
        className={`relative flex items-center gap-2 border-[2px] border-[#000000] rounded-lg px-3 py-2 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
          hasNewScenery ? 'bg-[#FFCD29]' : 'bg-zk-panel-bg'
        }`}
        style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
      >
        {hasNewScenery && (
          <span className="absolute -top-2 -right-2 bg-[#2ea84a] text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border-[2px] border-[#000000] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            New
          </span>
        )}
        <div
          className="w-12 h-12 rounded-md border-[2px] border-[#000000] overflow-hidden flex-shrink-0 bg-[#FFCD29]"
          style={{
            backgroundImage: `url('${hasNewScenery && newSceneryNames.length
              ? (ownedScenery.find((s) => isSceneryNew(s.slug || s.id, newScenerySlugs))?.image || activeScenery.image)
              : activeScenery.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="flex flex-col items-start text-left">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#000000]/70">
            {hasNewScenery ? 'New scenery' : 'Scenery'}
          </span>
          <span className={`text-sm font-black uppercase tracking-wide leading-tight ${
            hasNewScenery ? 'text-[#c0392b]' : 'text-[#000000]'
          }`}>
            {buttonLabel}
          </span>
        </div>
        <ImageIcon size={18} strokeWidth={3} className="text-[#000000] ml-1" />
      </button>

      {/* Modal Overlay via React Portal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center">
              {/* Dark Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-[3px]"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative z-10 w-[92%] max-w-3xl bg-zk-panel-bg border-[2px] border-black rounded-md p-6 md:p-8 flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4 shrink-0">
                  <div>
                    <h3 className="font-['Outfit'] font-black text-2xl text-zk-text">
                      Choose Scenery
                    </h3>
                    <p className="text-[10px] md:text-xs font-bold text-zk-text/40 mt-1">
                      Select a background for the game lobby
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-md border-[2px] border-black bg-[#E74C3C] text-white flex items-center justify-center font-black text-sm hover:brightness-95 active:scale-95 transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-1 scrollbar-none py-1">
                  {ownedScenery.map((scenery) => {
                    const isActive = scenery.image === currentImage;
                    const isNew = isSceneryNew(scenery.slug || scenery.id, newScenerySlugs);
                    return (
                      <button
                        key={scenery.id}
                        type="button"
                        onClick={() => handleSelect(scenery)}
                        className={`group relative flex flex-col rounded-md border-[2px] overflow-hidden text-left bg-zk-panel-bg transition-all ${
                          isActive
                            ? 'border-[#FFCD29] bg-[#FFCD29]/5'
                            : 'border-black'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="w-full aspect-[16/10] overflow-hidden relative border-b-[2px] border-black bg-black/10 shrink-0">
                          <img 
                            src={scenery.image} 
                            alt={scenery.name} 
                            className="w-full h-full object-cover" 
                          />
                          {isActive && (
                            <div className="absolute top-2 left-2 bg-[#FFCD29] text-black border-[2px] border-black rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Check size={10} strokeWidth={4} /> Equipped
                            </div>
                          )}
                          {isNew && !isActive && (
                            <div className="absolute top-2 right-2 bg-[#2ea84a] text-white border-[2px] border-black rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                              New
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <div className="p-3 flex-1 flex flex-col justify-center">
                          <span className="block text-sm font-black text-zk-text truncate w-full">
                            {scenery.name}
                          </span>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-zk-text/40 mt-0.5">
                            {isActive ? 'Currently Equipped' : 'Click to Equip'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}