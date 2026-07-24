import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Receipt, Scale, Sparkles, Users2, Clock } from 'lucide-react';
import clsx from 'clsx';
import { groupService } from '../services/endpoints';
import Avatar from '../components/ui/Avatar';
import FullScreenLoader from '../components/ui/FullScreenLoader';
import ExpenseList from '../components/expenses/ExpenseList';
import BalancesTab from '../components/groups/BalancesTab';
import InsightsTab from '../components/groups/InsightsTab';
import MembersTab from '../components/groups/MembersTab';
import ActivityTab from '../components/groups/ActivityTab';
import AddExpenseModal from '../components/expenses/AddExpenseModal';

const TABS = [
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'balances', label: 'Balances', icon: Scale },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'activity', label: 'Activity', icon: Clock },
  { id: 'members', label: 'Members', icon: Users2 },
];

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState('expenses');
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupService.getById(groupId),
  });

  const group = data?.data?.group;

  if (isLoading) return <FullScreenLoader />;
  if (!group) return null;

  return (
    <div className="space-y-6">
      <Link to="/groups" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to groups
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={group.name} src={group.image} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-100">{group.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex -space-x-2">
                {group.members.slice(0, 5).map((m) => (
                  <Avatar key={m.user._id} name={m.user.name} src={m.user.avatar} size="xs" ring />
                ))}
              </div>
              <span className="text-xs text-ink-500">{group.members.length} members</span>
            </div>
          </div>
        </div>
        <button onClick={() => setAddExpenseOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id ? 'text-ink-100' : 'text-ink-500 hover:text-ink-300'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="group-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-brand rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'expenses' && (
          <ExpenseList groupId={group._id} currency={group.currency} groupName={group.name} />
        )}
        {activeTab === 'balances' && <BalancesTab groupId={group._id} currency={group.currency} />}
        {activeTab === 'insights' && <InsightsTab groupId={group._id} currency={group.currency} />}
        {activeTab === 'activity' && <ActivityTab groupId={group._id} />}
        {activeTab === 'members' && <MembersTab group={group} />}
      </div>

      <AddExpenseModal isOpen={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} group={group} />
    </div>
  );
};

export default GroupDetailPage;
