"use client";
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import {
  addDragLayer,
  moveItemToLayer,
  removeDragLayer,
  sortAnswersByLayer,
  MAX_DRAG_LAYERS,
  MIN_DRAG_LAYERS,
} from '@/lib/dragLayersUtils';
import { displayAnswerText } from '@/lib/questionTypes';

const LAYER_SPRING = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 };
const CHIP_LAYOUT = { type: 'spring', stiffness: 620, damping: 38, mass: 0.65 };

function DragChip({
  answer,
  editable,
  onTextChange,
  draggable = true,
  isDragging,
  onDragStartCapture,
  onDragEndCapture,
  fillWidth = true,
}) {
  return (
    <motion.div
      layoutId={`drag-layer-chip-${answer.id}`}
      layout="position"
      transition={CHIP_LAYOUT}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging
          ? '0 8px 20px rgba(0,0,0,0.18)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-[3px] border-zk-border ${answer.color} text-white min-w-0 ${
        fillWidth ? 'w-full' : ''
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', answer.id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStartCapture?.();
      }}
      onDragEnd={() => {
        onDragEndCapture?.();
      }}
    >
      <GripVertical size={14} className="shrink-0 opacity-70" />
      {editable ? (
        <input
          value={displayAnswerText(answer.text)}
          onChange={(event) => onTextChange(answer.id, event.target.value)}
          placeholder="Type step..."
          className="flex-1 min-w-0 bg-transparent border-none outline-none font-bold text-sm text-white placeholder:text-white/50"
        />
      ) : (
        <span className="font-bold text-sm truncate">{displayAnswerText(answer.text) || 'Empty step'}</span>
      )}
    </motion.div>
  );
}

export default function DragLayersEditor() {
  const { questions, activeQuestionId, updateActiveQuestion } = useQuizStore();
  const activeQuestion = questions.find((question) => question.id === activeQuestionId);
  const answers = activeQuestion?.answers || [];
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const sortedLayers = useMemo(() => sortAnswersByLayer(answers), [answers]);

  if (!activeQuestion) return null;

  const updateAnswers = (nextAnswers) => {
    updateActiveQuestion({ answers: nextAnswers });
  };

  const handleDropOnLayer = (layerIndex, event) => {
    event.preventDefault();
    setDragOverIndex(null);
    setDraggingId(null);
    const itemId = event.dataTransfer.getData('text/plain');
    if (!itemId) return;
    updateAnswers(moveItemToLayer(answers, itemId, layerIndex));
  };

  const handleTextChange = (id, text) => {
    updateAnswers(
      answers.map((answer) => (answer.id === id ? { ...answer, text } : answer))
    );
  };

  return (
    <div className="zk-panel p-5 lg:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zk-text/50">Answer widget</p>
          <h3 className="font-black text-lg text-zk-text uppercase">Drag steps into the right layer</h3>
        </div>
        <button
          type="button"
          onClick={() => updateAnswers(addDragLayer(answers))}
          disabled={answers.length >= MAX_DRAG_LAYERS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[2px] border-zk-border bg-zk-green text-white font-black text-xs uppercase tracking-widest disabled:opacity-40"
        >
          <Plus size={14} strokeWidth={3} />
          Add layer
        </button>
      </div>

      <p className="text-sm font-bold text-zk-text/60">
        Arrange the cards top to bottom — that order is the correct answer in battle.
      </p>

      <LayoutGroup>
        <motion.div layout className="flex flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {sortedLayers.map((answer, index) => (
              <motion.div
                key={answer.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98, height: 0, marginBottom: 0 }}
                transition={LAYER_SPRING}
                className="flex items-stretch gap-3"
              >
                <motion.div
                  layout
                  transition={LAYER_SPRING}
                  className="w-16 shrink-0 flex flex-col items-center justify-center rounded-xl border-[3px] border-zk-border bg-zk-bg/40"
                >
                  <span className="text-[10px] font-black uppercase text-zk-text/50">Step</span>
                  <motion.span
                    key={`step-label-${index}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="font-black text-xl text-zk-text"
                  >
                    {index + 1}
                  </motion.span>
                </motion.div>

                <motion.div
                  layout
                  transition={LAYER_SPRING}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverIndex(index);
                  }}
                  onDragEnter={() => setDragOverIndex(index)}
                  onDragLeave={() => setDragOverIndex((prev) => (prev === index ? null : prev))}
                  onDrop={(event) => handleDropOnLayer(index, event)}
                  animate={{
                    scale: dragOverIndex === index ? 1.015 : 1,
                    backgroundColor: dragOverIndex === index ? 'rgba(255, 205, 41, 0.35)' : 'rgba(255, 255, 255, 0.5)',
                    borderColor: dragOverIndex === index ? '#5D3FD3' : '#000000',
                  }}
                  className="flex-1 min-h-[56px] rounded-xl border-[3px] border-dashed border-zk-border bg-zk-panel-bg/50 p-2 flex items-center"
                >
                  <DragChip
                    answer={answer}
                    editable
                    onTextChange={handleTextChange}
                    isDragging={draggingId === answer.id}
                    draggable
                    onDragStartCapture={() => setDraggingId(answer.id)}
                    onDragEndCapture={() => {
                      setDraggingId(null);
                      setDragOverIndex(null);
                    }}
                  />
                </motion.div>

                <motion.button
                  layout
                  type="button"
                  onClick={() => updateAnswers(removeDragLayer(answers, index))}
                  disabled={answers.length <= MIN_DRAG_LAYERS}
                  className="shrink-0 w-10 rounded-lg border-[2px] border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white transition-colors disabled:opacity-30 flex items-center justify-center"
                  aria-label={`Remove layer ${index + 1}`}
                >
                  <Trash2 size={16} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}