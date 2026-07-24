import { motion } from 'framer-motion';

const FullScreenLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-base-900">
    <motion.div
      className="h-10 w-10 rounded-full border-2 border-white/10 border-t-indigo-500"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    />
  </div>
);

export default FullScreenLoader;
