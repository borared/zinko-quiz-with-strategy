"use client";

import { CreditCard, ImageIcon, ShoppingCart, VenetianMask } from 'lucide-react';
import { useDayNight } from '@/hooks/useDayNight';

const CART_DAY_IMAGE = '/images/library-cart-day.jpg';
const CART_NIGHT_IMAGE = '/images/library-cart-night.jpg';

export default function LibraryCartHero({
  itemCount = 0,
  sceneryCount = 0,
  avatarCount = 0,
  onClearCart,
}) {
  const isDay = useDayNight();

  return (
    <div className="relative zk-panel !shadow-none overflow-hidden min-h-[180px] md:min-h-[200px]">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${isDay ? CART_DAY_IMAGE : CART_NIGHT_IMAGE})`,
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
        <div className="flex items-start justify-between gap-4">
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
              Cart
            </h1>
            <p
              className="amatic-sc-regular text-xl md:text-2xl text-white/90 mt-2 max-w-lg leading-snug"
              style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.7)', letterSpacing: '0.5px' }}
            >
              {itemCount > 0
                ? 'Ready to unlock — checkout each item when you are set.'
                : 'Nothing queued yet — browse the shop and add items here.'}
            </p>
          </div>

          {itemCount > 0 && onClearCart && (
            <button
              type="button"
              onClick={onClearCart}
              className="shrink-0 rounded-lg border-[2px] border-white/80 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Clear all
            </button>
          )}
        </div>

        {itemCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
            <ShoppingCart size={12} strokeWidth={3} />
            {itemCount} {itemCount === 1 ? 'item' : 'items'} waiting
          </span>
          {sceneryCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
              <ImageIcon size={12} strokeWidth={3} />
              {sceneryCount} scenery
            </span>
          )}
          {avatarCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
              <VenetianMask size={12} strokeWidth={3} />
              {avatarCount} avatars
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-zk-yellow/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zk-black">
            <CreditCard size={12} strokeWidth={3} />
            One checkout per item
          </span>
        </div>
        )}
      </div>
    </div>
  );
}