"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gamepad2, Info, VenetianMask } from 'lucide-react';
import { getSceneryDetails, SCENERY_LEVEL_CLASSES } from '@/lib/sceneryDetails';
import SceneryDetailModal from '@/components/Shop/SceneryDetailModal';

export default function CollectionItemCard({ item, onDetails }) {
  const [showDetails, setShowDetails] = useState(false);
  const isScenery = item.item_type === 'scenery';
  const sceneryDetails = isScenery ? getSceneryDetails(item.slug) : null;
  const imageSrc = item.image || item.image_url;
  const hasSceneryDetails = Boolean(sceneryDetails);

  const handleOpenDetails = () => {
    if (onDetails) {
      onDetails(item);
      return;
    }
    setShowDetails(true);
  };

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
          <span className="absolute top-4 right-4 z-10 bg-[#2ea84a] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border-[2px] border-zk-black">
            Owned
          </span>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zk-black/50">
              {isScenery ? 'Quiz Scenery' : item.is_free ? 'Free Avatar' : 'Player Avatar'}
            </p>
            <h3
              className={`text-xl font-black tracking-tight text-zk-black ${
                isScenery ? "font-['Outfit'] normal-case" : 'permanent-marker-regular uppercase'
              }`}
            >
              {item.name}
            </h3>
          </div>

          {isScenery ? (
            hasSceneryDetails ? (
              <button
                type="button"
                onClick={handleOpenDetails}
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-black transition-colors hover:bg-zk-yellow"
              >
                <Info size={16} strokeWidth={3} />
                View details
              </button>
            ) : (
              <Link
                href="/create-game"
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-white px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-black transition-colors hover:bg-zk-yellow"
              >
                <Gamepad2 size={16} strokeWidth={3} />
                Use in host lobby
              </Link>
            )
          ) : (
            <Link
              href="/join"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border-[2px] border-zk-black bg-[#5D3FD3]/10 px-4 font-['Amatic_SC'] text-xl font-bold leading-none text-zk-black transition-colors hover:bg-[#5D3FD3]/20"
            >
              <VenetianMask size={16} strokeWidth={3} />
              Equip when you join a game
            </Link>
          )}
        </div>
      </motion.article>

      {!onDetails && hasSceneryDetails && (
        <SceneryDetailModal
          item={{ ...item, owned: true }}
          open={showDetails}
          variant="collection"
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}