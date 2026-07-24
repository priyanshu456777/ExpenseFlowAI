import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, LogIn, Users } from 'lucide-react';
import { groupService } from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import GroupCard from '../components/dashboard/GroupCard';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import JoinGroupModal from '../components/groups/JoinGroupModal';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

const GroupsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-groups'],
    queryFn: groupService.getMyGroups,
  });

  const groups = data?.data?.groups || [];
  const sortedGroups = [...groups].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleTogglePin = async (groupId) => {
    try {
      await groupService.togglePin(groupId);
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">Groups</h1>
          <p className="text-sm text-ink-400 mt-1">Manage every group you're part of.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setJoinOpen(true)} className="btn-secondary">
            <LogIn className="h-4 w-4" /> Join group
          </button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Create group
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : sortedGroups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group to start splitting expenses, or join one using an invite code."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Create your first group
            </button>
          }
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sortedGroups.map((group) => (
            <motion.div
              key={group._id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <GroupCard group={group} onTogglePin={handleTogglePin} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateGroupModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinGroupModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
};

export default GroupsPage;
