import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import Avatar from '../ui/Avatar';

const TESTIMONIALS = [
  {
    name: 'Priya Nair',
    role: 'Roommate group of 4, Bangalore',
    quote:
      "We used to spend Sunday nights arguing about rent splits. Now the app just tells us the two payments we need to make. That's it.",
  },
  {
    name: 'Marcus Webb',
    role: 'Trip organizer, 9-person Bali trip',
    quote:
      'Nine people, three currencies, two weeks of chaos — and it still collapsed everything into four final transfers.',
  },
  {
    name: 'Sofia Reyes',
    role: 'Small team lead',
    quote:
      "The insights cards caught a spending pattern none of us had noticed. Turned into a real conversation about our team lunch budget.",
  },
];

const Testimonials = () => {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">Real groups</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink-100">Loved by people who hate math</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col"
            >
              <Quote className="h-6 w-6 text-indigo-500/40 mb-4" />
              <p className="text-sm leading-relaxed text-ink-300 flex-1">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar name={t.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-ink-100">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
