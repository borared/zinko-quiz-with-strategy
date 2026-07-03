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

function isPointerOverBank(clientX, clientY) {
  const bank = document.querySelector('[data-answer-bank]');
  if (!bank) return false;

  const rect = bank.getBoundingClientRect();
  return (
    clientX >= rect.left
    && clientX <= rect.right
    && clientY >= rect.top
    && clientY <= rect.bottom
  );
}

function shouldReturnToBank(pointer, draggedId, slots) {
  if (!pointer) return false;
  if (isPointerOverBank(pointer.x, pointer.y)) return true;

  const sourceLayer = Object.entries(slots).find(([, id]) => id === draggedId)?.[0];
  if (sourceLayer === undefined) return false;

  const slotEl = document.querySelector(`[data-layer-index="${sourceLayer}"]`);
  const bank = document.querySelector('[data-answer-bank]');
  if (!slotEl || !bank) return false;

  const slotRect = slotEl.getBoundingClientRect();
  const bankRect = bank.getBoundingClientRect();

  // Dragged downward from a slot into the bank corridor (handles overlap / missed collisions).
  return (
    pointer.y > slotRect.bottom - 10
    && pointer.y <= bankRect.bottom + 12
    && pointer.x >= bankRect.left - 16
    && pointer.x <= bankRect.right + 16
  );
}

function playCollisionDetection(args) {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    const bankHit = pointerHits.find(({ id }) => isBankDropId(String(id)));
    if (bankHit) return [bankHit];
    return pointerHits;
  }

  return rectIntersection(args);
}

function getPointerFromDragEvent(event) {
  const { activatorEvent, delta } = event;
  if (activatorEvent && 'clientX' in activatorEvent && 'clientY' in activatorEvent) {
    return {
      x: activatorEvent.clientX + delta.x,
      y: activatorEvent.clientY + delta.y,
    };
  }
  return null;
}

function resolveOverFromDom(clientX, clientY) {
  const elements = document.elementsFromPoint(clientX, clientY);
  for (const element of elements) {
    if (element.closest('[data-answer-bank]')) {
      return BANK_DROP_ID;
    }

    const layerNode = element.closest('[data-layer-index]');
    if (layerNode) {
      const layerIndex = Number(layerNode.getAttribute('data-layer-index'));
      if (Number.isInteger(layerIndex)) {
        return layerDropId(layerIndex);
      }
    }
  }

  return null;
}

