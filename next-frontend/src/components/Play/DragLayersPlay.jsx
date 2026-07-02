"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { GripVertical, Send } from 'lucide-react';
import { displayAnswerText, isDragLayersQuestion } from '@/lib/questionTypes';
import {
  applyLayerPlacement,
  getPlayLayerColor,
  returnChipToPool,
  shuffleArray,
} from '@/lib/dragLayersUtils';

const LAYER_SPRING = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 };
const CHIP_LAYOUT = { type: 'spring', stiffness: 620, damping: 38, mass: 0.65 };
const DRAG_THRESHOLD_PX = 4;

function getGridCols(layerCount, roomy = false) {
  const gapX = roomy ? 'gap-x-2 sm:gap-x-3' : 'gap-x-2 sm:gap-x-3';

  if (layerCount <= 4) {
    return `grid grid-cols-2 sm:grid-cols-4 ${gapX}`;
  }
  if (layerCount <= 6) {
    return `grid grid-cols-2 md:grid-cols-3 ${gapX}`;
  }
  return `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${gapX}`;
}

function PoolChip({
  answer,
  onPointerDown,
  onClick,
  disabled,
  isDragging,
  isSelected,
  fillWidth = false,
  compact = false,
}) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onPointerDown={disabled ? undefined : onPointerDown}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event);
        }
      }}
      className={`flex rounded-xl border-[3px] text-left touch-none select-none ${
        compact ? 'flex-col items-center gap-1.5 px-2.5 py-2.5 text-center' : 'items-center gap-2 px-3 py-3'
      } ${
        isSelected ? 'border-zk-yellow ring-2 ring-zk-yellow' : 'border-zk-black'
      } ${getPlayLayerColor(answer.color, answer.layerIndex)} text-white min-w-0 ${fillWidth ? 'w-full' : compact ? 'w-full' : 'shrink-0'} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-[0.35]' : isSelected ? 'scale-[1.02]' : ''}`}
    >
      <GripVertical size={compact ? 16 : 14} className="opacity-70 shrink-0 pointer-events-none" />
      <span
        className={`font-['Outfit'] font-bold pointer-events-none leading-tight ${
          compact ? 'text-sm sm:text-base md:text-lg line-clamp-3 leading-snug' : 'text-base md:text-lg'
        }`}
      >
        {displayAnswerText(answer.text)}
      </span>
    </div>
  );
}

