import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useFetchHook from '../../Hooks/UseFetchHook';
import SkeletonLoading from '../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { Error as ErrorMessage } from '../../components/other/Error/Error';

interface NotificationItem {
  notification_id: string;
  notification_type: string;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  action_url: string | null;
  priority: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  count: number;
}

const getRelativeGroup = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  return 'Earlier';
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export const Notification = () => {
  const navigate = useNavigate();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const [localUnread, setLocalUnread] = useState<number | null>(null);

  const {
    data: notifResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<NotificationsResponse>('/notifications', 'notifications', {
    staleTime: 30_000,
  });

  const { data: unreadResponse } = useFetchHook<UnreadCountResponse>(
    '/notifications/unread-count',
    'unread-count',
    { staleTime: 15_000 }
  );

  const unreadCount = localUnread ?? unreadResponse?.count ?? 0;
  const notifications = notifResponse?.data ?? [];

  const grouped = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = { Today: [], Yesterday: [], Earlier: [] };
    for (const n of notifications) {
      const group = getRelativeGroup(n.created_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    }
    return groups;
  }, [notifications]);

  const toggleGroup = useCallback((group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      setMarkingAll(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setLocalUnread(0);
        refetch();
      }
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  }, [refetch]);

  if (isLoading) return <SkeletonLoading />;

  if (isError) {
    return (
      <ErrorMessage
        message={error?.message || 'Failed to load notifications. Please try again.'}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-500 text-[14px] mb-4">
            Review the latest system alerts and important updates.
          </p>
          <p className="text-[14px] text-gray-700">
            You have{' '}
            <span className="text-[#38BDF8] font-semibold">{unreadCount}</span>
            {unreadCount === 1 ? ' new notification' : ' new notifications'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-[14px] shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CheckCheck className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => {
            if (items.length === 0) return null;
            const isCollapsed = collapsedGroups.has(group);
            return (
              <section key={group}>
                <div
                  className="flex justify-between items-center cursor-pointer group py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(group)}
                >
                  <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                    {group}
                    <span className="ml-2 font-normal text-gray-400">
                      ({items.length})
                    </span>
                  </h3>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${
                      isCollapsed ? '' : 'transform rotate-180'
                    }`}
                  />
                </div>
                {!isCollapsed && (
                  <div className="mt-4">
                    {items.map((item) => (
                      <div
                        key={item.notification_id}
                        className={`flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow mb-3 cursor-pointer ${
                          item.is_read ? 'bg-white' : 'bg-blue-50/60'
                        }`}
                        onClick={() => {
                          if (item.action_url) navigate(item.action_url);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                              item.is_read ? 'bg-gray-100' : 'bg-blue-100'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-sm ${
                                item.is_read ? 'bg-gray-300' : 'bg-blue-500'
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 text-[15px]">
                                {item.title}
                              </span>
                              <span className="text-[12px] text-gray-400 whitespace-nowrap">
                                {formatTime(item.created_at)}
                              </span>
                            </div>
                            <p className="text-[13px] text-gray-600 mt-0.5 line-clamp-2">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notification;
