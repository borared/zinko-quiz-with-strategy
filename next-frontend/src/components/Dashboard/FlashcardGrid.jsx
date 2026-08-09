"use client";
import React, { useEffect, useState } from 'react';
import FlashcardDeckCard from './FlashcardDeckCard';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { useUser } from '@clerk/nextjs';

const FlashcardGrid = () => {
  const router = useRouter();
  const { user } = useUser();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await api.get(`/api/flashcards/user/${user.id}`);
        setDecks(data.flashcards || []);
      } catch (err) {
        console.error("Failed to fetch flashcards", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 zk-skeleton rounded-lg border-[3px] border-zk-border/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="zk-skeleton border-[3px] border-zk-border rounded-xl h-[320px]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="zk-panel-glass !shadow-none px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-['Outfit'] text-3xl font-black text-zk-text tracking-tight">
            {decks.length > 0 ? 'Your Flashcards' : 'No Flashcards Yet'}
          </h2>
          <p className="text-sm font-bold text-zk-text/60 mt-1">
            {decks.length > 0
              ? 'Review your saved study materials'
              : 'Generate AI flashcards from your documents'}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zk-text/50">
            Total Decks
          </p>
          <p className="font-['Outfit'] text-5xl font-black text-zk-purple leading-none">
            {decks.length}
          </p>
        </div>
      </div>

      {decks.length === 0 ? (
        <div
          onClick={() => router.push('/flashcard')}
          className="zk-panel !shadow-none border-dashed p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-zk-panel-bg transition-colors min-h-[280px] text-center"
        >
          <div className="w-16 h-16 rounded-full border-[3px] border-zk-border bg-zk-bg flex items-center justify-center">
            <Plus size={32} strokeWidth={3} />
          </div>
          <h3 className="zk-section-title text-3xl">Generate Flashcards</h3>
          <p className="font-bold text-zk-text/60 max-w-md">
            Upload your notes or documents and let AI generate a beautiful 3D flashcard deck.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <FlashcardDeckCard key={deck.id} deck={deck} />
          ))}

          <div
            onClick={() => router.push('/flashcard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && router.push('/flashcard')}
            className="border-[3px] border-dashed border-zk-border p-8 flex flex-col items-center justify-center gap-4 bg-zk-panel-bg/70 cursor-pointer hover:bg-zk-panel-bg hover:-translate-y-0.5 transition-all h-[320px] !shadow-none rounded-xl group"
          >
            <div className="w-14 h-14 rounded-full border-[3px] border-zk-border flex items-center justify-center bg-zk-purple text-white group-hover:scale-105 transition-transform">
              <Plus size={28} strokeWidth={3} />
            </div>
            <p className="font-bold text-zk-text amatic-sc-regular text-2xl">Create New Deck</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardGrid;
