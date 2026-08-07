"use client";

export const DEFAULT_ALL_SKELETON_COUNT = 6;
export const DEFAULT_SCENERY_SKELETON_COUNT = 3;
export const DEFAULT_AVATAR_SKELETON_COUNT = 4;

function SkeletonBlock({ className = '' }) {
  return <div className={`zk-skeleton border-[2px] border-zk-border/10 ${className}`} />;
}

export function CollectionItemCardSkeleton({ isScenery = true }) {
  return (
    <article className="relative zk-panel flex h-fit w-full flex-col self-start overflow-hidden !shadow-none">
      {isScenery && (
        <SkeletonBlock className="absolute left-4 top-4 z-20 h-6 w-14 rounded" />
      )}

      <div className="relative w-full shrink-0 overflow-hidden border-b-[3px] border-zk-border bg-zk-bg/20 aspect-video">
        <SkeletonBlock className="h-full w-full rounded-none border-0" />
        <SkeletonBlock className="absolute top-4 right-4 z-10 h-6 w-16 rounded" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-24 rounded" />
          <SkeletonBlock className="h-6 w-3/5 rounded" />
        </div>
        <SkeletonBlock className="h-10 w-full rounded-lg" />
      </div>
    </article>
  );
}

function SkeletonGrid({ count, activeTab }) {
  const safeCount = Math.max(1, count);
  const skeletonItems = Array.from({ length: safeCount }, (_, index) => {
    if (activeTab === 'scenery') return { key: index, isScenery: true };
    if (activeTab === 'avatar') return { key: index, isScenery: false };
    return { key: index, isScenery: index % 2 === 0 };
  });

  return (
    <div className="grid grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
      {skeletonItems.map((item) => (
        <CollectionItemCardSkeleton key={item.key} isScenery={item.isScenery} />
      ))}
    </div>
  );
}

export default function LibraryCollectionSkeleton({
  count = DEFAULT_ALL_SKELETON_COUNT,
  activeTab = 'all',
}) {
  if (activeTab === 'all') {
    const sceneryCount = Math.min(3, Math.max(1, Math.ceil(count / 2)));
    const avatarCount = Math.min(3, Math.max(1, count - sceneryCount));

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-7 w-40 rounded" />
          <SkeletonGrid count={sceneryCount} activeTab="scenery" />
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-7 w-32 rounded" />
          <SkeletonGrid count={avatarCount} activeTab="avatar" />
        </div>
      </div>
    );
  }

  return <SkeletonGrid count={count} activeTab={activeTab} />;
}