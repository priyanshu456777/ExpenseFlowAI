import clsx from 'clsx';

const COLORS = [
  'bg-indigo-500/20 text-indigo-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-rose-500/20 text-rose-400',
];

const getInitials = (name = '') =>
  name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const getColorForName = (name = '') => {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index] || COLORS[0];
};

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

const Avatar = ({ name, src, size = 'md', className, ring = false }) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={clsx(
          sizeClass,
          'rounded-full object-cover flex-shrink-0',
          ring && 'ring-2 ring-base-900',
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        sizeClass,
        getColorForName(name),
        'flex flex-shrink-0 items-center justify-center rounded-full font-semibold',
        ring && 'ring-2 ring-base-900',
        className
      )}
    >
      {getInitials(name) || '?'}
    </div>
  );
};

export default Avatar;
