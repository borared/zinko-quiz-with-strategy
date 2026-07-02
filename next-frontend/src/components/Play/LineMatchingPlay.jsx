"use client";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Send } from 'lucide-react';
import { displayAnswerText, isLineMatchingQuestion } from '@/lib/questionTypes';
import {
  assignLineMatch,
  buildConnectionsPayload,
} from '@/lib/lineMatchingUtils';
import { getPlayLayerColor } from '@/lib/dragLayersUtils';

const DRAG_THRESHOLD_PX = 6;

function MatchItem({
  item,
  side,
  colorIndex,
  isSelected,
  isConnected,
  isDropTarget,
  disabled,
  onClick,
  onPointerDown,
  itemRef,
}) {
  const isRightConnected = side === 'right' && isConnected;
  const showFullColor = isRightConnected || !disabled;
  const playColor = getPlayLayerColor(item.color, colorIndex);

  return (
    <motion.button
      type="button"
      layout
      ref={itemRef}
      data-match-id={item.id}
      data-match-side={side}
      onClick={onClick}
      onPointerDown={onPointerDown}
      disabled={disabled}
      animate={{
        scale: isSelected || isDropTarget ? 1.02 : 1,
        opacity: showFullColor ? 1 : 0.45,
        boxShadow: isSelected
          ? '0 0 0 3px #FFCD29'
          : isDropTarget
            ? '0 0 0 3px #FFCD29'
            : isConnected
              ? '0 0 0 2px #5D3FD3'
              : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ layout: { type: 'spring', stiffness: 420, damping: 32 } }}
      className={`flex items-start gap-2 px-3 py-2.5 sm:py-3 rounded-xl border-[3px] border-zk-black ${playColor} text-white w-full max-w-[12rem] sm:max-w-[14rem] min-w-0 text-left select-none ${
        disabled && !isRightConnected ? 'cursor-not-allowed' : side === 'left' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
    >
      <Link2 size={14} className="shrink-0 opacity-70 mt-0.5" />
      <span className="font-black text-sm sm:text-base leading-snug break-words pointer-events-none line-clamp-3">
        {displayAnswerText(item.text) || '—'}
      </span>
    </motion.button>
  );
}

export default function LineMatchingPlay({
  question,
  phase,
  selectedId,
  foxSmokescreen,
  onSubmitMatches,
  inPanel = false,
}) {
  const leftItems = useMemo(() => question?.leftItems || [], [question?.leftItems]);
  const rightItems = useMemo(() => question?.rightItems || [], [question?.rightItems]);
  const pairCount = question?.pairCount ?? leftItems.length;

  const [connections, setConnections] = useState({});
  const [activeLeftId, setActiveLeftId] = useState(null);
  const [lineCoords, setLineCoords] = useState([]);
  const [dragLine, setDragLine] = useState(null);
  const [hoverRightId, setHoverRightId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const boardRef = useRef(null);
  const itemRefs = useRef({});
  const dragRef = useRef({
    leftId: null,
    startX: 0,
    startY: 0,
    moved: false,
    pointerId: null,
  });
  const removeDragListenersRef = useRef(null);

  const setItemRef = useCallback((id) => (node) => {
    if (node) itemRefs.current[id] = node;
    else delete itemRefs.current[id];
  }, []);

  const cleanupDragListeners = useCallback(() => {
    removeDragListenersRef.current?.();
    removeDragListenersRef.current = null;
  }, []);

  useEffect(() => {
    if (!isLineMatchingQuestion(question?.questionType) || pairCount < 1) return;
    cleanupDragListeners();
    setConnections({});
    setActiveLeftId(null);
    setLineCoords([]);
    setDragLine(null);
    setHoverRightId(null);
    setIsDragging(false);
    setDragActive(false);
    dragRef.current = { leftId: null, startX: 0, startY: 0, moved: false, pointerId: null };
  }, [question?.index, question?.questionType, pairCount, cleanupDragListeners]);

  useEffect(() => () => cleanupDragListeners(), [cleanupDragListeners]);

  const isDisabled = phase !== 'PLAYING' || !!selectedId || foxSmokescreen;
  const connectedCount = Object.keys(connections).length;
  const isComplete = connectedCount === pairCount && pairCount > 0;

  const getBoardPoint = useCallback((clientX, clientY) => {
    const board = boardRef.current;
    if (!board) return { x: 0, y: 0 };
    const boardRect = board.getBoundingClientRect();
    return {
      x: clientX - boardRect.left,
      y: clientY - boardRect.top,
    };
  }, []);

  const getAnchorPoint = useCallback((id, side) => {
    const board = boardRef.current;
    const node = itemRefs.current[id];
    if (!board || !node) return null;

    const boardRect = board.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    return {
      x: side === 'left' ? rect.right - boardRect.left : rect.left - boardRect.left,
      y: rect.top + rect.height / 2 - boardRect.top,
    };
  }, []);

  const getRightIdAtPoint = useCallback((clientX, clientY) => {
    for (const item of rightItems) {
      const node = itemRefs.current[item.id];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (
        clientX >= rect.left
        && clientX <= rect.right
        && clientY >= rect.top
        && clientY <= rect.bottom
      ) {
        return item.id;
      }
    }
    return null;
  }, [rightItems]);

  const connectPair = useCallback((leftId, rightId) => {
    if (!leftId || !rightId || isDisabled) return;
    setConnections((prev) => assignLineMatch(prev, leftId, rightId));
    setActiveLeftId(null);
  }, [isDisabled]);

  const updateLines = useCallback(() => {
    const nextLines = Object.entries(connections).map(([leftId, rightId]) => {
      const start = getAnchorPoint(leftId, 'left');
      const end = getAnchorPoint(rightId, 'right');
      if (!start || !end) return null;

      return {
        key: `${leftId}-${rightId}`,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      };
    }).filter(Boolean);

    setLineCoords(nextLines);
  }, [connections, getAnchorPoint]);

  useLayoutEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [updateLines, leftItems, rightItems, connections, dragLine, hoverRightId]);

  const updateDragPointer = useCallback((clientX, clientY) => {
    const { leftId, startX, startY } = dragRef.current;
    if (!leftId) return;

    const distance = Math.hypot(clientX - startX, clientY - startY);
    if (distance > DRAG_THRESHOLD_PX) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    const point = getBoardPoint(clientX, clientY);
    const anchor = getAnchorPoint(leftId, 'left');
    setDragLine({
      leftId,
      x1: anchor?.x ?? point.x,
      y1: anchor?.y ?? point.y,
      x2: point.x,
      y2: point.y,
    });
    setHoverRightId(getRightIdAtPoint(clientX, clientY));
  }, [getAnchorPoint, getBoardPoint, getRightIdAtPoint]);

  const finishDrag = useCallback((clientX, clientY) => {
    cleanupDragListeners();

    const { leftId, moved } = dragRef.current;
    dragRef.current = { leftId: null, startX: 0, startY: 0, moved: false, pointerId: null };
    setDragActive(false);
    setIsDragging(false);
    setDragLine(null);
    setHoverRightId(null);

    if (!leftId) return;

    if (moved) {
      const rightId = getRightIdAtPoint(clientX, clientY);
      if (rightId) {
        connectPair(leftId, rightId);
      } else {
        setActiveLeftId(null);
      }
      return;
    }

    setActiveLeftId((prev) => (prev === leftId ? null : leftId));
  }, [cleanupDragListeners, connectPair, getRightIdAtPoint]);

  const attachDragListeners = useCallback((pointerId) => {
    cleanupDragListeners();

    const onMove = (event) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      updateDragPointer(event.clientX, event.clientY);
    };

    const onEnd = (event) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      finishDrag(event.clientX, event.clientY);
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onEnd, { passive: false });
    window.addEventListener('pointercancel', onEnd, { passive: false });

    removeDragListenersRef.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, [cleanupDragListeners, finishDrag, updateDragPointer]);

  const handleLeftPointerDown = (leftId) => (event) => {
    if (isDisabled) return;
    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      leftId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      pointerId: event.pointerId,
    };

    setDragActive(true);
    attachDragListeners(event.pointerId);
    updateDragPointer(event.clientX, event.clientY);
  };

  const handleRightClick = (rightId) => {
    if (isDisabled || isDragging || dragActive || !activeLeftId) return;
    connectPair(activeLeftId, rightId);
  };

  const handleSubmit = () => {
    if (!isComplete || isDisabled) return;
    onSubmitMatches(buildConnectionsPayload(connections));
  };

  if (!isLineMatchingQuestion(question?.questionType) || pairCount < 1) {
    return null;
  }

  const usedRightIds = new Set(Object.values(connections));
  const tapModeReady = !!activeLeftId && !isDragging && !dragActive;
  const dropModeReady = dragActive || isDragging;

  return (
    <div className={`flex flex-col flex-1 min-h-0 gap-3 relative ${inPanel ? '' : 'px-3 pb-4 mt-3'}`}>
      <p className="text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-zk-black/45">
        Drag a line from left to right, or tap left then right
      </p>

      <div
        ref={boardRef}
        className={`relative flex-1 min-h-0 ${dragActive ? 'cursor-grabbing' : ''}`}
        style={{ touchAction: dragActive ? 'none' : 'manipulation' }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" aria-hidden="true">
          {lineCoords.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#5D3FD3"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          {dragLine && (
            <>
              <line
                x1={dragLine.x1}
                y1={dragLine.y1}
                x2={dragLine.x2}
                y2={dragLine.y2}
                stroke="#5D3FD3"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="8 6"
              />
              <circle
                cx={dragLine.x2}
                cy={dragLine.y2}
                r="6"
                fill="#FFCD29"
                stroke="#000"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-0 sm:gap-x-24 md:gap-x-32">
          <div className="flex flex-col gap-2 min-w-0 items-center sm:items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-zk-black/40 w-full max-w-[12rem] sm:max-w-[14rem] text-center sm:text-right">Left</p>
            {leftItems.map((item, index) => (
              <MatchItem
                key={item.id}
                item={item}
                side="left"
                colorIndex={index}
                itemRef={setItemRef(item.id)}
                isSelected={activeLeftId === item.id && !isDragging}
                isConnected={!!connections[item.id]}
                isDropTarget={false}
                disabled={isDisabled}
                onPointerDown={handleLeftPointerDown(item.id)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 min-w-0 items-center sm:items-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-zk-black/40 w-full max-w-[12rem] sm:max-w-[14rem] text-center sm:text-left">Right</p>
            {rightItems.map((item, index) => (
              <MatchItem
                key={item.id}
                item={item}
                side="right"
                colorIndex={index}
                itemRef={setItemRef(item.id)}
                isSelected={false}
                isConnected={usedRightIds.has(item.id)}
                isDropTarget={hoverRightId === item.id}
                disabled={isDisabled || (!tapModeReady && !dropModeReady)}
                onClick={() => handleRightClick(item.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <motion.button
        type="button"
        layout
        whileTap={isComplete && !isDisabled ? { scale: 0.97 } : {}}
        onClick={handleSubmit}
        disabled={!isComplete || isDisabled}
        className={`w-full sm:w-auto mx-auto shrink-0 mt-2 flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl border-[3px] border-zk-black font-black text-sm sm:text-base uppercase tracking-widest transition-colors ${
          isComplete && !isDisabled
            ? 'bg-[#5D3FD3] text-white hover:bg-[#4d33b8]'
            : inPanel
              ? 'bg-zk-black/10 text-zk-black/35 cursor-not-allowed'
              : 'bg-white/30 text-white/50 cursor-not-allowed'
        }`}
      >
        <Send size={16} />
        Lock in matches ({connectedCount}/{pairCount})
      </motion.button>
    </div>
  );
}