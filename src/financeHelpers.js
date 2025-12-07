// src/utils/financeHelpers.js

export const getCurrentMonthExpenses = (expenses) => {
  const now = new Date();
  return expenses.filter(exp => {
    const date = exp.createdAt?.toDate?.();
    return (
      date &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
};

export const calculateMonthsLeft = (targetDate) => {
  const now = new Date();
  const end = new Date(targetDate);
  const months =
    (end.getFullYear() - now.getFullYear()) * 12 +
    (end.getMonth() - now.getMonth());
  return Math.max(1, months); // at least 1 to avoid divide-by-zero
};
