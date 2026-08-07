"use client";

import CollectionItemCard from '@/components/Library/CollectionItemCard';

export default function LibraryCollectionSection({
  title,
  count,
  items,
  onDetails,
}) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="font-['Outfit'] text-xl md:text-2xl font-black text-zk-text tracking-tight">
          {title}
        </h2>
        <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-lg border-[2px] border-zk-border bg-zk-bg px-2 py-0.5 text-xs font-black text-zk-text">
          {count}
        </span>
      </div>

      <div className="grid grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        {items.map((item) => (
          <CollectionItemCard
            key={`${item.item_type}-${item.slug}`}
            item={item}
            onDetails={onDetails}
          />
        ))}
      </div>
    </section>
  );
}