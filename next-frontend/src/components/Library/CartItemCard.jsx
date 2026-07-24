"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Info, Loader2, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { getSceneryDetails, SCENERY_LEVEL_CLASSES } from '@/lib/sceneryDetails';
import SceneryDetailModal from '@/components/Shop/SceneryDetailModal';

export default function CartItemCard({
  item,
  isCheckingOut = false,
  onRemove,
  onCheckout,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isScenery = item.item_type === 'scenery';
  const sceneryDetails = isScenery ? getSceneryDetails(item.slug) : null;
  const imageSrc = item.image || item.image_url;
  const priceLabel = formatPrice(item.price_cents, item.currency);
  const hasSceneryDetails = Boolean(sceneryDetails);

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        className="relative zk-panel flex h-fit w-full flex-col self-start overflow-hidden !shadow-none"
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

        <div className="relative w-full shrink-0 overflow-hidden border-b-[3px] border-zk-black bg-zk-yellow/20 aspect-video">
          {imageSrc ? (
            <img src={imageSrc} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider text-zk-black/40">
              No preview
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove?.(item)}
            className="absolute top-4 right-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border-[2px] border-zk-black bg-white text-zk-black !shadow-none transition-colors hover:bg-red-50"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 size={14} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4">
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
            <p className="font-['Outfit'] text-lg font-black text-zk-black mt-1">
              {priceLabel}
            </p>
          </div>

          {isScenery && hasSceneryDetails ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-black !shadow-none transition-colors hover:bg-zk-yellow"
              >
                <Info size={16} strokeWidth={3} />
                View details
              </button>
              <button
                type="button"
                onClick={() => onCheckout?.(item)}
                disabled={isCheckingOut}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-[#5D3FD3] px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-white !shadow-none transition-colors hover:bg-[#4e33b8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} strokeWidth={3} />
                )}
                {isCheckingOut ? 'Loading...' : 'Checkout'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onCheckout?.(item)}
              disabled={isCheckingOut}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-[#5D3FD3] px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-white !shadow-none transition-colors hover:bg-[#4e33b8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CreditCard size={16} strokeWidth={3} />
              )}
              {isCheckingOut ? 'Loading...' : 'Checkout'}
            </button>
          )}
        </div>
      </motion.article>

      {hasSceneryDetails && (
        <SceneryDetailModal
          item={{ ...item, owned: false }}
          open={showDetails}
          isCheckingOut={isCheckingOut}
          onClose={() => setShowDetails(false)}
          onPurchase={onCheckout}
          inCart
        />
      )}
    </>
  );
}