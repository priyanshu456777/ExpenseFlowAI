import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import FormInput from '../../components/ui/FormInput';
import { authService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password reset successfully. You are now logged in.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
            pattern: {
              value: /^(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Must include an uppercase letter and a number',
            },
          })}
        />
        <FormInput
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-3">
          {isSubmitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Reset password
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
