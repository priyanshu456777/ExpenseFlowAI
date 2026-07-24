import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Copy, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import { groupService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';

const InviteMemberModal = ({ isOpen, onClose, group }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await groupService.inviteByEmail(group._id, email.trim());
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite to group">
      <div className="space-y-6">
        <form onSubmit={handleInvite} className="space-y-3">
          <label className="label-text">Invite by email</label>
          <div className="flex gap-2">
            <FormInput
              className="flex-1"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={isSubmitting} className="btn-primary px-4">
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="border-t border-white/[0.06] pt-5">
          <label className="label-text">Or share this invite code</label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-base-900/60 px-4 py-3">
            <code className="flex-1 text-sm text-indigo-300 font-mono truncate">{group.inviteCode}</code>
            <button
              onClick={handleCopyCode}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:text-ink-100 hover:bg-white/[0.06]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-ink-500 mt-2">Anyone with this code can join the group from the Groups page.</p>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;
