"use client";
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CreatorSelectPicker({
  value,
  onChange,
  options = [],
  className = '',
  buttonClassName = '',
  fullWidth = false,
  placement = 'bottom',
}) {
  const opensUp = placement === 'top';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label ?? '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
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
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-3 bg-zk-panel-bg text-zk-text border-[2px] border-zk-border hover:bg-zk-bg/20 px-3 py-1.5 transition-colors font-black text-sm uppercase tracking-widest ${
          fullWidth ? 'w-full' : 'min-w-[12.5rem]'
        } ${
          open
            ? opensUp
              ? 'rounded-b-lg rounded-t-none'
              : 'rounded-t-lg rounded-b-none'
            : 'rounded-lg'
        } ${buttonClassName}`}
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
            initial={{ opacity: 0, y: opensUp ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: opensUp ? -4 : 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 right-0 w-full bg-zk-panel-bg border-[2px] border-zk-border z-[100] overflow-hidden ${
              opensUp
                ? 'bottom-[calc(100%-3px)] border-b-0 rounded-t-lg rounded-b-none'
                : 'top-[calc(100%-3px)] border-t-0 rounded-b-lg rounded-t-none'
            }`}
            role="listbox"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isLast = index === options.length - 1;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-zk-bg/30 font-bold text-zk-text text-sm transition-colors text-left ${
                    !isLast ? 'border-b border-zk-border/10' : ''
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