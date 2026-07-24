import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pin, Users } from 'lucide-react';
import clsx from 'clsx';
import Avatar from '../ui/Avatar';

const GroupCard = ({ group, onTogglePin }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/groups/${group._id}`);
  };

  const handlePinClick = (e) => {
    // Prevent the click from bubbling up to the card and triggering navigation.
    e.stopPropagation();
    onTogglePin(group._id);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
      className="glass-card p-5 transition-shadow hover:shadow-card-hover cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={group.name} src={group.image} size="md" />
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-ink-100 truncate">{group.name}</h3>
            <p className="text-xs text-ink-500 flex items-center gap-1">
              <Users className="h-3 w-3" /> {group.memberCount} members
            </p>
          </div>
        </div>
        <button
          onClick={handlePinClick}
          className={clsx(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
            group.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-ink-600 hover:text-ink-300 hover:bg-white/[0.05]'
          )}
          aria-label={group.isPinned ? 'Unpin group' : 'Pin group'}
        >
          <Pin className={clsx('h-3.5 w-3.5', group.isPinned && 'fill-current')} />
        </button>
      </div>

      <div className="flex -space-x-2 mb-4">
        {group.members.slice(0, 5).map((m) => (
          <Avatar key={m.user._id} name={m.user.name} src={m.user.avatar} size="xs" ring />
        ))}
        {group.members.length > 5 && (
          <div className="h-6 w-6 rounded-full bg-base-700 border-2 border-base-900 flex items-center justify-center text-[9px] text-ink-400">
            +{group.members.length - 5}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <span className="text-xs text-ink-500">Total spent</span>
        <span className="text-sm font-semibold text-ink-100 figure">
          {group.currency} {group.totalExpenses?.toFixed(2) || '0.00'}
        </span>
      </div>
    </motion.div>
  );
};

export default GroupCard;