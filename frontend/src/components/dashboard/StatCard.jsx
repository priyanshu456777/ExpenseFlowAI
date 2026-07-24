import { motion } from 'framer-motion';
import clsx from 'clsx';

const StatCard = ({ label, value, icon: Icon, trend, accent = 'indigo', prefix = '' }) => {
  const accentClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-400',
    rose: 'bg-rose-500/10 text-rose-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass-card p-5 transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500 mb-2">{label}</p>
          <p className="font-display text-2xl font-bold text-ink-100 figure">
            {prefix}
            {value}
          </p>
        </div>
        {Icon && (
          <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', accentClasses[accent])}>
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
        )}
      </div>
      {trend && (
        <p className={clsx('mt-3 text-xs font-medium', trend.positive ? 'text-emerald-400' : 'text-rose-400')}>
          {trend.text}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
