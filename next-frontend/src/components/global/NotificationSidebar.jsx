'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useOwnedSceneryStore } from '@/store/useOwnedSceneryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BellRing, CheckCheck, Loader2, Gift, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZINKO_SENDER_AVATAR, ZINKO_SENDER_NAME } from '@/lib/lobbyScenery';

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23FFCD29"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%235D3FD3"/></svg>';

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
    : (metadata.cloner_avatar || DEFAULT_AVATAR);
  const isCollected = metadata.collected === true;
  const canCollect = isSceneryGift && !isCollected;

  const handleCardClick = () => {
    if (canCollect) return;
    if (!notif.is_read) onMarkRead(notif.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative flex gap-4 p-4 rounded-xl border-2 border-zk-border transition-colors ${
        notif.is_read
          ? 'bg-zk-panel-bg opacity-75 hover:opacity-100 cursor-default'
          : 'bg-zk-bg/10 hover:bg-zk-bg/25 cursor-pointer'
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(notif.id);
        }}
        className="absolute top-3 right-3 text-zk-text/30 hover:text-red-500 transition-colors"
        aria-label="Delete notification"
      >
        <Trash2 size={16} />
      </button>

      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-lg border-2 border-zk-border overflow-hidden bg-zk-bg flex items-center justify-center p-1">
          <img
            src={senderAvatar}
            alt={senderName}
            className={isSceneryGift ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
          />
        </div>
        {!notif.is_read && !canCollect && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-[1.5px] border-black rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border-2 border-black ${
            isSceneryGift ? 'bg-orange-600 text-white' : 'bg-[#5D3FD3] text-white'
          }`}>
            {notif.type.replace(/_/g, ' ')}
          </span>
          <span className="text-xs font-bold text-zk-text/40">
            {new Date(notif.created_at).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </span>
        </div>

        <p className="text-sm text-zk-text font-medium mt-1.5 leading-snug">
          <span className={`font-black ${isSceneryGift ? 'text-orange-600' : 'text-zk-blue'}`}>
            {senderName}
          </span>{' '}
          {notif.message}
        </p>

        {isSceneryGift && metadata.scenery_image && (
          <div className="mt-3 flex flex-col gap-2">
            <div
              className="w-full h-24 rounded-lg border-2 border-zk-border overflow-hidden"
              style={{
                backgroundImage: `url('${metadata.scenery_image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-zk-text truncate max-w-[120px]">
                {metadata.scenery_name || 'Background Scenery'}
              </span>
              {isCollected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-green-600">
                  <CheckCheck size={12} /> Collected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCollectScenery(notif.id);
                  }}
                  disabled={collectingId === notif.id}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#2ea84a] text-white border-2 border-zk-border px-3 py-1 rounded-lg font-['Amatic_SC'] text-lg font-bold transition-colors hover:bg-[#268f3f] disabled:opacity-60"
                >
                  {collectingId === notif.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Gift size={14} />
                  )}
                  Collect
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationSidebar({ isOpen, onClose }) {
  const { isLoaded, isSignedIn, user } = useUser();
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
  const { fetchOwnedScenery, syncNewScenerySlugs } = useOwnedSceneryStore();
  const isJwtReady = useAuthStore((s) => s.isJwtReady);
  const [collectingId, setCollectingId] = useState(null);

  useEffect(() => {
    if (isOpen && isSignedIn && user?.id && isJwtReady) {
      fetchNotifications(user.id);
    }
  }, [isOpen, isSignedIn, user?.id, isJwtReady, fetchNotifications]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[999] cursor-pointer"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zk-panel-bg border-l-2 border-zk-border shadow-2xl z-[1000] flex flex-col font-['Outfit']"
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-zk-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zk-bg border-2 border-zk-border rounded-lg flex items-center justify-center">
                  <BellRing className="text-zk-text" size={18} />
                </div>
                <h2 className="text-xl font-black text-zk-text tracking-tight">Notifications</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border-2 border-zk-border hover:bg-zk-bg/10 transition-colors text-zk-text"
                aria-label="Close notifications panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions Subheader */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 bg-zk-bg/5 border-b-2 border-zk-border flex items-center justify-end gap-2">
                <button
                  onClick={() => user?.id && markAllAsRead(user.id)}
                  className="flex items-center gap-1.5 bg-zk-blue text-white border-2 border-zk-border px-3 py-1.5 rounded-lg font-['Amatic_SC'] text-lg font-bold transition-colors hover:bg-zk-blue/90"
                >
                  <CheckCheck size={14} /> Mark Read
                </button>
                <button
                  onClick={() => user?.id && clearAllNotifications(user.id)}
                  className="flex items-center gap-1.5 bg-red-500 text-white border-2 border-zk-border px-3 py-1.5 rounded-lg font-['Amatic_SC'] text-lg font-bold transition-colors hover:bg-red-600"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Notification List Panel */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" data-lenis-prevent="true">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <Loader2 className="animate-spin w-8 h-8 text-zk-text mb-3" />
                  <span className="text-sm font-bold text-zk-text/60">Loading...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <span className="text-base font-black text-zk-text">You're all caught up!</span>
                  <span className="text-xs font-bold text-zk-text/40 mt-1">No new notifications to display.</span>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
