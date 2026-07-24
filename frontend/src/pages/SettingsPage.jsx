import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Trash2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService, authService } from '../services/endpoints';
import { getErrorMessage } from '../services/api';
import FormInput from '../components/ui/FormInput';
import Modal from '../components/ui/Modal';

const SettingsPage = () => {
  const { user, updateUserInPlace, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const prefsForm = useForm({
    defaultValues: {
      monthlyBudget: user?.monthlyBudget || 0,
      dailySpendingGoal: user?.dailySpendingGoal || 0,
    },
  });

  const passwordForm = useForm();

  const onPrefsSubmit = async (data) => {
    setIsSavingPrefs(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));

      const { data: response } = await userService.updateProfile(formData);
      updateUserInPlace(response.user);
      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsSavingPassword(true);
    try {
      await authService.updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated successfully!');
      passwordForm.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount(deletePassword);
      toast.success('Account deleted.');
      await logout();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-100">Settings</h1>
        <p className="text-sm text-ink-400 mt-1">Manage your preferences and account security.</p>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-ink-100">Appearance</h2>
        <div>
          <label className="label-text">Theme</label>
          <button type="button" onClick={toggleTheme} className="btn-secondary">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>

      {/* Spending preferences */}
      <form onSubmit={prefsForm.handleSubmit(onPrefsSubmit)} className="glass-card p-6 space-y-5">
        <h2 className="font-display text-base font-semibold text-ink-100">Spending preferences</h2>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Monthly budget"
            type="number"
            step="0.01"
            {...prefsForm.register('monthlyBudget', { min: 0 })}
          />
          <FormInput
            label="Daily spending goal"
            type="number"
            step="0.01"
            {...prefsForm.register('dailySpendingGoal', { min: 0 })}
          />
        </div>
        <button type="submit" disabled={isSavingPrefs} className="btn-primary">
          {isSavingPrefs ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            'Save changes'
          )}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="glass-card p-6 space-y-5">
        <h2 className="font-display text-base font-semibold text-ink-100">Change password</h2>
        <FormInput
          label="Current password"
          type="password"
          error={passwordForm.formState.errors.currentPassword?.message}
          {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
        />
        <FormInput
          label="New password"
          type="password"
          error={passwordForm.formState.errors.newPassword?.message}
          {...passwordForm.register('newPassword', {
            required: 'New password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          })}
        />
        <button type="submit" disabled={isSavingPassword} className="btn-secondary">
          {isSavingPassword ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            'Update password'
          )}
        </button>
      </form>

      {/* Danger zone */}
      <div className="glass-card p-6 border-rose-500/20">
        <h2 className="font-display text-base font-semibold text-rose-400 mb-2">Danger zone</h2>
        <p className="text-sm text-ink-400 mb-4">
          Deleting your account is permanent. You must settle all outstanding balances first.
        </p>
        <button onClick={() => setDeleteModalOpen(true)} className="btn-danger">
          <Trash2 className="h-4 w-4" /> Delete account
        </button>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete your account">
        <div className="space-y-4">
          <p className="text-sm text-ink-400">
            This action is permanent and cannot be undone. Enter your password to confirm.
          </p>
          <FormInput
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting || !deletePassword}
            className="btn-danger w-full py-3"
          >
            {isDeleting ? 'Deleting...' : 'Permanently delete my account'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;