import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import FormInput from '../../components/ui/FormInput';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { rememberMe: false } });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your group balances and recent activity.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-400 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-base-900 text-indigo-500 focus:ring-indigo-500/30"
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-3">
          {isSubmitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Log in
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
