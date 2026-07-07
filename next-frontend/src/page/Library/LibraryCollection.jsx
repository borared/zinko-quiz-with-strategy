"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ImageIcon, Layers, Loader2, VenetianMask } from 'lucide-react';
import LibraryShell from '@/components/Library/LibraryShell';
import LibraryCollectionHero from '@/components/Library/LibraryCollectionHero';
import LibrarySearchBar from '@/components/Library/LibrarySearchBar';
import LibraryCollectionSection from '@/components/Library/LibraryCollectionSection';
import LibraryCollectionSkeleton, {
  DEFAULT_ALL_SKELETON_COUNT,
  DEFAULT_AVATAR_SKELETON_COUNT,
  DEFAULT_SCENERY_SKELETON_COUNT,
} from '@/components/Library/CollectionItemCardSkeleton';
import SceneryDetailModal from '@/components/Shop/SceneryDetailModal';
import { getSceneryDetails } from '@/lib/sceneryDetails';
import { useAuthStore } from '@/store/useAuthStore';
import { useLibraryCollectionStore } from '@/store/useLibraryCollectionStore';
import { useToastStore } from '@/store/useToastStore';

const TABS = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'scenery', label: 'Scenery', icon: ImageIcon },
  { id: 'avatar', label: 'Avatars', icon: VenetianMask },
];

