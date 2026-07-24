import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-base-900 flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-sm"
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Compass className="h-7 w-7 text-ink-400" strokeWidth={1.5} />
      </div>
      <h1 className="font-display text-5xl font-bold text-transparent bg-clip-text bg-gradient-brand mb-3">404</h1>
      <p className="text-ink-300 font-medium mb-2">This page doesn't add up.</p>
      <p className="text-sm text-ink-500 mb-8">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
