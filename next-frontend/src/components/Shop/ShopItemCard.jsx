"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Info, Loader2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { getSceneryDetails, SCENERY_LEVEL_CLASSES } from '@/lib/sceneryDetails';
import SceneryDetailModal from '@/components/Shop/SceneryDetailModal';

export default function ShopItemCard({
  item,
  isCheckingOut = false,
  onPurchase,
  onAddToCart,
  inCart = false,
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

  const handleAddToCart = () => {
    if (item.owned || inCart) return;
    onAddToCart?.(item);
  };

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        className="relative zk-panel !shadow-none flex flex-col overflow-hidden"
      >
        {isScenery && sceneryDetails?.level && (
          <span
            className={`absolute left-4 top-4 z-20 text-[10px] font-black uppercase tracking-wider rounded border-[2px] border-zk-border px-2.5 py-1 ${
              sceneryDetails.level === 'Epic'
                ? 'bg-zk-pink text-white'
                : sceneryDetails.level === 'Rare'
                  ? 'bg-zk-blue text-white'
                  : sceneryDetails.level === 'Elite'
                    ? 'bg-zk-panel-bg text-zk-text'
                    : (SCENERY_LEVEL_CLASSES[sceneryDetails.level] ?? 'bg-zk-bg text-zk-text')
            }`}
          >
            {sceneryDetails.level}
          </span>
        )}

        <div
          className={`relative w-full shrink-0 overflow-hidden border-b-[3px] border-zk-border bg-zk-bg/20 ${
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
            <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider text-zk-text/40">
              No preview
            </div>
          )}
          {item.owned ? (
            <span className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#2ea84a] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border-[2px] border-zk-border">
              <Check size={12} strokeWidth={3} />
              Owned
            </span>
          ) : onAddToCart ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={inCart}
              className="absolute top-4 right-4 z-20 inline-flex items-center gap-1 bg-zk-panel-bg text-zk-text text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded border-[2px] border-zk-border !shadow-none transition-colors hover:bg-zk-bg disabled:opacity-60"
            >
              <ShoppingCart size={14} strokeWidth={3} />
              {inCart ? 'In cart' : 'Add'}
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-text/50">
              {isScenery ? 'Quiz Scenery' : 'Player Avatar'}
            </p>
            <h3
              className={`text-xl font-black tracking-tight text-zk-text ${
                isScenery
                  ? "font-['Outfit'] normal-case"
                  : 'permanent-marker-regular uppercase'
              }`}
            >
              {item.name}
            </h3>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="inline-flex h-10 shrink-0 items-center rounded-lg border-[2px] border-zk-border bg-zk-bg px-3">
              <span className="font-['Outfit'] text-lg font-black leading-none text-zk-text">{priceLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              {sceneryDetails && (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-border bg-zk-panel-bg px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-text !shadow-none transition-colors hover:bg-zk-bg"
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
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-border bg-[#5D3FD3] px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-white !shadow-none transition-colors hover:bg-[#4e33b8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
        onAddToCart={onAddToCart}
        inCart={inCart}
      />
    </>
  );
}