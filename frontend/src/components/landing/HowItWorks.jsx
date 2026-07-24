import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Create a group',
    description: 'Add your roommates, trip crew, or team. Invite by link or email in seconds.',
  },
  {
    number: '02',
    title: 'Log expenses as they happen',
    description: 'Snap a receipt, pick a split type, done. Everyone sees it update live.',
  },
  {
    number: '03',
    title: 'The engine does the math',
    description: 'Our settlement algorithm continuously recalculates the fewest payments needed to zero every balance.',
  },
  {
    number: '04',
    title: 'Settle in one tap',
    description: "Follow the suggested payments, mark them paid, and you're done — no chasing required.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative px-6 py-24 bg-base-800/30">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">The process</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink-100">From chaos to settled in four steps</h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/40 to-emerald-500/40 hidden sm:block" />

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex gap-6 sm:pl-2"
              >
                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-base-800 border border-white/10 font-mono text-sm font-semibold text-indigo-400">
                  {step.number}
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-lg font-semibold text-ink-100 mb-1.5">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-400 max-w-lg">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
