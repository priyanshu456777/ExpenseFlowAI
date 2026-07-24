import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Receipt,
  PieChart,
  Bell,
  Settings,
  ShieldCheck,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ mobile = false, onNavigate }) => {
  const { user, isAdmin, logout } = useAuth();

  // Desktop: fixed, translucent, hidden below the lg breakpoint (Topbar's
  // hamburger button opens the mobile drawer instead).
  // Mobile (inside the drawer in DashboardLayout): plain full-width flex
  // column, solid background, no fixed positioning — the drawer's own
  // motion.div already handles positioning/animation, so Sidebar just needs
  // to fill it and be fully opaque (readable over the dashboard behind it).
  const asideClasses = mobile
    ? 'flex w-full flex-col bg-base-800'
    : 'hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 left-0 z-30 border-r border-white/[0.06] bg-base-800/40 backdrop-blur-xl';

  return (
    <aside className={asideClasses}>
      <div className="flex items-center gap-2 px-6 h-16 border-b border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
          <Wallet className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display text-base font-bold text-ink-100">ExpenseFlow AI</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-ink-100' : 'text-ink-400 hover:text-ink-100 hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.06]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon className="relative h-4.5 w-4.5" strokeWidth={2} />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-violet-300 bg-violet-500/10' : 'text-ink-400 hover:text-ink-100 hover:bg-white/[0.04]'
              }`
            }
          >
            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-100 truncate">{user?.name}</p>
            <p className="text-xs text-ink-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:text-rose-400 hover:bg-rose-500/10"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;