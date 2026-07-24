import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Receipt, Users, LogIn, LogOut, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { activityService } from '../../services/endpoints';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { RowSkeleton } from '../ui/Skeleton';

const ACTION_ICONS = {
  create_group: Users,
  update_group: Pencil,
  delete_group: Trash2,
  add_expense: Receipt,
  update_expense: Pencil,
  delete_expense: Trash2,
  settle_payment: CheckCircle2,
  join_group: LogIn,
  leave_group: LogOut,
};

const formatTimeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const ActivityTab = ({ groupId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['group-activity', groupId],
    queryFn: () => activityService.getGroupActivity(groupId, { limit: 30 }),
  });

  const logs = data?.data?.logs || [];

  if (isLoading) {
    return (
      <div className="glass-card p-4 divide-y divide-white/[0.04]">
        {[...Array(5)].map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return <EmptyState icon={Clock} title="No activity yet" description="Actions in this group will show up here as a timeline." />;
  }

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/[0.06]" />
      <div className="space-y-1">
        {logs.map((log, i) => {
          const Icon = ACTION_ICONS[log.action] || Clock;
          return (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="relative flex gap-4 py-3"
            >
              <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-base-800 border border-white/10">
                <Icon className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0 pt-1.5">
                <div className="flex items-center gap-2">
                  <Avatar name={log.user?.name} src={log.user?.avatar} size="xs" />
                  <p className="text-sm text-ink-200">{log.description}</p>
                </div>
                <p className="text-xs text-ink-600 mt-1 ml-7">{formatTimeAgo(log.createdAt)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTab;
