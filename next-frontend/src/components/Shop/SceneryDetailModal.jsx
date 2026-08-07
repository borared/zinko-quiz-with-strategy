"use client";

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CreditCard, Headphones, Loader2, ShoppingCart, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { getSceneryDetails } from '@/lib/sceneryDetails';
import {
  isSceneryPreviewPlaying,
  stopSceneryPreview,
  toggleSceneryPreview,
} from '@/lib/sceneryAudio';

const NAVBAR_HEIGHT_PX = 76;

export default function SceneryDetailModal({
  item,
  open,
  onClose,
  isCheckingOut = false,
  onPurchase,
  onAddToCart,
  inCart = false,
  variant = 'shop',
}) {
  const isCollectionView = variant === 'collection';
  const details = item ? getSceneryDetails(item.slug) : null;
  const imageSrc = item?.image || item?.image_url;
  const priceLabel = formatPrice(item?.price_cents, item?.currency);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refreshPreviewState = useCallback(() => {
    if (!item?.slug) {
      setIsPreviewPlaying(false);
      return;
    }
    setIsPreviewPlaying(isSceneryPreviewPlaying(item.slug));
  }, [item?.slug]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      stopSceneryPreview();
      setIsPreviewPlaying(false);
      return undefined;
    }

    refreshPreviewState();
    const onAudioChange = () => refreshPreviewState();
    window.addEventListener('sceneryAudioChanged', onAudioChange);
    return () => {
      window.removeEventListener('sceneryAudioChanged', onAudioChange);
      stopSceneryPreview();
    };
  }, [open, refreshPreviewState]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const handleTogglePreview = () => {
    if (!item?.slug) return;
    const playing = toggleSceneryPreview(item.slug);
    setIsPreviewPlaying(playing);
  };

  const handlePurchase = () => {
    if (item?.owned || isCheckingOut) return;
    onPurchase?.(item);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && item && details && (
        <motion.div
          key="scenery-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[45] flex items-center justify-center bg-black/50 p-4 sm:p-6"
          style={{ top: NAVBAR_HEIGHT_PX }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            key="scenery-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scenery-detail-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.45, 0, 0.2, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border-[4px] border-zk-border bg-zk-panel-bg !shadow-none"
            style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT_PX}px - 2rem)` }}
          >
            <div className="relative h-40 shrink-0 overflow-hidden border-b-[3px] border-zk-border bg-zk-black sm:h-44">
              {imageSrc ? (
                <img src={imageSrc} alt={item.name} className="h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-zk-black/70 via-transparent to-zk-black/20" />
            </div>

            <div className="flex flex-col gap-3 overflow-hidden p-5 sm:gap-4 sm:p-6">
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg border-[2px] border-zk-border bg-zk-bg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-zk-text">
                  <Sparkles size={12} strokeWidth={3} />
                  Quiz Scenery
                </span>
                <h3
                  id="scenery-detail-title"
                  className="mt-2 font-['Outfit'] text-2xl font-black tracking-tight text-zk-text sm:text-3xl"
                >
                  {item.name}
                </h3>

                {!isCollectionView && (
                <div className="mt-2 flex items-center gap-3 sm:mt-3">
                  <div className="inline-flex h-10 items-center rounded-lg border-[2px] border-zk-border bg-zk-bg px-3">
                    <span className="font-['Outfit'] text-lg font-black leading-none text-zk-text">{priceLabel}</span>
                  </div>

                  {item.owned ? (
                    <span className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-border bg-[#2ea84a] px-4 text-sm font-black uppercase tracking-wider text-white">
                      <Check size={16} strokeWidth={3} />
                      Owned
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {onAddToCart && (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item)}
                          disabled={inCart}
                          className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-border bg-zk-panel-bg px-3 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-text !shadow-none transition-colors hover:bg-zk-bg disabled:opacity-60"
                        >
                          <ShoppingCart size={16} strokeWidth={3} />
                          {inCart ? 'In cart' : 'Add'}
                        </button>
                      )}
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
                        {isCheckingOut ? 'Loading...' : 'Buy now'}
                      </button>
                    </div>
                  )}
                </div>
                )}

                <p className="mt-2 text-sm font-bold text-zk-text/60">{details.tagline}</p>
                <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-zk-text/80">
                  {details.description}
                </p>
              </div>

              <div className="rounded-xl border-[3px] border-zk-border bg-zk-panel-bg p-3 sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-text/50">
                  What you get
                </p>
                <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
                  {details.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-xs font-bold leading-snug text-zk-text"
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full border-[2px] border-zk-border bg-zk-bg" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              {details.hasAudio && (
                <div className="rounded-xl border-[3px] border-zk-border bg-[#5D3FD3]/10 p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[2px] border-zk-border bg-zk-bg">
                        <Headphones size={18} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-text/50">
                          Included ambience
                        </p>
                        <p className="font-['Outfit'] text-base font-black text-zk-text sm:text-lg">
                          {details.audioLabel}
                        </p>
                        <p className="text-xs font-bold text-zk-text/60">
                          {isCollectionView
                            ? 'Preview the ambience — same sound in your host lobby when equipped.'
                            : 'Test the loop before you buy — same sound in your host lobby.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTogglePreview}
                      className="inline-flex items-center gap-2 rounded-lg border-[2px] border-zk-border bg-zk-panel-bg px-4 py-2 font-['Amatic_SC'] text-xl font-bold text-zk-text !shadow-none transition-colors hover:bg-zk-bg"
                    >
                      {isPreviewPlaying ? (
                        <Volume2 size={18} strokeWidth={3} />
                      ) : (
                        <VolumeX size={18} strokeWidth={3} />
                      )}
                      {isPreviewPlaying ? 'Stop sound' : 'Test sound'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}