export default function DragLayersPlay({
  question,
  phase,
  selectedId,
  foxSmokescreen,
  onSubmitOrder,
  inPanel = false,
}) {
  const stepAnswers = useMemo(() => question?.answers || [], [question?.answers]);
  const answerMap = useMemo(
    () => Object.fromEntries(stepAnswers.map((answer) => [answer.id, answer])),
    [stepAnswers]
  );

  const layerCount = question?.layerCount ?? stepAnswers.length;

  const [slots, setSlots] = useState({});
  const [pool, setPool] = useState([]);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [selectedChipId, setSelectedChipId] = useState(null);

  const slotsRef = useRef(slots);
  const stepAnswersRef = useRef(stepAnswers);
  const isDisabledRef = useRef(false);
  const dragRef = useRef(null);
  const removeListenersRef = useRef(null);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    stepAnswersRef.current = stepAnswers;
  }, [stepAnswers]);

  const isDisabled = phase !== 'PLAYING' || !!selectedId || foxSmokescreen;
  isDisabledRef.current = isDisabled;

  const stopDrag = useCallback(() => {
    removeListenersRef.current?.();
    removeListenersRef.current = null;
    dragRef.current?.ghost?.remove();
    dragRef.current = null;
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('touch-action');
    setDraggingId(null);
    setDragOverIndex(null);
  }, []);

  useEffect(() => {
    if (!isDragLayersQuestion(question?.questionType) || layerCount < 1) return;

    stopDrag();
    const emptySlots = Object.fromEntries(
      Array.from({ length: layerCount }, (_, index) => [index, null])
    );
    const ids = shuffleArray(stepAnswers.map((answer) => answer.id));
    setSlots(emptySlots);
    setPool(ids);
    setSelectedChipId(null);
  }, [question?.index, question?.questionType, layerCount, stepAnswers, stopDrag]);

  useEffect(() => () => stopDrag(), [stopDrag]);

  const filledCount = Object.values(slots).filter(Boolean).length;
  const isComplete = filledCount === layerCount && layerCount > 0;

  const placeChip = useCallback((itemId, targetLayer) => {
    if (!itemId || !answerMap[itemId] || isDisabledRef.current) return;
    const result = applyLayerPlacement(slotsRef.current, stepAnswersRef.current, itemId, targetLayer);
    setSlots(result.slots);
    setPool(result.pool);
    setSelectedChipId(null);
  }, [answerMap]);

  const getDropTarget = (clientX, clientY) => {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return null;

    const layerNode = element.closest('[data-layer-index]');
    if (layerNode) {
      const layerIndex = Number(layerNode.getAttribute('data-layer-index'));
      return Number.isInteger(layerIndex) ? { type: 'layer', layerIndex } : null;
    }

    if (element.closest('[data-answer-bank]')) {
      return { type: 'bank' };
    }

    return null;
  };

  const handlePointerDown = (itemId) => (event) => {
    if (isDisabledRef.current) return;
    event.preventDefault();

    const sourceEl = event.currentTarget;
    const rect = sourceEl.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    stopDrag();

    const ghost = sourceEl.cloneNode(true);
    ghost.style.position = 'fixed';
    ghost.style.left = `${event.clientX - offsetX}px`;
    ghost.style.top = `${event.clientY - offsetY}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.margin = '0';
    ghost.style.opacity = '0.9';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '99999';
    ghost.style.transform = 'none';
    document.body.appendChild(ghost);

    dragRef.current = {
      itemId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      offsetX,
      offsetY,
      ghost,
    };

    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
    setSelectedChipId(itemId);
    setDraggingId(itemId);

    const onMove = (ev) => {
      const drag = dragRef.current;
      if (!drag) return;

      drag.ghost.style.left = `${ev.clientX - drag.offsetX}px`;
      drag.ghost.style.top = `${ev.clientY - drag.offsetY}px`;

      if (Math.hypot(ev.clientX - drag.startX, ev.clientY - drag.startY) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
      }

      const target = getDropTarget(ev.clientX, ev.clientY);
      setDragOverIndex(target?.type === 'layer' ? target.layerIndex : null);
    };

    const onUp = (ev) => {
      const drag = dragRef.current;
      if (!drag) return;

      const { itemId: draggedId, moved } = drag;
      stopDrag();

      if (moved) {
        const target = getDropTarget(ev.clientX, ev.clientY);
        if (target?.type === 'layer') {
          placeChip(draggedId, target.layerIndex);
        } else if (target?.type === 'bank') {
          const result = returnChipToPool(slotsRef.current, stepAnswersRef.current, draggedId);
          setSlots(result.slots);
          setPool(result.pool);
          setSelectedChipId(null);
        }
        return;
      }

      setSelectedChipId((prev) => (prev === draggedId ? null : draggedId));
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);

    removeListenersRef.current = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  };

  const handleChipSelect = (itemId) => {
    if (isDisabled || draggingId) return;
    setSelectedChipId((prev) => (prev === itemId ? null : itemId));
  };

  const handleLayerTap = (layerIndex) => {
    if (isDisabled || draggingId || !selectedChipId) return;
    placeChip(selectedChipId, layerIndex);
  };

  const returnSelectedToPool = () => {
    if (isDisabled || draggingId || !selectedChipId) return;
    const result = returnChipToPool(slots, stepAnswers, selectedChipId);
    setSlots(result.slots);
    setPool(result.pool);
    setSelectedChipId(null);
  };

  const handleSubmit = () => {
    if (!isComplete || isDisabled) return;
    const order = Array.from({ length: layerCount }, (_, index) => slots[index]);
    onSubmitOrder(order);
  };

  if (!isDragLayersQuestion(question?.questionType) || layerCount < 1) {
    return null;
  }

  const gridCols = getGridCols(layerCount, inPanel);
  const slotsGrid = inPanel
    ? `${gridCols} gap-y-2 sm:gap-y-3`
    : `${gridCols} gap-y-3 sm:gap-y-4`;
  const poolGrid = inPanel
    ? `${gridCols} gap-y-2 sm:gap-y-2.5`
    : `${gridCols} gap-y-2 sm:gap-y-3`;

  const emptySlotBg = inPanel ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.2)';
  const filledSlotBg = inPanel ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)';
  const dragOverSlotBg = inPanel ? 'rgba(93, 63, 211, 0.12)' : 'rgba(255, 255, 255, 0.18)';
  const emptyBorderColor = inPanel ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255,255,255,0.5)';
  const placeholderClass = inPanel
    ? 'text-zk-black/45 font-bold text-xs sm:text-sm text-center px-1 self-center leading-tight'
    : 'text-white/70 font-bold text-xs sm:text-sm text-center px-1 self-center leading-tight';

  return (
    <div className={`flex flex-col h-auto relative ${inPanel ? 'w-full gap-3 sm:gap-4' : 'flex-1 min-h-0 gap-2.5 sm:gap-3 px-3 pb-4 mt-3'}`}>
      <LayoutGroup>
        <motion.div
          layout
          className={`${slotsGrid} w-full shrink-0 ${inPanel ? 'pt-1' : 'pt-3 mt-2'}`}
        >
          {Array.from({ length: layerCount }).map((_, index) => {
            const itemId = slots[index];
            const answer = itemId ? answerMap[itemId] : null;

            return (
              <motion.div
                key={`play-layer-${index}`}
                layout
                transition={LAYER_SPRING}
                className="relative min-w-0 pt-2"
              >
                <span className="absolute top-0 -left-1 z-10 bg-[#5D3FD3] text-white text-xs sm:text-sm md:text-base font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border-[2px] sm:border-[3px] border-zk-black min-w-[24px] sm:min-w-[28px] text-center">
                  {index + 1}
                </span>

                <motion.div
                  layout
                  transition={LAYER_SPRING}
                  data-layer-index={index}
                  onClick={() => handleLayerTap(index)}
                  animate={{
                    scale: dragOverIndex === index ? 1.02 : 1,
                    backgroundColor: dragOverIndex === index
                      ? dragOverSlotBg
                      : answer
                        ? filledSlotBg
                        : emptySlotBg,
                    borderColor: dragOverIndex === index ? '#FFCD29' : answer ? '#000000' : emptyBorderColor,
                  }}
                  className={`${
                    inPanel ? 'min-h-[96px] sm:min-h-[108px]' : 'min-h-[72px] sm:min-h-[80px]'
                  } rounded-lg sm:rounded-xl border-[2px] sm:border-[3px] border-dashed p-1.5 sm:p-2 pt-4 sm:pt-5 flex items-stretch justify-center ${
                    isDisabled ? 'opacity-50' : selectedChipId ? 'cursor-pointer' : ''
                  }`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {answer ? (
                      <PoolChip
                        key={answer.id}
                        answer={answer}
                        onPointerDown={handlePointerDown(answer.id)}
                        onClick={() => handleChipSelect(answer.id)}
                        disabled={isDisabled}
                        isDragging={draggingId === answer.id}
                        isSelected={selectedChipId === answer.id}
                        fillWidth
                        compact
                      />
                    ) : (
                      <motion.span
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={placeholderClass}
                      >
                        {selectedChipId ? 'Tap here' : 'Drop here'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          layout
          transition={LAYER_SPRING}
          data-answer-bank
          onClick={returnSelectedToPool}
          className={`rounded-xl border-[3px] border-zk-black flex flex-col w-full shrink-0 ${
            inPanel ? 'bg-zk-black/5 p-2 sm:p-3 gap-2' : 'bg-white/90 p-2 gap-1.5'
          } ${!isDisabled && selectedChipId ? 'cursor-pointer ring-2 ring-[#5D3FD3]/30' : ''}`}
        >
          <p className="text-xs font-black uppercase tracking-widest text-zk-black/50 px-0.5">
            Answer bank {selectedChipId ? '· tap here to return' : ''}
          </p>
          <motion.div layout className={`${poolGrid} w-full`}>
            {pool.length === 0 ? (
              <div
                className={`col-span-full min-h-[64px] sm:min-h-[72px] rounded-lg border-2 border-dashed flex items-center justify-center px-3 ${
                  selectedChipId && !isDisabled
                    ? 'border-[#5D3FD3] bg-[#5D3FD3]/10'
                    : 'border-zk-black/20 bg-transparent'
                }`}
              >
                <p className="text-xs sm:text-sm font-bold text-zk-black/40 text-center leading-tight">
                  {selectedChipId && !isDisabled
                    ? 'Tap or drop here to return a step'
                    : 'Drag steps back here to reorder'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {pool.map((itemId) => {
                  const answer = answerMap[itemId];
                  if (!answer) return null;
                  return (
                    <motion.div
                      key={itemId}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={CHIP_LAYOUT}
                      className="min-w-0"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <PoolChip
                        answer={answer}
                        onPointerDown={handlePointerDown(itemId)}
                        onClick={() => handleChipSelect(itemId)}
                        disabled={isDisabled}
                        isDragging={draggingId === itemId}
                        isSelected={selectedChipId === itemId}
                        compact
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      </LayoutGroup>

      <motion.button
        type="button"
        layout
        whileTap={isComplete && !isDisabled ? { scale: 0.97 } : {}}
        onClick={handleSubmit}
        disabled={!isComplete || isDisabled}
        className={`w-full sm:w-auto mx-auto shrink-0 mt-1 sm:mt-2 ${inPanel ? 'mb-4 sm:mb-5' : ''} flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[3px] border-zk-black font-black text-sm sm:text-base uppercase tracking-widest transition-colors ${
          isComplete && !isDisabled
            ? 'bg-[#5D3FD3] text-white hover:bg-[#4d33b8]'
            : inPanel
              ? 'bg-zk-black/10 text-zk-black/35 cursor-not-allowed'
              : 'bg-white/30 text-white/50 cursor-not-allowed'
        }`}
      >
        <Send size={16} />
        Lock in order
      </motion.button>
    </div>
  );
}