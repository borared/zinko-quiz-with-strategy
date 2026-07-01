"use client";

/**
 * Person laughing out loud — Zinko cartoon style, transparent, no background box.
 */
export default function ZinkoLaughSticker({ className = '', style }) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
      role="img"
    >
      {/* Left hand on cheek */}
      <path
        d="M14 52c-2-12 10-20 18-12 5 5 4 14-2 19l-6 8c-3 4-9 1-7-4z"
        fill="#FFD4A8"
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M12 70c3 2 7 2 10-1" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

      {/* Right hand on cheek */}
      <path
        d="M106 52c2-12-10-20-18-12-5 5-4 14 2 19l6 8c3 4 9 1 7-4z"
        fill="#FFD4A8"
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M108 70c-3 2-7 2-10-1" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

      {/* Shoulders / shirt */}
      <path
        d="M24 96 Q60 108 96 96 L96 88 Q60 98 24 88 Z"
        fill="#3B68FF"
        stroke="#000"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Neck */}
      <rect x="52" y="78" width="16" height="14" rx="4" fill="#FFD4A8" stroke="#000" strokeWidth="2.5" />

      {/* Head — tilted back laughing */}
      <ellipse
        cx="60"
        cy="48"
        rx="34"
        ry="36"
        fill="#FFD4A8"
        stroke="#000"
        strokeWidth="3.5"
      />

      {/* Hair */}
      <path
        d="M28 44 Q30 18 60 14 Q90 18 92 44 Q88 30 60 26 Q32 30 28 44Z"
        fill="#5D3FD3"
        stroke="#000"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Tight shut laughing eyes */}
      <path d="M38 46 Q46 54 54 46" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
      <path d="M66 46 Q74 54 82 46" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />

      {/* Joy tears */}
      <path
        d="M34 56c0 6-4 10-4 10s-4-4-4-10 3-6 4-6 4 0 4 6z"
        fill="#3B68FF"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M86 56c0 6 4 10 4 10s4-4 4-10-3-6-4-6-4 0-4 6z"
        fill="#3B68FF"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Wide open LOL mouth */}
      <path
        d="M38 62 Q60 88 82 62 Q60 78 38 62Z"
        fill="#000"
        stroke="#000"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M42 64 Q60 76 78 64" fill="#FF6B4A" />
      <ellipse cx="60" cy="70" rx="12" ry="8" fill="#FF8FAB" />

      {/* Laugh lines near mouth */}
      <path d="M30 58 L26 54 M90 58 L94 54" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}