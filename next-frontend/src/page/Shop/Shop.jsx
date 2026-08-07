"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ImageIcon, Loader2, VenetianMask } from 'lucide-react';
import Sidebar from '@/components/Dashboard/Sidebar';
import WorkspaceShell from '@/components/layout/WorkspaceShell';
import ShopItemCard from '@/components/Shop/ShopItemCard';
import ShopSkeleton, {
  DEFAULT_AVATAR_SKELETON_COUNT,
  DEFAULT_SCENERY_SKELETON_COUNT,
} from '@/components/Shop/ShopSkeleton';
import TrendingSceneryCarousel, {
  TrendingSceneryCarouselSkeleton,
} from '@/components/Shop/TrendingSceneryCarousel';
import { useAuthStore } from '@/store/useAuthStore';
import { useShopStore } from '@/store/useShopStore';
import { useOwnedSceneryStore } from '@/store/useOwnedSceneryStore';
import { useToastStore } from '@/store/useToastStore';
import { useLibraryCartStore } from '@/store/useLibraryCartStore';
import { markSceneryAsNew } from '@/lib/newSceneryNotice';

const TABS = [
  { id: 'scenery', label: 'Scenery', icon: ImageIcon },
  { id: 'avatar', label: 'Avatars', icon: VenetianMask },
];

