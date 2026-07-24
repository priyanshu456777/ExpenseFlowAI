import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Users, Users2, Receipt, CheckCircle2, Ban, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import StatCard from '../../components/dashboard/StatCard';
import { RowSkeleton } from '../../components/ui/Skeleton';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'groups', label: 'Groups' },
  { id: 'settings', label: 'Settings' },
];

const AdminOverview = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminService.getDashboard });
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5 h-28 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total users" value={stats?.totalUsers || 0} icon={Users} accent="indigo" />
      <StatCard label="Total groups" value={stats?.totalGroups || 0} icon={Users2} accent="violet" />
      <StatCard
        label="Total expenses"
        value={stats?.totalExpenseAmount?.toFixed(2) || '0.00'}
        prefix="$"
        icon={Receipt}
        accent="emerald"
      />
      <StatCard label="Settlements completed" value={stats?.totalCompletedSettlements || 0} icon={CheckCircle2} accent="amber" />
    </div>
  );
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminService.listUsers({ limit: 20 }) });
  const users = data?.data?.users || [];

  const handleToggleSuspend = async (id) => {
    try {
      await adminService.toggleSuspension(id);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4 divide-y divide-white/[0.04]">
        {[...Array(5)].map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card divide-y divide-white/[0.04]">
      {users.map((u) => (
        <div key={u._id} className="flex items-center gap-3 px-5 py-3.5">
          <Avatar name={u.name} src={u.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-200 truncate">{u.name}</p>
            <p className="text-xs text-ink-500 truncate">{u.email}</p>
          </div>
          {u.role === 'admin' && (
            <span className="badge-indigo">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          )}
          {u.isSuspended && <span className="badge-rose">Suspended</span>}
          {u.role !== 'admin' && (
            <button
              onClick={() => handleToggleSuspend(u._id)}
              className={clsx('btn-secondary text-xs py-1.5 px-3', u.isSuspended && 'text-emerald-400')}
            >
              <Ban className="h-3.5 w-3.5" /> {u.isSuspended ? 'Unsuspend' : 'Suspend'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const AdminGroups = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin-groups'], queryFn: () => adminService.listGroups({ limit: 20 }) });
  const groups = data?.data?.groups || [];

  if (isLoading) {
    return (
      <div className="glass-card p-4 divide-y divide-white/[0.04]">
        {[...Array(5)].map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card divide-y divide-white/[0.04]">
      {groups.map((g) => (
        <div key={g._id} className="flex items-center gap-3 px-5 py-3.5">
          <Avatar name={g.name} src={g.image} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-200 truncate">{g.name}</p>
            <p className="text-xs text-ink-500 truncate">Owner: {g.createdBy?.name}</p>
          </div>
          <span className="text-sm font-medium text-ink-100 figure">
            {g.currency} {g.totalExpenses?.toFixed(2) || '0.00'}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: adminService.getSettings });
  const settings = data?.data?.settings;
  const [saving, setSaving] = useState(false);

  const handleToggle = async (field) => {
    setSaving(true);
    try {
      await adminService.updateSettings({ [field]: !settings[field] });
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !settings) return <div className="glass-card p-6 h-40 skeleton" />;

  return (
    <div className="glass-card p-6 space-y-5 max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-100">Maintenance mode</p>
          <p className="text-xs text-ink-500">Temporarily disable access for non-admins</p>
        </div>
        <button
          disabled={saving}
          onClick={() => handleToggle('maintenanceMode')}
          className={clsx(
            'relative h-6 w-11 rounded-full transition-colors',
            settings.maintenanceMode ? 'bg-indigo-500' : 'bg-base-700'
          )}
        >
          <span
            className={clsx(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
              settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-100">Allow new registrations</p>
          <p className="text-xs text-ink-500">Let new users sign up</p>
        </div>
        <button
          disabled={saving}
          onClick={() => handleToggle('allowNewRegistrations')}
          className={clsx(
            'relative h-6 w-11 rounded-full transition-colors',
            settings.allowNewRegistrations ? 'bg-indigo-500' : 'bg-base-700'
          )}
        >
          <span
            className={clsx(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
              settings.allowNewRegistrations ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-100">Admin Panel</h1>
        <p className="text-sm text-ink-400 mt-1">Platform-wide stats and management.</p>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id ? 'text-ink-100' : 'text-ink-500 hover:text-ink-300'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="admin-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-brand rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <AdminOverview />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'groups' && <AdminGroups />}
      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
};

export default AdminPage;
