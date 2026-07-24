import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import FormInput from '../../components/ui/FormInput';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
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
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Welcome to ExpenseFlow AI.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start splitting expenses the smart way — free, no card required.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Full name"
          placeholder="Jordan Lee"
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        <FormInput
          label="Password"
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
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
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
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </button>

        <p className="text-xs text-center text-ink-600">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
