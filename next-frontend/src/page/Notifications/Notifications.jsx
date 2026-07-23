'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useOwnedSceneryStore } from '@/store/useOwnedSceneryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BellRing, CheckCheck, Loader2, Gift, Trash2 } from 'lucide-react';
import Navbar from '@/components/global/Navbar';
import { motion } from 'framer-motion';
import { ZINKO_SENDER_AVATAR, ZINKO_SENDER_NAME } from '@/lib/lobbyScenery';

function NotificationCard({
  notif,
  onMarkRead,
  onCollectScenery,
  collectingId,
  onDelete,
}) {
  const isSceneryGift = notif.type === 'SCENERY_GIFT';
  const metadata = notif.metadata || {};
  const senderName = isSceneryGift
    ? (metadata.sender_name || ZINKO_SENDER_NAME)
    : (metadata.cloner_name || 'Someone');
  const senderAvatar = isSceneryGift
    ? ZINKO_SENDER_AVATAR
    : (metadata.cloner_avatar || '/assets/default_avatar.png');
  const isCollected = metadata.collected === true;
  const canCollect = isSceneryGift && !isCollected;

  const handleCardClick = () => {
    if (canCollect) return;
    if (!notif.is_read) onMarkRead(notif.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative flex items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border-[4px] border-zk-black transition-colors ${
        notif.is_read
          ? 'bg-white opacity-70 hover:opacity-100 cursor-default'
          : 'bg-zk-yellow/20 hover:bg-zk-yellow/40 cursor-pointer'
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(notif.id);
        }}
        className="absolute top-4 right-4 text-zk-black/30 hover:text-red-500 transition-colors"
        aria-label="Delete notification"
      >
        <Trash2 size={20} />
      </button>

      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[3px] border-zk-black overflow-hidden bg-zk-yellow flex items-center justify-center p-1.5">
          <img
            src={senderAvatar}
            alt={senderName}
            className={isSceneryGift ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
          />
        </div>
        {!notif.is_read && !canCollect && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-[2px] border-black rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
          <span className={`inline-block text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border-[2px] border-black ${
            isSceneryGift ? 'bg-orange-600' : 'bg-[#5D3FD3]'
          }`}>
            {notif.type.replace(/_/g, ' ')}
          </span>
          <span className="text-xs font-bold text-zk-black/50">
            {new Date(notif.created_at).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </span>
        </div>

        <p className="text-base sm:text-lg text-zk-black font-semibold mt-2">
          <span className={`font-black ${isSceneryGift ? 'text-orange-700' : 'text-zk-blue'}`}>
            {senderName}
          </span>{' '}
          {notif.message}
        </p>

        {isSceneryGift && metadata.scenery_image && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className="w-full sm:w-36 h-20 rounded-xl border-[3px] border-zk-black overflow-hidden"
              style={{
                backgroundImage: `url('${metadata.scenery_image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-black uppercase tracking-wide text-zk-black">
                {metadata.scenery_name || 'Background Scenery'}
              </span>
              {isCollected ? (
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-green-700">
                  <CheckCheck size={14} /> Collected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCollectScenery(notif.id);
                  }}
                  disabled={collectingId === notif.id}
                  className="inline-flex items-center justify-center gap-2 bg-[#2ea84a] text-white border-[3px] border-zk-black px-4 py-2 rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-colors hover:bg-[#268f3f] disabled:opacity-60"
                >
                  {collectingId === notif.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Gift size={18} />
                  )}
                  Collect Scenery
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Notifications() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification,
    collectSceneryGift,
    isCachedForUser,
  } = useNotificationStore();
  const notificationsCached = Boolean(user?.id && isCachedForUser(user.id));
  const { fetchOwnedScenery, syncNewScenerySlugs } = useOwnedSceneryStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const [collectingId, setCollectingId] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/join');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn && user?.id && isJwtReady) {
      fetchNotifications(user.id);
    }
  }, [isSignedIn, user?.id, isJwtReady, fetchNotifications]);

  const handleCollectScenery = async (notificationId) => {
    setCollectingId(notificationId);
    try {
      await collectSceneryGift(notificationId);
      await fetchOwnedScenery();
      syncNewScenerySlugs();
    } catch (error) {
      console.error(error);
    } finally {
      setCollectingId(null);
    }
  };

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
        className="absolute top-[15%] left-[5%] text-zk-blue -z-10 pointer-events-none"
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BellRing size={120} />
      </motion.div>
      <motion.svg
        className="absolute top-[40%] right-[10%] -z-10 pointer-events-none"
        width="128"
        height="128"
        viewBox="0 0 128 128"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="64" cy="64" r="56" fill="none" stroke="#FFCD29" strokeWidth="8" />
      </motion.svg>
      <motion.div
        className="absolute bottom-[20%] left-[15%] w-24 h-24 bg-red-400 rounded-full -z-10 pointer-events-none"
        animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[25%] text-[#5D3FD3] -z-10 pointer-events-none"
        animate={{ y: [0, -15, 0], rotate: [0, -15, 15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BellRing size={80} />
      </motion.div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 mt-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border-[4px] border-zk-black p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zk-yellow border-[3px] border-zk-black rounded-xl flex items-center justify-center">
              <BellRing className="text-zk-black" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zk-black tracking-tight">Notifications</h1>
              <p className="text-zk-black/60 font-bold">Collect scenery gifts and stay up to date.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => user?.id && markAllAsRead(user.id)}
              className="flex items-center justify-center gap-2 bg-zk-blue text-white border-[3px] border-zk-black px-5 py-2.5 rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-colors hover:bg-zk-blue/90 whitespace-nowrap"
            >
              <CheckCheck size={20} /> Mark as read
            </button>
            <button
              onClick={() => user?.id && clearAllNotifications(user.id)}
              className="flex items-center justify-center gap-2 bg-red-500 text-white border-[3px] border-zk-black px-5 py-2.5 rounded-xl font-['Amatic_SC'] text-2xl font-bold transition-colors hover:bg-red-600 whitespace-nowrap"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading && !notificationsCached ? (
            <div className="p-12 text-center flex flex-col items-center justify-center mt-12">
              <Loader2 className="animate-spin w-12 h-12 text-zk-black mb-4" />
              <h2 className="text-2xl font-black text-zk-black">Loading Notifications...</h2>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center mt-12">
              <h2 className="text-2xl font-black text-zk-black">You&apos;re all caught up!</h2>
              <p className="text-zk-black/60 font-bold mt-2">No new notifications to display.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onMarkRead={markAsRead}
                onCollectScenery={handleCollectScenery}
                collectingId={collectingId}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}