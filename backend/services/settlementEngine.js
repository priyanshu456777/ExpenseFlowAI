const { round2 } = require('./splitService');

/**
 * SMART SETTLEMENT ENGINE
 * ------------------------------------------------------------------
 * Given a map of { userId: netBalance }, computes the minimum number of
 * transactions required to settle all debts within the group.
 *
 * Algorithm: greedy min-cash-flow debt simplification.
 * At each step, match the person owed the most (max creditor) with the
 * person who owes the most (max debtor), settle the smaller of the two
 * amounts between them, and repeat until all balances reach zero.
 *
 * This is the standard approach used by production expense-splitting apps:
 * instead of "A owes B, B owes C, C owes D" (3 transactions), it collapses
 * chains of debt into the fewest direct payments (e.g. "A pays D" — 1 transaction).
 *
 * Complexity: O(n log n) per settlement round, O(n) rounds worst case → O(n^2 log n)
 * for n participants, which is fast for realistic group sizes (a handful to a few dozen).
 *
 * @param {Object} balances - { userId: netBalance } where positive = owed money, negative = owes money
 * @returns {Array} [{ from: userId, to: userId, amount: Number }]
 */
const EPSILON = 0.01; // ignore balances that round to zero (floating point safety)

const optimizeSettlements = (balances) => {
  const entries = Object.entries(balances)
    .map(([userId, amount]) => ({ userId, amount: round2(amount) }))
    .filter((e) => Math.abs(e.amount) >= EPSILON);

  const creditors = entries.filter((e) => e.amount > 0).sort((a, b) => b.amount - a.amount);
  const debtors = entries.filter((e) => e.amount < 0).sort((a, b) => a.amount - b.amount);

  const transactions = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const settledAmount = round2(Math.min(creditor.amount, -debtor.amount));

    if (settledAmount >= EPSILON) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: settledAmount,
      });
    }

    creditor.amount = round2(creditor.amount - settledAmount);
    debtor.amount = round2(debtor.amount + settledAmount);

    if (Math.abs(creditor.amount) < EPSILON) ci += 1;
    if (Math.abs(debtor.amount) < EPSILON) di += 1;
  }

  return transactions;
};

module.exports = { optimizeSettlements };
