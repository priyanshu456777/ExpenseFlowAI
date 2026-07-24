import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: 12000, suffix: '+', label: 'Active groups' },
  { value: 2400000, prefix: '$', abbreviate: true, label: 'Expenses tracked' },
  { value: 68, suffix: '%', label: 'Fewer transactions per settlement' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
];

const abbreviateNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
};

const Counter = ({ value, prefix = '', suffix = '', abbreviate = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  const formatted = abbreviate ? abbreviateNumber(display) : Number.isInteger(value) ? Math.round(display) : display.toFixed(1);

  return (
    <span ref={ref} className="figure">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-brand">
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} abbreviate={stat.abbreviate} />
              </div>
              <p className="mt-2 text-sm text-ink-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
