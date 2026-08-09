"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Image as ImageIcon, Play, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { useToastStore } from '@/store/useToastStore';

const PictureRaceGrid = () => {
  const router = useRouter();
  const { user } = useUser();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToastStore();

  useEffect(() => {
    if (!user) return;
    const fetchRaces = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/picture-races/user/${user.id}`);
        console.log("PictureRaceGrid fetch data:", data);
        setRaces(Array.isArray(data) ? data : (data?.races || []));
      } catch (err) {
        console.error('Failed to fetch picture races', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/picture-races/${id}`);
      setRaces(races.filter(r => r.id !== id));
      showToast('Picture Race deleted', 'success');
    } catch (err) {
      console.error('Failed to delete picture race', err);
      showToast('Failed to delete Picture Race', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalId(null);
    }
  };

  const handleHostClick = async (id) => {
    // Currently Picture Race game screens aren't built, so we just show a placeholder toast.
    showToast('Picture Race game engine coming soon!', 'orange');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 zk-skeleton rounded-lg border-[3px] border-zk-border/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="zk-panel-glass !shadow-none px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-['Outfit'] text-3xl font-black text-zk-text tracking-tight">
            {races.length > 0 ? 'Your Picture Races' : 'No Picture Races Yet'}
          </h2>
          <p className="text-sm font-bold text-zk-text/60 mt-1">
            {races.length > 0
              ? 'Manage your custom image typing games'
              : 'Create fun pixelated guessing games'}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zk-text/50">
            Total Races
          </p>
          <p className="font-['Outfit'] text-5xl font-black text-zk-purple leading-none">
            {races.length}
          </p>
        </div>
      </div>

      {races.length === 0 ? (
        <div
          onClick={() => router.push('/create-picture-race')}
          className="zk-panel !shadow-none border-dashed p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-zk-panel-bg transition-colors min-h-[280px] text-center"
        >
          <div className="w-16 h-16 rounded-full border-[3px] border-zk-border bg-zk-bg flex items-center justify-center">
            <Plus size={32} strokeWidth={3} />
          </div>
          <h3 className="zk-section-title text-3xl">Create a Picture Race</h3>
          <p className="font-bold text-zk-text/60 max-w-md">
            Upload images, crop and zoom in to hide details, and challenge players to guess the picture fast!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {races.map((race) => (
            <div
              key={race.id}
              className="border-[3px] border-zk-border bg-zk-panel-bg flex flex-col h-[320px] rounded-xl overflow-hidden relative group hover:-translate-y-0.5 transition-transform"
            >
              <div className="h-32 border-b-[3px] border-zk-border bg-zk-bg/30 overflow-hidden relative">
                {race.cover_image ? (
                  <img src={race.cover_image} alt={race.title} className="w-full h-full object-cover" />
                ) : race.questions && race.questions.length > 0 && race.questions[0].image_url ? (
                  <img src={race.questions[0].image_url} alt={race.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zk-text/30">
                    <div className="w-10 h-10 border-[2px] border-dashed border-zk-border/20 rounded-lg flex items-center justify-center">
                      <ImageIcon size={18} className="opacity-40" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">No cover</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap gap-1.5">
                    <div className="bg-zk-purple text-white text-[10px] font-bold px-2 py-0.5 border-[1.5px] border-zk-border rounded uppercase">
                      {race.questions?.length || 0} Slides
                    </div>
                  </div>
                  <h3 className="font-black text-lg text-zk-text mt-1 leading-tight line-clamp-2">{race.title}</h3>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleHostClick(race.id); }}
                    className="flex-1 bg-zk-purple text-white border-[2px] border-zk-border !shadow-none py-2 font-['Amatic_SC'] font-bold text-2xl rounded-lg transition-colors hover:bg-zk-purple-light flex items-center justify-center gap-1.5 leading-none pt-2"
                  >
                    <Play size={16} fill="currentColor" /> Host
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push('/create-picture-race/' + race.id); }}
                    className="bg-zk-panel-bg text-zk-text border-[2px] border-zk-border !shadow-none p-2 font-bold text-sm flex items-center justify-center rounded-lg transition-colors hover:bg-zk-bg/30"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteModalId(race.id); }}
                    className="bg-[#FF4B4B] text-white border-[2px] border-zk-border !shadow-none p-2 font-bold text-sm flex items-center justify-center rounded-lg transition-colors hover:bg-[#e63e3e]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div
            onClick={() => router.push('/create-picture-race')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && router.push('/create-picture-race')}
            className="border-[3px] border-dashed border-zk-border p-8 flex flex-col items-center justify-center gap-4 bg-zk-panel-bg/70 cursor-pointer hover:bg-zk-panel-bg hover:-translate-y-0.5 transition-all h-[320px] !shadow-none rounded-xl group"
          >
            <div className="w-14 h-14 rounded-full border-[3px] border-zk-border flex items-center justify-center bg-zk-purple text-white group-hover:scale-105 transition-transform">
              <Plus size={28} strokeWidth={3} />
            </div>
            <p className="font-bold text-zk-text amatic-sc-regular text-2xl">Create New Race</p>
          </div>
        </div>
      )}

      {deleteModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zk-panel-bg border-[4px] border-zk-border !shadow-none p-6 max-w-sm w-full flex flex-col items-center rounded-xl">
            <h3 className="font-['Outfit'] text-2xl font-black uppercase tracking-tight mb-2 text-zk-text text-center">Delete Race?</h3>
            <p className="text-zk-text/70 mb-6 text-center font-bold text-sm">Are you sure you want to delete this picture race? This cannot be undone.</p>
            <div className="flex gap-4 w-full">
              <button onClick={() => setDeleteModalId(null)} disabled={isDeleting} className="flex-1 bg-gray-200 dark:bg-zk-border/50 text-zk-text border-[3px] border-zk-border !shadow-none py-2 font-['Amatic_SC'] text-2xl font-black rounded-lg leading-none pt-2 transition-colors hover:bg-zk-bg/30 disabled:opacity-60">NO</button>
              <button onClick={() => handleDelete(deleteModalId)} disabled={isDeleting} className="flex-1 bg-[#FF4B4B] text-white border-[3px] border-zk-border !shadow-none py-2 font-['Amatic_SC'] text-2xl font-black rounded-lg flex justify-center items-center leading-none pt-2 transition-colors hover:bg-[#e63e3e] disabled:opacity-60">
                {isDeleting ? <Loader2 size={20} className="animate-spin" /> : "DELETE"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PictureRaceGrid;
