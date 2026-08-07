"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
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
const BANK_DROP_ID = 'answer-bank';
const BANK_ZONE_DROP_ID = 'answer-bank-zone';

function isBankDropId(id) {
  return id === BANK_DROP_ID || id === BANK_ZONE_DROP_ID;
}

function prioritizeCollisions(collisions = []) {
  if (collisions.length === 0) return collisions;

  const layerHit = collisions.find(({ id }) => parseLayerDropId(String(id)) !== null);
  if (layerHit) return [layerHit];

  const bankHit = collisions.find(({ id }) => isBankDropId(String(id)));
  if (bankHit) return [bankHit];

  return collisions;
}

function playCollisionDetection(args) {
  const { pointerCoordinates } = args;

  if (pointerCoordinates) {
    const { x, y } = pointerCoordinates;

    // Check layers first – choose the closest slot under the pointer
    const layerSlots = document.querySelectorAll('[data-layer-index]');
    const candidates = [];
    for (const slot of layerSlots) {
      const rect = slot.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const layerIndex = Number(slot.getAttribute('data-layer-index'));
        if (Number.isInteger(layerIndex)) {
          // Compute distance from pointer to slot centre for tie‑breaking
          const dx = x - (rect.left + rect.width / 2);
          const dy = y - (rect.top + rect.height / 2);
          const dist = Math.hypot(dx, dy);
          candidates.push({ id: layerDropId(layerIndex), dist });
        }
      }
    }
    if (candidates.length) {
      // Return the slot whose centre is nearest to the pointer
      candidates.sort((a, b) => a.dist - b.dist);
      return [{ id: candidates[0].id }];
    }

    // Check bank
    const bank = document.querySelector('[data-answer-bank]');
    if (bank) {
      const rect = bank.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return [{ id: BANK_DROP_ID }];
      }
    }

    // If we have pointer coordinates but didn't hit anything, 
    // it means we are hovering empty space.
    // Return empty collisions so it correctly drops back to the bank.
    return [];
  }

  return prioritizeCollisions(rectIntersection(args));
}


function findBankCollision(collisions) {
  if (!collisions) return null;
  return collisions.find(({ id }) => isBankDropId(String(id))) ?? null;
}

function findLayerCollision(collisions) {
  if (!collisions) return null;
  return collisions.find(({ id }) => parseLayerDropId(String(id)) !== null) ?? null;
}

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

function layerDropId(index) {
  return `layer-${index}`;
}

function parseLayerDropId(id) {
  if (typeof id !== 'string' || !id.startsWith('layer-')) return null;
  const layerIndex = Number(id.slice('layer-'.length));
  return Number.isInteger(layerIndex) ? layerIndex : null;
}


function PoolChip({
  answer,
  onClick,
  disabled,
  isDragging,
  isSelected,
  fillWidth = false,
  compact = false,
  dragHandleProps,
}) {
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event);
        }
      }}
      className={`flex rounded-xl border-[3px] text-left touch-none select-none ${compact ? 'flex-col items-center gap-1.5 px-2.5 py-2.5 text-center' : 'items-center gap-2 px-3 py-3'
        } ${isSelected ? 'border-zk-yellow ring-2 ring-zk-yellow' : 'border-zk-border'
        } ${getPlayLayerColor(answer.color, answer.layerIndex)} text-white min-w-0 ${fillWidth ? 'w-full' : compact ? 'w-full' : 'shrink-0'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        } ${isDragging ? 'opacity-[0.35]' : isSelected ? 'scale-[1.02]' : ''}`}
      {...dragHandleProps}
    >
      <GripVertical size={compact ? 16 : 14} className="opacity-70 shrink-0 pointer-events-none" />
      <span
        className={`font-['Outfit'] font-bold pointer-events-none leading-tight ${compact ? 'text-sm sm:text-base md:text-lg line-clamp-3 leading-snug' : 'text-base md:text-lg'
          }`}
      >
        {displayAnswerText(answer.text)}
      </span>
    </div>
  );
}

