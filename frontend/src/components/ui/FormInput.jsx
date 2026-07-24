import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

const FormInput = forwardRef(({ label, error, type = 'text', className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={className}>
      {label && <label className="label-text">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={effectiveType}
          className={clsx('input-field', isPassword && 'pr-11', error && 'border-rose-500/50 focus:ring-rose-500/20')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