export default function Shop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseHandledRef = useRef(false);
  const initializedForUserRef = useRef(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const { showToast } = useToastStore();
  const [clientReady, setClientReady] = useState(false);

  const {
    sceneries,
    avatars,
    isLoading,
    isCheckingOut,
    activeTab,
    setActiveTab,
    isCachedForUser,
    hasPersistedCatalog,
    fetchCatalog,
    startCheckout,
  } = useShopStore();

  const fetchOwnedScenery = useOwnedSceneryStore((s) => s.fetchOwnedScenery);
  const markStoreSceneryAsNew = useOwnedSceneryStore((s) => s.markSceneryAsNew);

  const hydrateCart = useLibraryCartStore((s) => s.hydrateCart);
  const addToCart = useLibraryCartStore((s) => s.addItem);
  const hasCartItem = useLibraryCartStore((s) => s.hasItem);


  const shopCached = Boolean(user?.id && isCachedForUser(user.id));
  const hasPersistedData = hasPersistedCatalog();

  useEffect(() => {
    useShopStore.getState().hydrateFromSession();
    hydrateCart();
    setClientReady(true);
  }, [hydrateCart]);

  // Removed the sign-in redirect so the shop is public

  useEffect(() => {
    if (!user?.id) return;

    const state = useShopStore.getState();
    if (state.isHydrated && state.userId && state.userId !== user.id) {
      useShopStore.getState().invalidate();
      initializedForUserRef.current = null;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!clientReady || !isLoaded) return;

    if (!isSignedIn) {
      if (initializedForUserRef.current === 'public') return;
      initializedForUserRef.current = 'public';
      fetchCatalog({ userId: null }).catch(() => {
        showToast('Could not load the shop. Try again later.', 'error');
      });
      return;
    }

    if (!isJwtReady || !user?.id) return;
    if (initializedForUserRef.current === user.id) return;
    initializedForUserRef.current = user.id;

    if (isCachedForUser(user.id)) {
      fetchCatalog({ silent: true, userId: user.id }).catch(() => {
        showToast('Could not refresh the shop. Showing cached items.', 'error');
      });
      return;
    }

    fetchCatalog({ userId: user.id }).catch(() => {
      showToast('Could not load the shop. Try again later.', 'error');
    });
  }, [
    clientReady,
    isLoaded,
    isJwtReady,
    isSignedIn,
    user?.id,
    isCachedForUser,
    fetchCatalog,
    showToast,
  ]);

  useEffect(() => {
    if (!isJwtReady || !isSignedIn || purchaseHandledRef.current) return;

    const purchaseState = searchParams.get('purchase');
    if (!purchaseState) return;

    purchaseHandledRef.current = true;

    if (purchaseState === 'success') {
      const itemSlug = searchParams.get('item');
      const itemType = searchParams.get('type');

      if (itemType === 'scenery' && itemSlug) {
        markSceneryAsNew(itemSlug);
        markStoreSceneryAsNew(itemSlug);
        fetchOwnedScenery();
      }

      if (user?.id) {
        fetchCatalog({ silent: true, userId: user.id });
      }
      showToast('Payment successful! Your item is now unlocked.', 'success');
    } else if (purchaseState === 'canceled') {
      showToast('Checkout canceled.', 'info');
    }

    router.replace('/shop');
  }, [
    isJwtReady,
    isSignedIn,
    user?.id,
    searchParams,
    fetchCatalog,
    fetchOwnedScenery,
    markStoreSceneryAsNew,
    showToast,
    router,
  ]);

  const handleAddToCart = (item) => {
    if (!isSignedIn) {
      showToast('Please sign in to add items to your library!', 'info');
      router.push('/signin');
      return;
    }
    const added = addToCart(item);
    if (added) {
      const cartCount = useLibraryCartStore.getState().items.length;
      showToast(
        `${item.name} added to cart${cartCount > 1 ? ` · ${cartCount} items in Library` : ''}.`,
        'success'
      );
      return;
    }
    showToast('This item is already in your cart.', 'info');
  };

  const handlePurchase = async (item) => {
    if (!isSignedIn) {
      showToast('Please sign in to unlock this item!', 'info');
      router.push('/signin');
      return;
    }
    try {
      const result = await startCheckout(item.item_type, item.slug);
      if (result?.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      showToast('Could not start checkout. Try again.', 'error');
    } catch (error) {
      showToast(error?.message || 'Could not start checkout.', 'error');
    }
  };

  const activeItems = activeTab === 'scenery' ? sceneries : avatars;
  const skeletonCount =
    activeTab === 'scenery'
      ? (sceneries.length || DEFAULT_SCENERY_SKELETON_COUNT)
      : (avatars.length || DEFAULT_AVATAR_SKELETON_COUNT);
  const isAuthReady = isSignedIn ? isJwtReady : true;

  const showSkeleton =
    !clientReady
    || (((!isLoaded || !isAuthReady) && !hasPersistedData)
    || (isLoading && !shopCached && sceneries.length === 0 && avatars.length === 0));

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-zk-text" size={32} />
      </div>
    );
  }

  return (
    <WorkspaceShell sidebar={<Sidebar />} contentClassName="shop-shell">
      <section className="flex flex-col gap-6 md:gap-8">
        {showSkeleton ? (
          <TrendingSceneryCarouselSkeleton />
        ) : (
          <TrendingSceneryCarousel
            sceneries={sceneries}
            isCheckingOut={isCheckingOut}
            onPurchase={handlePurchase}
          />
        )}

        <div className="flex flex-wrap gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 border-[3px] border-zk-border rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-colors !shadow-none ${
                  isActive
                    ? 'bg-[#5D3FD3] text-white'
                    : 'bg-zk-panel-bg text-zk-text hover:bg-zk-bg/30'
                }`}
              >
                <Icon size={20} strokeWidth={3} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {showSkeleton ? (
          <ShopSkeleton count={skeletonCount} isScenery={activeTab === 'scenery'} />
        ) : activeTab === 'avatar' ? (
          <p className="font-['Outfit'] font-bold text-zk-text/70 text-center text-xl my-10">
            (Not yet product)
          </p>
        ) : activeItems.length === 0 ? (
          <div className="zk-panel !shadow-none p-10 text-center">
            <p className="text-lg font-bold text-zk-text/70">
              No scenery for sale right now. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {activeItems.map((item) => (
              <ShopItemCard
                key={`${item.item_type}-${item.slug}`}
                item={item}
                isCheckingOut={isCheckingOut}
                onPurchase={handlePurchase}
                onAddToCart={handleAddToCart}
                inCart={hasCartItem(item.item_type, item.slug)}
              />
            ))}
          </div>
        )}
      </section>
    </WorkspaceShell>
  );
}