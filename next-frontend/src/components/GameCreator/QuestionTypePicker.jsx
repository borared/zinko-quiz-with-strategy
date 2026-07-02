"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTION_TYPES, QUESTION_TYPE_OPTIONS } from '@/lib/questionTypes';

export default function QuestionTypePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = value || QUESTION_TYPES.MULTIPLE_CHOICE;
  const selectedLabel = QUESTION_TYPE_OPTIONS.find((o) => o.value === selected)?.label ?? 'Multiple Choice';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className="relative -mt-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-3 min-w-[12.5rem] bg-white text-zk-black border-[2px] border-zk-black hover:bg-zk-yellow/20 px-3 py-1.5 transition-colors font-black text-sm uppercase tracking-widest ${
          open ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-[calc(100%-3px)] w-full bg-white border-[2px] border-zk-black border-t-0 rounded-b-lg rounded-t-none z-50 overflow-hidden"
            role="listbox"
          >
            {QUESTION_TYPE_OPTIONS.map((option, index) => {
              const isSelected = option.value === selected;
              const isLast = index === QUESTION_TYPE_OPTIONS.length - 1;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-zk-yellow/30 font-bold text-zk-black text-sm transition-colors text-left ${
                    !isLast ? 'border-b border-zk-black/10' : ''
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} strokeWidth={3} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}