"use client";
import React from 'react';
import { Search } from 'lucide-react';

const DiscoverySearchIdle = ({ query }) => (
  <div className="zk-panel !shadow-none border-dashed min-h-[320px] flex flex-col items-center justify-center gap-4 p-10 text-center">
    <p className="permanent-marker-regular text-6xl md:text-7xl text-zk-purple tracking-tight">
      Zinko
    </p>
    <div className="flex items-center gap-2 text-zk-black/50">
      <Search size={18} />
      <p className="font-bold text-sm md:text-base">
        Press <span className="text-zk-black font-black">Enter</span> to search
        {query ? (
          <>
            {' '}
            for &ldquo;<span className="text-zk-purple">{query}</span>&rdquo;
          </>
        ) : (
          ' public quizzes'
        )}
      </p>
    </div>
    <p className="text-xs font-bold text-zk-black/40 max-w-sm">
      Pick a suggestion below or hit Enter to see matching quizzes.
    </p>
  </div>
);

export default DiscoverySearchIdle;