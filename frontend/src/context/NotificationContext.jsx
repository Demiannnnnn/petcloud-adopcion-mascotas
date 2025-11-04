import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { getApiBase } from '../api/apiBase';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext) || {};
  const perfilId = user?.id || user?.perfil?.id;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!perfilId) return;
    try {
      setLoading(true);
      const base = getApiBase('ADOPTIONS');
      const res = await fetch(`${base}/api/notificaciones?destinatarioId=${perfilId}`);
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, [perfilId]);

  useEffect(() => {
    fetchNotifications();
    // simple polling for new notifications
    const iv = setInterval(() => {
      fetchNotifications();
    }, 6000);
    return () => clearInterval(iv);
  }, [fetchNotifications]);

  const unreadCount = (notifications || []).filter(n => !n.leida).length;

  const markAsRead = async (id) => {
    try {
      const base = getApiBase('ADOPTIONS');
      const res = await fetch(`${base}/api/notificaciones/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setNotifications(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const markAllAsRead = async () => {
    if (!perfilId) return false;
    const base = getApiBase('ADOPTIONS');
    // optimistic update
    setNotifications(prev => prev.map(p => ({ ...p, leida: true })));
    try {
      console.debug('[NotificationContext] markAllAsRead ->', `${base}/api/notificaciones/read-all?destinatarioId=${perfilId}`);
      const res = await fetch(`${base}/api/notificaciones/read-all?destinatarioId=${perfilId}`, { method: 'PATCH' });
      if (!res.ok) {
        console.warn('[NotificationContext] markAllAsRead batch failed, falling back to per-item PATCH', res.status);
        // fallback: PATCH each unread individually
        const unread = (notifications || []).filter(n => !n.leida);
        await Promise.all(unread.map(n => fetch(`${base}/api/notificaciones/${n.id}/read`, { method: 'PATCH' })));
        // refresh to ensure server state is in sync
        await fetchNotifications();
        return false;
      }
      // success: refresh list
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error('Failed to mark all notifications read', e);
      // fallback to per-item
      try {
        const unread = (notifications || []).filter(n => !n.leida);
        await Promise.all(unread.map(n => fetch(`${base}/api/notificaciones/${n.id}/read`, { method: 'PATCH' })));
      } catch (e2) {
        console.error('Fallback per-item markAll failed', e2);
      }
      await fetchNotifications();
      return false;
    }
  };

  const deleteNotification = async (id) => {
    try {
      const base = getApiBase('ADOPTIONS');
      const res = await fetch(`${base}/api/notificaciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete notification', e);
    }
  };

  const clearAllNotifications = async () => {
    if (!perfilId) return;
    try {
      const base = getApiBase('ADOPTIONS');
      // optimistic: clear local list
      const prev = notifications;
      setNotifications([]);
      const res = await fetch(`${base}/api/notificaciones/clear?destinatarioId=${perfilId}`, { method: 'DELETE' });
      if (!res.ok) {
        // revert if failed
        setNotifications(prev);
      }
    } catch (e) {
      console.error('Failed to clear notifications', e);
      // refresh as fallback
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, loading, unreadCount, refresh: fetchNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
