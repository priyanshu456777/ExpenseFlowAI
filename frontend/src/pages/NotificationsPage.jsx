import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { notificationService } from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import { RowSkeleton } from '../components/ui/Skeleton';

const formatTimeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'full', page],
    queryFn: () => notificationService.list({ page, limit: 15 }),
    keepPreviousData: true,
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;
  const pagination = data?.meta?.pagination;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      invalidate();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      invalidate();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      invalidate();
      toast.success('All notifications marked as read.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">Notifications</h1>
          <p className="text-sm text-ink-400 mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="glass-card p-4 divide-y divide-white/[0.04]">
          {[...Array(5)].map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up. New activity will show up here." />
      ) : (
        <div className="glass-card divide-y divide-white/[0.04]">
          {notifications.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-indigo-500/[0.04]' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-200 leading-snug">{n.message}</p>
                <p className="text-xs text-ink-600 mt-1">{formatTimeAgo(n.createdAt)}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:text-rose-400 hover:bg-rose-500/10"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-8 w-8 rounded-lg text-xs font-medium ${
                page === i + 1 ? 'bg-gradient-brand text-white' : 'text-ink-400 hover:bg-white/[0.05]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