function matchesSearch(item, query) {
  if (!query) return true;
  const haystack = `${item.name || ''} ${item.slug || ''}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function LibraryCollection() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const initializedForUserRef = useRef(false);

  const [clientReady, setClientReady] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  const sceneryItems = useLibraryCollectionStore((s) => s.sceneryItems);
  const avatarItems = useLibraryCollectionStore((s) => s.avatarItems);
  const isLoading = useLibraryCollectionStore((s) => s.isLoading);
  const isCachedForUser = useLibraryCollectionStore((s) => s.isCachedForUser);
  const hasPersistedCollection = useLibraryCollectionStore((s) => s.hasPersistedCollection);
  const hydrateFromSession = useLibraryCollectionStore((s) => s.hydrateFromSession);
  const fetchCollection = useLibraryCollectionStore((s) => s.fetchCollection);
  const invalidate = useLibraryCollectionStore((s) => s.invalidate);

  const { showToast } = useToastStore();

  const libraryCached = Boolean(user?.id && isCachedForUser(user.id));
  const hasPersistedData = hasPersistedCollection();
  const trimmedSearch = searchQuery.trim();

  useEffect(() => {
    hydrateFromSession();
    setClientReady(true);
  }, [hydrateFromSession]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/signin');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!user?.id) return;

    const state = useLibraryCollectionStore.getState();
    if (state.isHydrated && state.userId && state.userId !== user.id) {
      invalidate();
      initializedForUserRef.current = null;
    }
  }, [user?.id, invalidate]);

  useEffect(() => {
    if (!clientReady || !isLoaded || !isJwtReady || !isSignedIn || !user?.id) return;
    if (initializedForUserRef.current === user.id) return;
    initializedForUserRef.current = user.id;

    if (isCachedForUser(user.id)) {
      fetchCollection({ silent: true, userId: user.id })
        .then((result) => {
          if (result?.avatarsFailed) {
            showToast(
              'Could not refresh avatars. Showing cached collection.',
              'error'
            );
          }
        })
        .catch(() => {
          showToast('Could not refresh your collection. Showing cached items.', 'error');
        });
      return;
    }

    fetchCollection({ userId: user.id })
      .then((result) => {
        if (result?.avatarsFailed) {
          showToast(
            'Could not load avatars for your collection. Scenery is still available.',
            'error'
          );
        }
      })
      .catch(() => {
        showToast('Could not load your collection. Try again later.', 'error');
      });
  }, [
    clientReady,
    isLoaded,
    isJwtReady,
    isSignedIn,
    user?.id,
    isCachedForUser,
    fetchCollection,
    showToast,
  ]);

  const filteredScenery = useMemo(
    () => sceneryItems.filter((item) => matchesSearch(item, trimmedSearch)),
    [sceneryItems, trimmedSearch]
  );

  const filteredAvatars = useMemo(
    () => avatarItems.filter((item) => matchesSearch(item, trimmedSearch)),
    [avatarItems, trimmedSearch]
  );

  const collectionItems = useMemo(() => {
    if (activeTab === 'scenery') return filteredScenery;
    if (activeTab === 'avatar') return filteredAvatars;
    return [...filteredScenery, ...filteredAvatars];
  }, [activeTab, filteredScenery, filteredAvatars]);

  const skeletonCount = useMemo(() => {
    if (activeTab === 'scenery') {
      return sceneryItems.length || DEFAULT_SCENERY_SKELETON_COUNT;
    }
    if (activeTab === 'avatar') {
      return avatarItems.length || DEFAULT_AVATAR_SKELETON_COUNT;
    }
    const total = sceneryItems.length + avatarItems.length;
    return total || DEFAULT_ALL_SKELETON_COUNT;
  }, [activeTab, sceneryItems.length, avatarItems.length]);

  const showSkeleton =
    !clientReady
    || (isLoading && collectionItems.length === 0 && !(libraryCached || hasPersistedData));

  const handleOpenDetails = (item) => {
    if (!getSceneryDetails(item.slug)) return;
    setDetailItem({ ...item, owned: true });
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
        <LibraryCollectionHero
          totalCount={sceneryItems.length + avatarItems.length}
          sceneryCount={sceneryItems.length}
          avatarCount={avatarItems.length}
        />

        <LibrarySearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={collectionItems.length}
          totalCount={sceneryItems.length + avatarItems.length}
        />

        <div className="flex flex-wrap gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 border-[3px] border-zk-black rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-colors ${
                  isActive
                    ? 'bg-[#5D3FD3] text-white'
                    : 'bg-white text-zk-black hover:bg-zk-yellow/30'
                }`}
              >
                <Icon size={20} strokeWidth={3} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {showSkeleton ? (
          <LibraryCollectionSkeleton count={skeletonCount} activeTab={activeTab} />
        ) : collectionItems.length === 0 ? (
          <div className="zk-panel !shadow-none p-10 text-center flex flex-col items-center gap-4">
            <p className="text-lg font-bold text-zk-black/70">
              {trimmedSearch
                ? `No items match "${trimmedSearch}".`
                : activeTab === 'scenery'
                  ? 'No scenery in your collection yet.'
                  : activeTab === 'avatar'
                    ? 'No avatars in your collection yet.'
                    : 'Your collection is empty.'}
            </p>
            {trimmedSearch ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 rounded-xl border-[3px] border-zk-black bg-white text-zk-black font-['Amatic_SC'] text-2xl font-bold transition-colors hover:bg-zk-yellow/30"
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="px-6 py-2.5 rounded-xl border-[3px] border-zk-black bg-[#5D3FD3] text-white font-['Amatic_SC'] text-2xl font-bold transition-colors hover:bg-[#4e33b8]"
              >
                Browse shop
              </button>
            )}
          </div>
        ) : activeTab === 'all' ? (
          <div className="flex flex-col gap-8 md:gap-10">
            <LibraryCollectionSection
              title="Quiz Scenery"
              count={filteredScenery.length}
              items={filteredScenery}
              onDetails={handleOpenDetails}
            />
            <LibraryCollectionSection
              title="Player Avatars"
              count={filteredAvatars.length}
              items={filteredAvatars}
              onDetails={handleOpenDetails}
            />
          </div>
        ) : (
          <LibraryCollectionSection
            title={activeTab === 'scenery' ? 'Quiz Scenery' : 'Player Avatars'}
            count={collectionItems.length}
            items={collectionItems}
            onDetails={handleOpenDetails}
          />
        )}
      </section>

      <SceneryDetailModal
        item={detailItem}
        open={Boolean(detailItem)}
        variant="collection"
        onClose={() => setDetailItem(null)}
      />
    </LibraryShell>
  );
}