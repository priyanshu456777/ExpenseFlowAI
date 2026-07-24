import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';

const MEDAL_COLORS = ['text-amber-400', 'text-ink-300', 'text-amber-600'];

const TopContributors = ({ data, currency }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-500 text-center py-16">No contributor data yet.</p>;
  }

  const maxPaid = Math.max(...data.map((d) => d.totalPaid));

  return (
    <div className="space-y-3">
      {data.map((c, i) => (
        <motion.div
          key={c.user._id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3"
        >
          <span className={`w-5 text-sm font-bold ${MEDAL_COLORS[i] || 'text-ink-600'}`}>{i + 1}</span>
          <Avatar name={c.user.name} src={c.user.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-ink-200 truncate">{c.user.name}</span>
              <span className="text-sm font-semibold text-ink-100 figure">
                {currency} {c.totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-base-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-brand"
                style={{ width: `${(c.totalPaid / maxPaid) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TopContributors;
