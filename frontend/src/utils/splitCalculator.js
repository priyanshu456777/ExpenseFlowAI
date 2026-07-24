const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Client-side mirror of the backend's split calculation, used purely for
 * instant visual feedback as the user types. The backend recalculates and
 * validates authoritatively on submit — this never needs to be perfectly
 * exploit-proof, just responsive and accurate for the happy path.
 */
export const calculateLiveSplit = ({ splitType, amount, participants }) => {
  const total = round2(Number(amount) || 0);
  if (!participants?.length || total <= 0) return participants.map((p) => ({ ...p, computedShare: 0 }));

  switch (splitType) {
    case 'equal': {
      const base = round2(total / participants.length);
      return participants.map((p, i) => ({
        ...p,
        computedShare: i === 0 ? round2(total - base * (participants.length - 1)) : base,
      }));
    }
    case 'unequal':
      return participants.map((p) => ({ ...p, computedShare: round2(Number(p.value) || 0) }));
    case 'percentage':
      return participants.map((p) => ({ ...p, computedShare: round2(((Number(p.value) || 0) / 100) * total) }));
    case 'shares': {
      const totalShares = participants.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
      if (totalShares <= 0) return participants.map((p) => ({ ...p, computedShare: 0 }));
      return participants.map((p) => ({
        ...p,
        computedShare: round2(((Number(p.value) || 0) / totalShares) * total),
      }));
    }
    default:
      return participants.map((p) => ({ ...p, computedShare: 0 }));
  }
};

export const getSplitTotal = (shares) => round2(shares.reduce((acc, s) => acc + (s.computedShare || 0), 0));

export const validateSplit = ({ splitType, amount, participants }) => {
  const total = round2(Number(amount) || 0);
  if (splitType === 'unequal') {
    const sum = round2(participants.reduce((acc, p) => acc + (Number(p.value) || 0), 0));
    if (Math.abs(sum - total) > 0.01) return `Amounts add up to ${sum}, but the total is ${total}.`;
  }
  if (splitType === 'percentage') {
    const sum = round2(participants.reduce((acc, p) => acc + (Number(p.value) || 0), 0));
    if (Math.abs(sum - 100) > 0.01) return `Percentages add up to ${sum}%, must equal 100%.`;
  }
  if (splitType === 'shares') {
    const sum = participants.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
    if (sum <= 0) return 'Total shares must be greater than 0.';
  }
  return null;
};

export { round2 };
