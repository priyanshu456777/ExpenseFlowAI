import clsx from 'clsx';
import Avatar from '../ui/Avatar';
import { calculateLiveSplit, getSplitTotal, validateSplit } from '../../utils/splitCalculator';

const SplitPreview = ({ splitType, amount, participants, onValueChange, currency }) => {
  const shares = calculateLiveSplit({ splitType, amount, participants });
  const computedTotal = getSplitTotal(shares);
  const errorMessage = validateSplit({ splitType, amount, participants });
  const needsInput = splitType !== 'equal';

  return (
    <div className="space-y-2">
      {shares.map((p, i) => (
        <div key={p.userId} className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
          <Avatar name={p.name} src={p.avatar} size="sm" />
          <span className="flex-1 text-sm text-ink-200 truncate">{p.name}</span>

          {needsInput && (
            <input
              type="number"
              step="0.01"
              value={p.value ?? ''}
              onChange={(e) => onValueChange(i, e.target.value)}
              placeholder={splitType === 'percentage' ? '%' : splitType === 'shares' ? 'shares' : '0.00'}
              className="w-24 rounded-lg border border-white/10 bg-base-900/60 px-2.5 py-1.5 text-sm text-right figure focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          )}

          <span className="w-20 text-right text-sm font-medium text-ink-100 figure">
            {currency} {p.computedShare.toFixed(2)}
          </span>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 px-3 text-xs">
        <span className={clsx('font-medium', errorMessage ? 'text-rose-400' : 'text-emerald-400')}>
          {errorMessage || 'Split is balanced'}
        </span>
        <span className="text-ink-500 figure">
          Total: {currency} {computedTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default SplitPreview;
