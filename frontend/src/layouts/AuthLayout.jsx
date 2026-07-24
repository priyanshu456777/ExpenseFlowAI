import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

const SELLING_POINTS = [
  { icon: Zap, text: 'Settlements optimized to the fewest possible payments' },
  { icon: TrendingUp, text: 'Real-time analytics on every group\'s spending' },
  { icon: ShieldCheck, text: 'JWT auth with httpOnly cookies, bcrypt-hashed passwords' },
];

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-base-900 flex">
      {/* Branding panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-base-800/40 border-r border-white/[0.06] flex-col justify-between p-12">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_30%_20%,black,transparent)]" />
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-gradient-brand opacity-[0.12] blur-[100px]" />

        <Link to="/" className="relative flex items-center gap-2 z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
            <Wallet className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold text-ink-100">
            ExpenseFlow <span className="text-transparent bg-clip-text bg-gradient-brand">AI</span>
          </span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-ink-100 leading-tight mb-8 max-w-md">
            Smart expense splitting made beautiful.
          </h2>
          <div className="space-y-5">
            {SELLING_POINTS.map((point, i) => (
              <motion.div
                key={point.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                  <point.icon className="h-4 w-4 text-indigo-400" />
                </div>
                <p className="text-sm text-ink-400 pt-1.5">{point.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-ink-600">© {new Date().getFullYear()} ExpenseFlow AI</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Wallet className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold text-ink-100">ExpenseFlow AI</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-ink-100 mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-ink-400 mb-8">{subtitle}</p>}

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