function findBankCollision(collisions = []) {
  return collisions.find(({ id }) => isBankDropId(String(id))) ?? null;
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
      className={`flex rounded-xl border-[3px] text-left touch-none select-none ${
        compact ? 'flex-col items-center gap-1.5 px-2.5 py-2.5 text-center' : 'items-center gap-2 px-3 py-3'
      } ${
        isSelected ? 'border-zk-yellow ring-2 ring-zk-yellow' : 'border-zk-black'
      } ${getPlayLayerColor(answer.color, answer.layerIndex)} text-white min-w-0 ${fillWidth ? 'w-full' : compact ? 'w-full' : 'shrink-0'} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-[0.35]' : isSelected ? 'scale-[1.02]' : ''}`}
      {...dragHandleProps}
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

function DraggableChip({
  itemId,
  answer,
  disabled,
  isDragging,
  isSelected,
  onClick,
  fillWidth = false,
  compact = false,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingLocal } = useDraggable({
    id: itemId,
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
      <span className="absolute top-0 -left-1 z-10 bg-[#5D3FD3] text-white text-xs sm:text-sm md:text-base font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border-[2px] sm:border-[3px] border-zk-black min-w-[24px] sm:min-w-[28px] text-center">
        {index + 1}
      </span>

      <motion.div
        ref={setNodeRef}
        layout
        transition={LAYER_SPRING}
        data-layer-index={index}
        onClick={() => onLayerTap(index)}
        animate={{
          scale: highlighted || isOver ? 1.02 : 1,
          backgroundColor: highlighted || isOver
            ? dragOverSlotBg
            : hasAnswer
              ? filledSlotBg
              : emptySlotBg,
          borderColor: highlighted || isOver ? '#FFCD29' : hasAnswer ? '#000000' : emptyBorderColor,
        }}
        className={`${
          inPanel ? 'min-h-[96px] sm:min-h-[108px]' : 'min-h-[72px] sm:min-h-[80px]'
        } rounded-lg sm:rounded-xl border-[2px] sm:border-[3px] border-dashed p-1.5 sm:p-2 pt-4 sm:pt-5 flex items-stretch justify-center ${
          isDisabled ? 'opacity-50' : selectedChipId ? 'cursor-pointer' : ''
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
      className={`col-span-full min-h-[120px] sm:min-h-[140px] rounded-lg border-2 border-dashed flex items-center justify-center px-3 ${
        (selectedChipId && !isDisabled) || active
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
      onClick={onReturnSelected}
      className={`rounded-xl border-[3px] border-zk-black flex flex-col w-full shrink-0 transition-shadow ${
        inPanel ? 'bg-zk-black/5 p-2 sm:p-3 gap-2' : 'bg-white/90 p-2 gap-1.5'
      } ${!isDisabled && selectedChipId ? 'cursor-pointer ring-2 ring-[#5D3FD3]/30' : ''} ${
        bankActive ? 'ring-2 ring-[#5D3FD3]/40 shadow-[0_0_0_3px_#5D3FD3]' : ''
      }`}
    >
      <p className="text-xs font-black uppercase tracking-widest text-zk-black/50 px-0.5">
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
    setActiveId(String(event.active.id));
    setSelectedChipId(String(event.active.id));
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
    const draggedId = String(event.active.id);
    let overId = event.over ? String(event.over.id) : null;

    const pointer = getPointerFromDragEvent(event);
    const domOverId = pointer ? resolveOverFromDom(pointer.x, pointer.y) : null;
    const bankCollision = findBankCollision(event.collisions);
    const draggedFromSlot = Object.values(slots).includes(draggedId);
    const pointerWantsBank = draggedFromSlot && shouldReturnToBank(pointer, draggedId, slots);

    setActiveId(null);
    setDragOverIndex(null);
    setBankHighlighted(false);

    if (isDisabled) return;

    if (pointerWantsBank) {
      returnDraggedToBank(draggedId);
      return;
    }

    const wantsBankReturn = draggedFromSlot && (
      isBankDropId(overId)
      || isBankDropId(domOverId)
      || Boolean(bankCollision)
    );

    if (wantsBankReturn) {
      overId = isBankDropId(domOverId)
        ? domOverId
        : isBankDropId(overId)
          ? overId
          : String(bankCollision.id);
    } else if (isBankDropId(domOverId)) {
      overId = domOverId;
    } else if (!overId && domOverId) {
      overId = domOverId;
    } else if (!overId && event.collisions?.length) {
      overId = bankCollision
        ? String(bankCollision.id)
        : String(event.collisions[0].id);
    } else if (overId === draggedId && bankCollision) {
      overId = String(bankCollision.id);
    }

    if (!overId) return;

    const target = resolveDropTarget(overId, slots, pool);

    if (target?.type === 'bank') {
      returnDraggedToBank(draggedId);
      return;
    }

    if (target?.type === 'layer') {
      const sourceLayer = Object.entries(slots).find(([, id]) => id === draggedId)?.[0];
      if (sourceLayer !== undefined && Number(sourceLayer) === target.layerIndex) {
        if (shouldReturnToBank(pointer, draggedId, slots)) {
          returnDraggedToBank(draggedId);
        }
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
    ? 'text-zk-black/45 font-bold text-xs sm:text-sm text-center px-1 self-center leading-tight'
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
      <div className={`flex flex-col h-auto relative ${inPanel ? 'w-full gap-3 sm:gap-4' : 'flex-1 min-h-0 gap-2.5 sm:gap-3 px-3 pb-4 mt-3'}`}>
        <motion.div
          layout
          className={`${slotsGrid} w-full shrink-0 ${inPanel ? 'pt-1' : 'pt-3 mt-2'}`}
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