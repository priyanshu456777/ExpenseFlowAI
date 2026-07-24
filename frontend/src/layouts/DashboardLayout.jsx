import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import CommandPalette from '../components/layout/CommandPalette';

const DashboardLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-base-900">
      <Sidebar />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.div
              key="mobile-nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-base-800 border-r border-white/[0.06] lg:hidden"
            >
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-white/[0.05]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <Topbar
          onMenuClick={() => setMobileNavOpen(true)}
          onQuickAdd={() => navigate('/expenses')}
          onSearchClick={() => setCommandPaletteOpen(true)}
        />
        <main className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

export default DashboardLayout;