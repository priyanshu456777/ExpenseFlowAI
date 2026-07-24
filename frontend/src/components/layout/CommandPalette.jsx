import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Receipt,
  PieChart,
  Bell,
  Settings,
  Plus,
  LogIn,
  Search,
} from 'lucide-react';
import { createPortal } from 'react-dom';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', keywords: 'home overview' },
  { id: 'groups', label: 'Go to Groups', icon: Users, path: '/groups', keywords: 'group friends' },
  { id: 'expenses', label: 'Go to Expenses', icon: Receipt, path: '/expenses', keywords: 'bill spend' },
  { id: 'analytics', label: 'Go to Analytics', icon: PieChart, path: '/analytics', keywords: 'charts stats' },
  { id: 'notifications', label: 'Go to Notifications', icon: Bell, path: '/notifications', keywords: 'alerts' },
  { id: 'settings', label: 'Go to Profile & Settings', icon: Settings, path: '/settings', keywords: 'account profile' },
  { id: 'create-group', label: 'Create a new group', icon: Plus, path: '/groups?action=create', keywords: 'new' },
  { id: 'join-group', label: 'Join a group with a code', icon: LogIn, path: '/groups?action=join', keywords: 'invite code' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) || cmd.keywords.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (cmd) => {
    navigate(cmd.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg glass-card p-0 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search className="h-4 w-4 text-ink-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands or pages..."
                className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
              />
              <kbd className="text-[10px] text-ink-600 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/10">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-ink-500 text-center py-8">No matching commands.</p>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                      i === selectedIndex ? 'bg-indigo-500/15 text-ink-100' : 'text-ink-300'
                    }`}
                  >
                    <cmd.icon className="h-4 w-4 flex-shrink-0" />
                    {cmd.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CommandPalette;
