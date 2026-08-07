"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, Store } from 'lucide-react';

export default function CartEmptyState({ onGoToShop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="zk-panel !shadow-none border-dashed p-10 md:p-14 text-center flex flex-col items-center gap-5 min-h-[280px] justify-center"
    >
      <div className="w-16 h-16 rounded-full border-[3px] border-zk-border bg-zk-bg/30 flex items-center justify-center">
        <ShoppingBag size={32} strokeWidth={2.5} className="text-zk-text/50" />
      </div>
      <div>
        <h2 className="font-['Outfit'] text-2xl md:text-3xl font-black text-zk-text tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-sm font-bold text-zk-text/60 mt-2 max-w-sm mx-auto">
          Browse the shop for scenery and avatars — add anything you like, then come back here to checkout.
        </p>
      </div>
      <button
        type="button"
        onClick={onGoToShop}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border-[3px] border-zk-border bg-[#5D3FD3] text-white font-['Amatic_SC'] text-2xl font-bold !shadow-none transition-colors hover:bg-[#4e33b8]"
      >
        <Store size={18} strokeWidth={3} />
        Go to shop
      </button>
    </motion.div>
  );
}