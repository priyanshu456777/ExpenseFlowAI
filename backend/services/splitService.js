const AppError = require('../utils/AppError');
const { SPLIT_TYPES } = require('../constants');

/**
 * Rounds to 2 decimal places without floating point drift (cents-safe).
 */
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Distributes rounding remainder (leftover cents from division) across participants
 * so the sum of shares always exactly equals the total amount.
 * The remainder is assigned to the first N participants (deterministic, order-stable).
 */
const distributeRemainder = (baseShares, totalAmount) => {
  const sumBase = round2(baseShares.reduce((acc, s) => acc + s.shareAmount, 0));
  let remainder = round2(totalAmount - sumBase);

  const cents = Math.round(remainder * 100);
  const step = cents > 0 ? 0.01 : -0.01;
  let remaining = Math.abs(cents);

  const adjusted = baseShares.map((s) => ({ ...s }));
  let i = 0;
  while (remaining > 0 && adjusted.length > 0) {
    adjusted[i % adjusted.length].shareAmount = round2(adjusted[i % adjusted.length].shareAmount + step);
    remaining -= 1;
    i += 1;
  }
  return adjusted;
};

/**
 * Calculates each participant's share amount based on the split type.
 *
 * @param {Object} params
 * @param {String} params.splitType - one of SPLIT_TYPES
 * @param {Number} params.amount - total expense amount
 * @param {Array} params.participants - array of { userId, value } where `value`
 *   is unused for EQUAL, the exact amount for UNEQUAL, the percentage for PERCENTAGE,
 *   and the number of shares for SHARES.
 * @returns {Array} [{ userId, shareAmount, percentage, shares }]
 */
const calculateSplit = ({ splitType, amount, participants }) => {
  if (!participants || participants.length === 0) {
    throw AppError.badRequest('At least one participant is required to split an expense.');
  }

  const total = round2(amount);

  switch (splitType) {
    case SPLIT_TYPES.EQUAL: {
      const n = participants.length;
      const base = round2(total / n);
      const baseShares = participants.map((p) => ({
        userId: p.userId,
        shareAmount: base,
        percentage: null,
        shares: null,
      }));
      return distributeRemainder(baseShares, total);
    }

    case SPLIT_TYPES.UNEQUAL: {
      const sum = round2(participants.reduce((acc, p) => acc + Number(p.value || 0), 0));
      if (Math.abs(sum - total) > 0.01) {
        throw AppError.badRequest(
          `Unequal split amounts (${sum}) must add up to the total expense amount (${total}).`,
          'SPLIT_MISMATCH'
        );
      }
      return participants.map((p) => ({
        userId: p.userId,
        shareAmount: round2(Number(p.value)),
        percentage: null,
        shares: null,
      }));
    }

    case SPLIT_TYPES.PERCENTAGE: {
      const sumPct = round2(participants.reduce((acc, p) => acc + Number(p.value || 0), 0));
      if (Math.abs(sumPct - 100) > 0.01) {
        throw AppError.badRequest(`Percentages must add up to 100 (received ${sumPct}).`, 'SPLIT_MISMATCH');
      }
      const baseShares = participants.map((p) => ({
        userId: p.userId,
        shareAmount: round2((Number(p.value) / 100) * total),
        percentage: Number(p.value),
        shares: null,
      }));
      return distributeRemainder(baseShares, total);
    }

    case SPLIT_TYPES.SHARES: {
      const totalShares = participants.reduce((acc, p) => acc + Number(p.value || 0), 0);
      if (totalShares <= 0) {
        throw AppError.badRequest('Total shares must be greater than 0.', 'SPLIT_MISMATCH');
      }
      const baseShares = participants.map((p) => ({
        userId: p.userId,
        shareAmount: round2((Number(p.value) / totalShares) * total),
        percentage: null,
        shares: Number(p.value),
      }));
      return distributeRemainder(baseShares, total);
    }

    default:
      throw AppError.badRequest(`Unsupported split type: ${splitType}`);
  }
};

module.exports = { calculateSplit, round2 };
