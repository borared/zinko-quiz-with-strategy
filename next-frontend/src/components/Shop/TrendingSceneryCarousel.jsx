"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { ShopItemCardSkeleton } from '@/components/Shop/ShopItemCardSkeleton';

const TRENDING_ORDER = ['inside', 'halloween'];
const SLIDE_ACTIVE_MS = 5000;
const SCROLL_DURATION_S = 2.5;
const SCROLL_DURATION_MS = SCROLL_DURATION_S * 1000;

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    zIndex: 2,
  }),
  center: {
    x: 0,
    zIndex: 2,
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    zIndex: 1,
  }),
};

function sortTrendingScenery(items = []) {
  const orderMap = new Map(TRENDING_ORDER.map((slug, index) => [slug, index]));
  return [...items].sort((a, b) => {
    const aRank = orderMap.get(a.slug) ?? 99;
    const bRank = orderMap.get(b.slug) ?? 99;
    return aRank - bRank;
  });
}

export function TrendingSceneryCarouselSkeleton() {
  return <ShopItemCardSkeleton variant="hero" />;
}

export default function TrendingSceneryCarousel({
  sceneries = [],
  isCheckingOut = false,
  onPurchase,
}) {
  const items = useMemo(() => sortTrendingScenery(sceneries), [sceneries]);
  const itemCount = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const itemCountRef = useRef(itemCount);
  const autoplayTimerRef = useRef(null);
  const scheduleAutoplayRef = useRef(() => {});

  itemCountRef.current = itemCount;

  const clearAutoplayTimer = () => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  scheduleAutoplayRef.current = () => {
    clearAutoplayTimer();

    const count = itemCountRef.current;
    if (count <= 1) return;

    autoplayTimerRef.current = setTimeout(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % count);
      autoplayTimerRef.current = setTimeout(() => {
        scheduleAutoplayRef.current();
      }, SCROLL_DURATION_MS);
    }, SLIDE_ACTIVE_MS);
  };

  const restartAutoplayAfterScroll = () => {
    clearAutoplayTimer();
    autoplayTimerRef.current = setTimeout(() => {
      scheduleAutoplayRef.current();
    }, SCROLL_DURATION_MS);
  };

  const goTo = useCallback(
    (index) => {
      if (!itemCount) return;
      const nextIndex = (index + itemCount) % itemCount;
      if (nextIndex === activeIndex) return;

      let nextDirection = 1;
      if (activeIndex === itemCount - 1 && nextIndex === 0) {
        nextDirection = 1;
      } else if (activeIndex === 0 && nextIndex === itemCount - 1) {
        nextDirection = -1;
      } else {
        nextDirection = nextIndex > activeIndex ? 1 : -1;
      }

      setDirection(nextDirection);
      setActiveIndex(nextIndex);
      restartAutoplayAfterScroll();
    },
    [activeIndex, itemCount]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    scheduleAutoplayRef.current();

    return clearAutoplayTimer;
  }, [itemCount]);

  useEffect(() => {
    if (activeIndex >= itemCount && itemCount > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, itemCount]);

  useEffect(() => {
    sceneries.forEach((scenery) => {
      const src = scenery.image || scenery.image_url;
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [sceneries]);

  if (!itemCount) return null;

  const item = items[activeIndex];
  const imageSrc = item.image || item.image_url;
  const priceLabel = formatPrice(item.price_cents, item.currency);
  const isNew = item.slug === 'inside';

  const handlePurchase = () => {
    if (item.owned || isCheckingOut) return;
    onPurchase?.(item);
  };

  return (
    <section className="relative zk-panel !shadow-none overflow-hidden min-h-[240px] md:min-h-[300px] lg:min-h-[440px] xl:min-h-[520px]">
      <div className="absolute inset-0 overflow-hidden bg-zk-black">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={item.slug}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: SCROLL_DURATION_S, ease: [0.45, 0, 0.2, 1] }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={imageSrc}
              alt={item.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-zk-black/85 via-zk-black/55 to-zk-black/20"
              aria-hidden="true"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex h-full min-h-[240px] md:min-h-[300px] lg:min-h-[440px] xl:min-h-[520px] flex-col justify-between p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-zk-black bg-zk-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-zk-black">
              <Sparkles size={12} strokeWidth={3} />
              Trending scenery
            </span>
            {isNew && (
              <span className="rounded-full border-[2px] border-zk-black bg-[#FF6B4A] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                New
              </span>
            )}
          </div>

          {items.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous scenery"
                className="flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-white/80 bg-zk-black/35 text-white backdrop-blur-sm !shadow-none transition-colors hover:bg-zk-black/55"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next scenery"
                className="flex h-9 w-9 items-center justify-center rounded-full border-[2px] border-white/80 bg-zk-black/35 text-white backdrop-blur-sm !shadow-none transition-colors hover:bg-zk-black/55"
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col justify-end">
          <div className="max-w-xl pr-36 sm:pr-44 md:max-w-md md:pr-52 lg:pr-56">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-yellow">
              Quiz Background
            </p>
            <h2 className="mt-1 font-['Outfit'] text-3xl font-black tracking-tight text-white md:text-4xl">
              {item.name}
            </h2>
            <p className="mt-2 text-sm font-bold text-white/80">
              Make your host lobby stand out with this trending scenery pack.
            </p>
          </div>

          <div className="absolute bottom-0 right-0 flex items-center gap-2">
            <div className="inline-flex h-10 items-center rounded-lg border-[2px] border-zk-black bg-zk-yellow px-3">
              <span className="font-['Outfit'] text-lg font-black leading-none text-zk-black">{priceLabel}</span>
            </div>

            {item.owned ? (
              <span className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-[#2ea84a] px-4 text-sm font-black uppercase tracking-wider text-white">
                <Check size={16} strokeWidth={3} />
                Owned
              </span>
            ) : (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={isCheckingOut}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-[#5D3FD3] px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-white !shadow-none transition-colors hover:bg-[#4e33b8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} strokeWidth={3} />
                )}
                {isCheckingOut ? 'Loading...' : 'Buy now'}
              </button>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {items.map((scenery, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.button
                  key={scenery.slug}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show ${scenery.name} scenery`}
                  aria-current={isActive ? 'true' : undefined}
                  animate={{
                    width: isActive ? 32 : 10,
                    backgroundColor: isActive
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(255, 255, 255, 0.45)',
                  }}
                  whileHover={
                    isActive
                      ? undefined
                      : { backgroundColor: 'rgba(255, 255, 255, 0.75)' }
                  }
                  transition={{ duration: 0.45, ease: [0.45, 0, 0.2, 1] }}
                  className="h-2.5 shrink-0 rounded-full border-[2px] border-white"
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}