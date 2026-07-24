import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus, Crown, Shield, MoreVertical, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import InviteMemberModal from './InviteMemberModal';
import { groupService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ROLE_BADGES = {
  owner: { icon: Crown, className: 'badge-amber' },
  admin: { icon: Shield, className: 'badge-indigo' },
  member: { icon: null, className: 'badge bg-white/[0.04] text-ink-400 border border-white/10' },
};

const MembersTab = ({ group }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const myRole = group.members.find((m) => m.user._id === user._id)?.role;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const handleRemove = async (memberId) => {
    try {
      await groupService.removeMember(group._id, memberId);
      toast.success('Member removed.');
      queryClient.invalidateQueries({ queryKey: ['group', group._id] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      await groupService.updateMemberRole(group._id, memberId, role);
      toast.success('Role updated.');
      queryClient.invalidateQueries({ queryKey: ['group', group._id] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMenuOpenFor(null);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setInviteOpen(true)} className="btn-primary">
          <UserPlus className="h-4 w-4" /> Invite member
        </button>
      </div>

      <div className="glass-card divide-y divide-white/[0.04]">
        {group.members.map((m) => {
          const badge = ROLE_BADGES[m.role];
          const BadgeIcon = badge.icon;
          const isSelf = m.user._id === user._id;

          return (
            <div key={m.user._id} className="flex items-center gap-3 px-4 py-3.5">
              <Avatar name={m.user.name} src={m.user.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-200 truncate">
                  {m.user.name} {isSelf && <span className="text-ink-500">(you)</span>}
                </p>
                <p className="text-xs text-ink-500 truncate">{m.user.email}</p>
              </div>
              <span className={badge.className}>
                {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                {m.role}
              </span>

              {canManage && m.role !== 'owner' && !isSelf && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpenFor(menuOpenFor === m.user._id ? null : m.user._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:text-ink-200 hover:bg-white/[0.05]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpenFor === m.user._id && (
                    <div className="absolute right-0 mt-1 w-40 glass-card p-1.5 z-10">
                      <button
                        onClick={() => handleRoleChange(m.user._id, m.role === 'admin' ? 'member' : 'admin')}
                        className="w-full text-left px-3 py-2 text-sm text-ink-300 hover:bg-white/[0.05] rounded-lg"
                      >
                        {m.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      </button>
                      <button
                        onClick={() => handleRemove(m.user._id)}
                        className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <InviteMemberModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} group={group} />
    </div>
  );
};

export default MembersTab;
