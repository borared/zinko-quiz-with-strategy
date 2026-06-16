'use client';
import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';
import { BellRing, CheckCheck, Loader2 } from 'lucide-react';
import Navbar from '@/components/global/Navbar';
import { motion } from 'framer-motion';

export default function Notifications() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, clearAllNotifications } = useNotificationStore();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/join');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchNotifications(user.id);
    }
  }, [isSignedIn, user?.id, fetchNotifications]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FDF9F1] flex items-center justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-zk-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9F1] flex flex-col font-['Outfit'] relative overflow-hidden z-0">
      <Navbar />

      {/* Floating Background Shapes */}
      <motion.div
        className="absolute top-[15%] left-[5%] text-zk-blue -z-10"
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BellRing size={120} />
      </motion.div>
      <motion.svg
        className="absolute top-[40%] right-[10%] -z-10"
        width="128"
        height="128"
        viewBox="0 0 128 128"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="64" cy="64" r="56" fill="none" stroke="#FFCD29" strokeWidth="8" />
      </motion.svg>
      <motion.div
        className="absolute bottom-[20%] left-[15%] w-24 h-24 bg-red-400 rounded-full -z-10"
        animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[25%] text-[#5D3FD3] -z-10"
        animate={{ y: [0, -15, 0], rotate: [0, -15, 15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BellRing size={80} />
      </motion.div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 mt-4 relative z-10">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border-[4px] border-zk-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zk-yellow border-[3px] border-zk-black rounded-xl flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <BellRing className="text-zk-black" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zk-black uppercase tracking-tight">Notifications</h1>
              <p className="text-zk-black/60 font-bold">Stay up to date with your game activities.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => user?.id && markAllAsRead(user.id)}
              className="flex items-center justify-center gap-2 bg-zk-blue text-white border-[3px] border-zk-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-5 py-2.5 rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none whitespace-nowrap"
            >
              <CheckCheck size={20} /> Mark as read
            </button>
            <button
              onClick={() => user?.id && clearAllNotifications(user.id)}
              className="flex items-center justify-center gap-2 bg-red-500 text-white border-[3px] border-zk-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-5 py-2.5 rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-transform hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none whitespace-nowrap"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center mt-12">
              <Loader2 className="animate-spin w-12 h-12 text-zk-black mb-4" />
              <h2 className="text-2xl font-black text-zk-black">Loading Notifications...</h2>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center mt-12">
              <h2 className="text-2xl font-black text-zk-black">You're all caught up!</h2>
              <p className="text-zk-black/60 font-bold mt-2">No new notifications to display.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const clonerName = notif.metadata?.cloner_name || 'Someone';
              const clonerAvatar = notif.metadata?.cloner_avatar || '/assets/default_avatar.png'; // fallback avatar
              
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`relative flex items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border-[4px] border-zk-black transition-all ${
                    notif.is_read
                      ? 'bg-white opacity-70 hover:opacity-100 shadow-[4px_4px_0_0_rgba(0,0,0,1)] cursor-default'
                      : 'bg-zk-yellow/20 hover:bg-zk-yellow/40 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] cursor-pointer'
                  }`}
                >
                  {/* Unread indicator */}
                  {!notif.is_read && (
                    <div className="absolute top-4 right-4 sm:top-auto sm:right-6 w-3 h-3 bg-red-500 border-[2px] border-black rounded-full" />
                  )}

                  {/* Cloner Avatar */}
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-zk-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] overflow-hidden bg-white">
                    <img src={clonerAvatar} alt={clonerName} className="w-full h-full object-cover" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <span className="inline-block bg-[#5D3FD3] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border-[2px] border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                        {notif.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-zk-black/50">
                        {new Date(notif.created_at).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    <p className="text-base sm:text-lg text-zk-black font-semibold mt-2">
                      <span className="font-black text-zk-blue">{clonerName}</span> {notif.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
