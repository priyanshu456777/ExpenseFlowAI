import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import Avatar from '../components/ui/Avatar';
import FormInput from '../components/ui/FormInput';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'];

const ProfilePage = () => {
  const { user, updateUserInPlace } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      name: user?.name,
      currency: user?.currency,
      language: user?.language || 'en',
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onProfileSubmit = async (data) => {
    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data: response } = await userService.updateProfile(formData);
      updateUserInPlace(response.user);
      toast.success('Profile updated successfully!');
      setAvatarFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-100">Profile</h1>
        <p className="text-sm text-ink-400 mt-1">Manage your personal info.</p>
      </div>

      {/* Avatar + basic info */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={user?.name} src={avatarPreview || user?.avatar} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink-100">{user?.name}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
        </div>

        <FormInput label="Full name" {...profileForm.register('name', { required: true, maxLength: 50 })} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Currency</label>
            <select className="input-field" {...profileForm.register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <FormInput label="Language" {...profileForm.register('language')} />
        </div>

        <button type="submit" disabled={isSavingProfile} className="btn-primary">
          {isSavingProfile ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            'Save changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;