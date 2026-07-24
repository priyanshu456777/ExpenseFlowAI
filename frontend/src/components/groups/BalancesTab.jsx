import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, Sparkles, CheckCircle2, Clock3 } from 'lucide-react';
import { settlementService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { celebrateSettlement } from '../../utils/confetti';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import { CardSkeleton } from '../ui/Skeleton';

const BalancesTab = ({ groupId, currency }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: balancesData, isLoading: balancesLoading } = useQuery({
    queryKey: ['group-balances', groupId],
    queryFn: () => settlementService.getBalances(groupId),
  });

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['group-suggestions', groupId],
    queryFn: () => settlementService.getSuggestions(groupId),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['group-settlement-history', groupId, 'pending'],
    queryFn: () => settlementService.getHistory(groupId, { status: 'pending', limit: 20 }),
  });

  const balances = balancesData?.data?.balances || [];
  const suggestions = suggestionsData?.data?.transactions || [];
  const pendingForMe = (historyData?.data?.settlements || []).filter((s) => s.to._id === user._id);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    queryClient.invalidateQueries({ queryKey: ['group-suggestions', groupId] });
    queryClient.invalidateQueries({ queryKey: ['group-settlement-history', groupId] });
    queryClient.invalidateQueries({ queryKey: ['group-activity', groupId] });
  };

  const handleRecordSettlement = async (to, amount) => {
    try {
      await settlementService.record({ group: groupId, to, amount, isSuggested: true });
      toast.success('Settlement recorded. Awaiting confirmation from the recipient.');
      invalidateAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleConfirmReceived = async (settlementId) => {
    try {
      await settlementService.updateStatus(settlementId, 'completed');
      toast.success('Payment confirmed!');
      celebrateSettlement();
      invalidateAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (balancesLoading || suggestionsLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!historyLoading && pendingForMe.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-sm font-semibold text-ink-100">Awaiting your confirmation</h3>
          </div>
          <div className="space-y-3">
            {pendingForMe.map((s) => (
              <div key={s._id} className="glass-card p-4 flex items-center gap-3">
                <Avatar name={s.from.name} src={s.from.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-200">
                    {s.from.name} says they paid you{' '}
                    <span className="font-semibold figure">
                      {currency} {s.amount.toFixed(2)}
                    </span>
                  </p>
                </div>
                <button onClick={() => handleConfirmReceived(s._id)} className="btn-primary text-xs py-2 px-3">
                  Confirm received
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-100 mb-4">Member balances</h3>
          {balances.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="All settled up" description="No outstanding balances in this group." />
          ) : (
            <div className="glass-card divide-y divide-white/[0.04]">
              {balances.map((b) => (
                <div key={b.user._id} className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar name={b.user.name} src={b.user.avatar} size="sm" />
                  <span className="flex-1 text-sm text-ink-200 truncate">
                    {b.user._id === user._id ? 'You' : b.user.name}
                  </span>
                  <span
                    className={`text-sm font-semibold figure ${b.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                  >
                    {b.balance >= 0 ? '+' : ''}
                    {currency} {b.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display text-sm font-semibold text-ink-100">Smart settlement suggestions</h3>
          </div>
          {suggestions.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nothing to settle" description="The group is already balanced." />
          ) : (
            <div className="space-y-3">
              {suggestions.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center gap-3"
                >
                  <Avatar name={t.from.name} src={t.from.avatar} size="sm" />
                  <ArrowRight className="h-4 w-4 text-ink-500 flex-shrink-0" />
                  <Avatar name={t.to.name} src={t.to.avatar} size="sm" />
                  <div className="flex-1 min-w-0 ml-1">
                    <p className="text-xs text-ink-400 truncate">
                      {t.from.name} → {t.to.name}
                    </p>
                    <p className="text-sm font-semibold text-ink-100 figure">
                      {currency} {t.amount.toFixed(2)}
                    </p>
                  </div>
                  {t.from._id === user._id && (
                    <button
                      onClick={() => handleRecordSettlement(t.to._id, t.amount)}
                      className="btn-secondary text-xs py-2 px-3 flex-shrink-0"
                    >
                      Mark paid
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalancesTab;
