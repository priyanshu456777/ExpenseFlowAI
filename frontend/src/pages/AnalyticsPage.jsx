import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { groupService, analyticsService } from '../services/endpoints';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import MonthlyBarChart from '../components/analytics/MonthlyBarChart';
import WeeklyTrendChart from '../components/analytics/WeeklyTrendChart';
import TopContributors from '../components/analytics/TopContributors';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import FullScreenLoader from '../components/ui/FullScreenLoader';

const AnalyticsPage = () => {
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['my-groups'],
    queryFn: groupService.getMyGroups,
  });

  const groups = groupsData?.data?.groups || [];

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) setSelectedGroupId(groups[0]._id);
  }, [groups, selectedGroupId]);

  const selectedGroup = groups.find((g) => g._id === selectedGroupId);

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['analytics-monthly', selectedGroupId],
    queryFn: () => analyticsService.getMonthlySpending(selectedGroupId, 6),
    enabled: Boolean(selectedGroupId),
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['analytics-categories', selectedGroupId],
    queryFn: () => analyticsService.getCategoryBreakdown(selectedGroupId),
    enabled: Boolean(selectedGroupId),
  });

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ['analytics-weekly', selectedGroupId],
    queryFn: () => analyticsService.getWeeklyTrend(selectedGroupId, 8),
    enabled: Boolean(selectedGroupId),
  });

  const { data: contributorsData, isLoading: contributorsLoading } = useQuery({
    queryKey: ['analytics-contributors', selectedGroupId],
    queryFn: () => analyticsService.getTopContributors(selectedGroupId, 5),
    enabled: Boolean(selectedGroupId),
  });

  if (groupsLoading) return <FullScreenLoader />;

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description="Create a group and log a few expenses to see analytics here."
        action={
          <Link to="/groups" className="btn-primary">
            <Plus className="h-4 w-4" /> Create a group
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">Analytics</h1>
          <p className="text-sm text-ink-400 mt-1">Deep dive into a group's spending patterns.</p>
        </div>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="input-field sm:w-56"
        >
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-display text-sm font-semibold text-ink-100 mb-4">Monthly spending (last 6 months)</h2>
          {monthlyLoading ? <CardSkeleton /> : <MonthlyBarChart data={monthlyData?.data?.data} />}
        </div>
        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold text-ink-100 mb-4">Category breakdown</h2>
          {categoryLoading ? <CardSkeleton /> : <CategoryPieChart data={categoryData?.data?.data} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold text-ink-100 mb-4">Weekly trend (last 8 weeks)</h2>
          {weeklyLoading ? <CardSkeleton /> : <WeeklyTrendChart data={weeklyData?.data?.data} />}
        </div>
        <div className="glass-card p-6">
          <h2 className="font-display text-sm font-semibold text-ink-100 mb-4">Top contributors</h2>
          {contributorsLoading ? (
            <CardSkeleton />
          ) : (
            <TopContributors data={contributorsData?.data?.data} currency={selectedGroup?.currency} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