function DraggableChip({
  itemId,
  idPrefix = '',
  answer,
  disabled,
  isDragging,
  isSelected,
  onClick,
  fillWidth = false,
  compact = false,
}) {
  const dragId = `${idPrefix}${itemId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingLocal } = useDraggable({
    id: dragId,
    disabled,
  });

  const dragging = isDragging || isDraggingLocal;
  const style = isDraggingLocal
    ? undefined
    : transform
      ? { transform: CSS.Translate.toString(transform) }
      : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="min-w-0 w-full"
      onClick={(event) => event.stopPropagation()}
    >
      <PoolChip
        answer={answer}
        onClick={onClick}
        disabled={disabled}
        isDragging={dragging}
        isSelected={isSelected}
        fillWidth={fillWidth}
        compact={compact}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}

function LayerSlot({
  index,
  highlighted,
  emptySlotBg,
  filledSlotBg,
  dragOverSlotBg,
  emptyBorderColor,
  inPanel,
  isDisabled,
  selectedChipId,
  onLayerTap,
  hasAnswer,
  children,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: layerDropId(index) });

  return (
    <motion.div
      layout
      transition={LAYER_SPRING}
      className="relative min-w-0 pt-2"
    >
      <span className="absolute top-0 -left-1 z-10 bg-[#5D3FD3] text-white text-xs sm:text-sm md:text-base font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border-[2px] sm:border-[3px] border-zk-border min-w-[24px] sm:min-w-[28px] text-center pointer-events-none">
        {index + 1}
      </span>

      <motion.div
        ref={setNodeRef}
        layout
        transition={LAYER_SPRING}
        data-layer-index={index}
        onClick={(e) => {
          e.stopPropagation();
          onLayerTap(index);
        }}
        animate={{
          scale: highlighted || isOver ? 1.02 : 1,
          backgroundColor: highlighted || isOver
            ? dragOverSlotBg
            : hasAnswer
              ? filledSlotBg
              : emptySlotBg,
          borderColor: highlighted || isOver ? '#FFCD29' : hasAnswer ? '#000000' : emptyBorderColor,
        }}
        className={`${inPanel ? 'min-h-[96px] sm:min-h-[108px]' : 'min-h-[72px] sm:min-h-[80px]'
          } rounded-lg sm:rounded-xl border-[2px] sm:border-[3px] border-dashed p-1.5 sm:p-2 pt-4 sm:pt-5 flex items-stretch justify-center ${isDisabled ? 'opacity-50' : selectedChipId ? 'cursor-pointer' : ''
          }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function EmptyBankDropZoneVisual({
  selectedChipId,
  isDisabled,
  isHighlighted,
}) {
  const active = isHighlighted;

  return (
    <div
      className={`col-span-full min-h-[120px] sm:min-h-[140px] rounded-lg border-2 border-dashed flex items-center justify-center px-3 ${(selectedChipId && !isDisabled) || active
        ? 'border-[#5D3FD3] bg-[#5D3FD3]/10'
        : 'border-zk-border/20 bg-transparent'
        }`}
    >
      <p className="text-xs sm:text-sm font-bold text-zk-text/40 text-center leading-tight">
        {selectedChipId && !isDisabled
          ? 'Tap or drop here to return a step'
          : 'Drag steps back here to reorder'}
      </p>
    </div>
  );
}

function AnswerBank({
  inPanel,
  selectedChipId,
  isDisabled,
  onReturnSelected,
  poolGrid,
  pool,
  answerMap,
  activeId,
  selectedChipIdState,
  onChipSelect,
  isDisabledState,
  bankHighlighted,
}) {
  const { setNodeRef: setBankRef, isOver: isBankOver } = useDroppable({ id: BANK_DROP_ID });
  const { setNodeRef: setZoneRef, isOver: isZoneOver } = useDroppable({ id: BANK_ZONE_DROP_ID });
  const bankActive = bankHighlighted || isBankOver || isZoneOver;

  return (
    <div
      ref={setBankRef}
      data-answer-bank
      onClick={(e) => {
        e.stopPropagation();
        onReturnSelected();
      }}
      className={`rounded-xl border-[3px] border-zk-border flex flex-col w-full shrink-0 transition-shadow ${inPanel ? 'bg-zk-black/5 p-2 sm:p-3 gap-2' : 'bg-zk-panel-bg/90 p-2 gap-1.5'
        } ${!isDisabled && selectedChipId ? 'cursor-pointer ring-2 ring-[#5D3FD3]/30' : ''} ${bankActive ? 'ring-2 ring-[#5D3FD3]/40 shadow-[0_0_0_3px_#5D3FD3]' : ''
        }`}
    >
      <p className="text-xs font-black uppercase tracking-widest text-zk-text/50 px-0.5">
        Answer bank {selectedChipId ? '· tap here to return' : ''}
      </p>
      <div
        ref={setZoneRef}
        className={`${poolGrid} w-full ${pool.length === 0 ? 'min-h-[120px] sm:min-h-[140px]' : ''}`}
      >
        {pool.length === 0 ? (
          <EmptyBankDropZoneVisual
            selectedChipId={selectedChipId}
            isDisabled={isDisabled}
            isHighlighted={bankHighlighted}
          />
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
                  <DraggableChip
                    itemId={itemId}
                    idPrefix="bank-"
                    answer={answer}
                    disabled={isDisabledState}
                    isDragging={activeId === itemId}
                    isSelected={selectedChipIdState === itemId}
                    onClick={() => onChipSelect(itemId)}
                    compact
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
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
  const [bankHighlighted, setBankHighlighted] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [selectedChipId, setSelectedChipId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!isDragLayersQuestion(question?.questionType) || layerCount < 1) return;

    const emptySlots = Object.fromEntries(
      Array.from({ length: layerCount }, (_, index) => [index, null])
    );
    const ids = shuffleArray(stepAnswers.map((answer) => answer.id));
    setSlots(emptySlots);
    setPool(ids);
    setSelectedChipId(null);
    setActiveId(null);
    setDragOverIndex(null);
    setBankHighlighted(false);
  }, [question?.index, question?.questionType, layerCount, stepAnswers]);

  const handleBackgroundClick = useCallback(() => {
    if (selectedChipId) {
      setSelectedChipId(null);
    }
  }, [selectedChipId]);

  const isDisabled = phase !== 'PLAYING' || !!selectedId || foxSmokescreen;
  const filledCount = Object.values(slots).filter(Boolean).length;
  const isComplete = filledCount === layerCount && layerCount > 0;

  const placeChip = useCallback((itemId, targetLayer) => {
    if (!itemId || !answerMap[itemId] || isDisabled) return;
    const result = applyLayerPlacement(slots, stepAnswers, itemId, targetLayer);
    setSlots(result.slots);
    setPool(result.pool);
    setSelectedChipId(null);
  }, [answerMap, isDisabled, slots, stepAnswers]);

  const handleDragStart = useCallback((event) => {
    if (isDisabled) return;
    const rawId = String(event.active.id);
    const actualId = rawId.replace(/^(slot-|bank-)/, '');
    setActiveId(actualId);
    setSelectedChipId(actualId);
  }, [isDisabled]);

  const handleDragOver = useCallback((event) => {
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) {
      setDragOverIndex(null);
      setBankHighlighted(false);
      return;
    }

    if (isBankDropId(overId)) {
      setBankHighlighted(true);
      setDragOverIndex(null);
      return;
    }

    setBankHighlighted(false);

    const layerFromId = parseLayerDropId(overId);
    if (layerFromId !== null) {
      setDragOverIndex(layerFromId);
      return;
    }

    if (answerMap[overId]) {
      const occupiedLayer = Object.entries(slots).find(([, id]) => id === overId)?.[0];
      setDragOverIndex(occupiedLayer !== undefined ? Number(occupiedLayer) : null);
      return;
    }

    setDragOverIndex(null);
  }, [answerMap, slots]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setDragOverIndex(null);
    setBankHighlighted(false);
  }, []);

  const resolveDropTarget = useCallback((overId, currentSlots, currentPool) => {
    if (!overId) return null;
    if (isBankDropId(overId) || currentPool.includes(overId)) {
      return { type: 'bank' };
    }

    const layerFromId = parseLayerDropId(overId);
    if (layerFromId !== null) {
      return { type: 'layer', layerIndex: layerFromId };
    }

    if (answerMap[overId]) {
      const occupiedLayer = Object.entries(currentSlots).find(([, id]) => id === overId)?.[0];
      if (occupiedLayer !== undefined) {
        return { type: 'layer', layerIndex: Number(occupiedLayer) };
      }
      if (currentPool.includes(overId)) {
        return { type: 'bank' };
      }
    }

    return null;
  }, [answerMap]);

  const returnDraggedToBank = useCallback((draggedId) => {
    const result = returnChipToPool(slots, stepAnswers, draggedId);
    setSlots(result.slots);
    setPool(result.pool);
    setSelectedChipId(null);
  }, [slots, stepAnswers]);

  const handleDragEnd = useCallback((event) => {
    const rawId = String(event.active.id);
    const draggedId = rawId.replace(/^(slot-|bank-)/, '');
    let overId = event.over ? String(event.over.id) : null;

    const bankCollision = findBankCollision(event.collisions);
    const layerCollision = findLayerCollision(event.collisions);
    const draggedFromSlot = Object.values(slots).includes(draggedId);

    setActiveId(null);
    setDragOverIndex(null);
    setBankHighlighted(false);

    if (isDisabled) return;

    if (!overId && event.collisions?.length) {
      overId = layerCollision
        ? String(layerCollision.id)
        : bankCollision
          ? String(bankCollision.id)
          : String(event.collisions[0].id);
    } else if (overId === draggedId && (layerCollision || bankCollision)) {
      overId = String((layerCollision ?? bankCollision).id);
    } else if (layerCollision && isBankDropId(overId)) {
      overId = String(layerCollision.id);
    }

    if (!overId) {
      if (draggedFromSlot) {
        returnDraggedToBank(draggedId);
      }
      return;
    }

    const target = resolveDropTarget(overId, slots, pool);

    if (target?.type === 'bank') {
      returnDraggedToBank(draggedId);
      return;
    }

    if (target?.type === 'layer') {
      const sourceLayer = Object.entries(slots).find(([, id]) => id === draggedId)?.[0];
      if (sourceLayer !== undefined && Number(sourceLayer) === target.layerIndex) {
        return;
      }
      placeChip(draggedId, target.layerIndex);
    }
  }, [isDisabled, placeChip, pool, resolveDropTarget, returnDraggedToBank, slots]);

  const handleChipSelect = (itemId) => {
    if (isDisabled || activeId) return;
    setSelectedChipId((prev) => (prev === itemId ? null : itemId));
  };

  const handleLayerTap = (layerIndex) => {
    if (isDisabled || activeId || !selectedChipId) return;
    placeChip(selectedChipId, layerIndex);
  };

  const returnSelectedToPool = () => {
    if (isDisabled || activeId || !selectedChipId) return;
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
    ? 'text-zk-text/45 font-bold text-xs sm:text-sm text-center px-1 self-center leading-tight'
    : 'text-white/70 font-bold text-xs sm:text-sm text-center px-1 self-center leading-tight';

  const activeAnswer = activeId ? answerMap[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={playCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className={`flex flex-col h-auto relative ${inPanel ? 'w-full gap-3 sm:gap-4' : 'flex-1 min-h-0 gap-2.5 sm:gap-3 px-3 pb-4 mt-3'}`}
        onClick={handleBackgroundClick}
      >
        <motion.div
          layout
          className={`${slotsGrid} w-full shrink-0 relative z-[1] ${inPanel ? 'pt-1' : 'pt-3 mt-2'}`}
        >
          {Array.from({ length: layerCount }).map((_, index) => {
            const itemId = slots[index];
            const answer = itemId ? answerMap[itemId] : null;

            return (
              <LayerSlot
                key={`play-layer-${index}`}
                index={index}
                highlighted={dragOverIndex === index}
                emptySlotBg={emptySlotBg}
                filledSlotBg={filledSlotBg}
                dragOverSlotBg={dragOverSlotBg}
                emptyBorderColor={emptyBorderColor}
                inPanel={inPanel}
                isDisabled={isDisabled}
                selectedChipId={selectedChipId}
                onLayerTap={handleLayerTap}
                hasAnswer={Boolean(answer)}
              >
                {answer ? (
                  <DraggableChip
                    itemId={answer.id}
                    idPrefix="slot-"
                    answer={answer}
                    disabled={isDisabled}
                    isDragging={activeId === answer.id}
                    isSelected={selectedChipId === answer.id}
                    onClick={() => handleChipSelect(answer.id)}
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
              </LayerSlot>
            );
          })}
        </motion.div>

        <AnswerBank
          inPanel={inPanel}
          selectedChipId={selectedChipId}
          isDisabled={isDisabled}
          onReturnSelected={returnSelectedToPool}
          poolGrid={poolGrid}
          pool={pool}
          answerMap={answerMap}
          activeId={activeId}
          selectedChipIdState={selectedChipId}
          onChipSelect={handleChipSelect}
          isDisabledState={isDisabled}
          bankHighlighted={bankHighlighted}
        />

        <motion.button
          type="button"
          layout
          whileTap={isComplete && !isDisabled ? { scale: 0.97 } : {}}
          onClick={handleSubmit}
          disabled={!isComplete || isDisabled}
          className={`w-full sm:w-auto mx-auto shrink-0 mt-1 sm:mt-2 ${inPanel ? 'mb-4 sm:mb-5' : ''} flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[3px] border-zk-border font-black text-sm sm:text-base uppercase tracking-widest transition-colors ${isComplete && !isDisabled
            ? 'bg-[#5D3FD3] text-white hover:bg-[#4d33b8]'
            : inPanel
              ? 'bg-zk-black/10 text-zk-text/35 cursor-not-allowed'
              : 'bg-zk-panel-bg/30 text-white/50 cursor-not-allowed'
            }`}
        >
          <Send size={16} />
          Lock in order
        </motion.button>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeAnswer ? (
          <div className="opacity-90 cursor-grabbing pointer-events-none">
            <PoolChip answer={activeAnswer} disabled compact fillWidth />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}