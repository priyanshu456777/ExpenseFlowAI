import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search,
  Plane,
  Utensils,
  ShoppingBag,
  Receipt,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Download,
} from 'lucide-react';
import { expenseService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';
import { exportExpensesToCSV } from '../../utils/exportCsv';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { RowSkeleton } from '../ui/Skeleton';

const CATEGORY_ICONS = {
  Travel: Plane,
  Food: Utensils,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Clapperboard,
  Health: HeartPulse,
  Education: GraduationCap,
  Others: MoreHorizontal,
};

const CATEGORIES = ['All', 'Travel', 'Food', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Others'];

const ExpenseList = ({ groupId, currency, groupName }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['group-expenses', groupId, { search, category, page }],
    queryFn: () =>
      expenseService.getGroupExpenses(groupId, {
        search: search || undefined,
        category: category === 'All' ? undefined : category,
        page,
        limit: 10,
      }),
    keepPreviousData: true,
  });

  const expenses = data?.data?.expenses || [];
  const pagination = data?.meta?.pagination;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: fullData } = await expenseService.getGroupExpenses(groupId, {
        search: search || undefined,
        category: category === 'All' ? undefined : category,
        limit: 5000,
      });
      if (!fullData.expenses.length) {
        toast.error('No expenses to export.');
        return;
      }
      exportExpensesToCSV(fullData.expenses, groupName);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="input-field sm:w-44"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button onClick={handleExport} disabled={isExporting} className="btn-secondary flex-shrink-0">
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {isLoading ? (
        <div className="glass-card p-4 divide-y divide-white/[0.04]">
          {[...Array(4)].map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses found" description="Try adjusting your search or filters, or add a new expense." />
      ) : (
        <div className="glass-card divide-y divide-white/[0.04]">
          {expenses.map((expense, i) => {
            const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal;
            return (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-100 truncate">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Avatar name={expense.paidBy?.name} src={expense.paidBy?.avatar} size="xs" />
                    <p className="text-xs text-ink-500">
                      Paid by {expense.paidBy?.name} · {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-ink-100 figure flex-shrink-0">
                  {currency} {expense.amount.toFixed(2)}
                </span>
              </motion.div>
            );
          })}
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

export default ExpenseList;
