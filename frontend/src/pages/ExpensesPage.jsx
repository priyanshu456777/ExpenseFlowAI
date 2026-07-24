import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Receipt, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { groupService } from '../services/endpoints';
import ExpenseList from '../components/expenses/ExpenseList';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import EmptyState from '../components/ui/EmptyState';
import FullScreenLoader from '../components/ui/FullScreenLoader';

const ExpensesPage = () => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-groups'],
    queryFn: groupService.getMyGroups,
  });

  const groups = data?.data?.groups || [];

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0]._id);
    }
  }, [groups, selectedGroupId]);

  const selectedGroup = groups.find((g) => g._id === selectedGroupId);

  if (isLoading) return <FullScreenLoader />;

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No groups yet"
        description="Create a group first — expenses always belong to a group."
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
          <h1 className="font-display text-2xl font-bold text-ink-100">Expenses</h1>
          <p className="text-sm text-ink-400 mt-1">View and log expenses for any of your groups.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="input-field sm:w-52"
          >
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button onClick={() => setAddExpenseOpen(true)} className="btn-primary flex-shrink-0">
            <Plus className="h-4 w-4" /> Add expense
          </button>
        </div>
      </div>

      {selectedGroup && (
        <>
          <ExpenseList groupId={selectedGroup._id} currency={selectedGroup.currency} groupName={selectedGroup.name} />
          <AddExpenseModal
            isOpen={addExpenseOpen}
            onClose={() => setAddExpenseOpen(false)}
            group={selectedGroup}
          />
        </>
      )}
    </div>
  );
};

export default ExpensesPage;
