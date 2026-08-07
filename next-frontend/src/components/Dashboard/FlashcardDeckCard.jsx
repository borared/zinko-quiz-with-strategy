"use client";
import React from 'react';
import { Layers, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const FlashcardDeckCard = ({ deck }) => {
  const router = useRouter();

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const cardCount = deck.flashcards ? deck.flashcards.length : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="zk-panel !shadow-none flex flex-col h-[320px] transition-all duration-300 relative group overflow-hidden bg-zk-bg cursor-pointer"
      onClick={() => router.push(`/flashcard/${deck.id}`)} // Or wherever it should go
    >
      {/* Visual Header / Cover */}
      <div className="h-40 w-full relative bg-[#FFCD29] border-b-[3px] border-zk-border flex items-center justify-center overflow-hidden">
        {deck.cover_image ? (
          <img src={deck.cover_image} alt={deck.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            {/* Subtle pattern background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            <div className="relative z-10 w-20 h-24 bg-[#3B68FF] border-[3px] border-zk-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center -rotate-6">
              <Layers className="text-[#FFCD29]" size={32} />
            </div>
          </>
        )}
        
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          <div className="bg-zk-bg px-2.5 py-1 rounded-md border-[2px] border-zk-border font-bold text-xs flex items-center gap-1">
             <Layers size={12} /> {cardCount} Cards
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-['Outfit'] font-black text-xl text-zk-text line-clamp-2 leading-tight">
            {deck.title}
          </h3>
          <p className="text-sm font-bold text-zk-text/50 mt-1 line-clamp-1">
            Created {timeAgo(deck.created_at)}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t-2 border-zk-border border-dashed">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-zk-border overflow-hidden bg-zk-panel-bg shrink-0">
              {deck.creator?.avatar_url ? (
                <img src={deck.creator.avatar_url} alt="creator" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zk-purple"></div>
              )}
            </div>
            <span className="text-xs font-bold text-zk-text/70 truncate max-w-[120px]">
              {deck.creator?.username || 'You'}
            </span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); /* TODO: handle delete */ }}
            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border-2 border-transparent hover:border-red-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FlashcardDeckCard;
