import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Award, Crown, BarChart3, Tag, HeartPulse, PiggyBank } from 'lucide-react';
import { insightService } from '../../services/endpoints';
import { CardSkeleton } from '../ui/Skeleton';

const InsightCard = ({ icon: Icon, label, children, accent = 'indigo' }) => {
  const accentClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
      </div>
      {children}
    </motion.div>
  );
};

const InsightsTab = ({ groupId, currency }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['group-insights', groupId],
    queryFn: () => insightService.getGroupInsights(groupId),
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const insights = data?.data;
  if (!insights) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <InsightCard icon={Calendar} label="Highest spending month" accent="indigo">
        {insights.highestSpendingMonth ? (
          <>
            <p className="font-display text-lg font-bold text-ink-100">{insights.highestSpendingMonth.label}</p>
            <p className="text-sm text-ink-400 figure">
              {currency} {insights.highestSpendingMonth.total.toFixed(2)}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-500">Not enough data yet.</p>
        )}
      </InsightCard>

      <InsightCard icon={Crown} label="Largest expense" accent="amber">
        {insights.largestExpense ? (
          <>
            <p className="font-display text-base font-bold text-ink-100 truncate">{insights.largestExpense.description}</p>
            <p className="text-sm text-ink-400 figure">
              {currency} {insights.largestExpense.amount.toFixed(2)} · {insights.largestExpense.category}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-500">Not enough data yet.</p>
        )}
      </InsightCard>

      <InsightCard icon={Award} label="Most active member" accent="violet">
        {insights.mostActiveMember ? (
          <>
            <p className="font-display text-base font-bold text-ink-100">{insights.mostActiveMember.user?.name}</p>
            <p className="text-sm text-ink-400">{insights.mostActiveMember.expenseCount} expenses logged</p>
          </>
        ) : (
          <p className="text-sm text-ink-500">Not enough data yet.</p>
        )}
      </InsightCard>

      <InsightCard icon={TrendingUp} label="Highest contributor" accent="emerald">
        {insights.highestContributor ? (
          <>
            <p className="font-display text-base font-bold text-ink-100">{insights.highestContributor.user?.name}</p>
            <p className="text-sm text-ink-400 figure">
              {currency} {insights.highestContributor.totalPaid.toFixed(2)} paid
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-500">Not enough data yet.</p>
        )}
      </InsightCard>

      <InsightCard icon={BarChart3} label="Average monthly expense" accent="indigo">
        <p className="font-display text-lg font-bold text-ink-100 figure">
          {currency} {(insights.averageMonthlyExpense || 0).toFixed(2)}
        </p>
      </InsightCard>

      <InsightCard icon={Tag} label="Most frequent category" accent="violet">
        {insights.mostFrequentCategory ? (
          <>
            <p className="font-display text-base font-bold text-ink-100">{insights.mostFrequentCategory.category}</p>
            <p className="text-sm text-ink-400">{insights.mostFrequentCategory.count} expenses</p>
          </>
        ) : (
          <p className="text-sm text-ink-500">Not enough data yet.</p>
        )}
      </InsightCard>

      <div className="sm:col-span-2 lg:col-span-3">
        <InsightCard icon={HeartPulse} label="Financial health score" accent="emerald">
          {insights.financialHealthScore && (
            <div className="flex items-center gap-6">
              <div>
                <p className="font-display text-3xl font-bold text-ink-100 figure">
                  {insights.financialHealthScore.score}
                  <span className="text-base text-ink-500">/100</span>
                </p>
                <span className="badge-emerald mt-1 inline-flex">{insights.financialHealthScore.rating}</span>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-ink-500 mb-1">Debt</p>
                  <p className="text-sm font-semibold text-ink-200 figure">
                    {insights.financialHealthScore.breakdown.debtScore.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-1">Settlement</p>
                  <p className="text-sm font-semibold text-ink-200 figure">
                    {insights.financialHealthScore.breakdown.settlementScore.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-1">Consistency</p>
                  <p className="text-sm font-semibold text-ink-200 figure">
                    {insights.financialHealthScore.breakdown.consistencyScore.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </InsightCard>
      </div>

      {insights.budgetSuggestion && (
        <div className="sm:col-span-2 lg:col-span-3">
          <InsightCard icon={PiggyBank} label="Budget suggestion" accent="amber">
            <p className="text-sm text-ink-300 leading-relaxed">{insights.budgetSuggestion.message}</p>
          </InsightCard>
        </div>
      )}
    </div>
  );
};

export default InsightsTab;
