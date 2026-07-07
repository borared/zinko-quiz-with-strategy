"use client";

export const DEFAULT_SCENERY_SKELETON_COUNT = 3;
export const DEFAULT_AVATAR_SKELETON_COUNT = 4;
export const TRENDING_SCENERY_SKELETON_COUNT = 2;

function SkeletonBlock({ className = '' }) {
  return <div className={`zk-skeleton border-[2px] border-zk-black/10 ${className}`} />;
}

export function ShopItemCardSkeleton({ variant = 'grid', isScenery = true }) {
  if (variant === 'hero') {
    return (
      <section className="relative zk-panel !shadow-none overflow-hidden min-h-[240px] md:min-h-[300px] lg:min-h-[440px] xl:min-h-[520px]">
        <SkeletonBlock className="absolute inset-0 rounded-none border-0" />

        <div className="relative z-10 flex h-full min-h-[240px] md:min-h-[300px] lg:min-h-[440px] xl:min-h-[520px] flex-col justify-between p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonBlock className="h-7 w-36 rounded-full" />
              <SkeletonBlock className="h-7 w-14 rounded-full" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <SkeletonBlock className="h-9 w-9 rounded-full" />
              <SkeletonBlock className="h-9 w-9 rounded-full" />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-end">
            <div className="max-w-xl pr-36 sm:pr-44 md:max-w-md md:pr-52 lg:pr-56">
              <SkeletonBlock className="h-3 w-24 rounded" />
              <SkeletonBlock className="mt-2 h-8 w-48 max-w-full rounded md:h-9" />
              <SkeletonBlock className="mt-2 h-4 w-64 max-w-full rounded" />
            </div>

            <div className="absolute bottom-0 right-0 flex items-center gap-2">
              <SkeletonBlock className="h-10 w-20 rounded-lg" />
              <SkeletonBlock className="h-10 w-28 rounded-lg" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: TRENDING_SCENERY_SKELETON_COUNT }, (_, i) => (
              <SkeletonBlock
                key={i}
                className={`h-2.5 rounded-full ${i === 0 ? 'w-8' : 'w-2.5'}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <article className="relative zk-panel !shadow-none flex flex-col overflow-hidden">
      <SkeletonBlock className="absolute left-4 top-4 z-20 h-6 w-14 rounded" />

      <div
        className={`relative w-full shrink-0 overflow-hidden border-b-[3px] border-zk-black bg-zk-yellow/20 ${
          isScenery ? 'aspect-video' : 'aspect-square'
        }`}
      >
        <SkeletonBlock className="h-full w-full rounded-none border-0" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-24 rounded" />
          <SkeletonBlock className="h-6 w-3/5 rounded" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <SkeletonBlock className="h-10 w-20 shrink-0 rounded-lg" />
          <div className="flex items-center gap-2">
            {isScenery && <SkeletonBlock className="h-10 w-24 rounded-lg" />}
            <SkeletonBlock className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ShopSkeleton({ count = DEFAULT_SCENERY_SKELETON_COUNT, isScenery = true }) {
  const safeCount = Math.max(1, count);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
      {Array.from({ length: safeCount }, (_, i) => (
        <ShopItemCardSkeleton key={i} isScenery={isScenery} />
      ))}
    </div>
  );
}