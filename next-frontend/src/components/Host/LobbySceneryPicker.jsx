"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const rootRef = useRef(null);
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

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
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
    <div ref={rootRef} className="relative z-30">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={hasNewScenery ? 'New scenery available' : `Change scenery. Current: ${activeScenery.name}`}
        className={`relative flex items-center gap-2 border-[3px] border-[#000000] rounded-xl px-3 py-2 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
          hasNewScenery ? 'bg-[#FFCD29]' : 'bg-zk-panel-bg'
        }`}
        style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
      >
        {hasNewScenery && (
          <span className="absolute -top-2 -right-2 bg-[#2ea84a] text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border-[2px] border-[#000000] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            New
          </span>
        )}
        <div
          className="w-12 h-12 rounded-lg border-[2px] border-[#000000] overflow-hidden flex-shrink-0 bg-[#FFCD29]"
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            role="listbox"
            aria-label="Owned scenery"
            className="absolute bottom-full right-0 mb-3 w-64 bg-zk-panel-bg border-[4px] border-[#000000] rounded-xl p-3 flex flex-col gap-2"
            style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#000000] px-1">
              Your Scenery
            </p>

            {ownedScenery.map((scenery) => {
              const isActive = scenery.image === currentImage;
              const isNew = isSceneryNew(scenery.slug || scenery.id, newScenerySlugs);
              return (
                <button
                  key={scenery.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(scenery)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg border-[3px] transition-colors ${
                    isActive
                      ? 'border-[#FFCD29] bg-[#FFCD29]/20'
                      : 'border-[#000000] hover:bg-black/5'
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-md border-[2px] border-[#000000] overflow-hidden flex-shrink-0"
                    style={{
                      backgroundImage: `url('${scenery.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-black uppercase tracking-wide text-[#000000]">
                      {scenery.name}
                    </span>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#000000]/60">
                      {isActive ? 'Equipped' : isNew ? 'New — tap to equip' : 'Tap to equip'}
                    </span>
                  </div>
                  {isNew && !isActive && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-[#2ea84a] text-white px-1.5 py-0.5 rounded border border-[#000000] flex-shrink-0">
                      New
                    </span>
                  )}
                  {isActive && (
                    <Check size={18} strokeWidth={3} className="text-[#000000] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}