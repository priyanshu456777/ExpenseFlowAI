import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import SettlementFlowVisual from './SettlementFlowVisual';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 px-6">
      {/* Ambient background: animated gradient glow + subtle grid */}
      <div className="absolute inset-0 bg-gradient-radial-glow" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-brand opacity-[0.15] blur-[120px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Minimum transactions, maximum clarity
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-ink-100">
              Split expenses.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-brand">Settle in one move.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-ink-400 leading-relaxed">
              ExpenseFlow AI collapses tangled group debts into the fewest possible
              payments automatically. No more "who owes who" spreadsheets — just
              clean, optimized settlements.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-base px-7 py-3.5">
                Start splitting for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-7 py-3.5">
                See how it works
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-ink-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500'].map((c, i) => (
                    <div key={i} className={`h-7 w-7 rounded-full border-2 border-base-900 ${c}`} />
                  ))}
                </div>
                <span>Trusted by 12,000+ groups</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card p-8 lg:p-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-500">
                Smart Settlement Engine
              </span>
              <span className="badge-emerald">Live</span>
            </div>
            <SettlementFlowVisual />
            <p className="mt-6 text-center text-sm text-ink-500">
              4 people, 4 debts — collapsed into <span className="text-emerald-400 font-medium">1 payment</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
