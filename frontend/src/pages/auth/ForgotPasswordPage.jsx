import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import FormInput from '../../components/ui/FormInput';
import { authService } from '../../services/endpoints';
import { getErrorMessage } from '../../services/api';

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-sm text-ink-300">
            If an account exists for that email, we've sent a link to reset your password. It expires in 15 minutes.
          </p>
        </div>
        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
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

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-base py-3">
          {isSubmitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send reset link
            </>
          )}
        </button>
      </form>

      <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-ink-300">
        <ArrowLeft className="h-4 w-4" />
        Back to log in
      </Link>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
