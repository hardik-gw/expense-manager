import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export async function getDailySpendForCategory(userId, category, year, month) {
  const expensesRef = collection(db, 'users', userId, 'expenses');

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last moment of the month
  const daysInMonth = endDate.getDate();

  // 🔍 Query expenses for the category within this month
  const q = query(
    expensesRef,
    where('category', '==', category),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date')
  );

  const snapshot = await getDocs(q);

  const dailySpend = Array(daysInMonth).fill(0);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.date.toDate();
    const day = date.getDate();
    dailySpend[day - 1] += data.amount;
  });

  // 🔴 Pull budget for this category from budgetSplits/{monthId}
  const monthId = `${year}-${String(month).padStart(2, '0')}`;
  const budgetDocRef = doc(db, 'users', userId, 'budgetSplits', monthId);
  const budgetSnap = await getDoc(budgetDocRef);

  let categoryBudget = 0;
  if (budgetSnap.exists()) {
    const data = budgetSnap.data();
    categoryBudget = data[category] || 0;
  }

  const dailyBudget = categoryBudget > 0 ? categoryBudget / daysInMonth : 0;

  return {
    dailySpend,    // Array of ₹ spent per day in this category
    dailyBudget    // Daily budget based on monthly split
  };
}
