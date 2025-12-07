import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  addDoc,
  doc
} from 'firebase/firestore';
import AddExpenseWizard from "../components/AddExpenseWizard/AddExpenseWizard";

const calculateMonthsLeft = (targetDateStr) => {
  if (!targetDateStr) return 1;
  const today = new Date();
  const targetDate = new Date(targetDateStr);
  const diffInMonths = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24 * 30));
  return Math.max(1, diffInMonths);
};

const getCurrentMonthId = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const ExpenseManager = () => {
  const [goal, setGoal] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [savingPerMonth, setSavingPerMonth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [editingIncome, setEditingIncome] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const goalQuery = query(collection(db, 'users', user.uid, 'savingsGoals'));
    const unsubscribeGoals = onSnapshot(goalQuery, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (goals.length > 0) {
        let totalTarget = 0;
        let totalMonthlySavings = 0;

        goals.forEach(goal => {
          const target = goal.target || 0;
          const deadline = goal.deadline || '';
          const months = calculateMonthsLeft(deadline);

          totalTarget += target;
          totalMonthlySavings += Math.ceil(target / months);
        });

        setGoal(totalTarget);
        setSavingPerMonth(totalMonthlySavings);

        const closestGoal = goals.sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline)
        )[0];
        setTargetDate(closestGoal.deadline);
      }
    });

    const fetchMonthlyIncome = async () => {
      const monthId = getCurrentMonthId();
      const incomeEntriesRef = collection(db, 'users', user.uid, 'monthlyIncome', monthId, 'entries');
      const snapshot = await getDocs(incomeEntriesRef);

      let total = 0;
      snapshot.forEach(doc => {
        total += doc.data().amount || 0;
      });

      setMonthlyIncome(total);
    };

    fetchMonthlyIncome();

    const expensesRef = collection(db, 'users', user.uid, 'expenses');
    const unsubscribeExpenses = onSnapshot(expensesRef, (snapshot) => {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const expenseDate = data.createdAt?.toDate?.();
        if (
          expenseDate &&
          expenseDate.getMonth() === thisMonth &&
          expenseDate.getFullYear() === thisYear
        ) {
          total += Number(data.amount || 0);
        }
      });

      setMonthlySpend(total);
    });

    return () => {
      unsubscribeGoals();
      unsubscribeExpenses();
    };
  }, [user]);

  const handleIncomeSubmit = async () => {
    if (!user || !incomeInput) return;

    const monthId = getCurrentMonthId();
    const incomeEntriesRef = collection(db, 'users', user.uid, 'monthlyIncome', monthId, 'entries');

    await addDoc(incomeEntriesRef, {
      amount: parseFloat(incomeInput),
      createdAt: new Date()
    });

    setIncomeInput('');
    setEditingIncome(false);

    // Re-fetch total
    const snapshot = await getDocs(incomeEntriesRef);
    let total = 0;
    snapshot.forEach(doc => {
      total += doc.data().amount || 0;
    });
    setMonthlyIncome(total);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Expense Manager 💸</h1>

          <div className="mb-4 flex gap-4">
            <button
              onClick={() => setShowWizard(!showWizard)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {showWizard ? 'Cancel' : '➕ Add Expense'}
            </button>
          </div>

          {showWizard && (
            <div className="mb-6">
              <AddExpenseWizard onComplete={() => setShowWizard(false)} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Income This Month</h3>
              {editingIncome ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="number"
                    className="border px-2 py-1 rounded w-full"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    placeholder="Enter income"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleIncomeSubmit}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIncome(false)}
                      className="text-gray-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-green-600">₹{monthlyIncome}</p>
                  <button
                    onClick={() => setEditingIncome(true)}
                    className="text-xs text-indigo-500 underline ml-2"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Total Spent This Month</h3>
              <p className="text-lg font-bold text-red-600">₹{monthlySpend}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-600 text-sm">Savings Target / Month</h3>
              <p className="text-lg font-bold text-indigo-600">₹{savingPerMonth || 0}</p>
              {goal > 0 && targetDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Goal: ₹{goal} by {targetDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
