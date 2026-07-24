import clsx from 'clsx';

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal' },
  { value: 'unequal', label: 'Unequal' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'shares', label: 'Shares' },
];

const SplitTypeSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-base-900/60 p-1.5 border border-white/10">
    {SPLIT_TYPES.map((type) => (
      <button
        key={type.value}
        type="button"
        onClick={() => onChange(type.value)}
        className={clsx(
          'rounded-lg py-2 text-xs font-medium transition-colors',
          value === type.value ? 'bg-gradient-brand text-white' : 'text-ink-400 hover:text-ink-100'
        )}
      >
        {type.label}
      </button>
    ))}
  </div>
);

export default SplitTypeSelector;
