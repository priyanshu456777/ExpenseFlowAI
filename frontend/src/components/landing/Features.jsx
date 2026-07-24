import { motion } from 'framer-motion';
import { Zap, PieChart, Users, ShieldCheck, Sparkles, Receipt } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Settlement Engine',
    description: 'Optimizes every group debt into the minimum number of payments — automatically, every time.',
    color: 'text-indigo-400 bg-indigo-500/10',
  },
  {
    icon: PieChart,
    title: 'Real-time Analytics',
    description: 'Category breakdowns, spending trends, and top contributors — visualized the moment an expense lands.',
    color: 'text-violet-400 bg-violet-500/10',
  },
  {
    icon: Users,
    title: 'Flexible Splitting',
    description: 'Equal, unequal, percentage, or share-based — every split type calculates instantly as you type.',
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: Sparkles,
    title: 'Smart Insights',
    description: 'A financial health score and budget suggestions generated from your own data — no black-box AI.',
    color: 'text-amber-400 bg-amber-500/10',
  },
  {
    icon: Receipt,
    title: 'Receipt Uploads',
    description: 'Attach photos or PDFs to any expense so nothing gets lost in a group chat scroll.',
    color: 'text-rose-400 bg-rose-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-grade Security',
    description: 'JWT auth, encrypted cookies, and rate limiting keep every group\'s finances locked down.',
    color: 'text-indigo-400 bg-indigo-500/10',
  },
];

const Features = () => {
  return (
    <section id="features" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Why ExpenseFlow AI</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink-100">
            Everything a group needs, nothing it doesn't
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 transition-shadow duration-300 hover:shadow-card-hover"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} mb-4`}>
                <feature.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base font-semibold text-ink-100 mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-ink-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
