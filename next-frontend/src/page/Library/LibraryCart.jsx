"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import LibraryShell from '@/components/Library/LibraryShell';
import LibraryCartHero from '@/components/Library/LibraryCartHero';
import CartItemCard from '@/components/Library/CartItemCard';
import CartEmptyState from '@/components/Library/CartEmptyState';
import { useAuthStore } from '@/store/useAuthStore';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';
import { useShopStore } from '@/store/useShopStore';
import { useToastStore } from '@/store/useToastStore';

export default function LibraryCart() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const { showToast } = useToastStore();

  const items = useLibraryCartStore((s) => s.items);
  const hydrateCart = useLibraryCartStore((s) => s.hydrateCart);
  const markCartSeen = useLibraryCartStore((s) => s.markCartSeen);
  const removeItem = useLibraryCartStore((s) => s.removeItem);
  const clearCart = useLibraryCartStore((s) => s.clearCart);

  const isCheckingOut = useShopStore((s) => s.isCheckingOut);
  const startCheckout = useShopStore((s) => s.startCheckout);

  const sceneryCount = useMemo(
    () => items.filter((item) => item.item_type === 'scenery').length,
    [items]
  );
  const avatarCount = useMemo(
    () => items.filter((item) => item.item_type === 'avatar').length,
    [items]
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/signin');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  useEffect(() => {
    markCartSeen();
  }, [markCartSeen]);

  const handleCheckout = async (item) => {
    if (!isJwtReady) {
      showToast('Please wait while we finish signing you in.', 'info');
      return;
    }

    try {
      const result = await startCheckout(item.item_type, item.slug);
      if (result?.checkoutUrl) {
        removeItem(item.item_type, item.slug);
        window.location.href = result.checkoutUrl;
        return;
      }
      showToast('Could not start checkout. Try again.', 'error');
    } catch (error) {
      showToast(error?.message || 'Could not start checkout.', 'error');
    }
  };

  const handleRemove = (item) => {
    removeItem(item.item_type, item.slug);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-zk-black" size={32} />
      </div>
    );
  }

  return (
    <LibraryShell>
      <section className="flex flex-col gap-6 md:gap-8">
        <LibraryCartHero
          itemCount={items.length}
          sceneryCount={sceneryCount}
          avatarCount={avatarCount}
          onClearCart={items.length > 0 ? clearCart : undefined}
        />

        {items.length === 0 ? (
          <CartEmptyState onGoToShop={() => router.push('/shop')} />
        ) : (
          <div className="grid grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${item.item_type}-${item.slug}`}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.97, filter: 'blur(2px)' }}
                  transition={{ duration: 0.28, ease: [0.45, 0, 0.2, 1] }}
                  className="w-full self-start"
                >
                  <CartItemCard
                    item={item}
                    isCheckingOut={isCheckingOut}
                    onRemove={handleRemove}
                    onCheckout={handleCheckout}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </LibraryShell>
  );
}