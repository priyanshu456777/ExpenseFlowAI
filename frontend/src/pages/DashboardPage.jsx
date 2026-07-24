import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, TrendingDown, TrendingUp, Users, Plus, UserPlus, HeartPulse } from 'lucide-react';
import { analyticsService, insightService, groupService } from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import GroupCard from '../components/dashboard/GroupCard';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const DashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsService.getDashboardStats,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['insights-overview'],
    queryFn: insightService.getOverview,
  });

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['my-groups'],
    queryFn: groupService.getMyGroups,
  });

  const stats = statsData?.data?.data;
  const health = insightsData?.data?.financialHealthScore;
  const groups = groupsData?.data?.groups || [];

  const handleTogglePin = async (groupId) => {
    try {
      await groupService.togglePin(groupId);
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const sortedGroups = [...groups].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-ink-100">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-400 mt-1">Here's what's happening across your groups.</p>
      </motion.div>

      {/* Stat cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <StatCard label="This month" value={stats?.monthlyTotal?.toFixed(2) || '0.00'} prefix="$" icon={Wallet} accent="indigo" />
          </motion.div>
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <StatCard
              label="You owe"
              value={stats?.totalYouOwe?.toFixed(2) || '0.00'}
              prefix="$"
              icon={TrendingDown}
              accent="rose"
            />
          </motion.div>
          <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <StatCard
              label="You've paid"
              value={stats?.totalYouPaid?.toFixed(2) || '0.00'}
              prefix="$"
              icon={TrendingUp}
              accent="emerald"
            />
          </motion.div>
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
            <StatCard label="Active groups" value={groups.length} icon={Users} accent="violet" />
          </motion.div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-display text-base font-semibold text-ink-100 mb-1">Spending by category</h2>
          <p className="text-xs text-ink-500 mb-4">This month, across all groups</p>
          <CategoryPieChart data={stats?.categoryTotals} />
        </div>

        {/* Financial health + quick actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-4 w-4 text-emerald-400" />
              <h2 className="font-display text-sm font-semibold text-ink-100">Financial health</h2>
            </div>
            {health ? (
              <>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display text-3xl font-bold text-ink-100 figure">{health.score}</span>
                  <span className="text-sm text-ink-500 mb-1">/100</span>
                </div>
                <span
                  className={`badge ${
                    health.rating === 'Excellent' || health.rating === 'Good'
                      ? 'badge-emerald'
                      : health.rating === 'Fair'
                      ? 'badge-amber'
                      : 'badge-rose'
                  }`}
                >
                  {health.rating}
                </span>
                <div className="mt-4 h-1.5 rounded-full bg-base-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-emerald transition-all duration-700"
                    style={{ width: `${health.score}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-500">Add a few expenses to see your score.</p>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="font-display text-sm font-semibold text-ink-100 mb-4">Quick actions</h2>
            <div className="space-y-2">
              <Link to="/groups" className="btn-secondary w-full justify-start">
                <Plus className="h-4 w-4" /> Create a group
              </Link>
              <Link to="/expenses" className="btn-secondary w-full justify-start">
                <Wallet className="h-4 w-4" /> Add an expense
              </Link>
              <Link to="/groups" className="btn-secondary w-full justify-start">
                <UserPlus className="h-4 w-4" /> Invite a friend
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Groups grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-semibold text-ink-100">Your groups</h2>
          <Link to="/groups" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>

        {groupsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : sortedGroups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create your first group to start splitting expenses with friends, roommates, or coworkers."
            action={
              <Link to="/groups" className="btn-primary">
                <Plus className="h-4 w-4" /> Create a group
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGroups.map((group) => (
              <GroupCard key={group._id} group={group} onTogglePin={handleTogglePin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
