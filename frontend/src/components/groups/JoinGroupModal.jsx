import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import { groupService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';

const JoinGroupModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Enter an invite code');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await groupService.joinByCode(code.trim());
      toast.success('Joined group successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      setCode('');
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a group">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-ink-400">Paste the invite code someone shared with you.</p>
        <FormInput
          label="Invite code"
          placeholder="e.g. 8f3a1c9d2b7e"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={error}
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4" /> Join group
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default JoinGroupModal;
