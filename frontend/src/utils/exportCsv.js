/**
 * Converts an array of expense objects into a CSV file and triggers a browser
 * download. Done entirely client-side — no extra dependency, no server round-trip.
 */
export const exportExpensesToCSV = (expenses, groupName = 'expenses') => {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Paid By', 'Notes'];

  const escapeCsvField = (field) => {
    const str = String(field ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = expenses.map((e) => [
    new Date(e.date).toLocaleDateString(),
    e.description,
    e.category,
    e.amount.toFixed(2),
    e.paidBy?.name || '',
    e.notes || '',
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${groupName.replace(/\s+/g, '-').toLowerCase()}-expenses-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
