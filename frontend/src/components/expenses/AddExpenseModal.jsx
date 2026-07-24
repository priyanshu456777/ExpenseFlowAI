import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Paperclip } from 'lucide-react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import Avatar from '../ui/Avatar';
import SplitTypeSelector from './SplitTypeSelector';
import SplitPreview from './SplitPreview';
import { expenseService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';
import { validateSplit } from '../../utils/splitCalculator';

const CATEGORIES = ['Travel', 'Food', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Others'];

const AddExpenseModal = ({ isOpen, onClose, group }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Others');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [participantValues, setParticipantValues] = useState({});
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members = group?.members || [];

  useEffect(() => {
    if (isOpen && members.length) {
      setSelectedMembers(members.map((m) => m.user._id));
      setPaidBy(members[0]?.user._id || '');
    }
  }, [isOpen, group]);

  const participants = selectedMembers.map((userId) => {
    const member = members.find((m) => m.user._id === userId);
    return {
      userId,
      name: member?.user?.name,
      avatar: member?.user?.avatar,
      value: participantValues[userId] ?? '',
    };
  });

  const toggleMember = (userId) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleValueChange = (index, value) => {
    const userId = participants[index].userId;
    setParticipantValues((prev) => ({ ...prev, [userId]: value }));
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('Others');
    setSplitType('equal');
    setParticipantValues({});
    setNotes('');
    setReceiptFile(null);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) return toast.error('Description is required.');
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount.');
    if (selectedMembers.length === 0) return toast.error('Select at least one participant.');

    const validationError = validateSplit({ splitType, amount, participants });
    if (validationError) return toast.error(validationError);

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('group', group._id);
      formData.append('description', description.trim());
      formData.append('amount', amount);
      formData.append('category', category);
      formData.append('paidBy', paidBy);
      formData.append('splitType', splitType);
      formData.append('notes', notes);
      formData.append('date', date);
      formData.append(
        'participants',
        JSON.stringify(participants.map((p) => ({ userId: p.userId, value: p.value || 0 })))
      );
      if (receiptFile) formData.append('receipt', receiptFile);

      await expenseService.create(formData);
      toast.success('Expense added successfully!');
      queryClient.invalidateQueries({ queryKey: ['group-expenses', group._id] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', group._id] });
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      handleClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add expense to ${group.name}`} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Description"
            placeholder="Dinner at Cafe Luna"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormInput
            label={`Amount (${group.currency})`}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <FormInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="label-text">Paid by</label>
          <select className="input-field" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-text">Split between</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const isSelected = selectedMembers.includes(m.user._id);
              return (
                <button
                  key={m.user._id}
                  type="button"
                  onClick={() => toggleMember(m.user._id)}
                  className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/[0.02] border-white/10 text-ink-500'
                  }`}
                >
                  <Avatar name={m.user.name} src={m.user.avatar} size="xs" />
                  {m.user.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label-text">Split type</label>
          <SplitTypeSelector value={splitType} onChange={setSplitType} />
        </div>

        {selectedMembers.length > 0 && (
          <SplitPreview
            splitType={splitType}
            amount={amount}
            participants={participants}
            onValueChange={handleValueChange}
            currency={group.currency}
          />
        )}

        <div>
          <label className="label-text">Notes (optional)</label>
          <textarea
            rows={2}
            className="input-field resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
          />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary w-full justify-start"
        >
          <Paperclip className="h-4 w-4" />
          {receiptFile ? receiptFile.name : 'Attach receipt (optional)'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            'Add expense'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
