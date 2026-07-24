import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center"
  >
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Icon className="h-6 w-6 text-ink-400" strokeWidth={1.5} />
      </div>
    )}
    <h3 className="font-display text-base font-semibold text-ink-100">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm text-ink-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
