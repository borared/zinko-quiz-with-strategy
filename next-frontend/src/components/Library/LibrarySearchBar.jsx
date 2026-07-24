"use client";

import { Search, X } from 'lucide-react';

export default function LibrarySearchBar({ value, onChange, resultCount, totalCount }) {
  const hasQuery = value.trim().length > 0;

  return (
    <div className="zk-panel-glass px-4 py-3 flex items-center gap-3 !shadow-none">
      <Search size={22} strokeWidth={2.5} className="text-zk-black shrink-0" />
      <input
        type="text"
        placeholder="Search your collection..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-base md:text-lg font-bold outline-none placeholder:text-zk-black/40 text-zk-black bg-transparent"
      />
      {hasQuery && (
        <>
          <span className="hidden sm:inline text-xs font-black uppercase tracking-wider text-zk-black/50 shrink-0">
            {resultCount} of {totalCount}
          </span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-[2px] border-zk-black bg-white text-zk-black transition-colors hover:bg-zk-yellow/30 shrink-0"
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
}