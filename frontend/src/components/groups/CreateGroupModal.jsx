import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ImagePlus, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import { groupService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'];

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { currency: user?.currency || 'USD' } });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    reset();
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('currency', data.currency);
      if (imageFile) formData.append('image', imageFile);

      await groupService.create(formData);
      toast.success('Group created successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-groups'] });
      handleClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create a new group">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-20 w-20 rounded-2xl overflow-hidden bg-white/[0.04] border border-dashed border-white/15 flex items-center justify-center group"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Group" className="h-full w-full object-cover" />
            ) : (
              <Users className="h-6 w-6 text-ink-500 group-hover:text-ink-300" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <ImagePlus className="h-5 w-5 text-white" />
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <FormInput
          label="Group name"
          placeholder="Goa Trip 2026"
          error={errors.name?.message}
          {...register('name', { required: 'Group name is required', maxLength: 60 })}
        />

        <div>
          <label className="label-text">Description (optional)</label>
          <textarea
            rows={2}
            placeholder="What's this group for?"
            className="input-field resize-none"
            {...register('description', { maxLength: 300 })}
          />
        </div>

        <div>
          <label className="label-text">Currency</label>
          <select className="input-field" {...register('currency')}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            'Create group'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
