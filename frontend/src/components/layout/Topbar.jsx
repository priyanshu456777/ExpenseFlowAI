import { Search, Sun, Moon, Menu, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ProfileMenu from './ProfileMenu';

const Topbar = ({ onMenuClick, onQuickAdd, onSearchClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-base-900/80 backdrop-blur-xl px-4 lg:px-8">
      <button
        onClick={onMenuClick}
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-ink-400 hover:bg-white/[0.05]"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onSearchClick}
        className="flex-1 max-w-md relative hidden sm:flex items-center rounded-xl border border-white/10 bg-base-900/60 px-4 py-2 text-left text-sm text-ink-500 hover:border-white/20 transition-colors"
      >
        <Search className="h-4 w-4 mr-2.5 flex-shrink-0" />
        <span className="flex-1">Search groups, expenses...</span>
        <kbd className="text-[10px] text-ink-600 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/10">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-2">
        <button onClick={onQuickAdd} className="btn-primary hidden sm:inline-flex py-2 px-4 text-sm">
          <Plus className="h-4 w-4" />
          Add expense
        </button>
        <button
          onClick={onQuickAdd}
          className="sm:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white"
          aria-label="Add expense"
        >
          <Plus className="h-5 w-5" />
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-400 hover:text-ink-100 hover:bg-white/[0.05] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Topbar;
