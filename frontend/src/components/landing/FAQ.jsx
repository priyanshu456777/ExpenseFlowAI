import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the Smart Settlement Engine actually work?',
    a: "It treats every group balance as a debt graph, then greedily matches whoever's owed the most with whoever owes the most, settling the smaller amount between them each round. This collapses long chains of debt into the fewest possible direct payments — no manual math needed.",
  },
  {
    q: 'Can I split an expense unevenly?',
    a: 'Yes — choose equal, unequal (exact amounts), percentage-based, or share-based splitting for any expense. The math recalculates in real time as you adjust values.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Authentication uses JWT tokens in httpOnly cookies, passwords are hashed with bcrypt, and every API route is protected with rate limiting, input sanitization, and role-based access control.',
  },
  {
    q: 'What happens if someone leaves a group with an unpaid balance?',
    a: "We block removing or leaving a group until all of that member's shares are settled, so balances can never silently disappear.",
  },
  {
    q: 'Do you support multiple currencies?',
    a: 'Each group has its own base currency, and your personal profile currency is used for cross-group dashboard totals.',
  },
];

const FAQItem = ({ faq, isOpen, onClick }) => (
  <div className="border-b border-white/[0.06]">
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between py-5 text-left"
      aria-expanded={isOpen}
    >
      <span className="font-medium text-ink-100 pr-6">{faq.q}</span>
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-ink-500" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-sm leading-relaxed text-ink-400 pr-10">{faq.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">FAQ</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-ink-100">Questions, answered</h2>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.q}
              faq={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
