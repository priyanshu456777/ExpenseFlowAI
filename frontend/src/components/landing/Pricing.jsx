import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import clsx from 'clsx';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    description: 'For small groups getting started',
    features: ['Up to 3 groups', 'Unlimited expenses', 'Smart settlement engine', 'Basic analytics'],
    cta: 'Start for free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '6',
    description: 'For frequent splitters and trip planners',
    features: [
      'Unlimited groups',
      'Receipt uploads & PDF export',
      'Full analytics & smart insights',
      'Priority support',
      'Custom categories',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    name: 'Teams',
    price: '14',
    description: 'For shared households & small businesses',
    features: ['Everything in Pro', 'Admin controls', 'Audit log & activity history', 'Dedicated onboarding'],
    cta: 'Talk to us',
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="relative px-6 py-24 bg-base-800/30">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Pricing</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink-100">Simple pricing, no surprises</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={clsx(
                'relative rounded-2xl border p-8',
                plan.highlighted
                  ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.08] to-transparent shadow-glow'
                  : 'border-white/[0.06] bg-base-800/40'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-indigo">Most popular</span>
              )}
              <h3 className="font-display text-lg font-semibold text-ink-100">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-400">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-ink-100 figure">${plan.price}</span>
                <span className="text-sm text-ink-500">/month</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-ink-300">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={clsx('mt-8 w-full', plan.highlighted ? 'btn-primary' : 'btn-secondary')}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
