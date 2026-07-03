import { create } from 'zustand';
import api from '../services/api';

function normalizeNotifications(data) {
  return Array.isArray(data) ? data : (data?.notifications || []);
}

function countUnread(notifications) {
  return notifications.filter((n) => !n.is_read).length;
}

export const useNotificationStore = create((set, get) => ({
  userId: null,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isHydrated: false,
  isFetching: false,

  isCachedForUser: (userId) => {
    const state = get();
    return Boolean(userId && state.isHydrated && state.userId === userId);
  },

  setCache: ({ userId, notifications, unreadCount }) => {
    const validData = normalizeNotifications(notifications);
    set({
      userId,
      notifications: validData,
      unreadCount: unreadCount ?? countUnread(validData),
      isHydrated: true,
      isLoading: false,
    });
  },

  invalidate: () =>
    set({
      userId: null,
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isHydrated: false,
      isFetching: false,
    }),

  fetchNotifications: async (userId, { silent } = {}) => {
    if (!localStorage.getItem('zinko_jwt')) return;
    if (!userId) return;

    const cached = get().isCachedForUser(userId);
    const isSilent = silent ?? cached;

    if (get().isFetching) return;

    const showLoading = !isSilent && !cached;
    if (showLoading) set({ isLoading: true });

    set({ isFetching: true });
    try {
      const data = await api.get(`/api/notifications/user/${userId}`);
      const validData = normalizeNotifications(data);
      set({
        userId,
        notifications: validData,
        unreadCount: countUnread(validData),
        isHydrated: true,
        isLoading: false,
        isFetching: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false, isFetching: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: countUnread(updated),
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await api.put(`/api/notifications/user/${userId}/read-all`);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  collectSceneryGift: async (notificationId) => {
    try {
      const result = await api.post('/api/sceneries/collect', { notificationId });
      const slug = result?.scenery?.slug || result?.scenery?.id;
      if (slug) {
        const { markSceneryAsNew } = await import('@/lib/newSceneryNotice');
        markSceneryAsNew(slug);
      }
      set((state) => {
        const updated = state.notifications.map((n) => {
          if (n.id !== notificationId) return n;
          return {
            ...n,
            is_read: true,
            metadata: {
              ...(n.metadata || {}),
              collected: true,
            },
          };
        });
        return {
          notifications: updated,
          unreadCount: countUnread(updated),
        };
      });
      return result;
    } catch (error) {
      console.error('Failed to collect scenery gift:', error);
      throw error;
    }
  },

  clearAllNotifications: async (userId) => {
    try {
      await api.delete(`/api/notifications/user/${userId}/clear-all`);
      set({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },
}));