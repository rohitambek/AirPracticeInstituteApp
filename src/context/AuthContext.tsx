import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, authStorage } from '../services/api.ts';
import { NotificationItem, User } from '../types.ts';

interface SessionNoticeState {
  show: boolean;
  message: string;
  deviceInfo?: string;
  timestamp?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  unreadCount: number;
  notifications: NotificationItem[];
  login: (loginId: string, pass: string) => Promise<void>;
  signup: (payload: {
    name: string;
    email?: string;
    mobile?: string;
    password: string;
    confirmPassword: string;
    targetExam?: string;
  }) => Promise<{ message: string; loginId: string }>;
  logout: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  sessionNotice: SessionNoticeState | null;
  dismissSessionNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [sessionNotice, setSessionNotice] = useState<SessionNoticeState | null>(null);

  const dismissSessionNotice = () => setSessionNotice(null);

  const refreshNotifications = async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Stale session or unauthorized
    }
  };

  // 1. Listen for single-device session terminated event from apiRequest 401 interceptor
  useEffect(() => {
    const handleSessionTerminated = (e: any) => {
      const detail = e.detail || {};
      authStorage.removeToken();
      authStorage.removeUser();
      setUser(null);
      setToken(null);
      setNotifications([]);
      setUnreadCount(0);
      setSessionNotice({
        show: true,
        message:
          detail.message ||
          'Your account was logged into on another device (phone, laptop, or tablet). As per single-device policy, this session has been ended.',
        deviceInfo: detail.lastLoginDevice || 'Another Device (Phone, Laptop, or Tablet)',
        timestamp: detail.lastLoginAt || new Date().toISOString(),
      });
    };

    window.addEventListener('air_session_terminated', handleSessionTerminated);
    return () => {
      window.removeEventListener('air_session_terminated', handleSessionTerminated);
    };
  }, []);

  // 2. BroadcastChannel for instant same-browser cross-tab session termination
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('air_device_session_channel');
      channel.onmessage = (event) => {
        const data = event.data;
        if (data && data.type === 'NEW_LOGIN') {
          const currentUser = authStorage.getUser();
          if (
            currentUser &&
            currentUser.id === data.userId &&
            currentUser.currentSessionId &&
            currentUser.currentSessionId !== data.sessionId
          ) {
            authStorage.removeToken();
            authStorage.removeUser();
            setUser(null);
            setToken(null);
            setNotifications([]);
            setUnreadCount(0);
            setSessionNotice({
              show: true,
              message:
                'Your account was logged into from another window or device. As per single-device policy, this session has been ended.',
              deviceInfo: data.device || 'Active Device',
              timestamp: data.timestamp || new Date().toISOString(),
            });
          }
        }
      };
    } catch {
      // Ignored if restricted
    }

    return () => {
      try {
        channel?.close();
      } catch {}
    };
  }, [user]);

  // 3. Periodic heartbeat session-check (every 5 seconds + on window focus):
  // Verifies that this device is still the sole active session
  useEffect(() => {
    if (!user || !token) return;

    const verifyActiveSession = async () => {
      try {
        await api.checkSession();
      } catch (err: any) {
        // If 401 SESSION_TERMINATED occurred, apiRequest will dispatch 'air_session_terminated'
      }
    };

    const interval = setInterval(verifyActiveSession, 5000);

    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        verifyActiveSession();
      }
    };

    window.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [user, token]);

  // 4. Initial checkAuth on mount
  useEffect(() => {
    async function checkAuth() {
      const storedToken = authStorage.getToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
            authStorage.setUser(res.user);
          }
        } catch {
          authStorage.removeToken();
          authStorage.removeUser();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && token) {
      refreshNotifications();
    }
  }, [user, token]);

  const login = async (loginId: string, pass: string) => {
    const res = await api.login(loginId, pass);
    if (res.success) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
      setSessionNotice(null);

      // Broadcast new login to other tabs so they terminate instantly
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const channel = new BroadcastChannel('air_device_session_channel');
          channel.postMessage({
            type: 'NEW_LOGIN',
            userId: res.user.id,
            sessionId: res.user.currentSessionId || res.token,
            device: res.user.lastLoginDevice || 'Active Device',
            timestamp: new Date().toISOString(),
          });
          channel.close();
        } catch {}
      }

      await refreshNotifications();
    }
  };

  const signup = async (payload: {
    name: string;
    email?: string;
    mobile?: string;
    password: string;
    confirmPassword: string;
    targetExam?: string;
  }) => {
    const res = await api.signup(payload);
    if (res.success) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      setToken(res.token);
      setUser(res.user);
      await refreshNotifications();
      return { message: res.message, loginId: res.user.loginId };
    }
    throw new Error('Registration failed');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore network errors on logout
    }
    authStorage.removeToken();
    authStorage.removeUser();
    setUser(null);
    setToken(null);
    setNotifications([]);
    setUnreadCount(0);
    setSessionNotice(null);
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        unreadCount,
        notifications,
        login,
        signup,
        logout,
        refreshNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sessionNotice,
        dismissSessionNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
