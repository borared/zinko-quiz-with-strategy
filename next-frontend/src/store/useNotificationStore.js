import { create } from 'zustand';
import api from '../services/api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId) => {
    if (get().isLoading) return;
    if (!localStorage.getItem('zinko_jwt')) return;

    set({ isLoading: true });
    try {
      const data = await api.get(`/api/notifications/user/${userId}`);
      const validData = Array.isArray(data) ? data : (data.notifications || []);
      set({ 
        notifications: validData,
        unreadCount: validData.filter(n => !n.is_read).length,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.is_read).length
        };
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      await api.put(`/api/notifications/user/${userId}/read-all`);
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  clearAllNotifications: async (userId) => {
    try {
      await api.delete(`/api/notifications/user/${userId}/clear-all`);
      set({
        notifications: [],
        unreadCount: 0
      });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }
}));
