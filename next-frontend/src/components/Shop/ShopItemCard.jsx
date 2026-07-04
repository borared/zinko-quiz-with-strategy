"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Info, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { getSceneryDetails, SCENERY_LEVEL_CLASSES } from '@/lib/sceneryDetails';
import SceneryDetailModal from '@/components/Shop/SceneryDetailModal';

export default function ShopItemCard({
  item,
  isCheckingOut = false,
  onPurchase,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isScenery = item.item_type === 'scenery';
  const sceneryDetails = isScenery ? getSceneryDetails(item.slug) : null;
  const imageSrc = item.image || item.image_url;
  const priceLabel = formatPrice(item.price_cents, item.currency);

  const handlePurchase = () => {
    if (item.owned || isCheckingOut) return;
    onPurchase?.(item);
  };

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        className="relative zk-panel flex flex-col overflow-hidden !shadow-[2px_2px_0_0_#000]"
      >
        {isScenery && sceneryDetails?.level && (
          <span
            className={`absolute left-4 top-4 z-20 text-[10px] font-black uppercase tracking-wider rounded border-[2px] border-zk-black px-2.5 py-1 ${
              sceneryDetails.level === 'Epic'
                ? 'bg-zk-pink text-white'
                : sceneryDetails.level === 'Rare'
                  ? 'bg-zk-blue text-white'
                  : sceneryDetails.level === 'Elite'
                    ? 'bg-white text-zk-black'
                    : (SCENERY_LEVEL_CLASSES[sceneryDetails.level] ?? 'bg-zk-yellow text-zk-black')
            }`}
          >
            {sceneryDetails.level}
          </span>
        )}

        <div
          className={`relative w-full shrink-0 overflow-hidden border-b-[3px] border-zk-black bg-zk-yellow/20 ${
            isScenery ? 'aspect-video' : 'aspect-square'
          }`}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider text-zk-black/40">
              No preview
            </div>
          )}
          {item.owned && (
            <span className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#2ea84a] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border-[2px] border-zk-black">
              <Check size={12} strokeWidth={3} />
              Owned
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-black/50">
              {isScenery ? 'Quiz Scenery' : 'Player Avatar'}
            </p>
            <h3
              className={`text-xl font-black tracking-tight text-zk-black ${
                isScenery
                  ? "font-['Outfit'] normal-case"
                  : 'permanent-marker-regular uppercase'
              }`}
            >
              {item.name}
            </h3>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="inline-flex h-10 shrink-0 items-center rounded-lg border-[2px] border-zk-black bg-zk-yellow px-3">
              <span className="font-black text-lg leading-none text-zk-black">{priceLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              {sceneryDetails && (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-black transition-colors hover:bg-zk-yellow"
                >
                  <Info size={16} strokeWidth={3} />
                  Details
                </button>
              )}

              {!item.owned && (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={isCheckingOut}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-[#5D3FD3] px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-white transition-colors hover:bg-[#4e33b8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCheckingOut ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} strokeWidth={3} />
                  )}
                  {isCheckingOut ? 'Loading...' : 'Buy'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.article>

      <SceneryDetailModal
        item={item}
        open={showDetails}
        isCheckingOut={isCheckingOut}
        onClose={() => setShowDetails(false)}
        onPurchase={onPurchase}
      />
    </>
  );
}