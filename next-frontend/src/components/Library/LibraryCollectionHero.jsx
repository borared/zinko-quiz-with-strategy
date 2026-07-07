"use client";

import { ImageIcon, Layers, VenetianMask } from 'lucide-react';
import { useDayNight } from '@/hooks/useDayNight';

const LIBRARY_DAY_IMAGE = '/images/library-day.jpg';
const LIBRARY_NIGHT_IMAGE = '/images/library-night.jpg';

export default function LibraryCollectionHero({
  totalCount = 0,
  sceneryCount = 0,
  avatarCount = 0,
}) {
  const isDay = useDayNight();

  return (
    <div className="relative zk-panel !shadow-none overflow-hidden min-h-[180px] md:min-h-[200px]">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${isDay ? LIBRARY_DAY_IMAGE : LIBRARY_NIGHT_IMAGE})`,
        }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDay
            ? 'bg-gradient-to-r from-[#0b1a3a]/82 via-[#0f2347]/52 to-[#0b1a3a]/18'
            : 'bg-gradient-to-r from-[#050d1f]/88 via-[#0a1633]/62 to-[#0b1a3a]/32'
        }`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full min-h-[180px] md:min-h-[200px] flex-col justify-between gap-4 p-6 md:p-8">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-yellow mb-1"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}
          >
            Your Library
          </p>
          <h1
            className="font-['Outfit'] text-4xl md:text-5xl font-black text-white tracking-tight uppercase"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.85)' }}
          >
            Collection
          </h1>
          <p
            className="amatic-sc-regular text-xl md:text-2xl text-white/90 mt-2 max-w-lg leading-snug"
            style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.7)', letterSpacing: '0.5px' }}
          >
            Everything you own — scenery, avatars, and more — ready for your next game.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
            <Layers size={12} strokeWidth={3} />
            {totalCount} {totalCount === 1 ? 'item' : 'items'} owned
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
            <ImageIcon size={12} strokeWidth={3} />
            {sceneryCount} scenery
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
            <VenetianMask size={12} strokeWidth={3} />
            {avatarCount} avatars
          </span>
        </div>
      </div>
    </div>
  );
}